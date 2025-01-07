import gleam/io

pub type GameKey {
  UpKey
  DownKey
  LeftKey
  RightKey
}

pub type KeyboardEvent {
  KeyboardEvent(
    key: String,
    alt_key: Bool,
    ctrl_key: Bool,
    meta_key: Bool,
    repeat: Bool,
    shift_key: Bool,
  )
}

fn decode_game_key(event: KeyboardEvent) -> Result(GameKey, String) {
  let key = case event.key {
    "ArrowUp" | "w" -> Ok(UpKey)
    "ArrowDown" | "s" -> Ok(DownKey)
    "ArrowLeft" | "a" -> Ok(LeftKey)
    "ArrowRight" | "d" -> Ok(RightKey)
    _ -> Error("Unsupported key")
  }
  io.debug(key)
}

pub fn on_keyboard_event(cb: fn(GameKey) -> Nil) -> Nil {
  add_keyboard_event_listener(fn(event) {
    case decode_game_key(event) {
      Ok(game_key) -> cb(game_key)
      Error(_) -> Nil
    }
  })
}

// Bind for only keyboard event_listener
//
@external(javascript, "../client_lib_engine_ffi.mjs", "add_keyboard_event_listener")
fn add_keyboard_event_listener(listener: fn(KeyboardEvent) -> Nil) -> Nil
