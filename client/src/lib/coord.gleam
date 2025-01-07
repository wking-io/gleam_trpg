import gleam/int
import gleam/order
import lib/direction

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
  Coord(x, y, z)
}

pub fn move(from: Coord, by: Coord) -> Coord {
  Coord(int.max(from.x + by.x, 0), int.max(from.y + by.y, 0), by.z)
}

pub fn elevate(from: Coord, z: Int) -> Coord {
  move(from, Coord(0, 0, int.max(z, 0)))
}

pub fn left(coord: Coord) -> Coord {
  move(coord, Coord(-1, 0, 0))
}

pub fn right(coord: Coord) -> Coord {
  move(coord, Coord(1, 0, 0))
}

pub fn up(coord: Coord) -> Coord {
  move(coord, Coord(0, -1, 0))
}

pub fn down(coord: Coord) -> Coord {
  move(coord, Coord(0, 1, 0))
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

pub fn equal(a: Coord, b: Coord) -> Bool {
  a.x == b.x && a.y == b.y && a.z == b.z
}

pub fn from_direction(direction: direction.Direction) -> Coord {
  case direction {
    direction.Up -> at(0, -1, 0)
    direction.Down -> at(0, 1, 0)
    direction.Left -> at(-1, 0, 0)
    direction.Right -> at(1, 0, 0)
  }
}
