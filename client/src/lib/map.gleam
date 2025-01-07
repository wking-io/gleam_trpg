import gleam/dict
import gleam/list
import gleam/pair
import lib/coord
import lib/sprite
import lib/tile

pub type Map {
  Map(
    sprite_sheet: sprite.SpriteSheet,
    tiles: dict.Dict(coord.Coord, tile.Tile),
  )
}

pub fn each_tile(map: Map, f: fn(coord.Coord, tile.Tile) -> Nil) -> Nil {
  map.tiles
  |> dict.to_list
  |> list.sort(fn(a, b) { coord.compare(pair.first(a), pair.first(b)) })
  |> list.each(fn(tile_pair) {
    let coords = pair.first(tile_pair)
    let t = pair.second(tile_pair)
    f(coord.set_elevation(coords, t.elevation), t)
  })
}
