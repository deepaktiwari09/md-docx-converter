'use client';

import { useState } from 'react';
import Image from 'next/image';
import { VERSION, DOWNLOADS, detectPlatform } from '@/lib/downloads';

function WindowFrame({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`rounded-xl overflow-hidden shadow-2xl border ${dark ? 'border-gray-700' : 'border-gray-200/60'}`}>
      <div className={`px-4 py-2.5 flex items-center gap-2 ${dark ? 'bg-[#2a2a2a]' : 'bg-[#e8e8e8]'}`}>
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className={`ml-2 text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>MD-DOCX Converter</span>
      </div>
      {children}
    </div>
  );
}

export default function Home() {
  const [copied, setCopied] = useState(false);
  const installCmd = 'curl -fsSL https://dt-md-docx-downloads.s3.amazonaws.com/install.sh | bash';

  const platform = typeof window !== 'undefined' ? detectPlatform() : null;
  const download = platform ? DOWNLOADS[platform] : DOWNLOADS['macos-arm64'];

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-sm">MD-DOCX Converter</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/deepaktiwari09/md-docx-converter" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              GitHub
            </a>
            <a href="#install" className="text-sm bg-blue-500 text-white px-4 py-1.5 rounded-lg hover:bg-blue-600 transition-colors">
              Download
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full mb-6">
            <span>v{VERSION}</span>
            <span className="w-1 h-1 bg-blue-300 rounded-full" />
            <span>macOS</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4 leading-tight">
            Convert Markdown &<br />Word Documents
          </h1>
          <p className="text-xl text-gray-500 mb-8 max-w-xl mx-auto">
            A fast, native desktop app with batch processing, queue system, and conversion history. Powered by Pandoc.
          </p>
          <div className="flex items-center justify-center gap-3 mb-16">
            {download?.available && download.url ? (
              <a href={download.url} className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download for macOS
              </a>
            ) : null}
            <a href="#install" className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-lg text-sm font-medium hover:border-gray-300 hover:text-gray-900 transition-colors">
              Install via Terminal
            </a>
          </div>

          {/* Hero Screenshot */}
          <div className="max-w-4xl mx-auto">
            <WindowFrame>
              <Image
                src="/screenshots/hero-light.png"
                alt="MD-DOCX Converter — files selected with conversion history"
                width={1920}
                height={1280}
                className="w-full h-auto"
                priority
              />
            </WindowFrame>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Everything you need</h2>
          <p className="text-gray-500 text-center mb-16 max-w-lg mx-auto">
            Convert documents in both directions, process entire folders, and track every conversion.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Bidirectional</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                MD to DOCX and DOCX to MD. Enterprise-grade output with proper table formatting, styles, and Mermaid diagrams.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Queue System</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Add files while conversions run in the background. Batch process entire folders without blocking the UI.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Conversion History</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Persistent sidebar tracks all past conversions. Open output files or delete them directly from history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase: Light & Dark */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Light & Dark Mode</h2>
          <p className="text-gray-500 text-center mb-16">
            Follows your system preference automatically.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <WindowFrame>
                <Image
                  src="/screenshots/hero-light.png"
                  alt="Light mode"
                  width={1920}
                  height={1280}
                  className="w-full h-auto"
                />
              </WindowFrame>
              <p className="text-center text-sm text-gray-400 mt-4">Light</p>
            </div>
            <div>
              <WindowFrame dark>
                <Image
                  src="/screenshots/dark-mode.png"
                  alt="Dark mode"
                  width={1920}
                  height={1280}
                  className="w-full h-auto"
                />
              </WindowFrame>
              <p className="text-center text-sm text-gray-400 mt-4">Dark</p>
            </div>
          </div>
        </div>
      </section>

      {/* Queue in action */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Non-blocking queue</h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Drop files or select a folder — they enter the queue immediately. Keep adding more while conversions process in the background. Each file shows real-time status with progress indicators.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">1</span>
                  Drop or select files
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">2</span>
                  Choose output directory
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">3</span>
                  Add to queue — keep working
                </li>
              </ul>
            </div>
            <WindowFrame>
              <Image
                src="/screenshots/queue-progress.png"
                alt="Queue processing files"
                width={1920}
                height={1280}
                className="w-full h-auto"
              />
            </WindowFrame>
          </div>
        </div>
      </section>

      {/* Install */}
      <section id="install" className="py-24 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Install in seconds</h2>
          <p className="text-gray-500 mb-8">
            One command to download, install, and open the app.
          </p>

          {/* Terminal */}
          <div className="bg-gray-900 rounded-xl overflow-hidden text-left mb-6">
            <div className="px-4 py-2.5 bg-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <button
                onClick={handleCopy}
                className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="p-4 overflow-x-auto">
              <code className="text-sm text-green-400 font-mono">
                <span className="text-gray-500">$ </span>{installCmd}
              </code>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-8">
            macOS Apple Silicon &bull; Downloads ~37 MB &bull; Installs to /Applications
          </p>

          {download?.available && download.url ? (
            <div className="flex flex-col items-center gap-3">
              <a
                href={download.url}
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download DMG ({download.size})
              </a>
              <span className="text-xs text-gray-400">or download directly from {download.label}</span>
            </div>
          ) : null}

          <p className="text-sm text-gray-400 mt-8">
            Windows & Linux coming soon
          </p>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-16 px-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              Native performance — built with Rust & Tauri
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full" />
              Powered by Pandoc
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full" />
              100% offline — no data leaves your machine
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-gray-400">
          <span>MD-DOCX Converter v{VERSION}</span>
          <div className="flex items-center gap-4">
            <a href="https://pandoc.org" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">Pandoc</a>
            <a href="https://tauri.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">Tauri</a>
            <a href="https://github.com/deepaktiwari09/md-docx-converter" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
