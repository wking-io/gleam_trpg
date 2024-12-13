import lib/asset.{type Asset}
import lib/canvas.{type Canvas}
import lib/canvas/text_metrics.{type TextMetrics}

// Opaque type for representing the context returned from Canvas
//
pub type CanvasRenderingContext2D

// Get the 2D render context from Canvas
//
@external(javascript, "../../client_lib_canvas_ffi.mjs", "get_context_2d")
pub fn get_context_2d(
  canvas: Canvas,
) -> Result(CanvasRenderingContext2D, String)

// Get fillStyle property
//
@external(javascript, "../../client_lib_canvas_ffi.mjs", "get_fill_style")
pub fn get_fill_style(context: CanvasRenderingContext2D) -> String

// Set fillStyle property
//
@external(javascript, "../../client_lib_canvas_ffi.mjs", "set_fill_style")
pub fn set_fill_style(
  context: CanvasRenderingContext2D,
  style: String,
) -> CanvasRenderingContext2D

// Get font property
//
@external(javascript, "../../client_lib_canvas_ffi.mjs", "get_font")
pub fn get_font(context: CanvasRenderingContext2D) -> String

// Set font property
//
@external(javascript, "../../client_lib_canvas_ffi.mjs", "set_font")
pub fn set_font(
  context: CanvasRenderingContext2D,
  font: String,
) -> CanvasRenderingContext2D

// Get letterSpacing property
//
@external(javascript, "../../client_lib_canvas_ffi.mjs", "get_letter_spacing")
pub fn get_letter_spacing(context: CanvasRenderingContext2D) -> String

// Set fillStyle property
//
@external(javascript, "../../client_lib_canvas_ffi.mjs", "set_letter_spacing")
pub fn set_letter_spacing(
  context: CanvasRenderingContext2D,
  style: String,
) -> CanvasRenderingContext2D

// Clear the specified location
//
@external(javascript, "../../client_lib_canvas_ffi.mjs", "clear_rect")
pub fn clear_rect(
  context: CanvasRenderingContext2D,
  x: Float,
  y: Float,
  width: Float,
  height: Float,
) -> CanvasRenderingContext2D

/// Draws an image at the destination (dx, dy)
@external(javascript, "../../client_lib_canvas_ffi.mjs", "draw_image_simple")
pub fn draw_image_simple(
  context: CanvasRenderingContext2D,
  image: Asset,
  dx: Float,
  dy: Float,
) -> CanvasRenderingContext2D

/// Draws an image at the destination (dx, dy) with scaling (d_width, d_height)
@external(javascript, "../../client_lib_canvas_ffi.mjs", "draw_image_scaled")
pub fn draw_image_scaled(
  context: CanvasRenderingContext2D,
  image: Asset,
  dx: Float,
  dy: Float,
  d_width: Float,
  d_height: Float,
) -> CanvasRenderingContext2D

/// Draws a portion of an image (sx, sy, s_width, s_height) to the destination (dx, dy, d_width, d_height)
@external(javascript, "../../client_lib_canvas_ffi.mjs", "draw_image_cropped")
pub fn draw_image_cropped(
  context: CanvasRenderingContext2D,
  image: Asset,
  sx: Float,
  sy: Float,
  s_width: Float,
  s_height: Float,
  dx: Float,
  dy: Float,
  d_width: Float,
  d_height: Float,
) -> CanvasRenderingContext2D

// Draw a shape at (x, y) that is size (width, height)
//
@external(javascript, "../../client_lib_canvas_ffi.mjs", "fill_rect")
pub fn fill_rect(
  context: CanvasRenderingContext2D,
  x: Float,
  y: Float,
  width: Float,
  height: Float,
) -> CanvasRenderingContext2D

// Get a TextMetrics Object based on context
//
@external(javascript, "../../client_lib_canvas_ffi.mjs", "measure_text")
pub fn measure_text(
  context: CanvasRenderingContext2D,
  text: String,
) -> TextMetrics
