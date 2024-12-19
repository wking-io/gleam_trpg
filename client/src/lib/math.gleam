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

pub type Scale {
  Double
  Triple
  Quad
}

pub fn scale(from: Float, amount: Scale) {
  let by = case amount {
    Double -> 2.0
    Triple -> 3.0
    Quad -> 4.0
  }
  float.multiply(from, by)
}
