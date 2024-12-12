// Opaque type for representing Canvas Element
//
pub opaque type Canvas

// Create a blank Canvas instance
//
@external(javascript, "./canvas/canvas_ffi.mjs", "create_canvas")
pub fn create_canvas() -> Canvas

// Find existing canvas element in DOM
//
@external(javascript, "./canvas/canvas_ffi.mjs", "get_canvas_by_id")
pub fn get_canvas_by_id(id: String) -> Result(Canvas, String)

// Set the canvas height
//
@external(javascript, "./canvas/canvas_ffi.mjs", "set_height")
pub fn set_height(canvas: Canvas, height: Int) -> Canvas

// Set the canvas width
//
@external(javascript, "./canvas/canvas_ffi.mjs", "set_width")
pub fn set_width(canvas: Canvas, width: Int) -> Canvas
