import gleam/dict
import gleam/float
import gleam/result
import lib/asset/cursor as asset
import lib/camera
import lib/canvas/context
import lib/constants
import lib/coord
import lib/math
import lib/sprite
import lib/vector

const cursor_animation = CursorAnimation(0.0, 0.75, 1.0)

pub type Cursor {
  Cursor(
    position: coord.Coord,
    sprite_sheet: sprite.SpriteSheet,
    animation: CursorAnimation,
  )
}

pub type CursorAnimation {
  CursorAnimation(elapsed: Float, cycle: Float, amplitude: Float)
}

pub fn new(position: coord.Coord) -> Cursor {
  Cursor(
    position:,
    sprite_sheet: asset.sprite_sheet(),
    animation: cursor_animation,
  )
}

pub fn update(cursor: Cursor) {
  let updated_elapsed =
    cursor.animation.elapsed
    |> float.add(constants.fixed_dt())
    |> float.modulo(cursor.animation.cycle)
    |> result.unwrap(0.0)

  Cursor(
    ..cursor,
    animation: CursorAnimation(..cursor.animation, elapsed: updated_elapsed),
  )
}

pub fn render_base(
  context: context.CanvasRenderingContext2D,
  cursor: Cursor,
  coords: coord.Coord,
  camera: camera.Camera,
  scale: math.Scale,
) {
  case coord.equal(cursor.position, coords) {
    False -> Nil
    True -> {
      let region =
        asset.get_sprite_key(asset.Base)
        |> dict.get(cursor.sprite_sheet.sprites, _)

      case region {
        Ok(region) -> {
          let vector = vector.from_coord(coords, camera)
          sprite.render(context, cursor.sprite_sheet, region, vector, scale)
          Nil
        }
        _ -> Nil
      }
    }
  }
}
