import gleam/int
import gleam/order

// A Coord is a 3D Point in a constrained space
// Space that the coords exist on are a grid
// that is incremented in single digit Ints
pub type Coord {
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

pub fn compare(a: Coord, b: Coord) -> order.Order {
  int.compare(sum(a), sum(b))
}

fn sum(coord: Coord) -> Int {
  coord.x + coord.y * 10
}
