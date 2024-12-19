import gleam/option
import lib/asset/demo
import lib/map
import lib/tile

pub fn new() -> map.Map {
  map.Map(width: 8, height: 8, sprite_sheet: demo.sprite_sheet(), tiles: [
    // Row 1
    new_tile(demo.Base, 0),
    new_tile(demo.Variant1, 0),
    new_tile(demo.Variant6, 0),
    new_tile(demo.Base, 0),
    new_tile(demo.Variant4, 0),
    new_tile(demo.Variant5, 0),
    new_tile(demo.Variant2, 0),
    new_tile(demo.Base, 0),
    // Row 2
    new_tile(demo.Variant3, 0),
    new_tile(demo.Variant4, 0),
    new_tile(demo.Base, 0),
    new_tile(demo.Variant5, 0),
    new_tile(demo.Variant1, 0),
    new_tile(demo.Base, 0),
    new_tile(demo.Variant6, 0),
    new_tile(demo.Variant2, 0),
    // Row 3
    new_tile(demo.Variant2, 0),
    new_tile(demo.Base, 0),
    new_tile(demo.Base, 1),
    new_tile(demo.Variant1, 1),
    new_tile(demo.Variant1, 1),
    new_tile(demo.Base, 1),
    new_tile(demo.Variant3, 0),
    new_tile(demo.Base, 0),
    // Row 4
    new_tile(demo.Base, 0),
    new_tile(demo.Variant4, 0),
    new_tile(demo.Base, 1),
    new_tile(demo.Variant1, 2),
    new_tile(demo.Variant3, 2),
    new_tile(demo.Base, 1),
    new_tile(demo.Base, 0),
    new_tile(demo.Variant2, 0),
    // Row 5
    new_tile(demo.Variant3, 0),
    new_tile(demo.Base, 0),
    new_tile(demo.Variant4, 1),
    new_tile(demo.Base, 2),
    new_tile(demo.Variant5, 2),
    new_tile(demo.Base, 1),
    new_tile(demo.Base, 0),
    new_tile(demo.Variant1, 0),
    // Row 6
    new_tile(demo.Base, 0),
    new_tile(demo.Variant1, 0),
    new_tile(demo.Base, 1),
    new_tile(demo.Variant3, 1),
    new_tile(demo.Base, 1),
    new_tile(demo.Variant2, 1),
    new_tile(demo.Variant5, 0),
    new_tile(demo.Base, 0),
    // Row 7
    new_tile(demo.Variant4, 0),
    new_tile(demo.Variant2, 0),
    new_tile(demo.Base, 0),
    new_tile(demo.Base, 0),
    new_tile(demo.Variant5, 0),
    new_tile(demo.Base, 0),
    new_tile(demo.Variant6, 0),
    new_tile(demo.Base, 0),
    // Row 8
    new_tile(demo.Variant6, 0),
    new_tile(demo.Base, 0),
    new_tile(demo.Variant1, 0),
    new_tile(demo.Variant4, 0),
    new_tile(demo.Base, 0),
    new_tile(demo.Base, 0),
    new_tile(demo.Base, 0),
    new_tile(demo.Variant2, 0),
  ])
}

fn new_tile(variant: demo.DemoVariant, elevation: Int) -> tile.Tile {
  tile.Tile(
    elevation: elevation,
    terrain: tile.Demo(variant),
    passability: tile.Passable,
  )
}
