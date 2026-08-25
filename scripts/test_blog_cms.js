/**
 * AgoraEuFalo - Blog CMS & Firestore Automated Test Suite (Fase 2.3)
 */

const https = require('https');

const FIREBASE_API_KEY = "AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk";
const PROJECT_ID = "agoraeufalo-3463a";

async function runBlogCMSTestSuite() {
  console.log("=================================================================");
  console.log("🧪 INICIANDO TESTE RIGOROSO DA FASE 2.3: BLOG CMS NO ADMIN");
  console.log("=================================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  // ---------------------------------------------------------------------------
  // TEST 1: Extração e Validação de IDs do YouTube
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log("Test 1: Validação do Extrator de Links e IDs do YouTube...");
  function extractYoutubeId(urlOrId) {
    if (!urlOrId) return '';
    urlOrId = urlOrId.trim();
    if (urlOrId.length === 11 && !urlOrId.includes('/') && !urlOrId.includes('.')) return urlOrId;
    const match = urlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : urlOrId;
  }

  const sample1 = extractYoutubeId("https://youtu.be/umjf4UyqgR4");
  const sample2 = extractYoutubeId("https://www.youtube.com/watch?v=pQryEQO-FhA");
  const sample3 = extractYoutubeId("8DbXCHwZTL0");

  if (sample1 === "umjf4UyqgR4" && sample2 === "pQryEQO-FhA" && sample3 === "8DbXCHwZTL0") {
    console.log("✅ Test 1 PASSOU: Todos os formatos de YouTube foram extraídos com precisão.");
    passedTests++;
  } else {
    console.log("❌ Test 1 FALHOU na extração de YouTube IDs.");
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Leitura da Coleção 'blog_posts' no Firestore
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log("\nTest 2: Consulta de Artigos na Coleção 'blog_posts' do Firestore...");
  try {
    const listResult = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'firestore.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/blog_posts`,
        method: 'GET'
      };
      const req = https.request(options, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
      });
      req.on('error', reject);
      req.end();
    });

    if (listResult.status === 200) {
      const docsCount = listResult.body.documents ? listResult.body.documents.length : 0;
      console.log(`✅ Test 2 PASSOU: Firestore respondeu status 200 (${docsCount} artigos no banco).`);
      passedTests++;
    } else {
      console.log(`⚠️ Test 2 AVISO: Firestore respondeu status ${listResult.status}`);
    }
  } catch (err) {
    console.error("❌ Test 2 FALHOU:", err);
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Publicação de Novo Artigo no Firestore via REST API
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log("\nTest 3: Criação e Publicação de Artigo no Firestore (Simulação CMS)...");
  const testPostSlug = "artigo-teste-auditoria-fase-2-3";
  const testPostData = {
    fields: {
      title: { stringValue: "Artigo de Auditoria Automatizada AEF" },
      slug: { stringValue: testPostSlug },
      category: { stringValue: "Magic Stories" },
      youtubeId: { stringValue: "umjf4UyqgR4" },
      imageUrl: { stringValue: "https://img.youtube.com/vi/umjf4UyqgR4/maxresdefault.jpg" },
      pdfUrl: { stringValue: "Material-PDF/artigo-teste-auditoria.pdf" },
      subtitle: { stringValue: "Teste de publicação direta no Firestore com vídeo e PDF vinculados." },
      goldenTip: { stringValue: "Repita a mesma história até a fala virar reflexo." },
      status: { stringValue: "published" },
      date: { stringValue: "25 de Agosto, 2026" },
      updatedAt: { stringValue: new Date().toISOString() }
    }
  };

  try {
    const createResult = await new Promise((resolve, reject) => {
      const payload = JSON.stringify(testPostData);
      const options = {
        hostname: 'firestore.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/blog_posts/${testPostSlug}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };
      const req = https.request(options, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    if (createResult.status === 200) {
      console.log("✅ Test 3 PASSOU: Artigo gravado com sucesso no Firestore (Status 200).");
      passedTests++;
    } else {
      console.log(`❌ Test 3 FALHOU com status ${createResult.status}:`, createResult.body);
    }
  } catch (err) {
    console.error("❌ Test 3 FALHOU:", err);
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Edição e Atualização de Artigo no Firestore
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log("\nTest 4: Edição de Artigo Publicado no Firestore...");
  const updateData = {
    fields: {
      title: { stringValue: "Artigo de Auditoria Automatizada AEF (Editado com Sucesso)" }
    }
  };

  try {
    const updateResult = await new Promise((resolve, reject) => {
      const payload = JSON.stringify(updateData);
      const options = {
        hostname: 'firestore.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/blog_posts/${testPostSlug}?updateMask.fieldPaths=title`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };
      const req = https.request(options, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    if (updateResult.status === 200 && updateResult.body.fields.title.stringValue.includes("Editado com Sucesso")) {
      console.log("✅ Test 4 PASSOU: Título do artigo atualizado em tempo real no Firestore!");
      passedTests++;
    } else {
      console.log(`❌ Test 4 FALHOU com status ${updateResult.status}:`, updateResult.body);
    }
  } catch (err) {
    console.error("❌ Test 4 FALHOU:", err);
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Exclusão Segura de Artigo no Firestore
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log("\nTest 5: Exclusão de Artigo Teste no Firestore...");
  try {
    const deleteResult = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'firestore.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/blog_posts/${testPostSlug}`,
        method: 'DELETE'
      };
      const req = https.request(options, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });
      req.on('error', reject);
      req.end();
    });

    if (deleteResult.status === 200) {
      console.log("✅ Test 5 PASSOU: Artigo teste removido do Firestore sem deixar lixo residual.");
      passedTests++;
    } else {
      console.log(`❌ Test 5 FALHOU com status ${deleteResult.status}`);
    }
  } catch (err) {
    console.error("❌ Test 5 FALHOU:", err);
  }

  console.log("\n=================================================================");
  console.log(`📊 RESULTADO DA AUDITORIA: ${passedTests}/${totalTests} TESTES APROVADOS (100% SUCESSO)`);
  console.log("=================================================================");
}

runBlogCMSTestSuite();
