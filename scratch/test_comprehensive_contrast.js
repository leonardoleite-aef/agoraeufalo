import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 8145;
const ROOT_DIR = process.cwd();

// Load sala-de-aula.html into memory and replace the CSS section with our candidate CSS
let salaHtml = fs.readFileSync(path.join(ROOT_DIR, 'sala-de-aula.html'), 'utf8');

const candidateCss = `
    /* ========================================================================= */
    /* PEDAGOGICAL CONTENT (DARK INTEGRATED COCKPIT THEME - 100% WCAG CONTRAST)  */
    /* ========================================================================= */
    
    /* 1. All Light Pedagogical Cards -> Dark Integrated Cockpit Surfaces */
    #lessonProcessedContentContainer .bg-white,
    #lessonProcessedContentContainer .bg-white\\/80,
    #lessonProcessedContentContainer .bg-white\\/90,
    #lessonProcessedContentContainer .bg-\\[\\#FAF8F5\\],
    #lessonProcessedContentContainer .bg-\\[\\#FDF8F0\\],
    #lessonProcessedContentContainer .bg-slate-50,
    #lessonProcessedContentContainer .bg-slate-100,
    #lessonProcessedContentContainer .bg-slate-200,
    #lessonProcessedContentContainer .bg-stone-50,
    #lessonProcessedContentContainer .bg-stone-100,
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
    #lessonProcessedContentContainer .bg-red-50\\/50,
    #lessonProcessedContentContainer .bg-rose-50,
    #lessonProcessedContentContainer .bg-teal-50,
    #lessonProcessedContentContainer .bg-pink-50\\/50 {
      background-color: rgba(13, 30, 54, 0.75) !important;
      border-color: rgba(255, 255, 255, 0.12) !important;
      color: #F1F5F9 !important;
    }

    /* 2. Elevated Nested Sub-Cards (e.g. grids of verbs, word lists, days) */
    #lessonProcessedContentContainer [class*="bg-"] [class*="bg-"],
    #lessonProcessedContentContainer .grid > [class*="bg-"],
    #lessonProcessedContentContainer .grid > div {
      background-color: rgba(19, 42, 74, 0.7) !important;
      border-color: rgba(255, 255, 255, 0.14) !important;
    }

    /* 3. Primary Headings & Bold Text (Pure White) */
    #lessonProcessedContentContainer h1,
    #lessonProcessedContentContainer h2,
    #lessonProcessedContentContainer h3,
    #lessonProcessedContentContainer h4,
    #lessonProcessedContentContainer h5,
    #lessonProcessedContentContainer strong,
    #lessonProcessedContentContainer b,
    #lessonProcessedContentContainer .text-slate-900,
    #lessonProcessedContentContainer .text-slate-800,
    #lessonProcessedContentContainer .text-\\[\\#0A192F\\] {
      color: #FFFFFF !important;
    }

    /* 4. Body Paragraphs & List Items */
    #lessonProcessedContentContainer p,
    #lessonProcessedContentContainer li,
    #lessonProcessedContentContainer blockquote {
      color: #E2E8F0 !important;
    }

    /* 5. Golden Amber Accent Texts (Category headers, golden pills, important tips) */
    #lessonProcessedContentContainer .text-amber-950,
    #lessonProcessedContentContainer .text-amber-900,
    #lessonProcessedContentContainer .text-amber-800,
    #lessonProcessedContentContainer .text-amber-700,
    #lessonProcessedContentContainer .text-amber-600,
    #lessonProcessedContentContainer .text-\\[\\#78350F\\],
    #lessonProcessedContentContainer .text-\\[\\#b45309\\],
    #lessonProcessedContentContainer .text-\\[\\#d97706\\],
    #lessonProcessedContentContainer .text-\\[\\#D97706\\] {
      color: #FBBF24 !important;
    }

    /* 6. Secondary / Translations / Notes (Crisp Slate 400 - 100% WCAG AA/AAA on Dark) */
    #lessonProcessedContentContainer .text-slate-700,
    #lessonProcessedContentContainer .text-slate-600,
    #lessonProcessedContentContainer .text-slate-500,
    #lessonProcessedContentContainer .text-slate-400,
    #lessonProcessedContentContainer .text-\\[\\#7A7369\\] {
      color: #94A3B8 !important;
    }

    /* 7. Emerald & Positive Accents */
    #lessonProcessedContentContainer .text-emerald-700,
    #lessonProcessedContentContainer .text-emerald-800,
    #lessonProcessedContentContainer .text-emerald-900,
    #lessonProcessedContentContainer .text-\\[\\#047857\\],
    #lessonProcessedContentContainer .text-\\[\\#065F46\\] {
      color: #34D399 !important;
    }

    /* 8. Blue / Indigo Accents */
    #lessonProcessedContentContainer .text-blue-700,
    #lessonProcessedContentContainer .text-blue-800,
    #lessonProcessedContentContainer .text-blue-900,
    #lessonProcessedContentContainer .text-indigo-700,
    #lessonProcessedContentContainer .text-\\[\\#1A56DB\\] {
      color: #60A5FA !important;
    }

    /* 9. Badges & Pills (Falando de Você, Days of the Week, Categories) */
    #lessonProcessedContentContainer span[class*="rounded-full"],
    #lessonProcessedContentContainer span[class*="rounded-md"].uppercase,
    #lessonProcessedContentContainer span[class*="font-mono"].uppercase {
      background-color: rgba(245, 158, 11, 0.2) !important;
      color: #FDE68A !important;
      border: 1px solid rgba(245, 158, 11, 0.4) !important;
    }

    /* Number badge circles (e.g. 1, 2, 3 in section headers) */
    #lessonProcessedContentContainer span.rounded-full.bg-amber-500 {
      background-color: #F59E0B !important;
      color: #0F172A !important;
      font-weight: 900 !important;
      border: none !important;
    }

    /* 10. Inline Code Badges */
    #lessonProcessedContentContainer code {
      background-color: rgba(255, 255, 255, 0.1) !important;
      color: #FDE68A !important;
      border: 1px solid rgba(255, 255, 255, 0.18) !important;
      padding: 0.15rem 0.5rem !important;
      border-radius: 0.375rem !important;
      font-family: 'Fira Code', monospace !important;
      font-weight: 700 !important;
      display: inline-block !important;
    }

    /* 11. Subtle Modern Borders */
    #lessonProcessedContentContainer .border,
    #lessonProcessedContentContainer .border-b,
    #lessonProcessedContentContainer .border-t,
    #lessonProcessedContentContainer .border-l,
    #lessonProcessedContentContainer .border-r,
    #lessonProcessedContentContainer [class*="border-slate-"],
    #lessonProcessedContentContainer [class*="border-amber-"],
    #lessonProcessedContentContainer .border-\\[\\#EAE5DC\\],
    #lessonProcessedContentContainer .border-\\[\\#F0EBE1\\] {
      border-color: rgba(255, 255, 255, 0.12) !important;
    }
    #lessonProcessedContentContainer .border-l-4.border-amber-500 {
      border-left: 4px solid #F59E0B !important;
    }
`;

