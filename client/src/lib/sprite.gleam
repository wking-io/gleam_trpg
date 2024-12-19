import gleam/dict
import lib/asset

pub type SpriteRegion {
  SpriteRegion(x: Int, y: Int)
}

pub type SpriteSheet {
  SpriteSheet(asset: asset.Asset, sprites: dict.Dict(String, SpriteRegion))
}

pub fn x(sr: SpriteRegion) {
  sr.x
}

pub fn y(sr: SpriteRegion) {
  sr.y
}
