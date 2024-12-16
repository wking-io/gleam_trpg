// IMPORTS ---------------------------------------------------------------------

import gleam/float
import gleam/list
import gleam/order.{type Order}
import gleam/result
import gleam_community/maths/elementary
import lib/canvas/context as context_impl
import lib/engine
import lib/render
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
  Ready(game_state: GameState)
}

type GameState {
  GameState(
    previous_time: Float,
    accumulator: Float,
    event_queue: List(Event),
    cursor: Vector,
    cursor_animation: CursorAnimation,
  )
}

type CursorAnimation {
  CursorIdle(elapsed: Float, cycle: Float, amplitude: Float)
  CursorMoving(start: Vector, target: Vector, elapsed: Float, duration: Float)
}

type Direction {
  Up
  Down
  Right
  Left
}

type Vector =
  #(Float, Float)

fn direction_to_vector(direction: Direction) -> Vector {
  case direction {
    Up -> #(0.0, -1.0)
    Down -> #(0.0, 1.0)
    Left -> #(-1.0, 0.0)
    Right -> #(1.0, 0.0)
  }
}

fn init(_) -> #(Model, Effect(Msg)) {
  #(Idle, init_canvas())
}

// UPDATE ----------------------------------------------------------------------

type Msg {
  AppInitCanvas(Float)
  AppSetNoCanvas
  Tick(Float)
  PlayerQueueEvent(Event)
}

type Event {
  MoveCursor(direction: Direction)
}

const cursor_idle_info = CursorIdle(0.0, 2.0, 1.0)

fn update(model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    AppInitCanvas(previous_time) -> #(
      Ready(GameState(previous_time, 0.0, [], #(0.0, 0.0), cursor_idle_info)),
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
            GameState(
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
    engine.on_keyboard_event(fn(game_key) {
      let direction = direction_from_game_key(game_key)
      dispatch(PlayerQueueEvent(MoveCursor(direction)))
    })
  })
}

fn direction_from_game_key(game_key: engine.GameKey) -> Direction {
  case game_key {
    engine.UpKey -> Up
    engine.DownKey -> Down
    engine.LeftKey -> Left
    engine.RightKey -> Right
  }
}

fn update_and_schedule(game_state: GameState) -> #(Model, Effect(Msg)) {
  #(
    Ready(game_state),
    effect.batch([render(game_state), schedule_next_frame()]),
  )
}

const fixed_dt = 16.67

fn engine_update(game_state: GameState, current_time: Float) -> GameState {
  let frame_time = float.subtract(current_time, game_state.previous_time)
  let accumulator = float.add(game_state.accumulator, frame_time)
  let updated_state =
    GameState(
      ..game_state,
      previous_time: current_time,
      accumulator: accumulator,
    )
  engine_update_loop(updated_state, accumulator)
}

fn engine_update_loop(game_state: GameState, acc: Float) -> GameState {
  case float.compare(acc, fixed_dt) |> is_gt_or_eq {
    True -> {
      let dt_seconds = float.divide(fixed_dt, 1000.0) |> result.unwrap(0.0)
      game_state
      |> apply_events(game_state.event_queue)
      |> run_logic_update(dt_seconds)
      |> engine_update_loop(float.subtract(acc, fixed_dt))
    }
    False -> {
      GameState(..game_state, accumulator: 0.0)
    }
  }
}

fn apply_events(game_state: GameState, events: List(Event)) -> GameState {
  list.fold_right(events, game_state, fn(acc, event) {
    case event {
      MoveCursor(direction) -> {
        case game_state.cursor_animation {
          CursorIdle(..) -> {
            let new_cursor =
              direction |> direction_to_vector() |> vector_move(acc.cursor)
            GameState(
              ..game_state,
              cursor: new_cursor,
              cursor_animation: CursorMoving(
                start: game_state.cursor,
                target: new_cursor,
                elapsed: 0.0,
                duration: 1.0,
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

fn run_logic_update(game_state: GameState, dt_seconds: Float) {
  let new_cursor_animation = case game_state.cursor_animation {
    CursorIdle(elapsed, cycle, amplitude) -> {
      let looped_elapsed =
        elapsed
        |> float.add(dt_seconds)
        |> float.modulo(cycle)
        |> result.unwrap(0.0)
      CursorIdle(elapsed: looped_elapsed, cycle: cycle, amplitude: amplitude)
    }
    CursorMoving(start, target, elapsed, duration) -> {
      let new_elapsed = float.add(elapsed, dt_seconds)
      case float.compare(new_elapsed, duration) {
        order.Lt -> {
          CursorMoving(
            start: start,
            target: target,
            elapsed: new_elapsed,
            duration: duration,
          )
        }
        _ -> {
          cursor_idle_info
        }
      }
    }
  }
  GameState(..game_state, cursor_animation: new_cursor_animation)
}

fn reset_events(game_state: GameState) -> GameState {
  GameState(..game_state, event_queue: [])
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
      case render.with_context() {
        Ok(render.RenderContext(_canvas, context)) -> {
          context_impl.fill_rect(context, 0.0, 0.0, 100.0, 100.0)
          dispatch(AppInitCanvas(timestamp))
        }
        _ -> dispatch(AppSetNoCanvas)
      }
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

fn render(game_state: GameState) -> Effect(Msg) {
  effect.from(fn(_dispatch) {
    engine.request_animation_frame(fn(timestamp) {
      case render.with_context() {
        Ok(render.RenderContext(canvas, context)) -> {
          let #(cursor_x, cursor_y) = case game_state.cursor_animation {
            CursorIdle(elapsed, cycle, amplitude) -> {
              let t = float.divide(elapsed, cycle) |> result.unwrap(0.0)
              let #(sx, sy) = game_state.cursor
              let offset_y =
                t
                |> float.multiply(2.0)
                |> float.multiply(elementary.pi())
                |> elementary.sin
                |> float.multiply(amplitude)
                |> float.add(sy)
              vector_move(#(sx, offset_y), #(2.5, 2.5))
            }
            CursorMoving(start, target, elapsed, duration) -> {
              let t = float.divide(elapsed, duration) |> result.unwrap(0.0)
              let new_pos = current_animation_vector(start, target, t)
              vector_move(new_pos, #(2.5, 2.5))
            }
          }

          context
          |> context_impl.clear_rect(0.0, 0.0, 100.0, 100.0)
          |> context_impl.stroke_rect(0.0, 0.0, 100.0, 100.0)
          |> context_impl.set_fill_style("#FA470A")
          |> context_impl.fill_rect(cursor_x, cursor_y, 5.0, 5.0)
          Nil
        }
        _ -> panic
      }
    })
  })
}

fn current_animation_vector(start: Vector, target: Vector, t: Float) {
  let #(sx, sy) = start
  let #(tx, ty) = target
  #(
    sx |> float.add(float.multiply(float.subtract(tx, sx), t)),
    sy |> float.add(float.multiply(float.subtract(ty, sy), t)),
  )
}

fn vector_move(s: Vector, d: Vector) -> Vector {
  let #(sx, sy) = s
  let #(dx, dy) = d
  #(float.add(sx, dx), float.add(sy, dy))
}
