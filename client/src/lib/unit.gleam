import gleam/dict
import gleam/io
import gleam/result
import lib/asset/roku
import lib/camera
import lib/canvas/context
import lib/coord
import lib/direction
import lib/math
import lib/sprite
import lib/vector

pub type UnitSet {
  Roku(roku.UnitVariant)
}

pub type UnitReference =
  String

pub type Unit {
  Unit(
    id: UnitReference,
    sprite_sheet: sprite.SpriteSheet,
    direction: direction.Direction,
    unitset: UnitSet,
  )
}

pub fn new(unitset: UnitSet, id: UnitReference) {
  case unitset {
    Roku(_) ->
      Unit(
        id:,
        sprite_sheet: roku.sprite_sheet(),
        unitset:,
        direction: direction.Down,
      )
  }
}

pub fn get_sprite(
  sprite_sheet: sprite.SpriteSheet,
  unitset: UnitSet,
  d: direction.Direction,
) -> Result(sprite.SpriteRegion, Nil) {
  let sprite_key = case unitset {
    Roku(variant) -> Ok(roku.get_sprite_key(variant, d))
  }

  sprite_key
  |> result.try(dict.get(sprite_sheet.sprites, _))
}

pub fn render(
  context: context.CanvasRenderingContext2D,
  unit: Unit,
  coords: coord.Coord,
  camera: camera.Camera,
  scale: math.Scale,
) -> Nil {
  let sprite_region =
    get_sprite(unit.sprite_sheet, unit.unitset, unit.direction)

  case sprite_region {
    Ok(region) -> {
      let vector =
        vector.from_coord(
          coords |> coord.add_elevation(unit.sprite_sheet.grid.height / 16),
          camera,
        )
      sprite.render(context, unit.sprite_sheet, region, vector, scale)
      Nil
    }
    _ -> Nil
  }
}
