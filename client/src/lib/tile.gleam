import gleam/dict
import gleam/result
import lib/asset/demo
import lib/camera
import lib/canvas/context
import lib/coord
import lib/math
import lib/sprite
import lib/vector

pub type Tile {
  Tile(tileset: Tileset, passability: Passability, elevation: Int)
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

pub fn render(
  context: context.CanvasRenderingContext2D,
  tile: Tile,
  coords: coord.Coord,
  sprite_sheet: sprite.SpriteSheet,
  camera: camera.Camera,
  scale: math.Scale,
) {
  let sprite_region = get_sprite(sprite_sheet, tile.tileset)

  case sprite_region {
    Ok(region) -> {
      let vector = vector.from_coord(coords, camera)
      sprite.render(context, sprite_sheet, region, vector, scale)
      Nil
    }
    _ -> Nil
  }
}
