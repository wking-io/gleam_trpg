import gleam/int
import gleam/order
import lib/vector

const tile_width = 32

const half_width = 16

const tile_height = 16

const half_height = 8

// A Coord is a 3D Point in a constrained space
// Space that the coords exist on are a grid
// that is incremented in single digit Ints
pub opaque type Coord {
  Coord(x: Int, y: Int, z: Int)
}

pub fn new() -> Coord {
  Coord(0, 0, 0)
}

pub fn at(x: Int, y: Int, z: Int) -> Coord {
  Coord(int.max(x, 0), int.max(y, 0), z)
}

pub fn move(from: Coord, x: Int, y: Int, z: Int) -> Coord {
  Coord(int.max(from.x + x, 0), int.max(from.y + y, 0), z)
}

pub fn elevate(from: Coord, z: Int) -> Coord {
  move(from, 0, 0, int.max(z, 0))
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

pub fn compare(a: Coord, b: Coord) -> order.Order {
  int.compare(sum(a), sum(b))
}

fn sum(coord: Coord) -> Int {
  coord.x + coord.y * 10
}
