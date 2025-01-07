// IMPORTS ---------------------------------------------------------------------

import gleam/float
import gleam/int
import gleam/pair
import lib/camera
import lib/canvas/context as context_impl
import lib/cursor
import lib/direction
import lib/engine
import lib/event
import lib/input
import lib/map
import lib/map/demo_one
import lib/math
import lib/render
import lib/tile
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
  Ready(game_state: engine.GameState)
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
}

fn update(model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    AppSetNoCanvas -> #(NoCanvas, effect.none())
    Tick(current_time) -> {
      case model {
        Ready(game_state) -> {
          game_state
          |> engine.update(current_time)
          |> update_and_schedule
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
    ToggleDebug -> {
      case model {
        Ready(game_state) -> #(
          Ready(engine.toggle_debug(game_state)),
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
  })
}

fn update_and_schedule(game_state: engine.GameState) -> #(Model, Effect(Msg)) {
  #(
    Ready(game_state),
    effect.batch([render(game_state), schedule_next_frame()]),
  )
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

fn render(game_state: engine.GameState) -> Effect(Msg) {
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
