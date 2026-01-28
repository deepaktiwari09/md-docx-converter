'use client';

import { Download } from '@/lib/downloads';

interface DownloadButtonProps {
  download: Download;
  isPrimary?: boolean;
}

export function DownloadButton({ download, isPrimary }: DownloadButtonProps) {
  if (!download.available) {
    return (
      <div
        className={`flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50 ${
          isPrimary ? 'opacity-60' : ''
        }`}
      >
        <div>
          <p className="font-medium text-gray-500">{download.label}</p>
          <p className="text-sm text-gray-400">Coming Soon</p>
        </div>
        <span className="px-3 py-1 text-xs font-medium text-gray-400 bg-gray-200 rounded-full">
          Soon
        </span>
      </div>
    );
  }

  return (
    <a
      href={download.url}
      download={download.filename}
      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
        isPrimary
          ? 'border-blue-500 bg-blue-500 text-white hover:bg-blue-600'
          : 'border-gray-200 bg-white hover:border-blue-500 hover:shadow-md'
      }`}
    >
      <div>
        <p className={`font-medium ${isPrimary ? 'text-white' : 'text-gray-900'}`}>
          {download.label}
        </p>
        {download.size && (
          <p className={`text-sm ${isPrimary ? 'text-blue-100' : 'text-gray-500'}`}>
            {download.size}
          </p>
        )}
      </div>
      <svg
        className={`w-5 h-5 ${isPrimary ? 'text-white' : 'text-blue-500'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
    </a>
  );
}
