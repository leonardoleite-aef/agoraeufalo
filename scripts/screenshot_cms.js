const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-web-security'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8081/blog-panel.html', { waitUntil: 'networkidle2' });
  await page.click('button[onclick="window.blogEngine.openEditor()"]');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: '/Users/macbookpro/.gemini/antigravity/brain/ef0d10c2-1ec7-4016-ad93-718c9843ab45/print_cms_correto.png' });
  await browser.close();
})();
