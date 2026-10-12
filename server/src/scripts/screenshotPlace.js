const puppeteer = require('puppeteer');
const path = require('path');

async function capture() {
  console.log('Launching browser to capture screenshot of Google Maps place...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=en-US,en'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });

  try {
    console.log('Navigating to https://maps.app.goo.gl/AaCd93WYde8cYnx79 ...');
    await page.goto('https://maps.app.goo.gl/AaCd93WYde8cYnx79', {
      waitUntil: 'load',
      timeout: 30000,
    });
    console.log('Resolved URL:', page.url());

    await new Promise((r) => setTimeout(r, 6000));

    // Save screenshot
    const screenshotPath = path.resolve('google_maps_screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log('Saved screenshot to:', screenshotPath);

    // Get all text content
    const text = await page.evaluate(() => document.body.innerText);
    require('fs').writeFileSync('place_text_content.txt', text);
    console.log('Saved place_text_content.txt, length:', text.length);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

capture();
