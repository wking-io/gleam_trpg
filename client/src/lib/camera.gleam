import gleam/int
import lib/coord
import lib/math

pub type Camera {
  Camera(focus: coord.Coord, width: Int, height: Int)
}

const width = 320

const height = 180

pub fn new(focus: coord.Coord) {
  Camera(focus:, width: width, height: height)
}

pub fn get_viewport(camera: Camera, scale: math.Scale) {
  #(
    math.scale(camera.width |> int.to_float, scale),
    math.scale(camera.height |> int.to_float, scale),
  )
}

const bound_x = 3

const bound_y = 2

pub fn in_bounds(camera: Camera, target: coord.Coord) {
  let dx = target.x - camera.focus.x
  let dy = target.y - camera.focus.y
  let dz = target.z - camera.focus.z

  let screen_x = int.absolute_value(dx - dy)
  let screen_y = int.absolute_value(dx + dy + dz)

  screen_x < bound_x && screen_y < bound_y
}

pub fn set_focus(camera: Camera, focus: coord.Coord) {
  Camera(..camera, focus:)
}
