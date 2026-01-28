# MD ↔ DOCX Converter

Cross-platform desktop app for bidirectional conversion between Markdown and Word documents using Pandoc.

## Features

- Convert MD → DOCX or DOCX → MD
- Batch conversion of multiple files
- Native file/folder dialogs
- Drag & drop support
- Progress tracking

## Tech Stack

- **Framework:** Tauri v2 (Rust + WebView)
- **Frontend:** React 19 + TypeScript + Vite
- **Converter:** Pandoc (bundled)

## Project Structure

```
├── apps/
│   ├── desktop/              # Tauri desktop app
│   │   ├── src/              # React frontend
│   │   ├── src-tauri/        # Rust backend
│   │   └── package.json
│   └── website/              # Next.js marketing site
│       ├── app/
│       └── package.json
├── docs/                     # Documentation
├── install.sh                # Install script
└── package.json              # Root convenience scripts
```

## Development

```bash
# Desktop app
cd apps/desktop
npm install
npm run tauri dev

# Website
cd apps/website
npm install
npm run dev

# Or from root
npm run desktop:dev
npm run website:dev
```

## Building

```bash
# Desktop app
cd apps/desktop
npm run tauri build

# Website
cd apps/website
npm run build
```

## Pandoc Setup

For development, download Pandoc for your platform and place in `apps/desktop/src-tauri/resources/pandoc/`:

- [Pandoc releases](https://github.com/jgm/pandoc/releases)

## License

MIT
