import lib/animation
import lib/coord
import lib/state
import lib/unit

pub type Turn {
  Turn(
    unit_id: String,
    position: List(coord.Coord),
    moves: Int,
    actions: Int,
    step: TurnStep,
  )
}

pub type TurnStep {
  PreTurn

  Idle
  SelectAction(focus: ActionType, animation: animation.Animation)

  SelectDestinationTile(
    destinations: List(coord.Coord),
    animation: animation.Animation,
  )
  MoveToDestinationTile(
    path: List(coord.Coord),
    duration: Float,
    elapsed: Float,
  )

  SelectAttackTarget(unit: String, reachable_tiles: List(coord.Coord))
  ConfirmAttack(unit: String, target_tile: coord.Coord)
  ExecuteAttack(
    unit: String,
    target_tile: coord.Coord,
    effected_units: List(unit.UnitReference),
  )
  ReactToAttack(unit: String, effected_units: List(unit.UnitReference))

  SelectSkill
  SelectSkillTarget
  ConfirmSkill
  ExecuteSkill
  ReactToSkill

  SelectItem
  SelectItemTarget
  ConfirmItem
  ExecuteItem

  SelectFinalPosition

  PostTurn
}

pub type ActionType {
  Move
  Attack
  Skill
  Item
  Wait
}

pub type Event {
  EngineCompletedPreTurn
  PlayerSelectedAction(ActionType)
  PlayerSelectedDestination(destination: coord.Coord)
  NextTurn
}

pub fn update(event: Event, game_state: state.GameState) {
  game_state
}
