import gleam/result
import lib/canvas.{type Canvas}
import lib/canvas/context.{type CanvasRenderingContext2D}

pub type RenderContext {
  RenderContext(Canvas, CanvasRenderingContext2D)
}

pub const render_target_id = "ds_render_target"

pub fn with_context() {
  let canvas_result = canvas.get_canvas_by_id(render_target_id)
  let context_result = result.try(canvas_result, context.get_context_2d)
  case canvas_result, context_result {
    Ok(can), Ok(con) -> Ok(RenderContext(can, con))
    _, _ -> Error("Failed to find context.")
  }
}
