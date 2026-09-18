const puppeteer = require('puppeteer');

const BASE_URL = process.env.TARGET_URL || 'https://agoraeufalo.selexenglish.workers.dev';

const ROUTES_TO_TEST = [
  { name: 'Portal Principal / Vitrine', path: '/portal.html', auth: 'student' },
  { name: 'Catálogo de Cursos', path: '/cursos.html', auth: 'anonymous' },
  { name: 'Sala de Aula (MS001)', path: '/sala-de-aula.html?curso=ms-legacy&modulo=ms001-grazi&aula=ms001-lr', auth: 'student' },
  { name: 'Sala de Aula (QuickStart)', path: '/sala-de-aula.html?curso=english-quickstart&modulo=eq-m1&aula=eq-m1-l1', auth: 'student' },
  { name: 'Login Administrativo', path: '/admin-login.html', auth: 'anonymous' },
  { name: 'CRM de Alunos', path: '/admin-alunos.html', auth: 'admin' },
  { name: 'Hub Central Admin', path: '/admin.html', auth: 'admin' },
  { name: 'Vendas / Checkout', path: '/vendas.html', auth: 'anonymous' }
];

async function runAudit() {
  console.log(`\n======================================================`);
  console.log(`🩺 INICIANDO AUDITORIA COMPLETA DO SISTEMA`);
  console.log(`Destino: ${BASE_URL}`);
  console.log(`======================================================\n`);

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const report = [];

  for (const route of ROUTES_TO_TEST) {
    const page = await browser.newPage();
    const errors = [];
    const failedRequests = [];

    page.on('dialog', async dialog => {
      await dialog.dismiss().catch(() => {});
    });

    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error' && !text.includes('favicon.ico')) {
        errors.push(text.substring(0, 120));
      }
    });

    page.on('requestfailed', req => {
      const err = req.failure()?.errorText;
      if (err !== 'net::ERR_ABORTED') {
        failedRequests.push(`${req.method()} ${req.url().split('?')[0]} (${err})`);
      }
    });

    page.on('response', res => {
      if (res.status() >= 400 && !res.url().includes('favicon.ico')) {
        failedRequests.push(`HTTP ${res.status}: ${res.url().split('?')[0]}`);
      }
    });

    if (route.auth === 'student') {
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem('aef_user_email', 'alunoteste@agoraeufalo.com');
        localStorage.setItem('aef_user_role', 'student');
        localStorage.setItem('aef_user_tier', 'club');
        localStorage.setItem('aef_enrolled_products', JSON.stringify(['ms-legacy', 'english-quickstart', 'fs-aef-ec']));
      });
    } else if (route.auth === 'admin') {
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem('aef_user_email', 'selexenglish@gmail.com');
        localStorage.setItem('aef_user_role', 'admin');
        localStorage.setItem('aef_user_tier', 'admin_master');
        localStorage.setItem('aef_is_admin', 'true');
      });
    }

    let status = 'OK';
    try {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      status = 'TIMEOUT / FALHA AO CARREGAR';
      errors.push(e.message);
    }

    try {
      await page.waitForFunction(() => {
        const spinner = document.querySelector('#classroomSpinner, .animate-spin');
        return !spinner || spinner.closest('.hidden') || window.getComputedStyle(spinner).display === 'none';
      }, { timeout: 4000 });
    } catch (e) {}

    const hasSpinner = await page.evaluate(() => {
      const spinner = document.querySelector('#classroomSpinner, .animate-spin');
      return spinner && !spinner.closest('.hidden') && window.getComputedStyle(spinner).display !== 'none';
    });

    if (errors.length > 0 || failedRequests.length > 0 || hasSpinner || status !== 'OK') {
      status = 'COM PROBLEMAS';
    }

    report.push({
      Tela: route.name,
      Status: status === 'OK' ? '✅ OK' : '❌ ERRO',
      'Erros JS': errors.length,
      'Falhas de Rede': failedRequests.length,
      'Spinner Travado': hasSpinner ? 'Sim' : 'Não',
      Detalhes: [...errors, ...failedRequests].slice(0, 2).join(' | ') || '-'
    });

    await page.close();
  }

  await browser.close();
  console.table(report);
}

runAudit().catch(console.error);
