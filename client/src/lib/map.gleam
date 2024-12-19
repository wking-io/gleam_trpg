import lib/coord
import lib/sprite
import lib/tile

pub type Map {
  Map(
    width: Int,
    height: Int,
    sprite_sheet: sprite.SpriteSheet,
    tiles: List(tile.Tile),
  )
}

pub fn each_tile(map: Map, f: fn(coord.Coord, tile.Tile) -> b) -> Nil {
  each_tile_loop(map.tiles, coord.new(map.width, map.height), f)
}

fn each_tile_loop(
  tiles: List(tile.Tile),
  coords: coord.Coord,
  f: fn(coord.Coord, tile.Tile) -> b,
) -> Nil {
  case tiles {
    [] -> Nil
    [tile, ..rest] -> {
      f(coords, tile)
      each_tile_loop(rest, coord.next(coords), f)
    }
  }
}
