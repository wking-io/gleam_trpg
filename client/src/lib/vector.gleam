import gleam/float
import gleam/int
import lib/camera
import lib/coord
import lib/direction
import lib/math

const half_width = 32

const half_height = 16

pub opaque type Vector {
  Vector(x: Float, y: Float)
}

pub fn new() -> Vector {
  Vector(0.0, 0.0)
}

pub fn at(x: Float, y: Float) -> Vector {
  Vector(x, y)
}

pub fn x(vec: Vector) {
  vec.x
}

pub fn y(vec: Vector) {
  vec.y
}

pub fn move(from: Vector, by: Vector) -> Vector {
  at(float.add(from.x, by.x), float.add(from.y, by.y))
}

pub fn scale(vec: Vector, scale: Float) -> Vector {
  map(vec, float.multiply(_, scale))
}

pub fn map(vec: Vector, cb: fn(Float) -> Float) -> Vector {
  at(cb(vec.x), cb(vec.y))
}

pub fn interpolate(from: Vector, to: Vector, progress: Float) {
  at(
    math.interpolate(from.x, to.x, progress),
    math.interpolate(from.y, to.y, progress),
  )
}

pub fn from_direction(direction: direction.Direction) -> Vector {
  case direction {
    direction.Up -> at(0.0, -1.0)
    direction.Down -> at(0.0, 1.0)
    direction.Left -> at(-1.0, 0.0)
    direction.Right -> at(1.0, 0.0)
  }
}

pub fn from_coord(coords: coord.Coord, camera: camera.Camera) -> Vector {
  let dx = coords.x - camera.focus.x
  let dy = coords.y - camera.focus.y
  let center_x = camera.width / 2
  let center_y = camera.height / 2 - half_height

  let screen_x = center_x + { dx - dy } * half_width

  let screen_y = center_y + { dx + dy } * half_height

  at(
    screen_x |> int.to_float,
    { screen_y - coords.z * half_height } |> int.to_float,
  )
}

pub fn to_pair(vec: Vector) -> #(Float, Float) {
  #(vec.x, vec.y)
}
