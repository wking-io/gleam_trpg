import gleam/dict
import lib/asset
import lib/direction
import lib/sprite

pub type UnitVariant {
  Idle
}

pub fn get_sprite_key(variant: UnitVariant, direction) {
  case variant, direction {
    Idle, direction.Up -> "IdleUp"
    Idle, direction.Down -> "IdleDown"
    Idle, direction.Left -> "IdleLeft"
    Idle, direction.Right -> "IdleRight"
  }
}

const sprites = [
  #("IdleUp", sprite.SpriteRegion(3, 0)),
  #("IdleDown", sprite.SpriteRegion(0, 0)),
  #("IdleLeft", sprite.SpriteRegion(2, 0)),
  #("IdleRight", sprite.SpriteRegion(1, 0)),
]

pub fn sprite_sheet() -> sprite.SpriteSheet {
  sprite.SpriteSheet(
    asset: asset.load_image(
      "https://pub-e304780d47a742ad9bad4f35844cd6e6.r2.dev/test-unit.png",
    ),
    grid: sprite.Grid(32, 64),
    sprites: dict.from_list(sprites),
  )
}
