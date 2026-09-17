const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

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

function getFirestoreDoc(path) {
  return new Promise((resolve) => {
    https.get(`https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
  });
}

async function runTest() {
  const PORT = 8098;
  const server = await createStaticServer(PORT);
  console.log(`Server running on http://localhost:${PORT}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  console.log('\n--- TEST 1: Verificar se método _mergePreRegistration existe em window.aefPortalAuth ---');
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
  const hasMethod = await page.evaluate(async () => {
    if (!window.aefPortalAuth) return false;
    await window.aefPortalAuth.ready();
    return typeof window.aefPortalAuth._mergePreRegistration === 'function';
  });
  console.log('window.aefPortalAuth._mergePreRegistration is function:', hasMethod);
  if (!hasMethod) {
    throw new Error('Falha: _mergePreRegistration não está definido no aefPortalAuth!');
  }

  console.log('\n--- TEST 2: Simular merge de Pré-Cadastro com Perfil Auth ---');
  const mergeResult = await page.evaluate(async () => {
    const auth = window.aefPortalAuth;
    const mockUser = {
      uid: 'mock_auth_uid_123',
      email: 'novoalunoteste@agoraeufalo.com.br'
    };
    const mockProfile = {
      uid: 'mock_auth_uid_123',
      name: 'Novo Aluno Teste',
      email: 'novoalunoteste@agoraeufalo.com.br',
      tier: 'free',
      role: 'student',
      enrolledProducts: []
    };

    const originalDb = auth.db;
    auth.db = {
      collection: (col) => ({
        doc: (id) => ({
          get: async () => {
            if (id === 'novoalunoteste_agoraeufalo_com_br') {
              return {
                exists: true,
                ref: { id, delete: async () => {} },
                data: () => ({
                  tier: 'club_annual',
                  categories: ['member_pago'],
                  enrolledProducts: ['magic_stories_club', 'ms-legacy'],
                  whatsapp: '+55 (11) 98888-7777',
                  phone: '+55 (11) 98888-7777',
                  subscription: { billingPeriod: 'annual', status: 'active' }
                })
              };
            }
            return { exists: false };
          },
          set: async () => {}
        }),
        where: () => ({
          get: async () => ({ docs: [] })
        })
      })
    };

    const merged = await auth._mergePreRegistration(mockUser, mockProfile);
    auth.db = originalDb;
    return merged;
  });

  console.log('Merge Result:', mergeResult);
  if (mergeResult.tier !== 'club_annual') {
    throw new Error('Falha: tier não foi promovido para club_annual!');
  }
  if (!mergeResult.enrolledProducts.includes('magic_stories_club') || !mergeResult.enrolledProducts.includes('ms-legacy')) {
    throw new Error('Falha: cursos não foram mesclados no perfil!');
  }
  if (mergeResult.whatsapp !== '+55 (11) 98888-7777') {
    throw new Error('Falha: WhatsApp não foi mesclado!');
  }

  console.log('\n--- TEST 3: Validação Forense de Segurança do Aluno Real Carlos Alexandre ---');
  const carlosCheck = await getFirestoreDoc('users/V0hxXjNI45WIPtXEsX2xBQIMe382');
  console.log('Carlos Doc Status:', carlosCheck.status);
  const fields = carlosCheck.data.fields;
  console.log('Carlos Email:', fields.email?.stringValue);
  console.log('Carlos Tier:', fields.tier?.stringValue);
  console.log('Carlos WhatsApp:', fields.whatsapp?.stringValue);
  console.log('Carlos Courses:', fields.enrolledProducts?.arrayValue?.values?.map(v => v.stringValue));

  if (fields.email?.stringValue !== 'carlosbarretos221@gmail.com') {
    throw new Error('Falha: Email do Carlos foi alterado!');
  }
  if (fields.tier?.stringValue !== 'club_annual') {
    throw new Error('Falha: Tier do Carlos não é club_annual!');
  }
  if (!fields.enrolledProducts?.arrayValue?.values?.some(v => v.stringValue === 'ms-legacy')) {
    throw new Error('Falha: Cursos do Carlos foram violados!');
  }

  console.log('\n🎉 TODOS OS TESTES DE SINCRONIZAÇÃO E SEGURANÇA PASSARAM COM 100% DE SUCESSO! 🎉');
  await browser.close();
  server.close();
}

runTest().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
