import lib/unit

pub type Entity {
  UnitEntity(id: unit.UnitReference)
}

pub type EntityReference =
  String
