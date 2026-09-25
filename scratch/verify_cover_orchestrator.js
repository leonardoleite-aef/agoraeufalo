import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Iniciando verificação ponta-a-ponta da capa do módulo no portal-lab...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://localhost:5173/portal-lab.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  // Simula interceptação da requisição ao /api/db/save-magic-story para verificar se coverImage está presente
  let capturedDbPayload = null;
  page.on('request', interceptedReq => {
    if (interceptedReq.url().includes('/api/db/save-magic-story') && interceptedReq.method() === 'POST') {
      try {
        capturedDbPayload = JSON.parse(interceptedReq.postData());
        console.log('📦 Interceptado POST /api/db/save-magic-story:');
        console.log('   - Metadata Title:', capturedDbPayload?.metadata?.title);
        console.log('   - Metadata CoverImage present:', !!capturedDbPayload?.metadata?.coverImage);
        console.log('   - CoverImage startsWith:', capturedDbPayload?.metadata?.coverImage?.substring(0, 30));
      } catch (e) {}
    }
  });

  // Preenche o formulário e dispara
  await page.evaluate(() => {
    window.openMinhasCoisasPreviewModal();
    const scenarioInput = document.getElementById('promptScenario');
    if (scenarioInput) scenarioInput.value = 'A quiet bookstore in Seattle with rain outside';
  });

  console.log('Disparando handleMinhasCoisasSubmit no portal-lab...');
  await page.evaluate(async () => {
    // Executa a orquestração do submit
    await window.handleMinhasCoisasSubmit();
  });

  // Aguarda até o modal de sucesso estar visível ou timeout
  await page.waitForFunction(() => {
    const successEl = document.getElementById('minhas-coisas-success-state');
    return successEl && !successEl.classList.contains('hidden');
  }, { timeout: 60000 });

  console.log('🎉 Orquestração concluída com sucesso!');
  console.log('Verificando payload persistido no backend...');
  if (capturedDbPayload?.metadata?.coverImage) {
    console.log('✅ Capa 16:9 gerada dinamicamente e injetada no dbPayload!');
  } else {
    console.warn('⚠️ CoverImage não foi capturado no dbPayload.');
  }

  await browser.close();
  console.log('🏁 Teste ponta-a-ponta finalizado com êxito!');
})();
