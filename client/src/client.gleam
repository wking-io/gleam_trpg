// IMPORTS ---------------------------------------------------------------------

import gleam/float
import gleam/int
import gleam/io
import gleam/list
import gleam/order.{type Order}
import gleam/result
import gleam_community/maths/elementary
import lib/canvas as canvas_impl
import lib/canvas/context as context_impl
import lib/coord
import lib/cursor
import lib/direction
import lib/engine
import lib/event
import lib/frames
import lib/input
import lib/map
import lib/map/demo_one
import lib/render
import lib/sprite
import lib/tile
import lib/vector
import lustre
import lustre/attribute
import lustre/effect.{type Effect}
import lustre/element.{type Element}
import lustre/element/html

// MAIN ------------------------------------------------------------------------

pub fn main() {
  let app = lustre.application(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)

  Nil
}

// MODEL -----------------------------------------------------------------------

type Model {
  Idle
  NoCanvas
  Ready(game_state: engine.GameState)
}

fn init(_) -> #(Model, Effect(Msg)) {
  #(Idle, init_canvas())
}

// UPDATE ----------------------------------------------------------------------

type Msg {
  AppInitEngine(Float)
  AppSetNoCanvas
  Tick(Float)
  PlayerQueueEvent(event.Event)
}

type Event {
  MoveCursor(direction: direction.Direction)
}

fn update(model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    AppInitEngine(previous_time) -> #(
      Ready(engine.new(previous_time, demo_one.new())),
      effect.batch([setup_listeners(), schedule_next_frame()]),
    )
    AppSetNoCanvas -> #(NoCanvas, effect.none())
    Tick(current_time) -> {
      case model {
        Ready(game_state) ->
          engine_update(game_state, current_time)
          |> update_and_schedule
        _ -> panic
      }
    }
    PlayerQueueEvent(event) -> {
      case model {
        Ready(game_state) -> #(
          Ready(
            engine.GameState(
              ..game_state,
              event_queue: [event, ..game_state.event_queue],
            ),
          ),
          effect.none(),
        )
        _ -> panic
      }
    }
  }
}

fn setup_listeners() {
  effect.from(fn(dispatch) {
    input.on_keyboard_event(fn(game_key) {
      let direction = direction.from_game_key(game_key)
      dispatch(PlayerQueueEvent(event.MoveCursor(direction)))
    })
  })
}

fn update_and_schedule(game_state: engine.GameState) -> #(Model, Effect(Msg)) {
  #(
    Ready(game_state),
    effect.batch([render(game_state), schedule_next_frame()]),
  )
}

const fixed_dt = 16.67

fn engine_update(
  game_state: engine.GameState,
  current_time: Float,
) -> engine.GameState {
  let frame_time = float.subtract(current_time, game_state.previous_time)
  let accumulator = float.add(game_state.accumulator, frame_time)

  // Avoid division by zero
  let fps = case float.divide(1000.0, frame_time) {
    Ok(fps) -> fps
    _ -> 0.0
  }

  let updated_state =
    engine.GameState(
      ..game_state,
      previous_time: current_time,
      accumulator: accumulator,
      fps: fps,
    )
  engine_update_loop(updated_state, accumulator)
}

fn engine_update_loop(
  game_state: engine.GameState,
  acc: Float,
) -> engine.GameState {
  case float.compare(acc, fixed_dt) |> is_gt_or_eq {
    True -> {
      let dt_seconds = float.divide(fixed_dt, 1000.0) |> result.unwrap(0.0)
      game_state
      |> apply_events(game_state.event_queue)
      |> run_logic_update(dt_seconds)
      |> engine_update_loop(float.subtract(acc, fixed_dt))
    }
    False -> {
      engine.GameState(..game_state, accumulator: 0.0)
    }
  }
}

fn apply_events(
  game_state: engine.GameState,
  events: event.EventQueue,
) -> engine.GameState {
  list.fold_right(events, game_state, fn(acc, event) {
    case event {
      event.MoveCursor(direction) -> {
        case game_state.cursor_animation {
          cursor.CursorIdle(..) -> {
            let new_cursor =
              direction |> vector.from_direction() |> vector.move(acc.cursor)
            engine.GameState(
              ..game_state,
              cursor: new_cursor,
              cursor_animation: cursor.CursorMoving(
                start: game_state.cursor,
                target: new_cursor,
                elapsed: 0.0,
                duration: frames.to_duration(6.0),
              ),
            )
          }
          _ -> {
            acc
          }
        }
      }
    }
  })
  |> reset_events
}

