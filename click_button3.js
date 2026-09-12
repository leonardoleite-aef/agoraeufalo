const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('file://' + path.join(__dirname, 'admin-alunos.html'), { waitUntil: 'networkidle2' });
  
  // wait a bit for javascript to load
  await new Promise(r => setTimeout(r, 2000));
  
  // call the function that is defined in the page
  await page.evaluate(() => {
    window.openCreateVipSpaceModal('estevao', 'Estêvão Pinheiro', 'estevaopin@gmail.com');
  });
  
  // wait a bit for modal to show
  await new Promise(r => setTimeout(r, 1000));
  
  await page.screenshot({ path: 'admin-alunos-vip-modal.png' });
  await browser.close();
  console.log("Screenshot saved to admin-alunos-vip-modal.png");
})();
