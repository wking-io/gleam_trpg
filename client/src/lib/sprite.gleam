import gleam/dict
import gleam/int
import lib/asset
import lib/canvas/context as context_impl
import lib/math
import lib/vector

pub type SpriteRegion {
  SpriteRegion(x: Int, y: Int)
}

pub type SpriteSheet {
  SpriteSheet(
    asset: asset.Asset,
    grid: Int,
    sprites: dict.Dict(String, SpriteRegion),
  )
}

pub fn x(sr: SpriteRegion, grid: Int) {
  sr.x * grid
}

pub fn y(sr: SpriteRegion, grid: Int) {
  sr.y * grid
}

pub fn render(
  context: context_impl.CanvasRenderingContext2D,
  sheet: SpriteSheet,
  sprite_region: SpriteRegion,
  at: vector.Vector,
  scale: math.Scale,
) {
  context_impl.draw_image_cropped(
    context,
    sheet.asset,
    x(sprite_region, sheet.grid) |> int.to_float,
    y(sprite_region, sheet.grid) |> int.to_float,
    32.0,
    32.0,
    vector.x(at) |> math.scale(scale),
    vector.y(at) |> math.scale(scale),
    32.0 |> math.scale(scale),
    32.0 |> math.scale(scale),
  )
}
