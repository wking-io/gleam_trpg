import gleam/bit_array
import prng/random

pub fn make_generator() -> random.Generator(BitArray) {
  random.bit_array()
}

pub fn step(generator: random.Generator(BitArray)) -> String {
  generator |> random.random_sample |> bit_array.base64_encode(True)
}