fn run_logic_update(game_state: engine.GameState, dt_seconds: Float) {
  let new_cursor_animation = case game_state.cursor_animation {
    cursor.CursorIdle(elapsed, cycle, amplitude) -> {
      let looped_elapsed =
        elapsed
        |> float.add(dt_seconds)
        |> float.modulo(cycle)
        |> result.unwrap(0.0)
      cursor.CursorIdle(
        elapsed: looped_elapsed,
        cycle: cycle,
        amplitude: amplitude,
      )
    }
    cursor.CursorMoving(start, target, elapsed, duration) -> {
      let new_elapsed = float.add(elapsed, dt_seconds)
      case float.compare(new_elapsed, duration) {
        order.Lt -> {
          cursor.CursorMoving(
            start: start,
            target: target,
            elapsed: new_elapsed,
            duration: duration,
          )
        }
        _ -> {
          cursor.new_idle_cursor()
        }
      }
    }
  }
  engine.GameState(..game_state, cursor_animation: new_cursor_animation)
}

fn reset_events(game_state: engine.GameState) -> engine.GameState {
  engine.GameState(..game_state, event_queue: [])
}

fn is_gt_or_eq(order: Order) -> Bool {
  case order {
    order.Lt -> False
    _ -> True
  }
}

fn init_canvas() {
  effect.from(fn(dispatch) {
    engine.request_animation_frame(fn(timestamp) {
      dispatch(AppInitEngine(timestamp))
    })
  })
}

fn schedule_next_frame() {
  effect.from(fn(dispatch) {
    engine.request_animation_frame(fn(timestamp) { dispatch(Tick(timestamp)) })
  })
}

// VIEW ------------------------------------------------------------------------

fn view(_model: Model) -> Element(Msg) {
  html.div([], [html.canvas([attribute.id(render.render_target_id)])])
}

fn scale_to_screen(from: Int) {
  from * 32 |> int.to_float()
}

fn render(game_state: engine.GameState) -> Effect(Msg) {
  effect.from(fn(_dispatch) {
    engine.request_animation_frame(fn(_timestamp) {
      case render.with_context() {
        Ok(render.RenderContext(canvas, context)) -> {
          canvas
          |> canvas_impl.set_width(game_state.map.width)
          |> canvas_impl.set_height(game_state.map.height)

          game_state.map
          |> map.each_tile(fn(coords, tile) {
            let sprite_region =
              game_state.map.sprite_sheet
              |> tile.get_sprite(tile.terrain)

            case sprite_region {
              Ok(region) -> {
                context_impl.draw_image_cropped(
                  context,
                  game_state.map.sprite_sheet.asset,
                  sprite.x(region) |> scale_to_screen(),
                  sprite.y(region) |> scale_to_screen(),
                  32.0,
                  32.0,
                  coord.x(coords) |> scale_to_screen(),
                  coord.y(coords) |> scale_to_screen(),
                  32.0,
                  32.0,
                )
              }
              _ -> context
            }
          })

          let new_cursor = case game_state.cursor_animation {
            cursor.CursorIdle(elapsed, cycle, amplitude) -> {
              let t = float.divide(elapsed, cycle) |> result.unwrap(0.0)
              let start = game_state.cursor |> vector.scale(10.0)
              let offset_y =
                t
                |> float.multiply(2.0)
                |> float.multiply(elementary.pi())
                |> elementary.sin
                |> float.multiply(amplitude)
                |> float.add(vector.y(start))

              vector.move(
                vector.at(vector.x(start), offset_y),
                vector.at(25.0, 25.0),
              )
            }
            cursor.CursorMoving(start, target, elapsed, duration) -> {
              let t = float.divide(elapsed, duration) |> result.unwrap(0.0)

              start
              |> vector.interpolate(target, t)
              |> vector.scale(10.0)
              |> vector.move(vector.at(25.0, 25.0))
            }
          }

          context
          |> context_impl.clear_rect(0.0, 0.0, 1000.0, 1000.0)
          |> context_impl.stroke_rect(0.0, 0.0, 1000.0, 1000.0)
          |> context_impl.set_fill_style("#FA470A")
          |> context_impl.fill_rect(
            vector.x(new_cursor),
            vector.y(new_cursor),
            50.0,
            50.0,
          )
          Nil
        }
        _ -> panic
      }
    })
  })
}
