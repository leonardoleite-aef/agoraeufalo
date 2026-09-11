const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', error => console.log('ERR:', error.message, error.stack));
  
  await page.goto('file://' + '/Users/macbookpro/Desktop/agoraeufalo_site/treino/player.html', { waitUntil: 'networkidle2' });
  await browser.close();
})();
