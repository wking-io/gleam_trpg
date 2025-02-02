import gleam/dict
import gleam/result
import lib/canvas.{type Canvas}
import lib/canvas/context.{type CanvasRenderingContext2D}
import lib/coord
import lib/entity
import lib/state
import lib/unit

pub type RenderContext {
  RenderContext(Canvas, CanvasRenderingContext2D)
}

pub const render_target_id = "ds_render_target"

pub fn with_context() {
  let canvas_result = canvas.get_canvas_by_id(render_target_id)
  let context_result = result.try(canvas_result, context.get_context_2d)
  case canvas_result, context_result {
    Ok(can), Ok(con) -> Ok(RenderContext(can, con))
    _, _ -> Error("Failed to find context.")
  }
}

pub fn entity(
  ref: entity.EntityReference,
  context: context.CanvasRenderingContext2D,
  coords: coord.Coord,
  game_state: state.GameState,
) {
  let entity_result = dict.get(game_state.entity_map, ref)
  case entity_result {
    Ok(entity) -> {
      case entity {
        entity.UnitEntity(unit_ref) -> {
          let unit_result = dict.get(game_state.unit_map, unit_ref)
          case unit_result {
            Ok(unit) ->
              unit.render(
                context,
                unit,
                coords,
                game_state.camera,
                game_state.scale,
              )
            _ -> Nil
          }
        }
      }
    }
    _ -> Nil
  }
}
