extern crate markdown;

use wasm_bindgen::prelude::*;
extern crate mdxjs;

#[wasm_bindgen]
pub fn compile_mdx(input: &str) -> Result<String, JsValue> {
    mdxjs::compile(input, &Default::default())
        .map_err(|e| JsValue::from_str(&e.to_string()))
}
