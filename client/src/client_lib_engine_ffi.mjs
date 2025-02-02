export function request_animation_frame(cb) {
  window.requestAnimationFrame(cb);
}

function with_keyboard_data(cb) {
  return function listener(e) {
    return cb({
      key: e.key,
      alt_key: e.altKey,
      ctrl_key: e.ctrlKey,
      meta_key: e.metaKey,
      repeat: e.repeat,
      shift_key: e.shiftKey,
    });
  };
}

export function add_keyboard_event_listener(cb) {
  return window.addEventListener("keydown", with_keyboard_data(cb));
}

export function add_game_focus_event_listener(cb) {
  window.addEventListener("focus", () => cb(true));
  window.addEventListener("blur", () => cb(false));
}
