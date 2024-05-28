use wasm_bindgen::prelude::*;
use pdf_extract::extract_text_from_mem;

#[wasm_bindgen]
pub fn extract_text_from_binary(pdf_data: &[u8]) -> String {
    match extract_text_from_mem(pdf_data) {
        Ok(text) => text,
        Err(e) => format!("Error: {:?}", e),
    }
}