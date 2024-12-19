import gleam/int
import lib/math
import lib/vector

const tile_width = 32

const half_width = 16

const tile_height = 16

const half_height = 8

// A Coord is a 3D Point in a constrained space
// Space that the coords exist on are a grid
// that is incremented in single digit Ints
pub opaque type Coord {
  Coord(x: Int, y: Int, z: Int, width: Int, height: Int)
}

pub fn new(width: Int, height: Int) -> Coord {
  Coord(0, 0, 0, width, height)
}

pub fn move(from: Coord, x: Int, y: Int, z: Int) -> Coord {
  Coord(
    int.clamp(from.x + x, 0, from.width),
    int.clamp(from.y + y, 0, from.height),
    z,
    from.width,
    from.height,
  )
}

pub fn elevate(from: Coord, z: Int) -> Coord {
  move(from, 0, 0, z)
}

pub fn next(coord: Coord) -> Coord {
  case is_bounded_x(coord), is_bounded_y(coord) {
    True, _ -> Coord(..coord, x: coord.x + 1)
    _, True -> Coord(..coord, x: 0, y: coord.y + 1)
    _, _ -> coord
  }
}

fn is_bounded_x(coord: Coord) -> Bool {
  coord.x < coord.width - 1
}

fn is_bounded_y(coord: Coord) -> Bool {
  coord.y < coord.height - 1
}

pub fn left(coord: Coord) -> Coord {
  move(coord, -1, 0, 0)
}

pub fn right(coord: Coord) -> Coord {
  move(coord, 1, 0, 0)
}

pub fn up(coord: Coord) -> Coord {
  move(coord, 0, -1, 0)
}

pub fn down(coord: Coord) -> Coord {
  move(coord, 0, 1, 0)
}

pub fn x(coord: Coord) {
  coord.x
}

pub fn y(coord: Coord) {
  coord.y
}

fn adjust_by_z(y: Int, coord: Coord) {
  y - int.multiply(coord.z, half_height)
}

pub fn to_vector(coord: Coord) -> vector.Vector {
  let screen_x =
    int.subtract(160, half_width) + int.subtract(coord.x, coord.y) * half_width
  let screen_y = tile_height + int.add(coord.x, coord.y) * half_height

  vector.at(
    screen_x |> int.to_float,
    screen_y |> adjust_by_z(coord) |> int.to_float,
  )
}
