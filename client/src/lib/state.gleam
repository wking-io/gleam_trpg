import gleam/dict
import lib/camera
import lib/coord
import lib/cursor
import lib/entity
import lib/event
import lib/map
import lib/math
import lib/unit

pub type GameState {
  GameState(
    accumulator: Float,
    camera: camera.Camera,
    cursor: cursor.Cursor,
    event_queue: List(event.Event),
    fps: Float,
    map: map.Map,
    previous_time: Float,
    scale: math.Scale,
    debug: Bool,
    entity_map: dict.Dict(entity.EntityReference, entity.Entity),
    location_map: dict.Dict(coord.Coord, List(entity.EntityReference)),
    unit_map: dict.Dict(unit.UnitReference, unit.Unit),
  )
}
