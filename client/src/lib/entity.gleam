import lib/canvas/context
import lib/coord
import lib/cursor
import lib/engine

pub type Entity {
  CursorEntity(cursor: cursor.Cursor)
  UnitEntity(id: String)
}

pub type EntityReference =
  String

pub fn render(
  ref: EntityReference,
  context: context.CanvasRenderingContext2D,
  cursor: cursor.Cursor,
  coords: coord.Coord,
  game_state: engine.GameState,
) {
  todo
}
