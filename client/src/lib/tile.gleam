import gleam/dict
import gleam/option
import gleam/result
import lib/asset/demo
import lib/sprite

pub type Tile {
  Tile(elevation: Int, terrain: Terrain, passability: Passability)
}

pub type Terrain {
  Demo(demo.DemoVariant)
  Blank
}

pub type Passability {
  Passable
  Impassable
}

pub fn get_sprite(
  sprite_sheet: sprite.SpriteSheet,
  terrain: Terrain,
) -> Result(sprite.SpriteRegion, Nil) {
  let sprite_key = case terrain {
    Demo(variant) -> Ok(demo.get_sprite_key(variant))
    Blank -> Error(Nil)
  }

  sprite_key
  |> result.try(dict.get(sprite_sheet.sprites, _))
}
