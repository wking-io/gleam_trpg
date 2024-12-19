import gleam/int

pub opaque type Coord {
  Coord(x: Int, y: Int, width: Int, height: Int)
}

pub fn new(width: Int, height: Int) -> Coord {
  Coord(0, 0, width, height)
}

pub fn move(from: Coord, x: Int, y: Int) -> Coord {
  Coord(
    int.clamp(from.x + x, 0, from.width),
    int.clamp(from.y + y, 0, from.height),
    from.width,
    from.height,
  )
}

pub fn next(coord: Coord) -> Coord {
  case is_bounded_x(coord), is_bounded_y(coord) {
    True, _ -> Coord(..coord, x: coord.x + 1)
    _, True -> Coord(..coord, y: coord.y + 1)
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
  move(coord, -1, 0)
}

pub fn right(coord: Coord) -> Coord {
  move(coord, 1, 0)
}

pub fn up(coord: Coord) -> Coord {
  move(coord, 0, -1)
}

pub fn down(coord: Coord) -> Coord {
  move(coord, 0, 1)
}

pub fn x(coord: Coord) {
  coord.x
}

pub fn y(coord: Coord) {
  coord.y
}
