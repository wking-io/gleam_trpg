// IMPORTS ---------------------------------------------------------------------

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
  Ready(previous_time: Float, accumulator: Float, event_queue: List(string))
}

fn init(_) -> #(Model, Effect(Msg)) {
  #(Idle, init_canvas())
}

// UPDATE ----------------------------------------------------------------------

type Msg {
  AppInitCanvas
  AppSetNoCanvas
  Tick(Float)
}

fn update(model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    AppInitCanvas -> #(Ready, effect.none())
    AppSetNoCanvas -> #(NoCanvas, effect.none())
    Tick(current_time) -> engine_update(model, current_time)
  }
}

const ffps = 60.0
const fixed_dt = 1000.0 / 60.0 

fn engine_update(model: Model, current_time: Flaot) -> #(Model, Effect(Msg)) {
  case model {
    Ready(previous_time) -> {
      let frame_time = current_time - model.previous_time
      let accumulator = model.accumulator + frame_time 

      let updated_model = Ready(..model, previous_time: current_time, accumulator: accumulator)
      let final_model = engine_update_loop(updated_model, accumulator)
      #(final_model, schedule_next_frame())
    }
    _ -> #(model, effect.none())
  }
}

fn engine_update_loop(model: Model, acc: Float) -> Model {
  if (model.event_queue) 
  if (acc >= fixed_dt) {
    engine_update_loop(model, acc - fixed_dt)
} else {
  Model(..model, accumulator: acc)
}
}

fn init_canvas() {
  effect.from(fn(dispatch) {
    engine.request_animation_frame(fn(_timestamp) {
      case render.with_context() {
        Ok(render.RenderContext(_canvas, context)) -> {
          context_impl.fill_rect(context, 0.0, 0.0, 100.0, 100.0)
          dispatch(AppInitCanvas)
        }
        _ -> dispatch(AppSetNoCanvas)
      }
    })
  })
}

fn schedule_next_frame() {
  effect.from(fn(dispatch) {
    engine.request_animation_frame(fn(timestamp) {

  })
}

// VIEW ------------------------------------------------------------------------

fn view(model: Model) -> Element(Msg) {
  html.div([], [
    html.h1([], [render(model)]),
    html.canvas([attribute.id(render.render_target_id)]),
  ])
}

fn render(model: Model) -> Element(Msg) {
  let text = case model {
    NoCanvas -> "No canvas available"
    Ready -> "It worked"
    Idle -> "Initializing"
  }
  element.text(text)
}
