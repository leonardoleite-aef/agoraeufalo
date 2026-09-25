const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://localhost:8081/blog-panel.html', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));
  // Abre o modal
  await page.evaluate(() => { openImportModal(); });
  await new Promise(r => setTimeout(r, 800));
  // Scroll para baixo dentro do modal para ver a área dos blocos
  await page.evaluate(() => {
    const modal = document.getElementById('import-modal');
    if (modal) modal.querySelector('.overflow-y-auto, form')?.scrollTo(0, 300);
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: '/Users/macbookpro/.gemini/antigravity/brain/ef0d10c2-1ec7-4016-ad93-718c9843ab45/modal_blocks.png', fullPage: false });
  console.log("OK");
  await browser.close();
})();
