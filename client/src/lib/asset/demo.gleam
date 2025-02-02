import gleam/dict
import lib/asset
import lib/sprite

pub type DemoVariant {
  Base
  Variant1
  Variant2
  Variant3
  Variant4
  Variant5
  Variant6
}

pub fn get_sprite_key(variant: DemoVariant) {
  case variant {
    Base -> "Base"
    Variant1 -> "Variant1"
    Variant2 -> "Variant2"
    Variant3 -> "Variant3"
    Variant4 -> "Variant4"
    Variant5 -> "Variant5"
    Variant6 -> "Variant6"
  }
}

const sprites = [
  #("Base", sprite.SpriteRegion(0, 0)),
  #("Variant1", sprite.SpriteRegion(1, 0)),
  #("Variant2", sprite.SpriteRegion(2, 0)),
  #("Variant3", sprite.SpriteRegion(3, 0)),
  #("Variant4", sprite.SpriteRegion(4, 0)),
  #("Variant5", sprite.SpriteRegion(5, 0)),
  #("Variant6", sprite.SpriteRegion(6, 0)),
]

pub fn sprite_sheet() -> sprite.SpriteSheet {
  sprite.SpriteSheet(
    asset: asset.load_image(
      "https://pub-e304780d47a742ad9bad4f35844cd6e6.r2.dev/color-test-tiles.png",
    ),
    grid: sprite.Grid(32, 32),
    sprites: dict.from_list(sprites),
  )
}
