import gleam/float
import gleam/int

// In ms
const dt_ms = 16.67

// In s
const dt_s = 0.01667

// Get value for animation by frame count
pub fn to_duration(count: Int) {
  float.multiply(dt_s, int.to_float(count))
}
