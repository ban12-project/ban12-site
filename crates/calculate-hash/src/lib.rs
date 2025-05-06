use sha2::{Digest, Sha256};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct CreateSha256 {
    hasher: Option<Sha256>,
}

#[wasm_bindgen]
impl CreateSha256 {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        CreateSha256 {
            hasher: Some(Sha256::new()),
        }
    }

    pub fn init(&mut self) {
        if let Some(hasher) = self.hasher.as_mut() {
            hasher.reset();
        }
    }

    pub fn update(&mut self, data: &[u8]) {
        if let Some(hasher) = self.hasher.as_mut() {
            hasher.update(data);
        }
    }

    pub fn digest(&mut self, mode: &str) -> String {
        if let Some(hasher) = self.hasher.take() {
            let result = hasher.finalize();

            match mode {
                "binary" => format!("{:?}", result),
                "hex" => format!("{:x}", result),
                _ => panic!("Unknown mode"),
            }
        } else {
            panic!("No hasher instance available");
        }
    }
}
