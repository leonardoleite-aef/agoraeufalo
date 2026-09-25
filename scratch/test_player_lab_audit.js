import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 8133;
const ROOT_DIR = process.cwd();

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = url.pathname;
  if (pathname === '/') pathname = '/player-lab.html';

  const filePath = path.join(ROOT_DIR, pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    let contentType = 'text/plain';
    if (filePath.endsWith('.html')) contentType = 'text/html; charset=utf-8';
    else if (filePath.endsWith('.js')) contentType = 'application/javascript; charset=utf-8';
    else if (filePath.endsWith('.css')) contentType = 'text/css; charset=utf-8';
    else if (filePath.endsWith('.json')) contentType = 'application/json';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

async function runAudit() {
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Audit server running at http://localhost:${PORT}`);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const consoleLogs = [];
  const pageErrors = [];

  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => pageErrors.push(err.toString()));

  // 1. Desktop Viewport (1280x800)
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}/player-lab.html`, { waitUntil: 'networkidle0' });

  // Let's audit all 6 tabs on Desktop
  const arenas = ['lr', 'voc', 'la', 'lrt', 'lask', 'pro'];
  const auditResults = {};

  for (const arena of arenas) {
    await page.evaluate(a => window.switchArena(a), arena);
    await new Promise(r => setTimeout(r, 300));
    
    // Check visibility and content
    const info = await page.evaluate(a => {
      const sec = document.getElementById(`arena-${a}`);
      const isVisible = sec && !sec.classList.contains('hidden');
      const textLength = sec ? sec.innerText.length : 0;
      const buttons = sec ? Array.from(sec.querySelectorAll('button')).map(b => b.innerText.trim().replace(/\n+/g, ' ')) : [];
      return { isVisible, textLength, buttons };
    }, arena);

    auditResults[arena] = info;

    const screenshotPath = path.join(ROOT_DIR, `scratch/audit_desktop_${arena}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
  }

  // Test dock controls
  const dockInfo = await page.evaluate(() => {
    const playBtn = document.getElementById('btn-dock-play')?.innerText;
    const speedBtn = document.getElementById('btn-dock-speed')?.innerText;
    const activityLabel = document.getElementById('dock-activity-label')?.innerText;
    const trackTitle = document.getElementById('dock-track-title')?.innerText;
    
    // Test cycling speed
    window.cycleSpeed();
    const speedAfter1 = document.getElementById('btn-dock-speed')?.innerText;
    window.cycleSpeed();
    const speedAfter2 = document.getElementById('btn-dock-speed')?.innerText;
    window.cycleSpeed();
    const speedAfter3 = document.getElementById('btn-dock-speed')?.innerText;

    return { playBtn, speedBtn, activityLabel, trackTitle, speeds: [speedAfter1, speedAfter2, speedAfter3] };
  });

  // 2. Mobile Viewport (375x667 - iPhone SE)
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
  await page.evaluate(() => window.switchArena('lr'));
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(ROOT_DIR, 'scratch/audit_mobile_lr.png'), fullPage: false });

  await page.evaluate(() => window.switchArena('la'));
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(ROOT_DIR, 'scratch/audit_mobile_la.png'), fullPage: false });

  // Check interactive LA toggle
  const laToggleTest = await page.evaluate(() => {
    const firstAnswer = document.getElementById('la-answer-0');
    const isInitiallyHidden = firstAnswer.classList.contains('hidden');
    window.toggleAnswer(0);
    const isShownAfterClick = !firstAnswer.classList.contains('hidden');
    window.toggleAnswer(0);
    const isHiddenAfterSecondClick = firstAnswer.classList.contains('hidden');
    return { isInitiallyHidden, isShownAfterClick, isHiddenAfterSecondClick };
  });

  // Check LASK toggle
  await page.evaluate(() => window.switchArena('lask'));
  const laskToggleTest = await page.evaluate(() => {
    const firstQ = document.getElementById('lask-q-0');
    const isInitiallyHidden = firstQ.classList.contains('hidden');
    window.toggleLaskQuestion(0);
    const isShownAfterClick = !firstQ.classList.contains('hidden');
    window.toggleLaskQuestion(0);
    const isHiddenAfterSecondClick = firstQ.classList.contains('hidden');
    return { isInitiallyHidden, isShownAfterClick, isHiddenAfterSecondClick };
  });

  console.log('AUDIT SUMMARY:');
  console.log('Page Errors:', pageErrors);
  console.log('Console Logs Sample:', consoleLogs.slice(0, 10));
  console.log('Arenas Audit:', JSON.stringify(auditResults, null, 2));
  console.log('Dock Controls:', dockInfo);
  console.log('LA Toggle Test:', laToggleTest);
  console.log('LASK Toggle Test:', laskToggleTest);

  await browser.close();
  server.close();
}

runAudit().catch(err => {
  console.error('Audit run error:', err);
  server.close();
  process.exit(1);
});
