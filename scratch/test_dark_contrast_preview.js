import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 8142;
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

async function run() {
  await new Promise(r => server.listen(PORT, r));
  console.log(`Server at http://localhost:${PORT}`);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1200 });

  // TEST 1: DARK COCKPIT THEME with 100% contrast on all boxes
  await page.goto(`http://localhost:${PORT}/sala-de-aula.html?curso=fs-aef-ec&aula=aula-1788905850710`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  await page.addStyleTag({
    content: `
    /* All pedagogical boxes in dark cockpit */
    #lessonProcessedContentContainer .bg-white,
    #lessonProcessedContentContainer .bg-white\\/80,
    #lessonProcessedContentContainer .bg-\\[\\#FAF8F5\\],
    #lessonProcessedContentContainer .bg-\\[\\#FDF8F0\\],
    #lessonProcessedContentContainer .bg-slate-50,
    #lessonProcessedContentContainer .bg-slate-100,
    #lessonProcessedContentContainer .bg-slate-200,
    #lessonProcessedContentContainer .bg-amber-50,
    #lessonProcessedContentContainer .bg-amber-50\\/40,
    #lessonProcessedContentContainer .bg-amber-50\\/50,
    #lessonProcessedContentContainer .bg-amber-50\\/60,
    #lessonProcessedContentContainer .bg-amber-50\\/70,
    #lessonProcessedContentContainer .bg-amber-50\\/80,
    #lessonProcessedContentContainer .bg-amber-50\\/90,
    #lessonProcessedContentContainer .bg-amber-100,
    #lessonProcessedContentContainer .bg-amber-100\\/50,
    #lessonProcessedContentContainer .bg-amber-100\\/60,
    #lessonProcessedContentContainer .bg-amber-100\\/70,
    #lessonProcessedContentContainer .bg-amber-100\\/80,
    #lessonProcessedContentContainer .bg-amber-200,
    #lessonProcessedContentContainer .bg-blue-50,
    #lessonProcessedContentContainer .bg-emerald-50,
    #lessonProcessedContentContainer .bg-emerald-100,
    #lessonProcessedContentContainer .bg-red-50,
    #lessonProcessedContentContainer .bg-stone-100 {
      background-color: rgba(13, 30, 54, 0.75) !important;
      border-color: rgba(255, 255, 255, 0.12) !important;
      color: #F1F5F9 !important;
    }

    /* Inner nested cards */
    #lessonProcessedContentContainer [class*="bg-"] [class*="bg-"] {
      background-color: rgba(19, 42, 74, 0.7) !important;
      border-color: rgba(255, 255, 255, 0.14) !important;
    }

    /* Clear typography */
    #lessonProcessedContentContainer h2,
    #lessonProcessedContentContainer h3,
    #lessonProcessedContentContainer h4,
    #lessonProcessedContentContainer strong,
    #lessonProcessedContentContainer b {
      color: #FFFFFF !important;
    }
    #lessonProcessedContentContainer p,
    #lessonProcessedContentContainer li {
      color: #E2E8F0 !important;
    }
    #lessonProcessedContentContainer .text-amber-950,
    #lessonProcessedContentContainer .text-amber-900,
    #lessonProcessedContentContainer .text-amber-800,
    #lessonProcessedContentContainer .text-amber-700,
    #lessonProcessedContentContainer .text-amber-600 {
      color: #FBBF24 !important;
    }
    #lessonProcessedContentContainer .text-slate-500,
    #lessonProcessedContentContainer .text-slate-600,
    #lessonProcessedContentContainer .text-slate-400 {
      color: #94A3B8 !important;
    }
    #lessonProcessedContentContainer span[class*="rounded-full"] {
      background-color: rgba(245, 158, 11, 0.2) !important;
      color: #FDE68A !important;
      border: 1px solid rgba(245, 158, 11, 0.4) !important;
    }
    #lessonProcessedContentContainer code {
      background-color: rgba(255, 255, 255, 0.1) !important;
      color: #FDE68A !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      padding: 0.15rem 0.5rem !important;
      border-radius: 0.375rem !important;
      font-weight: 700 !important;
    }
    #lessonProcessedContentContainer .border,
    #lessonProcessedContentContainer .border-b,
    #lessonProcessedContentContainer .border-t,
    #lessonProcessedContentContainer [class*="border-"] {
      border-color: rgba(255, 255, 255, 0.12) !important;
    }
    `
  });

  await page.evaluate(() => {
    const el = document.getElementById('interactive-script-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    window.scrollBy(0, 300);
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scratch/preview_all_dark.png' });

  // Now test fs aula 3 with dark
  await page.goto(`http://localhost:${PORT}/sala-de-aula.html?curso=fs-aef-ec&aula=aula-1788909250195`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.addStyleTag({
    content: `
    #lessonProcessedContentContainer .bg-white,
    #lessonProcessedContentContainer .bg-white\\/80,
    #lessonProcessedContentContainer .bg-\\[\\#FAF8F5\\],
    #lessonProcessedContentContainer .bg-\\[\\#FDF8F0\\],
    #lessonProcessedContentContainer .bg-slate-50,
    #lessonProcessedContentContainer .bg-slate-100,
    #lessonProcessedContentContainer .bg-slate-200,
    #lessonProcessedContentContainer .bg-amber-50,
    #lessonProcessedContentContainer .bg-amber-50\\/40,
    #lessonProcessedContentContainer .bg-amber-50\\/50,
    #lessonProcessedContentContainer .bg-amber-50\\/60,
    #lessonProcessedContentContainer .bg-amber-50\\/70,
    #lessonProcessedContentContainer .bg-amber-50\\/80,
    #lessonProcessedContentContainer .bg-amber-50\\/90,
    #lessonProcessedContentContainer .bg-amber-100,
    #lessonProcessedContentContainer .bg-amber-100\\/50,
    #lessonProcessedContentContainer .bg-amber-100\\/60,
    #lessonProcessedContentContainer .bg-amber-100\\/70,
    #lessonProcessedContentContainer .bg-amber-100\\/80,
    #lessonProcessedContentContainer .bg-amber-200,
    #lessonProcessedContentContainer .bg-blue-50,
    #lessonProcessedContentContainer .bg-emerald-50,
    #lessonProcessedContentContainer .bg-emerald-100,
    #lessonProcessedContentContainer .bg-red-50,
    #lessonProcessedContentContainer .bg-stone-100 {
      background-color: rgba(13, 30, 54, 0.75) !important;
      border-color: rgba(255, 255, 255, 0.12) !important;
      color: #F1F5F9 !important;
    }
    #lessonProcessedContentContainer [class*="bg-"] [class*="bg-"] {
      background-color: rgba(19, 42, 74, 0.7) !important;
      border-color: rgba(255, 255, 255, 0.14) !important;
    }
    #lessonProcessedContentContainer h2,
    #lessonProcessedContentContainer h3,
    #lessonProcessedContentContainer h4,
    #lessonProcessedContentContainer strong,
    #lessonProcessedContentContainer b {
      color: #FFFFFF !important;
    }
    #lessonProcessedContentContainer p,
    #lessonProcessedContentContainer li {
      color: #E2E8F0 !important;
    }
    #lessonProcessedContentContainer .text-amber-950,
    #lessonProcessedContentContainer .text-amber-900,
    #lessonProcessedContentContainer .text-amber-800,
    #lessonProcessedContentContainer .text-amber-700,
    #lessonProcessedContentContainer .text-amber-600 {
      color: #FBBF24 !important;
    }
    #lessonProcessedContentContainer .text-slate-500,
    #lessonProcessedContentContainer .text-slate-600,
    #lessonProcessedContentContainer .text-slate-400 {
      color: #94A3B8 !important;
    }
    #lessonProcessedContentContainer span[class*="rounded-full"] {
      background-color: rgba(245, 158, 11, 0.2) !important;
      color: #FDE68A !important;
      border: 1px solid rgba(245, 158, 11, 0.4) !important;
    }
    `
  });
  await page.evaluate(() => {
    const el = document.getElementById('interactive-script-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    window.scrollBy(0, 300);
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scratch/preview_fs_aula3_dark.png' });

  await browser.close();
  server.close();
  console.log('Done rendering previews!');
}

run().catch(e => { console.error(e); process.exit(1); });
