import gleam/float

pub fn interpolate(from: Float, to: Float, progress: Float) {
  to
  // Get delta
  |> float.subtract(from)
  // Get current progress through delta
  |> float.multiply(progress)
  // Add progress to base
  |> float.add(from)
}
