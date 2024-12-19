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
  #("Base", sprite.SpriteRegion(0, 0)), #("Variant1", sprite.SpriteRegion(0, 0)),
  #("Variant2", sprite.SpriteRegion(0, 1)),
  #("Variant3", sprite.SpriteRegion(0, 2)),
  #("Variant4", sprite.SpriteRegion(0, 3)),
  #("Variant5", sprite.SpriteRegion(0, 4)),
  #("Variant6", sprite.SpriteRegion(0, 5)),
]

pub fn sprite_sheet() -> sprite.SpriteSheet {
  sprite.SpriteSheet(
    asset: asset.load_image(
      "https://pub-e304780d47a742ad9bad4f35844cd6e6.r2.dev/test-tile.png",
    ),
    sprites: dict.from_list(sprites),
  )
}
