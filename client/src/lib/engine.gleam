import lib/cursor
import lib/event
import lib/vector

pub type GameState {
  GameState(
    previous_time: Float,
    accumulator: Float,
    event_queue: List(event.Event),
    cursor: vector.Vector,
    cursor_animation: cursor.CursorAnimation,
    fps: Float,
  )
}

pub fn new(init: Float) -> GameState {
  GameState(
    previous_time: init,
    accumulator: 0.0,
    event_queue: event.new_queue(),
    cursor: vector.new(),
    cursor_animation: cursor.new_idle_cursor(),
    fps: 0.0,
  )
}

// Bind for requestAnimationFrame
//
@external(javascript, "../client_lib_engine_ffi.mjs", "request_animation_frame")
pub fn request_animation_frame(cb: fn(Float) -> Nil) -> Nil
