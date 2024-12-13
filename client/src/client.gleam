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
  Ready
}

fn init(_) -> #(Model, Effect(Msg)) {
  #(Idle, init_canvas())
}

// UPDATE ----------------------------------------------------------------------

type Msg {
  AppInitCanvas
  AppSetNoCanvas
}

fn update(_model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    AppInitCanvas -> #(Ready, effect.none())
    AppSetNoCanvas -> #(NoCanvas, effect.none())
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
