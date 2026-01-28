'use client';

import { VERSION } from '@/lib/downloads';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-2xl mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            MD-DOCX Converter
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Convert between Markdown and Word documents
          </p>
          <p className="text-sm text-gray-400">Version {VERSION}</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="text-center p-4">
            <div className="text-2xl mb-2">MD → DOCX</div>
            <p className="text-sm text-gray-500">Markdown to Word</p>
          </div>
          <div className="text-center p-4">
            <div className="text-2xl mb-2">DOCX → MD</div>
            <p className="text-sm text-gray-500">Word to Markdown</p>
          </div>
          <div className="text-center p-4">
            <div className="text-2xl mb-2">Batch</div>
            <p className="text-sm text-gray-500">Multiple files</p>
          </div>
        </div>

        {/* Install */}
        <div className="mb-12 p-6 bg-gray-900 rounded-xl text-white">
          <h2 className="text-lg font-semibold mb-2">Install (macOS)</h2>
          <p className="text-sm text-gray-400 mb-4">
            Run in Terminal:
          </p>
          <code className="block bg-black p-4 rounded-lg text-sm text-green-400 font-mono overflow-x-auto">
            curl -fsSL https://dt-md-docx-downloads.s3.amazonaws.com/install.sh | bash
          </code>
          <p className="text-xs text-gray-500 mt-4">
            Downloads, installs to /Applications, and opens the app.
          </p>
        </div>

        {/* Coming Soon */}
        <div className="mb-12 text-center">
          <p className="text-sm text-gray-400">
            Windows & Linux coming soon
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400">
          <p>
            Powered by{' '}
            <a
              href="https://pandoc.org"
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pandoc
            </a>
            {' '}&bull;{' '}
            Built with{' '}
            <a
              href="https://tauri.app"
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Tauri
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
