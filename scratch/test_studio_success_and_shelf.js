import puppeteer from 'puppeteer';
import path from 'path';

async function runTest() {
  console.log("🚀 [Test E2E] Testando Tela de Sucesso no Modal e Injeção na Estante...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.error("PAGE ERROR:", err));

  // Interceptar chamadas
  await page.setRequestInterception(true);
  let processStudioCalled = false;
  let processStudioBody = null;

  page.on('request', req => {
    const url = req.url();
    if (url.includes('/api/lab/process-studio')) {
      processStudioCalled = true;
      processStudioBody = JSON.parse(req.postData() || '{}');
      console.log("⚡ [Intercepted] POST /api/lab/process-studio chamado!");
      req.respond({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, status: "processing" })
      });
      return;
    }

    if (url.includes('/api/lab/generate-magic-story')) {
      console.log("⚡ [Intercepted] POST /api/lab/generate-magic-story chamado!");
      req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          story: {
            documentTitle: "Reunião de Negócios com Clientes Americanos",
            scenario: "Reunião de Negócios",
            description: "Treino prático focado em negociações e vocabulário executivo.",
            topic: "profissional",
            level: "Intermediate",
            format: "Dialogue",
            activities: {
              lr: { text: "Good morning, everyone." },
              voc: { chunks: [{ chunk: "get started", translation: "começar" }] }
            }
          }
        })
      });
      return;
    }

    if (url.includes('/api/lab/generate-cover')) {
      console.log("⚡ [Intercepted] POST /api/lab/generate-cover chamado!");
      req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          imageUrl: "/assets/images/metodo-01-listen-read-DQy70yBF.jpg"
        })
      });
      return;
    }

    req.continue();
  });

  await page.goto('http://localhost:5173/portal-lab.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Abrir Modal Minhas Coisas
  console.log("📝 1. Abrindo modal Minhas Coisas...");
  await page.evaluate(() => window.openMinhasCoisasPreviewModal());
  await page.waitForSelector('#promptScenario', { visible: true });

  // 2. Preencher formulário
  await page.type('#promptScenario', 'Reunião de Negócios com Clientes Americanos');

  // 3. Submeter formulário
  console.log("🚀 2. Submetendo formulário...");
  await page.click('#btnGenerateCustomStory');

  // 4. Aguardar exibição da Tela de Sucesso no interior do Modal (sem fechar o modal)
  console.log("⏳ 3. Aguardando Tela de Sucesso no Modal...");
  await page.waitForSelector('#minhas-coisas-success-state:not(.hidden)', { timeout: 10000 });

  // Verificar textos da tela de sucesso
  const successTitle = await page.$eval('#minhas-coisas-success-state h3', el => el.innerText.trim());
  const successDesc = await page.$eval('#minhas-coisas-success-state p', el => el.innerText.trim());
  const btnCloseText = await page.$eval('#minhas-coisas-success-state button', el => el.innerText.trim());

  console.log("✅ Título da Tela de Sucesso:", successTitle);
  console.log("✅ Descrição da Tela de Sucesso:", successDesc);
  console.log("✅ Botão de Ação:", btnCloseText);

  if (!successTitle.includes("Seu treino está sendo preparado")) {
    throw new Error("Título da Tela de Sucesso incorreto: " + successTitle);
  }
  if (!successDesc.includes("estúdio em nuvem está gravando")) {
    throw new Error("Texto da Tela de Sucesso incorreto: " + successDesc);
  }
  if (!btnCloseText.toLowerCase().includes("ver meus treinos")) {
    throw new Error("Texto do Botão incorreto: " + btnCloseText);
  }

  // Verificar se o POST /api/lab/process-studio foi despachado
  if (!processStudioCalled) {
    throw new Error("POST /api/lab/process-studio NÃO foi despachado!");
  }
  console.log("✅ POST /api/lab/process-studio confirmado!");

  // Screenshot do Modal com a Tela de Sucesso
  const artifactDir = '/Users/macbookpro/.gemini/antigravity/brain/c9f37595-c0f2-48b7-8e60-7e5acecef1de';
  await page.screenshot({ path: path.join(artifactDir, 'test_modal_success_state.png') });
  console.log("📸 Screenshot do Modal salvo!");

  // 5. Clicar em "Ver Meus Treinos" para fechar o modal e inspecionar a estante
  console.log("👆 4. Clicando em 'Ver Meus Treinos'...");
  await page.click('#minhas-coisas-success-state button');
  await new Promise(r => setTimeout(r, 600));

  // 6. Verificar se o novo treino brotou na estante com a tag "Processando Áudio"
  console.log("🔍 5. Verificando injeção na Estante...");
  await page.waitForSelector('#magic-catalog-grid', { visible: true });

  const catalogHtml = await page.$eval('#magic-catalog-grid', el => el.innerHTML);

  if (!catalogHtml.includes("Processando Áudio")) {
    throw new Error("Tag 'Processando Áudio' não encontrada no catálogo!");
  }
  console.log("✅ Card com tag 'Processando Áudio' encontrado na Estante!");

  // Screenshot da Estante com o treino recém-criado
  await page.evaluate(() => {
    const el = document.getElementById('magic-creations-shelf');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(artifactDir, 'test_shelf_processing_badge.png') });
  console.log("📸 Screenshot da Estante salvo!");

  await browser.close();
  console.log("🎉 TESTE E2E CONCLUÍDO COM 100% DE SUCESSO!");
}

runTest().catch(err => {
  console.error("❌ ERRO NO TESTE:", err);
  process.exit(1);
});
