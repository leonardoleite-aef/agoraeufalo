const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem("aef_user_name", "Leonardo Leite");
    localStorage.setItem("aef_user_email", "selexenglish@gmail.com");
    localStorage.setItem("aef_user_tier", "vip_mentorship");
    localStorage.setItem("aef_enrolled_products", JSON.stringify(["ms-legacy", "quickstart"]));
  });

  console.log('--- Loading portal.html ---');
  await page.goto('file:///Users/macbookpro/Desktop/agoraeufalo_site/portal.html', { waitUntil: 'networkidle0' });
  
  await browser.close();
})();
