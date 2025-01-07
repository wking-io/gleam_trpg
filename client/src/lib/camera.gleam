import gleam/int
import lib/coord
import lib/math

pub type Camera {
  Camera(focus: coord.Coord, width: Int, height: Int)
}

const width = 640

const height = 360

pub fn new(focus: coord.Coord) {
  Camera(focus:, width: width, height: height)
}

pub fn get_viewport(camera: Camera, scale: math.Scale) {
  #(
    math.scale(camera.width |> int.to_float, scale),
    math.scale(camera.height |> int.to_float, scale),
  )
}
