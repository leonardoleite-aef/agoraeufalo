const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  await page.goto('file://' + '/Users/macbookpro/Desktop/agoraeufalo_site/player.html', { waitUntil: 'networkidle2' });
  await browser.close();
})();
