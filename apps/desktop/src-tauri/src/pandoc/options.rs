use std::path::PathBuf;

/// Internal arg builder for enterprise DOCX output.
/// Auto-detects features and builds pandoc CLI args accordingly.
/// Not exposed to the frontend — all decisions are automatic.
pub struct ConversionArgs;

impl ConversionArgs {
    /// Build pandoc args for MD → DOCX conversion.
    ///
    /// Always applies:
    /// - `--reference-doc` (enterprise template)
    /// - `--highlight-style=kate`
    ///
    /// Auto-detects:
    /// - `--toc --toc-depth=3` when input has >50 lines
    /// - `--lua-filter=mermaid.lua` when mmdc is available
    pub fn build_for_md_to_docx(
        resource_dir: &PathBuf,
        input_path: &str,
        mmdc_available: bool,
    ) -> Vec<String> {
        let mut args: Vec<String> = Vec::new();

        // Enterprise template — always applied if present
        let template_path = resource_dir.join("reference.docx");
        if template_path.exists() {
            args.push(format!("--reference-doc={}", template_path.display()));
        }

        // Code highlighting
        args.push("--highlight-style=kate".to_string());

        // Auto TOC for substantial docs (>50 lines)
        if Self::should_add_toc(input_path) {
            args.push("--toc".to_string());
            args.push("--toc-depth=3".to_string());
        }

        // Table styling via Lua filter — always applied
        let table_filter = resource_dir.join("filters").join("table-style.lua");
        if table_filter.exists() {
            args.push(format!("--lua-filter={}", table_filter.display()));
        }

        // Mermaid diagram rendering via Lua filter
        if mmdc_available {
            let filter_path = resource_dir.join("filters").join("mermaid.lua");
            if filter_path.exists() {
                args.push(format!("--lua-filter={}", filter_path.display()));
            }
        }

        args
    }

    /// Check if input file has >50 lines (warrants a TOC)
    fn should_add_toc(input_path: &str) -> bool {
        std::fs::read_to_string(input_path)
            .map(|content| content.lines().count() > 50)
            .unwrap_or(false)
    }
}
