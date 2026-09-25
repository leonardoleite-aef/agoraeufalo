import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 8136;
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

async function runCheck() {
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Test server running at http://localhost:${PORT}`);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 950 });
  await page.goto(`http://localhost:${PORT}/sala-de-aula.html?curso=fs-aef-ec&aula=aula-1788904998576`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await new Promise(r => setTimeout(r, 1500));

  console.log('1. Verificando título da aula...');
  const title = await page.$eval('#currentLessonTitle', el => el.innerText.trim());
  console.log(`- Título da Aula: ${title}`);

  console.log('2. Verificando conteúdo pedagógico de Personal Pronouns...');
  const contentText = await page.$eval('#lessonProcessedContentContainer', el => el.innerText);
  
  const hasDispara = /dispara/i.test(contentText);
  console.log(`- Contém a palavra 'Dispara' em qualquer lugar do conteúdo? ${hasDispara ? 'SIM (FALHA!)' : 'NÃO (100% LIMPO!)'}`);

  console.log('3. Capturando screenshot da seção exata...');
  // Scroll para a seção dos gatilhos
  await page.evaluate(() => {
    const el = document.getElementById('lessonProcessedContentContainer');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scratch/verify_pronouns_no_dispara.png' });
  console.log('- Screenshot salvo em scratch/verify_pronouns_no_dispara.png');

  await browser.close();
  server.close();
  console.log('Verificação finalizada com sucesso!');
}

runCheck().catch(err => {
  console.error('Falha:', err);
  process.exit(1);
});
