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
    grid: Grid,
    sprites: dict.Dict(String, SpriteRegion),
  )
}

pub type Grid {
  Grid(width: Int, height: Int)
}

pub fn x(sr: SpriteRegion, grid: Grid) {
  sr.x * grid.width
}

pub fn y(sr: SpriteRegion, grid: Grid) {
  sr.y * grid.height
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
    sheet.grid.width |> int.to_float,
    sheet.grid.height |> int.to_float,
    vector.x(at) |> math.scale(scale),
    vector.y(at) |> math.scale(scale),
    sheet.grid.width |> int.to_float |> math.scale(scale),
    sheet.grid.height |> int.to_float |> math.scale(scale),
  )
}
