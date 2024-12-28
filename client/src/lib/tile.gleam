import gleam/dict
import gleam/result
import lib/asset/demo
import lib/sprite

pub type Tile {
  Tile(tileset: Tileset, passability: Passability)
}

pub type Tileset {
  Demo(demo.DemoVariant)
  Blank
}

pub type Passability {
  Passable
  Impassable
}

pub fn get_sprite(
  sprite_sheet: sprite.SpriteSheet,
  tileset: Tileset,
) -> Result(sprite.SpriteRegion, Nil) {
  let sprite_key = case tileset {
    Demo(variant) -> Ok(demo.get_sprite_key(variant))
    Blank -> Error(Nil)
  }

  sprite_key
  |> result.try(dict.get(sprite_sheet.sprites, _))
}
