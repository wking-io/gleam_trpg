import cors_builder as cors
import lustre/element
import server/web
import wisp.{type Request, type Response}

/// The HTTP request handler- your application!
/// 
pub fn handle_request(req: Request) -> Response {
  // Apply the middleware stack for this request/response.
  use req <- web.middleware(req)
  use req <- cors.wisp_middleware(
    req,
    cors.new()
      |> cors.allow_origin("http://localhost:1234")
      |> cors.allow_method(http.Get)
      |> cors.allow_method(http.Post)
      |> cors.allow_header("Content-Type"),
  )

  // Later we'll use templates, but for now a string will do.

  // Return a 200 OK response with the body and a HTML content type.
  case wisp.path_segments(req) {
    ["api", ..] -> api_routes(req, wisp.path_segments(req))
    _ -> wisp.not_found()
  }
}

fn api_routes(req: Request, route_segments: List(String)) -> Response {
  case route_segments {
    _ -> []
  }
}
