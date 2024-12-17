import lib/direction

pub type Event {
  MoveCursor(direction.Direction)
}

pub type EventQueue =
  List(Event)

pub fn new_queue() -> EventQueue {
  []
}
