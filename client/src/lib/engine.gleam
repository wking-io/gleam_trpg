// Bind for requestAnimationFrame
//
@external(javascript, "../client_lib_enginee_ffi.mjs", "request_animation_frame")
pub fn request_animation_frame(cb: fn(Int) -> Nil) -> Nil