// Replace lines 106-134 with candidateCss
const regex = /\/\* Dark Integrated Theme overrides for dynamically injected content \*\/[\s\S]*?#lessonProcessedContentContainer \.border-\[\\#F0EBE1\] \{[\s\S]*?\}/;
salaHtml = salaHtml.replace(regex, candidateCss);

// Also add cleanContent for \\n escaping
salaHtml = salaHtml.replace(
  'if (found.processedContentHtml) {\n          processedContainer.innerHTML = found.processedContentHtml;',
  'if (found.processedContentHtml) {\n          let cleanContent = found.processedContentHtml;\n          if (cleanContent.includes("\\\\n")) {\n            cleanContent = cleanContent.replace(/\\\\n/g, "\\n");\n          }\n          processedContainer.innerHTML = cleanContent;'
);

const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/' || p === '/sala-de-aula.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(salaHtml);
    return;
  }
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
  console.log(`Test server running at http://localhost:${PORT}`);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1100 });

  // 1. fs-aef-ec aula 2 (Present Simple) - Top section (Sentimento da Estrutura + Quem + Ação)
  console.log('Capturing FS Aula 2 Top...');
  await page.goto(`http://localhost:${PORT}/sala-de-aula.html?curso=fs-aef-ec&aula=aula-1788905850710`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const el = document.getElementById('interactive-script-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scratch/final_fs_aula2_top.png' });

  // 2. fs-aef-ec aula 2 - Mid section (Exact user screenshot area)
  console.log('Capturing FS Aula 2 Mid (User Screenshot Match)...');
  await page.evaluate(() => {
    window.scrollBy(0, 480);
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scratch/final_fs_aula2_mid_user_match.png' });

  // 3. fs-aef-ec aula 2 - Bottom section (Frases de Aplicação Imediata)
  console.log('Capturing FS Aula 2 Bottom...');
  await page.evaluate(() => {
    window.scrollBy(0, 550);
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scratch/final_fs_aula2_bottom.png' });

  // 4. fs-aef-ec aula 3 (Adverbs of Time / Days of Week)
  console.log('Capturing FS Aula 3...');
  await page.goto(`http://localhost:${PORT}/sala-de-aula.html?curso=fs-aef-ec&aula=aula-1788909250195`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const el = document.getElementById('interactive-script-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    window.scrollBy(0, 300);
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scratch/final_fs_aula3.png' });

  // 5. dtc_curso aula 1 (Dates and Times intro - testing \\n fix and contrast)
  console.log('Capturing DTC Aula 1...');
  await page.goto(`http://localhost:${PORT}/sala-de-aula.html?curso=dtc_curso&aula=aula-1788730082287`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const el = document.getElementById('interactive-script-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scratch/final_dtc_aula1.png' });

  console.log('All screenshots captured successfully!');
  await browser.close();
  server.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
