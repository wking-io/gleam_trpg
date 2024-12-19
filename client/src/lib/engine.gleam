import lib/camera
import lib/cursor
import lib/event
import lib/map
import lib/math
import lib/vector

pub type GameState {
  GameState(
    accumulator: Float,
    camera: camera.Camera,
    cursor: vector.Vector,
    cursor_animation: cursor.CursorAnimation,
    event_queue: List(event.Event),
    fps: Float,
    map: map.Map,
    previous_time: Float,
    scale: math.Scale,
  )
}

pub fn new(init: Float, map: map.Map) -> GameState {
  GameState(
    accumulator: 0.0,
    camera: camera.new(),
    cursor: vector.new(),
    cursor_animation: cursor.new_idle_cursor(),
    event_queue: event.new_queue(),
    fps: 0.0,
    map: map,
    previous_time: init,
    scale: math.Double,
  )
}

// Bind for requestAnimationFrame
//
@external(javascript, "../client_lib_engine_ffi.mjs", "request_animation_frame")
pub fn request_animation_frame(cb: fn(Float) -> Nil) -> Nil
