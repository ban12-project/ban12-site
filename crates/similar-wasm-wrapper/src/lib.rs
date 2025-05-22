use similar::{ChangeTag, TextDiff};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn diff_lines_unified(old_text: &str, new_text: &str) -> String {
    let diff = TextDiff::from_lines(old_text, new_text);
    let mut result = String::new();

    for change in diff.iter_all_changes() {
        let sign = match change.tag() {
            ChangeTag::Delete => "-",
            ChangeTag::Insert => "+",
            ChangeTag::Equal => " ",
        };
        result.push_str(&format!("{}{}", sign, change.value()));
    }
    result
}

#[wasm_bindgen]
pub fn diff_lines_simple(old_text: &str, new_text: &str) -> String {
    let diff = TextDiff::from_lines(old_text, new_text);
    let mut output = String::new();
    for change in diff.iter_all_changes() {
        let sign = match change.tag() {
            ChangeTag::Delete => "-",
            ChangeTag::Insert => "+",
            ChangeTag::Equal => " ",
        };
        output.push_str(&format!("{}{}", sign, change.value()));
    }
    output
}

// Example returning structured data (more complex but more flexible for JS)
#[derive(serde::Serialize)]
pub struct DiffChange {
    tag: String, // "Delete", "Insert", "Equal"
    value: String,
    old_index: Option<usize>,
    new_index: Option<usize>,
}

#[wasm_bindgen]
pub fn diff_lines_structured(old_text: &str, new_text: &str) -> Result<JsValue, JsValue> {
    let diff = TextDiff::from_lines(old_text, new_text);
    let mut changes = Vec::new();

    for hunk in diff.unified_diff().iter_hunks() {
        for change in hunk.iter_changes() {
            changes.push(DiffChange {
                tag: change.tag().to_string(),
                value: change.value().to_string(),
                old_index: change.old_index(),
                new_index: change.new_index(),
            });
        }
    }
    serde_wasm_bindgen::to_value(&changes).map_err(|e| e.into())
}

#[wasm_bindgen]
pub fn diff_chars_unified(old_text: &str, new_text: &str) -> String {
    let diff = TextDiff::from_chars(old_text, new_text);
    let mut result = String::new();

    for change in diff.iter_all_changes() {
        let sign = match change.tag() {
            ChangeTag::Delete => "-",
            ChangeTag::Insert => "+",
            ChangeTag::Equal => " ",
        };
        result.push_str(&format!("{}{}", sign, change.value()));
    }
    result
}
