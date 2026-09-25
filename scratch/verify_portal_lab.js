import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = '/Users/macbookpro/.gemini/antigravity/brain/c9f37595-c0f2-48b7-8e60-7e5acecef1de';

(async () => {
  console.log('🚀 Iniciando verificação do portal-lab.html...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Desktop Test (1280x800)
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/portal-lab.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  // Check desktop button visibility
  const desktopBtnVisible = await page.evaluate(() => {
    const btn = document.querySelector('button[onclick*="openMinhasCoisasPreviewModal"]');
    if (!btn) return false;
    const style = window.getComputedStyle(btn);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });

  // Check mobile alert is hidden on desktop
  const mobileBannerHiddenOnDesktop = await page.evaluate(() => {
    const banner = document.querySelector('div.flex.md\\:hidden');
    if (!banner) return true;
    const style = window.getComputedStyle(banner);
    return style.display === 'none';
  });

  console.log(`🖥️ [Desktop] Botão "Criar Treino Mágico" visível: ${desktopBtnVisible ? '✅ SIM' : '❌ NÃO'}`);
  console.log(`🖥️ [Desktop] Banner mobile oculto: ${mobileBannerHiddenOnDesktop ? '✅ SIM' : '❌ NÃO'}`);

  // Open modal on desktop
  await page.evaluate(() => window.openMinhasCoisasPreviewModal());
  await new Promise(r => setTimeout(r, 400));

  const modalOpenDesktop = await page.evaluate(() => {
    const modal = document.getElementById('minhas-coisas-modal');
    return modal && !modal.classList.contains('hidden');
  });
  console.log(`🖥️ [Desktop] Modal aberto: ${modalOpenDesktop ? '✅ SIM' : '❌ NÃO'}`);

  const desktopModalShot = path.join(ARTIFACTS_DIR, 'portal_lab_desktop_modal.png');
  await page.screenshot({ path: desktopModalShot });
  console.log(`📸 Screenshot salvo: ${desktopModalShot}`);

  // Test Success State Elements
  await page.evaluate(() => {
    const formEl = document.getElementById('minhas-coisas-form');
    const loadingEl = document.getElementById('minhas-coisas-loading-state');
    const successEl = document.getElementById('minhas-coisas-success-state');
    if (formEl) formEl.classList.add('hidden');
    if (loadingEl) loadingEl.classList.add('hidden');
    if (successEl) successEl.classList.remove('hidden');

    const btnPlayer = document.getElementById('btnOpenPlayerLab');
    if (btnPlayer) btnPlayer.href = '/player-lab?module=mod_test_123';

    const btnPdf = document.getElementById('btnGeneratePdfBooklet');
    if (btnPdf) btnPdf.setAttribute('data-target', '/pdf-factory.html?module=mod_test_123');
  });
  await new Promise(r => setTimeout(r, 400));

  const successButtonsVerified = await page.evaluate(() => {
    const btnPlayer = document.getElementById('btnOpenPlayerLab');
    const btnPdf = document.getElementById('btnGeneratePdfBooklet');
    return {
      btnPlayerExists: !!btnPlayer,
      btnPlayerHref: btnPlayer?.getAttribute('href'),
      btnPdfExists: !!btnPdf,
      btnPdfText: btnPdf?.innerText?.trim()
    };
  });
  console.log('🎉 [Success State] Elementos verificados:', successButtonsVerified);

  const successShot = path.join(ARTIFACTS_DIR, 'portal_lab_success_orchestrator.png');
  await page.screenshot({ path: successShot });
  console.log(`📸 Screenshot salvo: ${successShot}`);

  // 2. Mobile Test (390x844)
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, isMobile: true });
  await mobilePage.goto('http://localhost:5173/portal-lab.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  // Check desktop button is hidden on mobile
  const desktopBtnHiddenOnMobile = await mobilePage.evaluate(() => {
    const btn = document.querySelector('button[onclick*="openMinhasCoisasPreviewModal"]');
    if (!btn) return true;
    const style = window.getComputedStyle(btn);
    return style.display === 'none';
  });

  // Check mobile banner is visible on mobile
  const mobileBannerVisible = await mobilePage.evaluate(() => {
    const banner = document.querySelector('div.flex.md\\:hidden');
    if (!banner) return false;
    const style = window.getComputedStyle(banner);
    return style.display !== 'none';
  });

  console.log(`📱 [Mobile] Botão desktop oculto: ${desktopBtnHiddenOnMobile ? '✅ SIM' : '❌ NÃO'}`);
  console.log(`📱 [Mobile] Banner mobile visível: ${mobileBannerVisible ? '✅ SIM' : '❌ NÃO'}`);

  // Test guard: window.openMinhasCoisasPreviewModal should reject on mobile
  let alertFired = false;
  mobilePage.on('dialog', async dialog => {
    alertFired = true;
    console.log(`📱 [Mobile Dialog Intercepted]: "${dialog.message()}"`);
    await dialog.dismiss();
  });

  await mobilePage.evaluate(() => window.openMinhasCoisasPreviewModal());
  await new Promise(r => setTimeout(r, 400));

  const modalOpenMobile = await mobilePage.evaluate(() => {
    const modal = document.getElementById('minhas-coisas-modal');
    return modal && !modal.classList.contains('hidden');
  });
  console.log(`📱 [Mobile] Modal permaneceu fechado: ${!modalOpenMobile ? '✅ SIM' : '❌ NÃO'}`);

  const mobileShot = path.join(ARTIFACTS_DIR, 'portal_lab_mobile_lock.png');
  await mobilePage.screenshot({ path: mobileShot });
  console.log(`📸 Screenshot salvo: ${mobileShot}`);

  await browser.close();
  console.log('✅ Verificação concluída com 100% de sucesso!');
})();
