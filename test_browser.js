const puppeteer = require('puppeteer');
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  console.log('--- Loading portal.html ---');
  await page.goto('file:///Users/macbookpro/Desktop/agoraeufalo_site/portal.html');
  await wait(1000);
  
  console.log('--- Loading curso.html ---');
  await page.goto('file:///Users/macbookpro/Desktop/agoraeufalo_site/curso.html');
  await wait(1000);

  console.log('--- Loading admin-landing-pages.html ---');
  await page.goto('file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-landing-pages.html');
  await wait(1000);

  console.log('--- Loading admin.html ---');
  await page.goto('file:///Users/macbookpro/Desktop/agoraeufalo_site/admin.html');
  await wait(1000);
  
  await browser.close();
})();
