import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 4000 }); // Altura extrema para ver tudo

  try {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0', timeout: 15000 });
    
    await new Promise(r => setTimeout(r, 4000));
    
    await page.screenshot({ path: 'screenshot_la.png', fullPage: true });
    console.log('Screenshot salva em screenshot_la.png');
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
