import gleam/dict
import lib/asset/demo
import lib/coord
import lib/map
import lib/tile

pub fn new() -> map.Map {
  let tiles =
    dict.from_list([
      // Row 1
      #(coord.at(0, 0, 0), new_tile(demo.Base)),
      #(coord.at(1, 0, 0), new_tile(demo.Variant1)),
      #(coord.at(2, 0, 0), new_tile(demo.Variant6)),
      #(coord.at(3, 0, 0), new_tile(demo.Base)),
      #(coord.at(4, 0, 0), new_tile(demo.Variant4)),
      #(coord.at(5, 0, 0), new_tile(demo.Variant5)),
      #(coord.at(6, 0, 0), new_tile(demo.Variant2)),
      #(coord.at(7, 0, 0), new_tile(demo.Base)),
      // Row 2
      #(coord.at(0, 1, 0), new_tile(demo.Variant3)),
      #(coord.at(1, 1, 0), new_tile(demo.Variant4)),
      #(coord.at(2, 1, 0), new_tile(demo.Base)),
      #(coord.at(3, 1, 0), new_tile(demo.Variant5)),
      #(coord.at(4, 1, 0), new_tile(demo.Variant1)),
      #(coord.at(5, 1, 0), new_tile(demo.Base)),
      #(coord.at(6, 1, 0), new_tile(demo.Variant6)),
      #(coord.at(7, 1, 0), new_tile(demo.Variant2)),
      // Row 3
      #(coord.at(0, 2, 0), new_tile(demo.Variant2)),
      #(coord.at(1, 2, 0), new_tile(demo.Base)),
      #(coord.at(2, 2, 0), new_tile(demo.Base)),
      #(coord.at(3, 2, 0), new_tile(demo.Variant1)),
      #(coord.at(4, 2, 0), new_tile(demo.Variant1)),
      #(coord.at(5, 2, 0), new_tile(demo.Base)),
      #(coord.at(6, 2, 0), new_tile(demo.Variant3)),
      #(coord.at(7, 2, 0), new_tile(demo.Base)),
      // Row 4
      #(coord.at(0, 3, 0), new_tile(demo.Base)),
      #(coord.at(1, 3, 0), new_tile(demo.Variant4)),
      #(coord.at(2, 3, 0), new_tile(demo.Base)),
      #(coord.at(3, 3, 2), new_tile(demo.Variant1)),
      #(coord.at(4, 3, 2), new_tile(demo.Variant3)),
      #(coord.at(5, 3, 0), new_tile(demo.Base)),
      #(coord.at(6, 3, 0), new_tile(demo.Base)),
      #(coord.at(7, 3, 0), new_tile(demo.Variant2)),
      // Row 5
      #(coord.at(0, 4, 0), new_tile(demo.Variant3)),
      #(coord.at(1, 4, 0), new_tile(demo.Base)),
      #(coord.at(2, 4, 0), new_tile(demo.Variant4)),
      #(coord.at(3, 4, 2), new_tile(demo.Base)),
      #(coord.at(4, 4, 2), new_tile(demo.Variant5)),
      #(coord.at(5, 4, 0), new_tile(demo.Base)),
      #(coord.at(6, 4, 0), new_tile(demo.Base)),
      #(coord.at(7, 4, 0), new_tile(demo.Variant1)),
      // Row 6
      #(coord.at(0, 5, 0), new_tile(demo.Base)),
      #(coord.at(1, 5, 0), new_tile(demo.Variant1)),
      #(coord.at(2, 5, 0), new_tile(demo.Base)),
      #(coord.at(3, 5, 0), new_tile(demo.Variant3)),
      #(coord.at(4, 5, 0), new_tile(demo.Base)),
      #(coord.at(5, 5, 0), new_tile(demo.Variant2)),
      #(coord.at(6, 5, 0), new_tile(demo.Variant5)),
      #(coord.at(7, 5, 0), new_tile(demo.Base)),
      // Row 7
      #(coord.at(0, 6, 0), new_tile(demo.Variant4)),
      #(coord.at(1, 6, 0), new_tile(demo.Variant2)),
      #(coord.at(2, 6, 0), new_tile(demo.Base)),
      #(coord.at(3, 6, 0), new_tile(demo.Base)),
      #(coord.at(4, 6, 0), new_tile(demo.Variant5)),
      #(coord.at(5, 6, 0), new_tile(demo.Base)),
      #(coord.at(6, 6, 0), new_tile(demo.Variant6)),
      #(coord.at(7, 6, 0), new_tile(demo.Base)),
      // Row 8
      #(coord.at(0, 7, 0), new_tile(demo.Variant6)),
      #(coord.at(1, 7, 0), new_tile(demo.Base)),
      #(coord.at(2, 7, 0), new_tile(demo.Variant1)),
      #(coord.at(3, 7, 0), new_tile(demo.Variant4)),
      #(coord.at(4, 7, 0), new_tile(demo.Base)),
      #(coord.at(5, 7, 0), new_tile(demo.Base)),
      #(coord.at(6, 7, 0), new_tile(demo.Base)),
      #(coord.at(7, 7, 0), new_tile(demo.Variant2)),
    ])
  map.Map(sprite_sheet: demo.sprite_sheet(), tiles: tiles)
}

fn new_tile(variant: demo.DemoVariant) -> tile.Tile {
  tile.Tile(tileset: tile.Demo(variant), passability: tile.Passable)
}
