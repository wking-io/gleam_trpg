import lustre/element.{type Element, text}
import lustre/element/html.{canvas}

pub fn root() -> Element(t) {
  canvas([])
}
