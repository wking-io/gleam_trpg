import gleam/int
import lib/math

pub type Camera {
  Camera(x: Int, y: Int, width: Int, height: Int)
}

const width = 320

const height = 180

pub fn new() {
  Camera(x: width / 2, y: height / 2, width: width, height: height)
}

pub fn get_viewport(camera: Camera, scale: math.Scale) {
  #(
    math.scale(camera.width |> int.to_float, scale),
    math.scale(camera.height |> int.to_float, scale),
  )
}
