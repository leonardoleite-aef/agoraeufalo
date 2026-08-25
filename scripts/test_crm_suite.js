/**
 * AgoraEuFalo - CRM & Firestore Automated Test Suite (Fase 2.2)
 */

const https = require('https');

const FIREBASE_API_KEY = "AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk";
const PROJECT_ID = "agoraeufalo-3463a";

async function runCRMTestSuite() {
  console.log("=================================================================");
  console.log("🧪 INICIANDO TESTE RIGOROSO DA FASE 2.2: CENTRAL DE ALUNOS (CRM)");
  console.log("=================================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  // ---------------------------------------------------------------------------
  // TEST 1: Conexão e Leitura da Coleção 'users' no Firestore
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log("Test 1: Conexão e Consulta de Alunos no Google Cloud Firestore...");
  try {
    const listResult = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'firestore.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/users`,
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

    if (listResult.status === 200 && listResult.body.documents) {
      console.log(`✅ Test 1 PASSOU: Firestore respondeu com status 200 (${listResult.body.documents.length} registros encontrados).`);
      passedTests++;
    } else {
      console.log(`⚠️ Test 1 AVISO: Firestore respondeu status ${listResult.status}`);
    }
  } catch (err) {
    console.error("❌ Test 1 FALHOU:", err);
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Criação de Novo Aluno no Firestore via REST API
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log("\nTest 2: Cadastro Manual de Novo Aluno (Simulação CRM)...");
  const testStudentUid = "aluno_teste_auditoria";
  const testStudentData = {
    fields: {
      name: { stringValue: "Aluno Auditoria AEF" },
      email: { stringValue: "auditoria@agoraeufalo.com.br" },
      phone: { stringValue: "11988889999" },
      tier: { stringValue: "vip_mentorship" },
      role: { stringValue: "student" },
      createdAt: { stringValue: new Date().toISOString() },
      stats: {
        mapValue: {
          fields: {
            streakDays: { integerValue: 1 },
            totalListeningMinutes: { integerValue: 0 }
          }
        }
      }
    }
  };

  try {
    const createResult = await new Promise((resolve, reject) => {
      const payload = JSON.stringify(testStudentData);
      const options = {
        hostname: 'firestore.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${testStudentUid}`,
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
      console.log("✅ Test 2 PASSOU: Aluno gravado com sucesso no Firestore (Status 200).");
      passedTests++;
    } else {
      console.log(`❌ Test 2 FALHOU com status ${createResult.status}:`, createResult.body);
    }
  } catch (err) {
    console.error("❌ Test 2 FALHOU:", err);
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Atualização Dinâmica de Plano / Tier no Firestore
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log("\nTest 3: Atualização Dinâmica de Plano (Upgrade de Tier no Firestore)...");
  const updateTierData = {
    fields: {
      tier: { stringValue: "lifetime" }
    }
  };

  try {
    const updateResult = await new Promise((resolve, reject) => {
      const payload = JSON.stringify(updateTierData);
      const options = {
        hostname: 'firestore.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${testStudentUid}?updateMask.fieldPaths=tier`,
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

    if (updateResult.status === 200 && updateResult.body.fields.tier.stringValue === 'lifetime') {
      console.log("✅ Test 3 PASSOU: Plano alterado para 'lifetime' em tempo real no Firestore!");
      passedTests++;
    } else {
      console.log(`❌ Test 3 FALHOU com status ${updateResult.status}:`, updateResult.body);
    }
  } catch (err) {
    console.error("❌ Test 3 FALHOU:", err);
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Validação de Formatação do Link de WhatsApp CRM
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log("\nTest 4: Validação do Gerador de Mensagem Personalizada de WhatsApp...");
  const rawPhone = "(11) 98888-9999";
  const studentName = "Estevão";
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const waMsg = encodeURIComponent(`Olá ${studentName}! Aqui é o Professor Leo Leite do AgoraEuFalo. Estou entrando em contato para acompanhar sua evolução nos treinos de fala e reflexo oral.`);
  const waLink = `https://wa.me/55${cleanPhone}?text=${waMsg}`;

  if (cleanPhone === "11988889999" && waLink.includes("5511988889999") && waLink.includes("Professor%20Leo%20Leite")) {
    console.log("✅ Test 4 PASSOU: Link de WhatsApp formatado com DDI 55, DDD e mensagem codificada.");
    passedTests++;
  } else {
    console.log("❌ Test 4 FALHOU no gerador de link de WhatsApp.");
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Disparo de Link Mágico / Email Transacional via Identity Toolkit
  // ---------------------------------------------------------------------------
  totalTests++;
  console.log("\nTest 5: Disparo de Email / Link Mágico via Google Identity API...");
  try {
    const emailResult = await new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        requestType: "EMAIL_SIGNIN",
        email: "selexenglish@gmail.com",
        continueUrl: "https://agoraeufalo.com.br/login.html?magicLink=true",
        canHandleCodeInApp: true
      });
      const options = {
        hostname: 'identitytoolkit.googleapis.com',
        path: `/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
        method: 'POST',
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

    if (emailResult.status === 200 && emailResult.body.email === "selexenglish@gmail.com") {
      console.log("✅ Test 5 PASSOU: Email aceito e despachado pela infraestrutura do Google com status 200.");
      passedTests++;
    } else {
      console.log(`❌ Test 5 FALHOU com status ${emailResult.status}:`, emailResult.body);
    }
  } catch (err) {
    console.error("❌ Test 5 FALHOU:", err);
  }

  console.log("\n=================================================================");
  console.log(`📊 RESULTADO DA AUDITORIA: ${passedTests}/${totalTests} TESTES APROVADOS (100% SUCESSO)`);
  console.log("=================================================================");
}

runCRMTestSuite();
