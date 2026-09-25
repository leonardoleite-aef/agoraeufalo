import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = '/Users/macbookpro/.gemini/antigravity/brain/c9f37595-c0f2-48b7-8e60-7e5acecef1de';

(async () => {
  console.log('🚀 Iniciando verificação de simplificação de sucesso e injeção de PDF...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // 1. Verificar portal-lab.html (Fase 1: Sucesso Simplificado)
  console.log('📋 [1/2] Testando portal-lab.html...');
  await page.goto('http://localhost:5173/portal-lab.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  // Abrir modal e forçar estado de sucesso com moduleId simulado
  await page.evaluate(() => {
    window.openMinhasCoisasPreviewModal();
    const formEl = document.getElementById('minhas-coisas-form');
    const loadingEl = document.getElementById('minhas-coisas-loading-state');
    const successEl = document.getElementById('minhas-coisas-success-state');
    if (formEl) formEl.classList.add('hidden');
    if (loadingEl) loadingEl.classList.add('hidden');
    if (successEl) successEl.classList.remove('hidden');

    const btnPlayer = document.getElementById('btnOpenPlayerLab');
    if (btnPlayer) {
      btnPlayer.href = '/player-lab?module=mod_test_abc123';
    }
  });
  await new Promise(r => setTimeout(r, 500));

  const portalSuccessCheck = await page.evaluate(() => {
    const successEl = document.getElementById('minhas-coisas-success-state');
    const playerBtn = document.getElementById('btnOpenPlayerLab');
    const pdfBtn = document.getElementById('btnGeneratePdfBooklet');
    const allButtonsAndLinks = Array.from(successEl?.querySelectorAll('a, button') || []).map(el => ({
      tag: el.tagName,
      id: el.id,
      text: el.innerText.trim(),
      href: el.getAttribute('href')
    }));

    return {
      hasSuccessEl: !!successEl,
      playerBtnExists: !!playerBtn,
      playerBtnHref: playerBtn?.getAttribute('href'),
      playerBtnText: playerBtn?.innerText?.trim(),
      pdfBtnExists: !!pdfBtn,
      allButtonsAndLinks
    };
  });

  console.log('🔍 Resultados do portal-lab.html:', portalSuccessCheck);
  console.log(`✅ Botão Acessar Aula existe: ${portalSuccessCheck.playerBtnExists ? 'SIM' : 'NÃO'}`);
  console.log(`✅ Botão Gerar PDF removido: ${!portalSuccessCheck.pdfBtnExists ? 'SIM' : 'NÃO'}`);

  const portalShot = path.join(ARTIFACTS_DIR, 'portal_lab_simplified_success.png');
  await page.screenshot({ path: portalShot });
  console.log(`📸 Screenshot salvo: ${portalShot}`);

  // 2. Verificar player-lab.html (Fase 2: Botão PDF no LR)
  console.log('📋 [2/2] Testando player-lab.html com ?module=mod_test_abc123...');
  const playerPage = await browser.newPage();
  await playerPage.setViewport({ width: 1280, height: 800 });
  await playerPage.goto('http://localhost:5173/player-lab.html?module=mod_test_abc123', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));

  const playerLrCheck = await playerPage.evaluate(() => {
    const lrContainer = document.getElementById('lr-sentences-container');
    const audioBtn = lrContainer?.querySelector('button[onclick*="AEFPlay"]');
    const pdfBtn = lrContainer?.querySelector('button[onclick*="v2-pdf-factory"]');

    return {
      hasLrContainer: !!lrContainer,
      audioBtnExists: !!audioBtn,
      audioBtnText: audioBtn?.innerText?.trim(),
      pdfBtnExists: !!pdfBtn,
      pdfBtnText: pdfBtn?.innerText?.trim(),
      pdfBtnOnclick: pdfBtn?.getAttribute('onclick')
    };
  });

  console.log('🔍 Resultados do player-lab.html:', playerLrCheck);
  console.log(`✅ Botão de Áudio no LR existe: ${playerLrCheck.audioBtnExists ? 'SIM' : 'NÃO'}`);
  console.log(`✅ Botão PDF no LR existe: ${playerLrCheck.pdfBtnExists ? 'SIM' : 'NÃO'}`);
  console.log(`✅ Onclick do PDF contém moduleId: ${playerLrCheck.pdfBtnOnclick?.includes('mod_test_abc123') ? 'SIM' : 'NÃO'}`);

  const playerShot = path.join(ARTIFACTS_DIR, 'player_lab_lr_pdf_button.png');
  await playerPage.screenshot({ path: playerShot });
  console.log(`📸 Screenshot salvo: ${playerShot}`);

  await browser.close();
  console.log('🏁 Verificação completa executada com êxito!');
})();
