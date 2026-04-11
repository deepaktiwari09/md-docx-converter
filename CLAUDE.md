# MD-DOCX Converter

Tauri v2 desktop app — converts Markdown to DOCX (and reverse) with enterprise-grade output using bundled Pandoc.

## Project Structure

```
apps/desktop/
  src-tauri/                    # Rust backend (Tauri v2)
    src/
      lib.rs                    # App setup, command registration
      commands/
        mod.rs                  # Re-exports all commands
        convert.rs              # convert_md_to_docx, convert_docx_to_md, scan_directory
        detect.rs               # open_file, delete_file (platform-specific)
        history.rs              # load_history, save_history_entry, delete_history_entry
      pandoc/
        mod.rs                  # Re-exports executor + options
        executor.rs             # Spawns bundled pandoc binary with args
        options.rs              # Builds pandoc CLI args (filters, reference.docx, etc.)
    resources/pandoc/
      pandoc                    # Bundled pandoc binary (not in git)
      reference.docx            # Style template for DOCX output
      filters/
        table-style.lua         # Column width algorithm (compact/flexible classification, fixed layout)
        mermaid.lua             # Mermaid diagram rendering via puppeteer
    tauri.conf.json             # App config, window size, bundle resources
    capabilities/default.json   # Tauri permission grants

  src/                          # React 19 + TypeScript frontend
    App.tsx                     # Main layout: two-panel (converter + history sidebar)
    App.css                     # All styles including dark mode
    types.ts                    # Shared types: QueueItem, HistoryEntry, ConversionResult
    components/
      ConversionToggle.tsx      # MD→DOCX / DOCX→MD toggle
      FileDropZone.tsx          # Drag-and-drop + file/folder picker
      FileList.tsx              # Selected files list with remove/clear
      QueueStatus.tsx           # Live conversion queue with status icons
      HistorySidebar.tsx        # Collapsible right sidebar with persistent history
      ProgressBar.tsx           # (deprecated — replaced by QueueStatus)
      ResultsList.tsx           # (deprecated — replaced by QueueStatus)
    hooks/
      useQueue.ts               # useReducer-based queue: ADD_ITEMS, SET_STATUS, REMOVE, CLEAR
      useHistory.ts             # History CRUD: load/add/remove/open/delete via Rust commands
      useConversion.ts          # (deprecated — replaced by useQueue)

scripts/                        # Build helpers
docs/                           # Business logic documentation
test-docs/                      # Sample MD/DOCX files for testing
```

## Code Context Guide

### "Conversion output looks wrong"
- Table widths → `resources/pandoc/filters/table-style.lua` (compact_threshold, twips_per_char, fixed layout)
- Styles/fonts → `resources/pandoc/reference.docx` (regenerate via `scripts/generate-reference-docx.py`)
- Pandoc args → `src-tauri/src/pandoc/options.rs` (filter order, flags)
- Pandoc execution → `src-tauri/src/pandoc/executor.rs`

### "UI not working / layout broken"
- All styles → `src/App.css` (single file, includes dark mode)
- Layout structure → `src/App.tsx` (two-panel: `.app-main` + `.history-sidebar`)
- Scroll issues → check `height: 0; min-height: 0` on flex containers in App.css

### "Queue / conversion stuck"
- Queue state machine → `src/hooks/useQueue.ts` (useReducer + useEffect processing loop)
- Rust convert commands → `src-tauri/src/commands/convert.rs`
- Command registration → `src-tauri/src/lib.rs` (all commands must be listed here)

### "History not loading / saving"
- Rust persistence → `src-tauri/src/commands/history.rs` (JSON at app data dir)
- Frontend hook → `src/hooks/useHistory.ts`
- History path: `~/Library/Application Support/com.dtworkspace.md-docx-converter/history.json`

### "New Tauri command not working"
1. Create command in `src-tauri/src/commands/`
2. Re-export in `src-tauri/src/commands/mod.rs`
3. Register in `src-tauri/src/lib.rs` → `.invoke_handler(tauri::generate_handler![...])`
4. Add permission in `src-tauri/capabilities/default.json` if needed

### "Pandoc binary not found at runtime"
- Binary bundled via `tauri.conf.json` → `bundle.resources`
- Resolved at runtime in `executor.rs` using `app_handle.path().resource_dir()`

## Release Process

### Build
```bash
cd apps/desktop
npm run tauri build
```
Output: `src-tauri/target/release/bundle/dmg/MD-DOCX Converter_<version>_aarch64.dmg`

### Deploy to S3
```bash
# Upload DMG (use versioned path)
aws --profile personal s3 cp \
  "src-tauri/target/release/bundle/dmg/MD-DOCX Converter_<version>_aarch64.dmg" \
  "s3://dt-md-docx-downloads/v<version>/MD-DOCX-Converter_<version>_aarch64.dmg"

# Update install.sh to point to new version URL, then upload
aws --profile personal s3 cp install.sh s3://dt-md-docx-downloads/install.sh
```

### GitHub Release
```bash
gh release create v<version> \
  --title "v<version> — <summary>" \
  --notes "<changelog>" \
  "src-tauri/target/release/bundle/dmg/MD-DOCX Converter_<version>_aarch64.dmg"
```

### User Install
```bash
curl -fsSL https://dt-md-docx-downloads.s3.amazonaws.com/install.sh | bash
```

### Version Bumping
- Update `apps/desktop/src-tauri/tauri.conf.json` → `"version": "<new>"`
- DMG filename derives from this version automatically

### Checklist
1. Bump version in `tauri.conf.json`
2. `npm run tauri build`
3. Upload DMG to S3 under `v<version>/`
4. Update `install.sh` URL → upload to S3
5. `gh release create` with DMG attached
6. Delete old S3 versions if no longer needed

## AWS
- Profile: `personal`
- Bucket: `dt-md-docx-downloads`
- Region: default (us-east-1)

## Stack
- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Rust, Tauri v2
- **Conversion**: Pandoc (bundled binary) with Lua filters
- **Persistence**: JSON file in app data directory
- **Distribution**: S3 + install.sh curl script, GitHub Releases
