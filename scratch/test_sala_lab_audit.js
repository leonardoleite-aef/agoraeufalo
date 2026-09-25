import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 8134;
const ROOT_DIR = process.cwd();

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = url.pathname;
  if (pathname === '/') pathname = '/sala-lab.html';

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

  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}/sala-lab.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  console.log('1. Verificando carregamento inicial da sala-lab...');
  const title = await page.$eval('#currentLessonTitle', el => el.innerText.trim());
  console.log(`- Título da Aula Inicial: ${title}`);

  console.log('2. Verificando classes do overlay da gaveta (filtro suavizado)...');
  const overlayClasses = await page.$eval('#syllabusDrawerOverlay', el => el.className);
  console.log(`- Classes do overlay: ${overlayClasses}`);
  const hasSoftFilter = overlayClasses.includes('bg-slate-950/35') && overlayClasses.includes('backdrop-blur-[2px]');
  console.log(`- Filtro suavizado para 35% com blur 2px: ${hasSoftFilter ? 'SIM (OK)' : 'NÃO (FALHA)'}`);

  console.log('3. Abrindo gaveta de aulas...');
  await page.evaluate(() => window.toggleSyllabusDrawer(true));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scratch/audit_sala_lab_drawer.png' });
  console.log('- Captura de tela da gaveta salva em scratch/audit_sala_lab_drawer.png');

  console.log('4. Fechando gaveta...');
  await page.evaluate(() => window.toggleSyllabusDrawer(false));
  await new Promise(r => setTimeout(r, 400));

  console.log('5. Testando ativação do Motor de Quiz...');
  const quizTestResult = await page.evaluate(() => {
    // Busca um quiz do registry
    const registry = window.AEF_QUIZZES_REGISTRY || {};
    const quizKey = Object.keys(registry)[0] || 'quiz-dtc-horas-01';
    const quizData = registry[quizKey] || {
      id: 'quiz-test',
      title: 'Quiz Teste de Fixação',
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          questionText: 'How do you say 1973 in English?',
          options: [
            { id: 'opt1', text: 'One thousand nine hundred seventy-three', isCorrect: false },
            { id: 'opt2', text: 'Nineteen seventy-three', isCorrect: true },
            { id: 'opt3', text: 'Nineteen hundred seventy-three', isCorrect: false }
          ],
          goldenTip: 'Anos em inglês são falados em blocos de dois dígitos!'
        }
      ]
    };

    window.renderQuizArena(quizData, { id: 'test-quiz-lesson', title: 'Quiz de Teste' });

    const videoStage = document.getElementById('videoStage');
    const consoleEl = document.getElementById('tactileStudioConsole');
    const hasQuizHeader = !!videoStage.querySelector('span')?.innerText.includes('QUIZ DE ESCUTA');
    const questionText = videoStage.querySelector('h3')?.innerText || '';
    const optionsCount = videoStage.querySelectorAll('[onclick*="selectQuizOption"]').length;
    const isConsoleHidden = consoleEl ? consoleEl.classList.contains('hidden') : false;

    return {
      hasQuizHeader,
      questionText,
      optionsCount,
      isConsoleHidden
    };
  });

  console.log('- Quiz Renderizado:', quizTestResult);
  await page.screenshot({ path: 'scratch/audit_sala_lab_quiz.png' });
  console.log('- Captura de tela do Quiz salva em scratch/audit_sala_lab_quiz.png');

  console.log('6. Testando interação do Quiz (selecionar opção B e submeter)...');
  const interactionResult = await page.evaluate(() => {
    // Busca a opção correta da primeira pergunta
    const registry = window.AEF_QUIZZES_REGISTRY || {};
    const quizKey = Object.keys(registry)[0] || 'quiz-dtc-horas-01';
    const firstQ = registry[quizKey]?.questions?.[0];
    const correctOpt = firstQ?.options?.find(o => o.isCorrect) || { id: 'opt_b' };
    window.selectQuizOption(correctOpt.id);
    window.submitQuizAnswer();

    const feedbackEl = document.querySelector('.bg-emerald-500\\/15') || document.querySelector('#quizFeedbackBox');
    const hasSuccessFeedback = !!feedbackEl && feedbackEl.innerText.includes('EXCELENTE');
    return { hasSuccessFeedback, selectedId: correctOpt.id };
  });
  console.log('- Feedback de Acerto do Quiz:', interactionResult);

  console.log('7. Testando resumo final e gravação de progresso...');
  await page.evaluate(() => {
    window.renderQuizSummary();
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: 'scratch/audit_sala_lab_summary.png' });
  console.log('- Captura de tela do Resumo salva em scratch/audit_sala_lab_summary.png');

  const summaryResult = await page.evaluate(() => {
    const isSummary = document.querySelector('h3')?.innerText.includes('Parabéns') || document.querySelector('h3')?.innerText.includes('Ouvido Afiado');
    window.finishQuizAndRecordProgress();
    const toastText = document.getElementById('classroom-toast-text')?.innerText;
    return { isSummary, toastText };
  });
  console.log('- Resumo e Toast:', summaryResult);

  console.log('8. Verificando erros no console...');
  console.log(`- Page Errors: ${pageErrors.length}`);
  if (pageErrors.length > 0) {
    console.error('Erros:', pageErrors);
  }

  await browser.close();
  server.close();
  console.log('Auditoria concluída com sucesso!');
}

runAudit().catch(err => {
  console.error('Falha na auditoria:', err);
  process.exit(1);
});
