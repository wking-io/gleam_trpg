import gleam/float

// In ms
const dt_ms = 16.67

// In s
const dt_s = 0.01667

// Get value for animation by frame count
pub fn to_duration(count: Float) {
  float.multiply(dt_s, count)
}
