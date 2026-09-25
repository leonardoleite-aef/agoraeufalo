import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 8135;
const ROOT_DIR = process.cwd();

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = url.pathname;
  if (pathname === '/') pathname = '/sala-de-aula.html';

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

async function runProdAudit() {
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Audit server running at http://localhost:${PORT}`);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const consoleLogs = [];
  const pageErrors = [];

  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => pageErrors.push(err.toString()));

  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}/sala-de-aula.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  console.log('1. Verificando carregamento da nova sala-de-aula.html...');
  const title = await page.title();
  console.log(`- Page Title: ${title}`);

  console.log('2. Verificando ausência total da LAB NOTICE BAR...');
  const labNoticeExists = await page.evaluate(() => {
    return !!document.querySelector('aside[aria-label="Ambiente de Teste"]') ||
           !!document.getElementById('btn-lab-club') ||
           document.body.innerText.includes('LAB COCKPIT');
  });
  console.log(`- LAB NOTICE BAR presente? ${labNoticeExists ? 'FALHA (Ainda existe!)' : 'NÃO (Removida com sucesso!)'}`);

  console.log('3. Verificando aula inicial e HUD...');
  const lessonTitle = await page.$eval('#currentLessonTitle', el => el.innerText.trim());
  console.log(`- Título da Aula: ${lessonTitle}`);

  console.log('4. Verificando gaveta com filtro suavizado (35%)...');
  const overlayClasses = await page.$eval('#syllabusDrawerOverlay', el => el.className);
  const hasSoftFilter = overlayClasses.includes('bg-slate-950/35') && overlayClasses.includes('backdrop-blur-[2px]');
  console.log(`- Filtro suavizado: ${hasSoftFilter ? 'OK' : 'FALHA'}`);

  await page.evaluate(() => window.toggleSyllabusDrawer(true));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scratch/prod_sala_drawer.png' });
  console.log('- Screenshot da gaveta: scratch/prod_sala_drawer.png');

  await page.evaluate(() => window.toggleSyllabusDrawer(false));
  await new Promise(r => setTimeout(r, 300));

  console.log('5. Verificando Motor de Quiz...');
  const quizTestResult = await page.evaluate(() => {
    const registry = window.AEF_QUIZZES_REGISTRY || {};
    const quizKey = Object.keys(registry)[0] || 'quiz-dtc-horas-01';
    const quizData = registry[quizKey];
    window.renderQuizArena(quizData, { id: 'test-quiz', title: 'Quiz Teste' });

    const videoStage = document.getElementById('videoStage');
    const tactileConsole = document.getElementById('tactileStudioConsole');
    return {
      hasQuizHeader: !!videoStage.querySelector('span')?.innerText.includes('QUIZ DE ESCUTA'),
      isConsoleHidden: tactileConsole ? tactileConsole.classList.contains('hidden') : false
    };
  });
  console.log('- Quiz Test Result:', quizTestResult);
  await page.screenshot({ path: 'scratch/prod_sala_quiz.png' });
  console.log('- Screenshot do quiz: scratch/prod_sala_quiz.png');

  console.log('6. Verificando erros na página...');
  console.log(`- Total Page Errors: ${pageErrors.length}`);
  if (pageErrors.length > 0) {
    console.error('Page Errors:', pageErrors);
  }

  await browser.close();
  server.close();
  console.log('Auditoria da nova sala-de-aula.html concluída com sucesso!');
}

runProdAudit().catch(err => {
  console.error('Falha no teste:', err);
  process.exit(1);
});
