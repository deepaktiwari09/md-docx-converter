# Enterprise DOCX Features (v2.0)

## Overview

MD→DOCX conversions now produce professionally styled documents automatically. No user configuration needed — all features are auto-detected and applied by the Rust backend.

## Features

### 1. Enterprise Template (Always Active)

Bundled `reference.docx` applies corporate styling to all output:

| Element | Style |
|---------|-------|
| Heading 1 | Calibri Light, 26pt, Dark Blue (#1F3864) |
| Heading 2 | Calibri Light, 20pt, Medium Blue (#2E74B5) |
| Heading 3 | Calibri, 16pt, Medium Blue |
| Heading 4 | Calibri, 14pt bold, Dark Gray |
| Body text | Calibri, 11pt, 1.15 line spacing |
| Code blocks | Consolas, 9.5pt, light gray background |
| Blockquotes | Calibri italic, left blue border accent |
| Tables | Header row blue fill, alternating row shading |

### 2. Mermaid Diagram Rendering (Auto if mmdc installed)

Fenced `mermaid` code blocks in Markdown are automatically rendered as SVG images in the DOCX.

**Supported diagram types:** flowchart, sequence, ER, gantt, class, state, pie, etc.

**Smart sizing:** Diagram width is computed from SVG aspect ratio:
- Horizontal diagrams → full page width (6.5in)
- Square diagrams → 5.5in
- Vertical/tall diagrams → constrained (3.5in)

**Prerequisite:** `npm install -g @mermaid-js/mermaid-cli`

**Fallback:** If mmdc is not installed, mermaid blocks are kept as plain code in the output. No error, no crash.

### 3. Auto Table of Contents (>50 lines)

Documents longer than 50 lines automatically get a table of contents (depth 3). Short documents skip the TOC.

### 4. Code Syntax Highlighting

All code blocks use `kate` highlighting theme — clean, print-friendly colors.

## Architecture

All logic lives in the Rust backend. The React frontend is untouched.

```
User clicks Convert
  → useConversion.ts → invoke('convert_batch')
    → convert.rs → ConversionArgs::build_for_md_to_docx()
      → Auto-detect: reference.docx exists? Add --reference-doc
      → Auto-detect: input >50 lines? Add --toc
      → Auto-detect: mmdc available? Add --lua-filter
    → run_conversion_with_args() → pandoc with smart args
```

## Files

| File | Purpose |
|------|---------|
| `src/pandoc/options.rs` | ConversionArgs builder (auto-detects features) |
| `src/commands/detect.rs` | mmdc availability check (OnceLock cached) |
| `src/pandoc/executor.rs` | `run_conversion_with_args()` + `get_resource_dir()` |
| `resources/pandoc/reference.docx` | Enterprise Word template |
| `resources/pandoc/filters/mermaid.lua` | Pandoc Lua filter for SVG diagrams |
| `resources/pandoc/filters/mermaid-config.json` | Mermaid neutral theme config |
| `resources/pandoc/filters/puppeteer-config.json` | Chromium headless config |

## Dependencies

| Tool | Required | Install |
|------|----------|---------|
| Pandoc 3.x | Bundled | — |
| mmdc (mermaid-cli) | Optional | `npm i -g @mermaid-js/mermaid-cli` |
| rsvg-convert | Optional | `brew install librsvg` |
