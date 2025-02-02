// IMPORTS ---------------------------------------------------------------------

import gleam/dict
import gleam/float
import gleam/int
import gleam/list
import gleam/pair
import gleam/result
import lib/camera
import lib/canvas/context as context_impl
import lib/classnames
import lib/cursor
import lib/direction
import lib/engine
import lib/event
import lib/input
import lib/map
import lib/map/demo_one
import lib/math
import lib/render
import lib/state
import lib/tile
import lib/turn
import lustre
import lustre/attribute
import lustre/effect.{type Effect}
import lustre/element.{type Element}
import lustre/element/html
import lustre/event as e

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
  Ready(game_state: state.GameState)
  Paused(game_state: state.GameState)
}

fn init(_) -> #(Model, Effect(Msg)) {
  #(Idle, schedule_next_frame())
}

// UPDATE ----------------------------------------------------------------------

type Msg {
  AppSetNoCanvas
  ToggleDebug
  Tick(Float)
  PlayerQueueEvent(event.Event)
  BrowserPauseGame
  BrowserUnpauseGame
  TurnEvent(turn.Event)
}

fn update(model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    AppSetNoCanvas -> #(NoCanvas, effect.none())
    Tick(current_time) -> {
      case model {
        Ready(game_state) -> {
          game_state
          |> engine.update(current_time)
          |> fn(game_state) {
            #(Ready(game_state), update_and_schedule(game_state))
          }
        }
        Paused(game_state) -> {
          game_state
          |> engine.paused_update(current_time)
          |> fn(game_state) {
            #(Paused(game_state), update_and_schedule(game_state))
          }
        }
        Idle -> #(
          Ready(engine.new(current_time, demo_one.new())),
          effect.batch([setup_listeners(), schedule_next_frame()]),
        )
        _ -> panic
      }
    }
    PlayerQueueEvent(event) -> {
      case model {
        Ready(game_state) -> #(
          Ready(
            state.GameState(..game_state, event_queue: [
              event,
              ..game_state.event_queue
            ]),
          ),
          effect.none(),
        )
        _ -> panic
      }
    }
    ToggleDebug -> {
      case model {
        Ready(game_state) -> #(
          Ready(engine.toggle_debug(game_state)),
          effect.none(),
        )
        _ -> #(model, effect.none())
      }
    }
    BrowserPauseGame -> {
      case model {
        Ready(game_state) -> #(Paused(game_state), effect.none())
        _ -> #(model, effect.none())
      }
    }
    BrowserUnpauseGame -> {
      case model {
        Paused(game_state) -> #(Ready(game_state), effect.none())
        _ -> #(model, effect.none())
      }
    }
    TurnEvent(event) -> {
      case model {
        Ready(game_state) -> #(
          Ready(turn.update(event, game_state)),
          effect.none(),
        )
        _ -> #(model, effect.none())
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
    engine.on_game_focus(fn(focused) {
      dispatch(case focused {
        True -> BrowserUnpauseGame
        False -> BrowserPauseGame
      })
    })
  })
}

fn update_and_schedule(game_state: state.GameState) -> Effect(Msg) {
  effect.batch([render(game_state), schedule_next_frame()])
}

fn schedule_next_frame() {
  effect.from(fn(dispatch) {
    engine.request_animation_frame(fn(timestamp) { dispatch(Tick(timestamp)) })
  })
}

// VIEW ------------------------------------------------------------------------

