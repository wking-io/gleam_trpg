import app/pages/playground
import app/layouts/doc
import app/web
import gleam/io
import lustre/element
import wisp.{type Request, type Response}

/// The HTTP request handler- your application!
/// 
pub fn handle_request(req: Request) -> Response {
  // Apply the middleware stack for this request/response.
  use _req <- web.middleware(req)

  // Later we'll use templates, but for now a string will do.

  // Return a 200 OK response with the body and a HTML content type.
  case wisp.path_segments(req) {
    [] -> {
      [playground.root()]
      |> doc.root
      |> element.to_document_string_builder
      |> wisp.html_response(200)
    }
    _ -> wisp.not_found()
  }
}
