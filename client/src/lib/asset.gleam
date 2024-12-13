pub type Asset

// Load image from src using Image constructor for passing into canvas
//
@external(javascript, "../client_lib_asset_ffi.mjs", "load_image")
pub fn load_image(src: String) -> Asset
