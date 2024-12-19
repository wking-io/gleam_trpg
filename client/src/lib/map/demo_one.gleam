import lib/asset/demo
import lib/map
import lib/tile

pub fn new() -> map.Map {
  map.Map(width: 8, height: 8, sprite_sheet: demo.sprite_sheet(), tiles: [
    // Row 1
    new_tile(demo.Base),
    new_tile(demo.Variant1),
    new_tile(demo.Variant6),
    new_tile(demo.Base),
    new_tile(demo.Variant4),
    new_tile(demo.Variant5),
    new_tile(demo.Variant2),
    new_tile(demo.Base),
    // Row 2
    new_tile(demo.Variant3),
    new_tile(demo.Variant4),
    new_tile(demo.Base),
    new_tile(demo.Variant5),
    new_tile(demo.Variant1),
    new_tile(demo.Base),
    new_tile(demo.Variant6),
    new_tile(demo.Variant2),
    // Row 3
    new_tile(demo.Variant2),
    new_tile(demo.Base),
    new_tile(demo.Base),
    new_tile(demo.Variant1),
    new_tile(demo.Base),
    new_tile(demo.Variant3),
    new_tile(demo.Base),
    // Row 4
    new_tile(demo.Base),
    new_tile(demo.Variant4),
    new_tile(demo.Base),
    new_tile(demo.Variant1),
    new_tile(demo.Variant3),
    new_tile(demo.Base),
    new_tile(demo.Base),
    new_tile(demo.Base),
    new_tile(demo.Variant2),
    // Row 5
    new_tile(demo.Variant3),
    new_tile(demo.Base),
    new_tile(demo.Variant4),
    new_tile(demo.Base),
    new_tile(demo.Variant5),
    new_tile(demo.Base),
    new_tile(demo.Base),
    new_tile(demo.Variant1),
    // Row 6
    new_tile(demo.Base),
    new_tile(demo.Variant1),
    new_tile(demo.Base),
    new_tile(demo.Variant3),
    new_tile(demo.Base),
    new_tile(demo.Variant2),
    new_tile(demo.Variant5),
    new_tile(demo.Base),
    // Row 7
    new_tile(demo.Variant4),
    new_tile(demo.Variant2),
    new_tile(demo.Base),
    new_tile(demo.Base),
    new_tile(demo.Variant5),
    new_tile(demo.Base),
    new_tile(demo.Variant6),
    new_tile(demo.Base),
    // Row 8
    new_tile(demo.Variant6),
    new_tile(demo.Base),
    new_tile(demo.Variant1),
    new_tile(demo.Variant4),
    new_tile(demo.Base),
    new_tile(demo.Base),
    new_tile(demo.Base),
    new_tile(demo.Variant2),
  ])
}

fn new_tile(variant: demo.DemoVariant) -> tile.Tile {
  tile.Tile(
    elevation: 0,
    terrain: tile.Demo(variant),
    passability: tile.Passable,
  )
}
