import lib/input

pub type Direction {
  Up
  Down
  Right
  Left
}

pub fn from_game_key(game_key: input.GameKey) -> Direction {
  case game_key {
    input.UpKey -> Up
    input.DownKey -> Down
    input.LeftKey -> Left
    input.RightKey -> Right
  }
}
