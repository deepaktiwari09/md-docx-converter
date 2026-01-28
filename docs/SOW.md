# MD-DOCX Converter Desktop Application

**Version:** 1.0
**Date:** 2026-01-28

## 1. Project Overview

Cross-platform desktop application for bidirectional conversion between Markdown (.md) and Microsoft Word (.docx) formats using Pandoc.

## 2. Scope

### In Scope

- Convert single/multiple .md files to .docx
- Convert single/multiple .docx files to .md
- Folder selection with recursive file discovery
- Preserve folder structure in output
- Drag & drop file selection
- Native file/folder dialogs
- Progress indicator (overall %)
- Cross-platform: macOS, Windows, Linux

### Out of Scope

- Cloud storage integration
- User accounts/authentication
- File preview
- Batch scheduling
- Custom Pandoc templates (v1.0)

## 3. Deliverables

| Deliverable | Format |
|-------------|--------|
| macOS Installer | `.dmg` (arm64 + x64) |
| Windows Installer | `.msi` (x64) |
| Linux Packages | `.AppImage`, `.deb` |
| Source Code | GitHub repository |
| Documentation | README, user guide |

## 4. Technical Stack

| Component | Technology |
|-----------|------------|
| Framework | Tauri v2 |
| Frontend | React 18 + TypeScript + Vite |
| Backend | Rust |
| Converter | Pandoc (bundled) |

## 5. Architecture

```
┌─────────────────────────────────────────┐
│           Tauri App Window              │
│  ┌───────────────────────────────────┐  │
│  │     React Frontend (WebView)      │  │
│  │  - File/folder picker UI          │  │
│  │  - Drag & drop zone               │  │
│  │  - Conversion progress            │  │
│  │  - Download/save location         │  │
│  └───────────────────────────────────┘  │
│              ↕ invoke()                 │
│  ┌───────────────────────────────────┐  │
│  │     Rust Backend (Tauri)          │  │
│  │  - Pandoc process execution       │  │
│  │  - File I/O with streaming        │  │
│  │  - Native file dialogs            │  │
│  └───────────────────────────────────┘  │
│              ↕ Command                  │
│  ┌───────────────────────────────────┐  │
│  │  Bundled Pandoc Binary            │  │
│  │  (platform-specific)              │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 6. Milestones

| Phase | Description |
|-------|-------------|
| 0 | Documentation & SOW |
| 1 | Project scaffold (Tauri + React) |
| 2 | Pandoc bundling setup |
| 3 | Rust conversion commands |
| 4 | React UI components |
| 5 | File dialogs & save location |
| 6 | Cross-platform builds |

## 7. Acceptance Criteria

- [ ] Single .md file converts to .docx successfully
- [ ] Single .docx file converts to .md successfully
- [ ] Batch conversion of folder preserves structure
- [ ] Drag & drop files triggers conversion
- [ ] Progress shows "X of Y files (Z%)"
- [ ] Builds run on macOS, Windows, Linux
- [ ] App size < 150MB per platform

## 8. Bundle Sizes (Estimated)

| Component | Size |
|-----------|------|
| Tauri app | ~10MB |
| React bundle | ~500KB |
| Pandoc binary | ~80-100MB |
| **Total per platform** | **~90-110MB** |
