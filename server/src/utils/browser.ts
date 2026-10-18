import fs from 'fs';
import puppeteer, { Browser } from 'puppeteer';

const BASE_ARGS = ['--no-sandbox', '--disable-setuid-sandbox'];

function candidatePaths(): string[] {
  const fromEnv = [process.env.PUPPETEER_EXECUTABLE_PATH, process.env.CHROME_PATH].filter(
    (value): value is string => Boolean(value)
  );

  let bundled = '';
  try {
    bundled = puppeteer.executablePath();
  } catch {
    bundled = '';
  }

  const system: string[] = [];
  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA;
    const programFiles = process.env.PROGRAMFILES;
    const programFilesX86 = process.env['PROGRAMFILES(X86)'];
    system.push(
      localAppData ? `${localAppData}\\Google\\Chrome\\Application\\chrome.exe` : '',
      programFiles ? `${programFiles}\\Google\\Chrome\\Application\\chrome.exe` : '',
      programFilesX86 ? `${programFilesX86}\\Google\\Chrome\\Application\\chrome.exe` : '',
      programFiles ? `${programFiles}\\Microsoft\\Edge\\Application\\msedge.exe` : '',
      programFilesX86 ? `${programFilesX86}\\Microsoft\\Edge\\Application\\msedge.exe` : ''
    );
  } else if (process.platform === 'darwin') {
    system.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
    );
  } else {
    system.push(
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser'
    );
  }

  return [...fromEnv, bundled, ...system].filter((path) => path && fs.existsSync(path));
}

/** Launch whatever Chrome or Edge is available, instead of one pinned Puppeteer build. */
export async function launchBrowser(extraArgs: string[] = []): Promise<Browser> {
  const args = [...BASE_ARGS, ...extraArgs];
  const paths = candidatePaths();
  let lastError: unknown;

  for (const executablePath of paths) {
    try {
      return await puppeteer.launch({ headless: true, args, executablePath });
    } catch (error) {
      lastError = error;
    }
  }

  try {
    return await puppeteer.launch({ headless: true, args, channel: 'chrome' });
  } catch (error) {
    lastError = error;
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('No Chrome or Edge installation was found for PDF printing.');
}
