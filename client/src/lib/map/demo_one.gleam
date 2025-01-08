import gleam/dict
import lib/asset/demo
import lib/coord
import lib/map
import lib/tile

pub fn new() -> map.Map {
  let tiles =
    dict.from_list([
      // Row 1
      #(coord.at(0, 0, 0), new_tile(demo.Variant2, 1)),
      #(coord.at(1, 0, 0), new_tile(demo.Variant4, 0)),
      #(coord.at(2, 0, 0), new_tile(demo.Variant6, 1)),
      #(coord.at(3, 0, 0), new_tile(demo.Variant3, 2)),
      #(coord.at(4, 0, 0), new_tile(demo.Base, 1)),
      #(coord.at(5, 0, 0), new_tile(demo.Variant5, 0)),
      #(coord.at(6, 0, 0), new_tile(demo.Variant1, 1)),
      #(coord.at(7, 0, 0), new_tile(demo.Base, 2)),
      #(coord.at(8, 0, 0), new_tile(demo.Variant2, 2)),
      #(coord.at(9, 0, 0), new_tile(demo.Base, 3)),
      #(coord.at(10, 0, 0), new_tile(demo.Variant4, 3)),
      #(coord.at(11, 0, 0), new_tile(demo.Variant6, 1)),
      #(coord.at(12, 0, 0), new_tile(demo.Base, 0)),
      // Row 2
      #(coord.at(0, 1, 0), new_tile(demo.Variant5, 1)),
      #(coord.at(1, 1, 0), new_tile(demo.Base, 2)),
      #(coord.at(2, 1, 0), new_tile(demo.Variant4, 0)),
      #(coord.at(3, 1, 0), new_tile(demo.Variant2, 1)),
      #(coord.at(4, 1, 0), new_tile(demo.Variant6, 1)),
      #(coord.at(5, 1, 0), new_tile(demo.Base, 1)),
      #(coord.at(6, 1, 0), new_tile(demo.Variant3, 0)),
      #(coord.at(7, 1, 0), new_tile(demo.Variant5, 2)),
      #(coord.at(8, 1, 0), new_tile(demo.Variant1, 0)),
      #(coord.at(9, 1, 0), new_tile(demo.Base, 1)),
      #(coord.at(10, 1, 0), new_tile(demo.Variant4, 2)),
      #(coord.at(11, 1, 0), new_tile(demo.Variant6, 1)),
      #(coord.at(12, 1, 0), new_tile(demo.Variant2, 1)),
      // Row 3
      #(coord.at(0, 2, 0), new_tile(demo.Variant3, 2)),
      #(coord.at(1, 2, 0), new_tile(demo.Variant5, 3)),
      #(coord.at(2, 2, 0), new_tile(demo.Base, 2)),
      #(coord.at(3, 2, 0), new_tile(demo.Variant1, 3)),
      #(coord.at(4, 2, 0), new_tile(demo.Variant6, 1)),
      #(coord.at(5, 2, 0), new_tile(demo.Variant4, 0)),
      #(coord.at(6, 2, 0), new_tile(demo.Variant2, 0)),
      #(coord.at(7, 2, 0), new_tile(demo.Base, 0)),
      #(coord.at(8, 2, 0), new_tile(demo.Variant5, 0)),
      #(coord.at(9, 2, 0), new_tile(demo.Variant3, 0)),
      #(coord.at(10, 2, 0), new_tile(demo.Base, 0)),
      #(coord.at(11, 2, 0), new_tile(demo.Variant4, 0)),
      #(coord.at(12, 2, 0), new_tile(demo.Variant1, 0)),
      // Row 4
      #(coord.at(0, 3, 0), new_tile(demo.Variant6, 1)),
      #(coord.at(1, 3, 0), new_tile(demo.Base, 2)),
      #(coord.at(2, 3, 0), new_tile(demo.Variant5, 1)),
      #(coord.at(3, 3, 0), new_tile(demo.Variant4, 0)),
      #(coord.at(4, 3, 0), new_tile(demo.Variant1, 0)),
      #(coord.at(5, 3, 0), new_tile(demo.Variant3, 1)),
      #(coord.at(6, 3, 0), new_tile(demo.Base, 0)),
      #(coord.at(7, 3, 0), new_tile(demo.Variant2, 0)),
      #(coord.at(8, 3, 0), new_tile(demo.Variant5, 0)),
      #(coord.at(9, 3, 0), new_tile(demo.Base, 0)),
      #(coord.at(10, 3, 0), new_tile(demo.Variant6, 0)),
      #(coord.at(11, 3, 0), new_tile(demo.Variant1, 0)),
      #(coord.at(12, 3, 0), new_tile(demo.Base, 0)),
      // Row 5
      #(coord.at(0, 4, 0), new_tile(demo.Variant2, 1)),
      #(coord.at(1, 4, 0), new_tile(demo.Variant4, 0)),
      #(coord.at(2, 4, 0), new_tile(demo.Base, 0)),
      #(coord.at(3, 4, 0), new_tile(demo.Variant6, 0)),
      #(coord.at(4, 4, 0), new_tile(demo.Variant1, 0)),
      #(coord.at(5, 4, 0), new_tile(demo.Variant5, 1)),
      #(coord.at(6, 4, 0), new_tile(demo.Variant3, 0)),
      #(coord.at(7, 4, 0), new_tile(demo.Base, 0)),
      #(coord.at(8, 4, 0), new_tile(demo.Variant4, 0)),
      #(coord.at(9, 4, 0), new_tile(demo.Variant2, 0)),
      #(coord.at(10, 4, 0), new_tile(demo.Variant5, 1)),
      #(coord.at(11, 4, 0), new_tile(demo.Base, 0)),
      #(coord.at(12, 4, 0), new_tile(demo.Variant3, 1)),
      // Row 6
      #(coord.at(0, 5, 0), new_tile(demo.Base, 0)),
      #(coord.at(1, 5, 0), new_tile(demo.Variant1, 0)),
      #(coord.at(2, 5, 0), new_tile(demo.Variant4, 1)),
      #(coord.at(3, 5, 0), new_tile(demo.Base, 0)),
      #(coord.at(4, 5, 0), new_tile(demo.Variant3, 2)),
      #(coord.at(5, 5, 0), new_tile(demo.Variant5, 1)),
      #(coord.at(6, 5, 0), new_tile(demo.Base, 0)),
      #(coord.at(7, 5, 0), new_tile(demo.Variant6, 1)),
      #(coord.at(8, 5, 0), new_tile(demo.Variant2, 0)),
      #(coord.at(9, 5, 0), new_tile(demo.Base, 0)),
      #(coord.at(10, 5, 0), new_tile(demo.Variant1, 0)),
      #(coord.at(11, 5, 0), new_tile(demo.Variant5, 0)),
      #(coord.at(12, 5, 0), new_tile(demo.Variant4, 0)),
      // Row 7
      #(coord.at(0, 6, 0), new_tile(demo.Variant4, 1)),
      #(coord.at(1, 6, 0), new_tile(demo.Variant2, 2)),
      #(coord.at(2, 6, 0), new_tile(demo.Base, 1)),
      #(coord.at(3, 6, 0), new_tile(demo.Variant5, 0)),
      #(coord.at(4, 6, 0), new_tile(demo.Variant6, 0)),
      #(coord.at(5, 6, 0), new_tile(demo.Base, 0)),
      #(coord.at(6, 6, 0), new_tile(demo.Variant1, 0)),
      #(coord.at(7, 6, 0), new_tile(demo.Variant3, 0)),
      #(coord.at(8, 6, 0), new_tile(demo.Base, 0)),
      #(coord.at(9, 6, 0), new_tile(demo.Variant4, 0)),
      #(coord.at(10, 6, 0), new_tile(demo.Variant5, 0)),
      #(coord.at(11, 6, 0), new_tile(demo.Variant6, 0)),
      #(coord.at(12, 6, 0), new_tile(demo.Base, 0)),
      // Row 8
      #(coord.at(0, 7, 0), new_tile(demo.Base, 3)),
      #(coord.at(1, 7, 0), new_tile(demo.Variant1, 2)),
      #(coord.at(2, 7, 0), new_tile(demo.Variant6, 1)),
      #(coord.at(3, 7, 0), new_tile(demo.Variant3, 0)),
      #(coord.at(4, 7, 0), new_tile(demo.Variant5, 1)),
      #(coord.at(5, 7, 0), new_tile(demo.Base, 2)),
      #(coord.at(6, 7, 0), new_tile(demo.Variant2, 1)),
      #(coord.at(7, 7, 0), new_tile(demo.Variant4, 0)),
      #(coord.at(8, 7, 0), new_tile(demo.Variant5, 0)),
      #(coord.at(9, 7, 0), new_tile(demo.Variant6, 0)),
      #(coord.at(10, 7, 0), new_tile(demo.Variant3, 0)),
      #(coord.at(11, 7, 0), new_tile(demo.Base, 0)),
      #(coord.at(12, 7, 0), new_tile(demo.Variant1, 0)),
      // Row 9
      #(coord.at(0, 8, 0), new_tile(demo.Variant2, 2)),
      #(coord.at(1, 8, 0), new_tile(demo.Variant4, 1)),
      #(coord.at(2, 8, 0), new_tile(demo.Base, 0)),
      #(coord.at(3, 8, 0), new_tile(demo.Variant5, 0)),
      #(coord.at(4, 8, 0), new_tile(demo.Variant6, 0)),
      #(coord.at(5, 8, 0), new_tile(demo.Variant3, 0)),
      #(coord.at(6, 8, 0), new_tile(demo.Base, 0)),
      #(coord.at(7, 8, 0), new_tile(demo.Variant2, 0)),
      #(coord.at(8, 8, 0), new_tile(demo.Variant4, 0)),
      #(coord.at(9, 8, 0), new_tile(demo.Variant5, 0)),
      #(coord.at(10, 8, 0), new_tile(demo.Base, 0)),
      #(coord.at(11, 8, 0), new_tile(demo.Variant6, 0)),
      #(coord.at(12, 8, 0), new_tile(demo.Variant1, 0)),
      // Row 10
      #(coord.at(0, 9, 0), new_tile(demo.Variant5, 1)),
      #(coord.at(1, 9, 0), new_tile(demo.Base, 0)),
      #(coord.at(2, 9, 0), new_tile(demo.Variant4, 1)),
      #(coord.at(3, 9, 0), new_tile(demo.Variant3, 0)),
      #(coord.at(4, 9, 0), new_tile(demo.Variant2, 0)),
      #(coord.at(5, 9, 0), new_tile(demo.Variant6, 0)),
      #(coord.at(6, 9, 0), new_tile(demo.Base, 0)),
      #(coord.at(7, 9, 0), new_tile(demo.Variant5, 0)),
      #(coord.at(8, 9, 0), new_tile(demo.Variant1, 0)),
      #(coord.at(9, 9, 0), new_tile(demo.Variant4, 0)),
      #(coord.at(10, 9, 0), new_tile(demo.Base, 0)),
      #(coord.at(11, 9, 0), new_tile(demo.Variant6, 0)),
      #(coord.at(12, 9, 0), new_tile(demo.Variant3, 1)),
      // Row 11
      #(coord.at(0, 10, 0), new_tile(demo.Base, 0)),
      #(coord.at(1, 10, 0), new_tile(demo.Variant6, 0)),
      #(coord.at(2, 10, 0), new_tile(demo.Variant5, 0)),
      #(coord.at(3, 10, 0), new_tile(demo.Variant4, 0)),
      #(coord.at(4, 10, 0), new_tile(demo.Variant1, 0)),
      #(coord.at(5, 10, 0), new_tile(demo.Variant3, 0)),
      #(coord.at(6, 10, 0), new_tile(demo.Variant5, 0)),
      #(coord.at(7, 10, 0), new_tile(demo.Variant2, 0)),
      #(coord.at(8, 10, 0), new_tile(demo.Base, 0)),
      #(coord.at(9, 10, 0), new_tile(demo.Variant6, 0)),
      #(coord.at(10, 10, 0), new_tile(demo.Variant1, 0)),
      #(coord.at(11, 10, 0), new_tile(demo.Base, 1)),
      #(coord.at(12, 10, 0), new_tile(demo.Variant4, 2)),
      // Row 12
      #(coord.at(0, 11, 0), new_tile(demo.Variant3, 0)),
      #(coord.at(1, 11, 0), new_tile(demo.Base, 0)),
      #(coord.at(2, 11, 0), new_tile(demo.Variant6, 0)),
      #(coord.at(3, 11, 0), new_tile(demo.Variant5, 0)),
      #(coord.at(4, 11, 0), new_tile(demo.Variant2, 0)),
      #(coord.at(5, 11, 0), new_tile(demo.Variant4, 0)),
      #(coord.at(6, 11, 0), new_tile(demo.Variant1, 0)),
      #(coord.at(7, 11, 0), new_tile(demo.Base, 1)),
      #(coord.at(8, 11, 0), new_tile(demo.Variant6, 1)),
      #(coord.at(9, 11, 0), new_tile(demo.Variant3, 2)),
      #(coord.at(10, 11, 0), new_tile(demo.Variant5, 3)),
      #(coord.at(11, 11, 0), new_tile(demo.Variant2, 4)),
      #(coord.at(12, 11, 0), new_tile(demo.Base, 3)),
    ])
  map.Map(sprite_sheet: demo.sprite_sheet(), tiles: tiles)
}

fn new_tile(variant: demo.DemoVariant, elevation: Int) -> tile.Tile {
  tile.Tile(tileset: tile.Demo(variant), passability: tile.Passable, elevation:)
}