fn view(model: Model) -> Element(Msg) {
  let #(canvas_width, canvas_height) = get_canvas_dimensions(model)
  let width_px = canvas_width |> int.to_string <> "px"
  let height_px = canvas_height |> int.to_string <> "px"
  let half_width_px = { canvas_width / 2 } |> int.to_string <> "px"
  let half_height_px = { canvas_height / 2 } |> int.to_string <> "px"
  let #(is_debug, debug_display) = get_show_debug(model)
  let fps = get_fps(model)
  let state = case model {
    Idle -> "Idle"
    Ready(_) -> "Ready"
    Paused(_) -> "Paused"
    NoCanvas -> "NoCanvas"
  }

  html.div(
    [
      attribute.class("flex flex-col gap-2"),
      attribute.style([#("width", width_px), #("height", height_px)]),
    ],
    [
      html.div(
        [
          attribute.class("relative border border-gray-900"),
          attribute.style([#("width", width_px), #("height", height_px)]),
        ],
        [
          html.canvas([
            attribute.id(render.render_target_id),
            attribute.width(canvas_width),
            attribute.height(canvas_height),
            attribute.style([#("image-rendering", "pixelated")]),
          ]),
          html.div(
            [
              attribute.class("absolute left-0 bg-red-400/15 inset-y-0"),
              attribute.style([
                #("display", debug_display),
                #("width", half_width_px),
              ]),
            ],
            [],
          ),
          html.div(
            [
              attribute.class("absolute left-0 bg-blue-400/15 top-0 inset-x-0"),
              attribute.style([
                #("display", debug_display),
                #("height", half_height_px),
              ]),
            ],
            [],
          ),
        ],
      ),
      html.div([attribute.class("flex self-start gap-2")], [
        html.label(
          [attribute.class("font-mono text-sm flex items-center gap-1")],
          [
            html.input([
              attribute.class("text-indigo-500"),
              attribute.type_("checkbox"),
              attribute.checked(is_debug),
              e.on_check(fn(_) { ToggleDebug }),
            ]),
            html.text("Debug"),
          ],
        ),
        html.p(
          [
            attribute.class(
              classnames.from([
                classnames.Static("font-mono text-sm"),
                classnames.Conditional(!is_debug, "hidden"),
              ]),
            ),
          ],
          [html.text(float.to_string(fps))],
        ),
        html.p(
          [
            attribute.class(
              classnames.from([classnames.Static("font-mono text-sm")]),
            ),
          ],
          [html.text(state)],
        ),
      ]),
    ],
  )
}

fn get_canvas_dimensions(model: Model) {
  case model {
    Ready(game_state) -> #(
      math.scale(game_state.camera.width |> int.to_float, game_state.scale)
        |> float.round,
      math.scale(game_state.camera.height |> int.to_float, game_state.scale)
        |> float.round,
    )
    _ -> #(640, 360)
  }
}

fn get_show_debug(model: Model) {
  case model {
    Ready(game_state) ->
      case game_state.debug {
        True -> #(True, "block")
        False -> #(False, "none")
      }
    _ -> #(False, "none")
  }
}

fn get_fps(model: Model) {
  case model {
    Ready(game_state) -> game_state.fps
    _ -> 0.0
  }
}

fn render(game_state: state.GameState) -> Effect(Msg) {
  effect.from(fn(_dispatch) {
    case render.with_context() {
      Ok(render.RenderContext(_canvas, context)) -> {
        engine.request_animation_frame(fn(_timestamp) {
          let viewport =
            camera.get_viewport(game_state.camera, game_state.scale)
          context_impl.clear_rect(
            context,
            0.0,
            0.0,
            pair.first(viewport),
            pair.second(viewport),
          )

          game_state.map
          |> map.each_tile(fn(coords, tile) {
            tile.render(
              context,
              tile,
              coords,
              game_state.map.sprite_sheet,
              game_state.camera,
              game_state.scale,
            )

            cursor.render_base(
              context,
              game_state.cursor,
              coords,
              game_state.camera,
              game_state.scale,
            )

            let _ =
              dict.get(game_state.location_map, coords)
              |> result.map(
                list.each(_, fn(ref) {
                  render.entity(ref, context, coords, game_state)
                }),
              )

            cursor.render_pointer(
              context,
              game_state.cursor,
              coords,
              game_state.camera,
              game_state.scale,
            )
          })
        })
      }
      _ -> panic
    }
  })
}
