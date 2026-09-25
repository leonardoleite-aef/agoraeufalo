const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8081/blog-panel.html', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/Users/macbookpro/.gemini/antigravity/brain/ef0d10c2-1ec7-4016-ad93-718c9843ab45/painel_restaurado.png', fullPage: false });
  console.log("Screenshot OK!");
  await browser.close();
})();
