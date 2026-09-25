const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 900 });
  
  let success = false;
  let attempts = 0;
  
  while (!success && attempts < 5) {
    attempts++;
    console.log(`Attempt ${attempts}: Fetching URL...`);
    const response = await page.goto('https://agoraeufalo.com.br/blog/eu-consegui-publicar-no-blog-do-leo', { waitUntil: 'networkidle2' });
    
    if (response && response.status() === 200) {
      console.log("Page is live! Taking screenshot...");
      await page.screenshot({ path: '/Users/macbookpro/.gemini/antigravity/brain/ef0d10c2-1ec7-4016-ad93-718c9843ab45/print_artigo.png', fullPage: true });
      success = true;
    } else {
      console.log(`Got status ${response ? response.status() : 'Unknown'}. Retrying in 10 seconds...`);
      await new Promise(r => setTimeout(r, 10000));
    }
  }
  
  await browser.close();
})();
