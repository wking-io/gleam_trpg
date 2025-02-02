import gleam/dict
import lib/asset
import lib/sprite

pub type CursorVariant {
  Base
  Pointer
}

pub fn get_sprite_key(variant: CursorVariant) {
  case variant {
    Base -> "Base"
    Pointer -> "Pointer"
  }
}

const sprites = [
  #("Base", sprite.SpriteRegion(0, 0)),
  #("Pointer", sprite.SpriteRegion(1, 0)),
]

pub fn sprite_sheet() -> sprite.SpriteSheet {
  sprite.SpriteSheet(
    asset: asset.load_image(
      "https://pub-e304780d47a742ad9bad4f35844cd6e6.r2.dev/cursor.png",
    ),
    grid: sprite.Grid(32, 32),
    sprites: dict.from_list(sprites),
  )
}
