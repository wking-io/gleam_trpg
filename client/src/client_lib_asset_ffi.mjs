const __asset_cache = {};

export function load_image(src) {
  const cached_image = __asset_cache[src];
  if (cached_image) return cached_image;

  const image = new Image();
  image.src = src;
  __asset_cache[src] = image;
  return image;
}
