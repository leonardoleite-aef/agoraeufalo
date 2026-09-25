const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.goto('http://localhost:8081/blog-panel.html', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate(() => { openImportModal(); });
  await new Promise(r => setTimeout(r, 800));
  // scroll down to see the media section
  await page.evaluate(() => {
    const modal = document.querySelector('#import-modal .overflow-y-auto') || document.querySelector('#import-modal > div');
    if (modal) modal.scrollTop = 400;
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: '/Users/macbookpro/.gemini/antigravity/brain/ef0d10c2-1ec7-4016-ad93-718c9843ab45/modal_media_fields.png', fullPage: false });
  console.log("OK");
  await browser.close();
})();
