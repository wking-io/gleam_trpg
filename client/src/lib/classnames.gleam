import gleam/list
import gleam/string

// Define a type that represents a CSS class.
// - `Static` represents a class that is always included.
// - `Conditional` takes a Bool and a String and only includes the class if the Bool is true.
pub type ClassName {
  Static(String)
  Conditional(Bool, String)
}

// The classnames function takes a list of ClassName values,
// filters out any conditional ones that evaluate to false,
// and joins the remaining class names with a space.
pub fn from(class_list: List(ClassName)) -> String {
  class_list
  |> list.filter_map(fn(cn) {
    case cn {
      Static(name) -> Ok(name)
      Conditional(True, name) -> Ok(name)
      Conditional(False, _) -> Error("Omit")
    }
  })
  |> string.join(" ")
}
