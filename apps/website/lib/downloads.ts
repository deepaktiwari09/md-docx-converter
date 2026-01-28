export const S3_BASE = 'https://dt-md-docx-downloads.s3.amazonaws.com';
export const VERSION = '1.0.0';

export interface Download {
  url?: string;
  available: boolean;
  label: string;
  size?: string;
  filename?: string;
}

export const DOWNLOADS: Record<string, Download> = {
  'macos-arm64': {
    url: `${S3_BASE}/v${VERSION}/MD-DOCX-Converter_${VERSION}_aarch64.dmg`,
    available: true,
    label: 'macOS (Apple Silicon)',
    size: '37.5 MB',
    filename: `MD-DOCX-Converter_${VERSION}_aarch64.dmg`,
  },
  'macos-x64': {
    available: false,
    label: 'macOS (Intel)',
  },
  'windows': {
    available: false,
    label: 'Windows',
  },
  'linux-deb': {
    available: false,
    label: 'Linux (Debian/Ubuntu)',
  },
  'linux-appimage': {
    available: false,
    label: 'Linux (AppImage)',
  },
};

export function detectPlatform(): string | null {
  if (typeof window === 'undefined') return null;

  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes('mac')) {
    // Check for Apple Silicon vs Intel
    // Note: This is a simplified check, actual detection may vary
    return 'macos-arm64';
  }
  if (ua.includes('win')) {
    return 'windows';
  }
  if (ua.includes('linux')) {
    return 'linux-deb';
  }

  return null;
}
