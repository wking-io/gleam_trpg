import lib/vector

const cursor_idle_info = CursorIdle(0.0, 0.75, 1.0)

pub type CursorAnimation {
  CursorIdle(elapsed: Float, cycle: Float, amplitude: Float)
  CursorMoving(
    start: vector.Vector,
    target: vector.Vector,
    elapsed: Float,
    duration: Float,
  )
}

pub fn new_idle_cursor() -> CursorAnimation {
  cursor_idle_info
}

pub fn render() {
  todo
}
