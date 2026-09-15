const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

function createStaticServer(port) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  const server = http.createServer((req, res) => {
    let cleanUrl = req.url.split('?')[0];
    if (cleanUrl === '/') cleanUrl = '/index.html';
    if (cleanUrl.startsWith('/')) cleanUrl = cleanUrl.substring(1);
    const filePath = path.join(process.cwd(), cleanUrl);
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        console.log('404 Not Found:', req.url, '=> Tried path:', filePath);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found: ' + cleanUrl);
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(content);
    });
  });

  return new Promise(resolve => {
    server.listen(port, () => resolve(server));
  });
}

async function runRealTest() {
  const PORT = 8092;
  const server = await createStaticServer(PORT);
  console.log(`Local test server running on port ${PORT}...`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const pageErrors = [];
  page.on('console', msg => {
    console.log(`[Browser Console ${msg.type()}]: ${msg.text()}`);
    if (msg.type() === 'error') pageErrors.push(`[Console Error] ${msg.text()}`);
  });
  page.on('pageerror', err => {
    console.log(`[Browser PageError]: ${err.message}`);
    pageErrors.push(`[Page Error] ${err.message}`);
  });

  // Setup admin session in localStorage
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('aef_user_email', 'selexenglish@gmail.com');
    localStorage.setItem('aef_user_name', 'Prof. Leonardo Leite');
    localStorage.setItem('aef_user_uid', 'leo_superadmin');
    localStorage.setItem('aef_user_role', 'admin');
    localStorage.setItem('aef_user_tier', 'admin_master');
    localStorage.setItem('aef_logged_out', 'false');
    localStorage.setItem('aef_enrolled_products', JSON.stringify(['all_access_master', 'mentoria_vip', 'mentoria-andre', 'mentoria-thomas', 'mentoria-mateus', 'mentoria-estevao']));
  });

  console.log('====================================================');
  console.log('TESTE 1: Painel Admin - Edição de Alunos & Meet Link');
  console.log('====================================================');

  await page.goto(`http://localhost:${PORT}/admin-alunos.html`, { waitUntil: 'domcontentloaded' });
  console.log('Aguardando carregamento de alunos na tabela...');
  await page.waitForFunction(() => typeof ALL_STUDENTS_LIST !== 'undefined' && ALL_STUDENTS_LIST.length > 0, { timeout: 20000 });
  console.log('Alunos carregados com sucesso! Testando abertura dos modais...');

  const mentees = [
    { email: 'andrebarrote1992@gmail.com', name: 'André Barrote', expectedMeet: 'https://meet.google.com/pcn-wgxm-tma' },
    { email: 'thomasskt21@gmail.com', name: 'Thomas', expectedMeet: 'https://meet.google.com/uyj-dfzg-pmh' },
    { email: 'mateus.s.gomes.novo@gmail.com', name: 'Mateus Gomes', expectedMeet: 'https://meet.google.com/kmu-hwdu-xrm' },
    { email: 'estevaopin@gmail.com', name: 'Estêvão Pinheiro', expectedMeet: 'https://meet.google.com/bbr-kzuy-edc' }
  ];

  for (const m of mentees) {
    const editResult = await page.evaluate(async (email) => {
      try {
        await openEditStudentModal(email);
        const modal = document.getElementById('edit-student-modal');
        const isVisible = modal && !modal.classList.contains('hidden');
        const meetInput = document.getElementById('edit-student-meet-url');
        const meetVal = meetInput ? meetInput.value : null;
        return { success: true, isVisible, meetVal };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }, m.email);

    console.log(`\nAluno: ${m.name} (${m.email})`);
    if (!editResult.success) {
      console.log(`  ❌ FALHA ao abrir modal: ${editResult.error}`);
    } else {
      console.log(`  Modal Aberto: ${editResult.isVisible ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`  Meet URL no Input: ${editResult.meetVal}`);
      console.log(`  Link Correto: ${editResult.meetVal === m.expectedMeet ? '✅ SIM' : '❌ NÃO'}`);
    }
  }

  console.log('\n--- Testando clique físico no botão Editar da tabela ---');
  const clicked = await page.evaluate(() => {
    const editBtn = document.querySelector('button[onclick*="openEditStudentModal"]');
    if (!editBtn) return { found: false };
    editBtn.click();
    const modal = document.getElementById('edit-student-modal');
    return { found: true, modalOpen: !modal.classList.contains('hidden'), studentName: document.getElementById('edit-student-name').value };
  });
  console.log('Botão físico na tabela:', clicked);
  console.log('TESTE 2: Sala de Aula Vitrine (curso.html) - Botão Meet');
  console.log('====================================================');

  const courseTests = [
    { url: `http://localhost:${PORT}/curso.html?curso=mentoria-andre`, name: 'André Barrote', expected: 'https://meet.google.com/pcn-wgxm-tma' },
    { url: `http://localhost:${PORT}/curso.html?curso=mentoria-thomas`, name: 'Thomas', expected: 'https://meet.google.com/uyj-dfzg-pmh' },
    { url: `http://localhost:${PORT}/curso.html?curso=mentoria-matheus`, name: 'Mateus (matheus)', expected: 'https://meet.google.com/kmu-hwdu-xrm' },
    { url: `http://localhost:${PORT}/curso.html?curso=mentoria-mateus`, name: 'Mateus (mateus)', expected: 'https://meet.google.com/kmu-hwdu-xrm' },
    { url: `http://localhost:${PORT}/curso.html?curso=mentoria-estevao`, name: 'Estêvão Pinheiro', expected: 'https://meet.google.com/bbr-kzuy-edc' }
  ];

  for (const ct of courseTests) {
    await page.goto(ct.url, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));

    const check = await page.evaluate(() => {
      const card = document.getElementById('vipMeetSidebarCard');
      const btn = document.getElementById('btnJoinVipMeet');
      const drawer = document.getElementById('drawerMeetLink');
      return {
        cardVisible: card && !card.classList.contains('hidden'),
        btnHref: btn ? btn.href : null,
        drawerHref: drawer ? drawer.href : null
      };
    });

    console.log(`\nCurso: ${ct.name} (${ct.url})`);
    console.log(`  Card VIP Visível: ${check.cardVisible ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`  Botão Meet (Desktop): ${check.btnHref}`);
    console.log(`  Link Meet (Mobile Drawer): ${check.drawerHref}`);
    const ok = check.btnHref === ct.expected && check.drawerHref === ct.expected && check.cardVisible;
    console.log(`  Status Final: ${ok ? '✅ APROVADO' : '❌ FALHOU'}`);
  }

  console.log('\n====================================================');
  console.log('Erros Javascript capturados durante a sessão:');
  if (pageErrors.length === 0) {
    console.log('  ✅ NENHUM erro JavaScript disparado!');
  } else {
    pageErrors.forEach(e => console.log('  ⚠️ ' + e));
  }
  console.log('====================================================');

  await browser.close();
  server.close();
  process.exit(0);
}

runRealTest().catch(e => { console.error('FATAL TEST ERROR:', e); process.exit(1); });
