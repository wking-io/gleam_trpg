import gleam/dict
import gleam/float
import gleam/list
import gleam/order
import lib/asset/roku
import lib/camera
import lib/constants
import lib/coord
import lib/cursor
import lib/entity
import lib/event
import lib/id
import lib/map
import lib/math
import lib/state
import lib/tile
import lib/unit

pub fn new(init: Float, map: map.Map) -> state.GameState {
  let cursor = cursor.new(coord.at(3, 2, 3))
  let generator = id.make_generator()

  let unit_ref = id.step(generator)

  let unit_map =
    dict.new()
    |> dict.insert(unit_ref, unit.new(unit.Roku(roku.Idle), unit_ref))

  let entity_map =
    dict.new()
    |> dict.insert(unit_ref, entity.UnitEntity(unit_ref))

  let location_map =
    dict.new()
    |> dict.insert(coord.at(3, 2, 3), [unit_ref])

  state.GameState(
    accumulator: 0.0,
    camera: camera.new(coord.at(3, 2, 3)),
    cursor: cursor.new(coord.at(3, 2, 3)),
    event_queue: event.new_queue(),
    fps: 0.0,
    map: map,
    previous_time: init,
    scale: math.Double,
    debug: False,
    entity_map:,
    location_map:,
    unit_map:,
  )
}

pub fn update(
  game_state: state.GameState,
  current_time: Float,
) -> state.GameState {
  let updated = update_time(game_state, current_time)
  update_loop(updated, updated.accumulator, 0)
}

pub fn paused_update(
  game_state: state.GameState,
  current_time: Float,
) -> state.GameState {
  state.GameState(..game_state, previous_time: current_time)
}

fn update_time(game_state: state.GameState, current_time: Float) {
  let time_since_last_frame = calc_frame_time(game_state, current_time)
  let accumulator = float.add(game_state.accumulator, time_since_last_frame)

  // Since division by 0 is illegal the division function
  // returns a Result type we need to pattern match on.
  let fps = case float.divide(1000.0, time_since_last_frame) {
    Ok(fps) -> fps
    _ -> 60.0
  }

  state.GameState(
    ..game_state,
    accumulator: accumulator,
    fps: fps,
    previous_time: current_time,
  )
}

fn calc_frame_time(game_state: state.GameState, current_time: Float) {
  float.subtract(current_time, game_state.previous_time)
}

fn update_loop(game_state: state.GameState, accumulator: Float, loop_count: Int) {
  let has_pending_frames =
    float.compare(accumulator, constants.fixed_dt()) |> is_gt_or_eq
  case has_pending_frames && loop_count <= constants.max_update_frames() {
    True -> {
      game_state
      |> apply_events()
      |> update_entities()
      |> update_loop(
        float.subtract(accumulator, constants.fixed_dt()),
        loop_count + 1,
      )
    }
    False -> state.GameState(..game_state, accumulator:)
  }
}

fn apply_events(game_state: state.GameState) -> state.GameState {
  list.fold_right(game_state.event_queue, game_state, fn(acc, event) {
    case event {
      event.MoveCursor(direction) -> {
        let flat_position =
          direction
          |> coord.from_direction()
          |> coord.move(acc.cursor.position)
          |> coord.set_elevation(0)

        case dict.get(game_state.map.tiles, flat_position) {
          Ok(t) -> {
            case t.passability {
              tile.Passable -> {
                let position = coord.set_elevation(flat_position, t.elevation)
                let camera = case
                  camera.in_bounds(game_state.camera, flat_position)
                {
                  True -> game_state.camera
                  False -> {
                    direction
                    |> coord.from_direction()
                    |> coord.move(game_state.camera.focus)
                    |> coord.set_elevation(t.elevation)
                    |> camera.set_focus(game_state.camera, _)
                  }
                }

                state.GameState(
                  ..game_state,
                  camera:,
                  cursor: cursor.Cursor(..game_state.cursor, position:),
                )
              }
              _ -> game_state
            }
          }
          Error(_) -> game_state
        }
      }
    }
  })
  |> reset_events
}

fn reset_events(game_state: state.GameState) -> state.GameState {
  state.GameState(..game_state, event_queue: [])
}

fn is_gt_or_eq(order: order.Order) -> Bool {
  case order {
    order.Lt -> False
    _ -> True
  }
}

fn update_entities(game_state: state.GameState) {
  let new_cursor = cursor.update(game_state.cursor)
  state.GameState(..game_state, cursor: new_cursor)
}

pub fn toggle_debug(game_state: state.GameState) -> state.GameState {
  state.GameState(..game_state, debug: !game_state.debug)
}

pub fn on_game_focus(cb: fn(Bool) -> Nil) -> Nil {
  add_game_focus_event_listener(cb)
}

// Bind for requestAnimationFrame
//
@external(javascript, "../client_lib_engine_ffi.mjs", "request_animation_frame")
pub fn request_animation_frame(cb: fn(Float) -> Nil) -> Nil

// Bind for events to track broswer tab focus
//
@external(javascript, "../client_lib_engine_ffi.mjs", "add_game_focus_event_listener")
fn add_game_focus_event_listener(cb: fn(Bool) -> Nil) -> Nil
