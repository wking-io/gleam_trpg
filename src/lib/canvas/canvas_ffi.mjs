import { Ok, Error } from "./gleam.mjs";

/**********************
 * CANVAS
 *********************/

export function create_canvas() {
  return document.createElement("canvas");
}

export function get_canvas_by_id(id) {
  const canvas = document.getElementById(id);
  if (!canvas) {
    return new Error(`Canvas with ID ${id} not found`);
  }
  return new Ok(canvas);
}

// Setters

export function set_height(canvas, height) {
  canvas.height = height;
  return canvas;
}

export function set_width(canvas, width) {
  canvas.width = width;
  return canvas;
}

/**********************
 * CONTEXT
 *********************/

export function get_context_2d(canvas) {
  const context = canvas.getContext("2d");
  if (!context) {
    return new Error("Failed to get 2D context");
  }
  return new Ok(context);
}

// Methods

export function clear_rect(context, x, y, width, height) {
  context.clearRect(x, y, width, height);
  return context;
}

export function draw_image_simple(context, image, dx, dy) {
  context.drawImage(image, dx, dy);
  return context;
}

export function draw_image_scaled(context, image, dx, dy, dWidth, dHeight) {
  context.drawImage(image, dx, dy, dWidth, dHeight);
  return context;
}

export function draw_image_cropped(
  context,
  image,
  sx,
  sy,
  sWidth,
  sHeight,
  dx,
  dy,
  dWidth,
  dHeight,
) {
  context.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  return context;
}

export function fill_rect(context, x, y, width, height) {
  context.fillRect(x, y, width, height);
  return context;
}

export function measure_text(context, text) {
  const metrics = context.measureText(text);
  return {
    actual_bounding_box_left: metrics.actualBoundingBoxLeft || 0,
    actual_bounding_box_right: metrics.actualBoundingBoxRight || 0,
    actual_bounding_box_ascent: metrics.actualBoundingBoxAscent || 0,
    actual_bounding_box_descent: metrics.actualBoundingBoxDescent || 0,
    alphabetic_baseline: metrics.alphabeticBaseline || 0,
    font_bounding_box_ascent: metrics.fontBoundingBoxAscent || 0,
    font_bounding_box_descent: metrics.fontBoundingBoxDescent || 0,
    hanging_baseline: metrics.hangingBaseline || 0,
    ideographic_baseline: metrics.ideographicBaseline || 0,
    width: metrics.width,
  };
}
