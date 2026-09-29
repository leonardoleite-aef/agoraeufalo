import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 8140;
const ROOT_DIR = process.cwd();

const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/sala-de-aula.html';
  const filePath = path.join(ROOT_DIR, p);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    let ct = 'text/plain';
    if (filePath.endsWith('.html')) ct = 'text/html; charset=utf-8';
    else if (filePath.endsWith('.js')) ct = 'application/javascript; charset=utf-8';
    else if (filePath.endsWith('.css')) ct = 'text/css; charset=utf-8';
    else if (filePath.endsWith('.json')) ct = 'application/json';
    res.writeHead(200, { 'Content-Type': ct });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

async function main() {
  await new Promise(r => server.listen(PORT, r));
  console.log(`Server running at http://localhost:${PORT}`);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1200 });

  // Test Lesson 1: fs-aef-ec aula 2 (Present Simple - from screenshot)
  console.log('Testing fs-aef-ec aula 2 (Present Simple)...');
  await page.goto(`http://localhost:${PORT}/sala-de-aula.html?curso=fs-aef-ec&aula=aula-1788905850710`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const el = document.getElementById('interactive-script-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scratch/test_fs_aula2_top.png' });

  await page.evaluate(() => {
    window.scrollBy(0, 600);
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scratch/test_fs_aula2_mid.png' });

  await page.evaluate(() => {
    window.scrollBy(0, 600);
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scratch/test_fs_aula2_bottom.png' });

  // Test Lesson 2: dtc_curso aula 1 (Dates and Times intro)
  console.log('Testing dtc_curso aula 1 (Dates & Times)...');
  await page.goto(`http://localhost:${PORT}/sala-de-aula.html?curso=dtc_curso&aula=aula-1788730082287`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const el = document.getElementById('interactive-script-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scratch/test_dtc_aula1.png' });

  // Test Lesson 3: fs-aef-ec aula 3 (Adverbs of Place / Days of Week)
  console.log('Testing fs-aef-ec aula 3...');
  await page.goto(`http://localhost:${PORT}/sala-de-aula.html?curso=fs-aef-ec&aula=aula-1788909250195`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const el = document.getElementById('interactive-script-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scratch/test_fs_aula3.png' });

  console.log('Screenshots saved!');
  await browser.close();
  server.close();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
