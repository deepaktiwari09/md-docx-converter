import { chromium } from 'playwright';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(__dirname, '../apps/website/public/screenshots');
const APP_URL = 'http://localhost:1420';
const VIEWPORT = { width: 960, height: 640 };

// --- Mock Data ---

const now = Date.now();

const MOCK_HISTORY_FULL = [
  {
    id: 'h1', input_path: '/docs/api-specification.md', output_path: '/output/api-specification.docx',
    direction: 'md_to_docx', success: true, error: null,
    timestamp: new Date(now - 2 * 60000).toISOString(),
    input_filename: 'api-specification.md', output_filename: 'api-specification.docx',
  },
  {
    id: 'h2', input_path: '/docs/user-guide.docx', output_path: '/output/user-guide.md',
    direction: 'docx_to_md', success: true, error: null,
    timestamp: new Date(now - 15 * 60000).toISOString(),
    input_filename: 'user-guide.docx', output_filename: 'user-guide.md',
  },
  {
    id: 'h3', input_path: '/docs/release-notes.md', output_path: '/output/release-notes.docx',
    direction: 'md_to_docx', success: true, error: null,
    timestamp: new Date(now - 45 * 60000).toISOString(),
    input_filename: 'release-notes.md', output_filename: 'release-notes.docx',
  },
  {
    id: 'h4', input_path: '/docs/architecture.md', output_path: '/output/architecture.docx',
    direction: 'md_to_docx', success: true, error: null,
    timestamp: new Date(now - 2 * 3600000).toISOString(),
    input_filename: 'architecture.md', output_filename: 'architecture.docx',
  },
  {
    id: 'h5', input_path: '/docs/meeting-notes.docx', output_path: '/output/meeting-notes.md',
    direction: 'docx_to_md', success: true, error: null,
    timestamp: new Date(now - 5 * 3600000).toISOString(),
    input_filename: 'meeting-notes.docx', output_filename: 'meeting-notes.md',
  },
];

const MOCK_HISTORY_EXTENDED = [
  ...MOCK_HISTORY_FULL,
  {
    id: 'h6', input_path: '/docs/proposal.md', output_path: '/output/proposal.docx',
    direction: 'md_to_docx', success: true, error: null,
    timestamp: new Date(now - 24 * 3600000).toISOString(),
    input_filename: 'proposal.md', output_filename: 'proposal.docx',
  },
  {
    id: 'h7', input_path: '/docs/broken-file.md', output_path: '/output/broken-file.docx',
    direction: 'md_to_docx', success: false, error: 'Pandoc conversion failed: invalid UTF-8 sequence',
    timestamp: new Date(now - 26 * 3600000).toISOString(),
    input_filename: 'broken-file.md', output_filename: 'broken-file.docx',
  },
  {
    id: 'h8', input_path: '/docs/quarterly-report.docx', output_path: '/output/quarterly-report.md',
    direction: 'docx_to_md', success: true, error: null,
    timestamp: new Date(now - 48 * 3600000).toISOString(),
    input_filename: 'quarterly-report.docx', output_filename: 'quarterly-report.md',
  },
];

const MOCK_FILES = [
  '/Users/demo/docs/project-report.md',
  '/Users/demo/docs/api-documentation.md',
  '/Users/demo/docs/meeting-notes.md',
];

const MOCK_OUTPUT_DIR = '/Users/demo/output';

// --- Tauri Mock Script Factory ---

function tauriMockScript(historyData: unknown[], convertDelay = 0) {
  return `
    window.__TAURI_INTERNALS__ = {
      invoke: async function(cmd, args) {
        const HISTORY = ${JSON.stringify(historyData)};
        const FILES = ${JSON.stringify(MOCK_FILES)};
        const OUTPUT_DIR = ${JSON.stringify(MOCK_OUTPUT_DIR)};

        switch(cmd) {
          case 'load_history':
            return HISTORY;
          case 'plugin:dialog|open':
            if (args && args.options && args.options.directory) return OUTPUT_DIR;
            return FILES;
          case 'convert_md_to_docx':
          case 'convert_docx_to_md':
            ${convertDelay > 0 ? `await new Promise(r => setTimeout(r, ${convertDelay}));` : ''}
            return { input: args.inputPath || args.input_path, output: args.outputPath || args.output_path, success: true, error: null };
          case 'save_history_entry':
            return { ...args.entry, id: 'new-' + Date.now() };
          case 'scan_directory':
            return [];
          case 'open_file':
          case 'delete_file':
          case 'delete_history_entry':
            return null;
          default:
            console.log('[mock] unhandled invoke:', cmd, args);
            return null;
        }
      },
      metadata: function() {
        return { windows: [{ label: 'main' }], currentWindow: { label: 'main' } };
      },
      convertFileSrc: function(path) { return path; },
    };
  `;
}

// --- Screenshot helpers ---

async function waitForApp(page: any) {
  await page.waitForSelector('.app-header', { timeout: 10000 });
  await page.waitForTimeout(500); // let React settle
}

async function selectFilesAndOutput(page: any) {
  // Click "Select Files" button inside the drop zone
  await page.click('button:has-text("Select Files")');
  await page.waitForTimeout(300);

  // Click "Browse" for output directory
  await page.click('.output-row button');
  await page.waitForTimeout(300);
}

// --- Main ---

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch();

  try {
    // 1. Initial state (empty)
    console.log('1/5 Capturing initial-state.png...');
    {
      const context = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      await page.addInitScript(tauriMockScript([]));
      await page.goto(APP_URL);
      await waitForApp(page);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'initial-state.png') });
      await context.close();
    }

    // 2. Hero light (files selected + history visible)
    console.log('2/5 Capturing hero-light.png...');
    {
      const context = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      await page.addInitScript(tauriMockScript(MOCK_HISTORY_FULL));
      await page.goto(APP_URL);
      await waitForApp(page);
      await selectFilesAndOutput(page);
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'hero-light.png') });
      await context.close();
    }

    // 3. Queue in progress
    console.log('3/5 Capturing queue-progress.png...');
    {
      const context = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      await page.addInitScript(tauriMockScript(MOCK_HISTORY_FULL, 5000));
      await page.goto(APP_URL);
      await waitForApp(page);
      await selectFilesAndOutput(page);
      await page.waitForTimeout(300);
      // Click "Add 3 File(s) to Queue"
      await page.click('.convert-btn');
      // Wait for spinner to appear
      await page.waitForSelector('.spinner', { timeout: 5000 });
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'queue-progress.png') });
      await context.close();
    }

    // 4. History sidebar with many entries
    console.log('4/5 Capturing history-sidebar.png...');
    {
      const context = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      await page.addInitScript(tauriMockScript(MOCK_HISTORY_EXTENDED));
      await page.goto(APP_URL);
      await waitForApp(page);
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'history-sidebar.png') });
      await context.close();
    }

    // 5. Dark mode
    console.log('5/5 Capturing dark-mode.png...');
    {
      const context = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: 2,
        colorScheme: 'dark',
      });
      const page = await context.newPage();
      await page.addInitScript(tauriMockScript(MOCK_HISTORY_FULL));
      await page.goto(APP_URL);
      await waitForApp(page);
      await selectFilesAndOutput(page);
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dark-mode.png') });
      await context.close();
    }

    console.log('All screenshots saved to:', SCREENSHOT_DIR);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Screenshot failed:', err);
  process.exit(1);
});
