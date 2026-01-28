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
- **Frontend:** React 18 + TypeScript + Vite
- **Converter:** Pandoc (bundled)

## Development

```bash
# Install dependencies
npm install

# Run in dev mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Pandoc Setup

For development, download Pandoc for your platform and place in `src-tauri/resources/pandoc/`:

- [macOS arm64](https://github.com/jgm/pandoc/releases)
- [macOS x64](https://github.com/jgm/pandoc/releases)
- [Windows x64](https://github.com/jgm/pandoc/releases)
- [Linux x64](https://github.com/jgm/pandoc/releases)

## Project Structure

```
├── src/                     # React frontend
│   ├── components/          # UI components
│   ├── hooks/               # Custom hooks
│   └── App.tsx              # Main app
├── src-tauri/               # Rust backend
│   ├── src/
│   │   ├── commands/        # Tauri commands
│   │   └── pandoc/          # Pandoc executor
│   └── resources/pandoc/    # Bundled Pandoc
└── docs/                    # Documentation
```

## License

MIT
