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

async function runTest() {
  const PORT = 8097;
  const server = await createStaticServer(PORT);
  console.log(`Server running on http://localhost:${PORT}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Set localStorage session
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('aef_user_email', 'selexenglish@gmail.com');
    localStorage.setItem('aef_user_name', 'Prof. Leonardo Leite');
    localStorage.setItem('aef_user_uid', 'leo_superadmin');
    localStorage.setItem('aef_user_role', 'admin');
    localStorage.setItem('aef_user_tier', 'admin_master');
    localStorage.setItem('aef_logged_out', 'false');
  });

  await page.goto(`http://localhost:${PORT}/admin-alunos.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof ALL_STUDENTS_LIST !== 'undefined' && ALL_STUDENTS_LIST.length > 0, { timeout: 15000 });

  await page.evaluate(() => { window.alert = () => {}; });

  console.log('--- TEST 1: Modal Inclusão de Aluno ---');
  const addModalTest = await page.evaluate(() => {
    openAddStudentModal();
    const modal = document.getElementById('add-student-modal');
    const wa = document.getElementById('new-student-whatsapp');
    return {
      modalVisible: modal && !modal.classList.contains('hidden'),
      hasWaInput: !!wa,
      placeholder: wa ? wa.placeholder : ''
    };
  });
  console.log('Add Student Modal:', addModalTest);
  if (!addModalTest.hasWaInput) throw new Error('Campo WhatsApp não encontrado no modal de inclusão!');

  console.log('\n--- TEST 2: Cadastrar Aluno com WhatsApp via handleSaveStudent ---');
  await page.evaluate(async () => {
    document.getElementById('new-student-name').value = 'Aluno Teste WhatsApp';
    document.getElementById('new-student-email').value = 'teste.whatsapp@agoraeufalo.com.br';
    document.getElementById('new-student-whatsapp').value = '(11) 99616-0910';
    await handleSaveStudent({ preventDefault: () => {} });
  });

  const studentSaved = await page.evaluate(() => {
    const s = ALL_STUDENTS_LIST.find(item => item.email === 'teste.whatsapp@agoraeufalo.com.br');
    return s ? { name: s.name, email: s.email, whatsapp: s.whatsapp, phone: s.phone } : null;
  });
  console.log('Aluno Salvo em memória:', studentSaved);
  if (!studentSaved || studentSaved.whatsapp !== '(11) 99616-0910') {
    throw new Error('Falha ao salvar WhatsApp do novo aluno!');
  }

  console.log('\n--- TEST 3: Modal Edição de Aluno ---');
  const editModalTest = await page.evaluate(async () => {
    await openEditStudentModal('teste.whatsapp@agoraeufalo.com.br');
    const modal = document.getElementById('edit-student-modal');
    const waInput = document.getElementById('edit-student-whatsapp');
    const waBtn = document.getElementById('edit-student-whatsapp-btn');
    return {
      modalVisible: modal && !modal.classList.contains('hidden'),
      waValue: waInput ? waInput.value : '',
      waBtnHref: waBtn ? waBtn.href : '',
      waBtnVisible: waBtn && !waBtn.classList.contains('hidden')
    };
  });
  console.log('Edit Student Modal:', editModalTest);
  if (editModalTest.waValue !== '(11) 99616-0910') {
    throw new Error('Valor do WhatsApp não foi carregado corretamente no modal de edição!');
  }
  if (!editModalTest.waBtnHref.includes('5511996160910')) {
    throw new Error('Link do botão Abrir WhatsApp está incorreto: ' + editModalTest.waBtnHref);
  }

  console.log('\n--- TEST 4: Atualização Dinâmica do Botão ao Digitar no Input ---');
  const dynamicTest = await page.evaluate(() => {
    const waInput = document.getElementById('edit-student-whatsapp');
    waInput.value = '(21) 98765-4321';
    waInput.dispatchEvent(new Event('input', { bubbles: true }));
    const waBtn = document.getElementById('edit-student-whatsapp-btn');
    return {
      newHref: waBtn ? waBtn.href : '',
      btnVisible: waBtn && !waBtn.classList.contains('hidden')
    };
  });
  console.log('Dynamic Input Update:', dynamicTest);
  if (!dynamicTest.newHref.includes('5521987654321')) {
    throw new Error('Atualização dinâmica do link do WhatsApp falhou!');
  }

  console.log('\n--- TEST 5: Salvar Edição via handleUpdateStudent ---');
  await page.evaluate(async () => {
    await handleUpdateStudent({ preventDefault: () => {} });
  });
  const updatedStudent = await page.evaluate(() => {
    const s = ALL_STUDENTS_LIST.find(item => item.email === 'teste.whatsapp@agoraeufalo.com.br');
    return s ? { name: s.name, email: s.email, whatsapp: s.whatsapp } : null;
  });
  console.log('Aluno Atualizado:', updatedStudent);
  if (updatedStudent.whatsapp !== '(21) 98765-4321') {
    throw new Error('Falha ao atualizar o WhatsApp do aluno!');
  }

  console.log('\n--- TEST 6: Renderização na Tabela com Badge de WhatsApp ---');
  const tableCheck = await page.evaluate(() => {
    SEARCH_QUERY = 'teste.whatsapp';
    CURRENT_PAGE = 1;
    renderStudentsTable();
    const tbody = document.getElementById('students-table-body');
    const hasWaLink = tbody ? tbody.innerHTML.includes('https://wa.me/5521987654321') : false;
    const hasWaText = tbody ? tbody.innerHTML.includes('(21) 98765-4321') : false;
    return { hasWaLink, hasWaText };
  });
  console.log('Table WhatsApp Link check:', tableCheck);
  if (!tableCheck.hasWaLink || !tableCheck.hasWaText) {
    throw new Error('Link/Badge do WhatsApp não renderizado na tabela de alunos!');
  }

  console.log('\n--- TEST 7: Busca por Número de WhatsApp ---');
  const searchCheck = await page.evaluate(() => {
    SEARCH_QUERY = '98765';
    const filtered = getFilteredStudents();
    SEARCH_QUERY = '';
    return {
      foundCount: filtered.length,
      firstEmail: filtered[0] ? filtered[0].email : null
    };
  });
  console.log('Search by digits check:', searchCheck);
  if (searchCheck.firstEmail !== 'teste.whatsapp@agoraeufalo.com.br') {
    throw new Error('Busca por dígitos de WhatsApp falhou!');
  }

  console.log('\n🎉 TODOS OS 7 TESTES DE INTEGRAÇÃO PASSARAM COM 100% DE SUCESSO! 🎉');

  await browser.close();
  server.close();
  process.exit(0);
}

runTest().catch(err => {
  console.error('❌ ERRO NO TESTE:', err);
  process.exit(1);
});
