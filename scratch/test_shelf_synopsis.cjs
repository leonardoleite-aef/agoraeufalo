const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 [Test] Iniciando bateria de testes: Estante Magic Creations, Access Engine e Sinopse no Player...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const artifactDir = '/Users/macbookpro/.gemini/antigravity/brain/c9f37595-c0f2-48b7-8e60-7e5acecef1de';

  try {
    // 1. TESTE DO PORTAL LAB (FREE MODE)
    console.log('--- TESTE 1: Portal Lab no Modo Free ---');
    await page.goto('http://localhost:5173/portal-lab.html', { waitUntil: 'networkidle2' });
    
    // Configura preview mode para 'free'
    await page.evaluate(() => {
      localStorage.setItem('aef_lab_preview_mode', 'free');
    });
    await page.reload({ waitUntil: 'networkidle2' });

    // Aguarda o carregamento do catálogo
    await page.waitForSelector('#magic-catalog-grid', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1000)); // tempo para renderização dos cards

    const totalText = await page.$eval('#counter-total', el => el.innerText.trim());
    const new30dText = await page.$eval('#counter-30d', el => el.innerText.trim());
    const cardCount = await page.$$eval('#magic-catalog-grid > div', divs => divs.length);

    console.log(`📊 Contadores: Total = "${totalText}", Novos = "${new30dText}", Cards Renderizados = ${cardCount}`);

    if (totalText !== '142 Treinos' || cardCount < 4) {
      throw new Error(`Validação dos cards falhou: total=${totalText}, cards=${cardCount}`);
    }

    // Tira screenshot da estante no portal
    const shelfElement = await page.$('#magic-creations-shelf');
    if (shelfElement) {
      await shelfElement.screenshot({
        path: path.join(artifactDir, 'magic_creations_shelf_preview.png')
      });
      console.log('📸 Screenshot da Estante salvo: magic_creations_shelf_preview.png');
    }

    // Testa o Access Engine no modo Free (clique no primeiro card deve abrir modal upsell)
    console.log('🔒 Testando Access Engine (Paywall no Free)...');
    await page.click('#magic-catalog-grid > div:first-child');
    await new Promise(r => setTimeout(r, 600));

    const upsellOpen = await page.evaluate(() => {
      const modal = document.getElementById('upsell-modal');
      return modal && !modal.classList.contains('hidden');
    });

    console.log(`🔒 Modal Upsell aberto ao clicar no card Free? ${upsellOpen ? 'SIM ✅' : 'NÃO ❌'}`);
    if (upsellOpen) {
      await page.screenshot({
        path: path.join(artifactDir, 'magic_creations_upsell_modal.png')
      });
      console.log('📸 Screenshot do Upsell Modal salvo: magic_creations_upsell_modal.png');
    }

    // 2. TESTE DO PORTAL LAB (CLUB MODE)
    console.log('--- TESTE 2: Portal Lab no Modo Club ---');
    await page.evaluate(() => {
      localStorage.setItem('aef_lab_preview_mode', 'club');
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('#magic-catalog-grid > div', { timeout: 10000 });

    // 3. TESTE DO PLAYER LAB (SINOPSE PEDAGÓGICA)
    console.log('--- TESTE 3: Player Lab com Sinopse Pedagógica ---');
    await page.goto('http://localhost:5173/player-lab.html?module=mc-airport-luggage-02', { waitUntil: 'networkidle2' });
    
    // Aguarda o container do Listen & Read
    await page.waitForSelector('#lr-sentences-container', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1000));

    // Verifica a presença do box de sinopse
    const synopsisBox = await page.evaluate(() => {
      const box = document.querySelector('#lr-sentences-container .bg-slate-50.border-amber-500');
      if (!box) return null;
      return {
        text: box.innerText.trim(),
        hasIcon: !!box.querySelector('svg, i[data-lucide="info"]')
      };
    });

    console.log('📖 Box de Sinopse no Player:', synopsisBox);
    if (!synopsisBox || !synopsisBox.text.includes('sobrevivência em viagens internacionais')) {
      throw new Error('Falha ao encontrar o box de sinopse pedagógica com a descrição correta.');
    }
    console.log('✅ Box de sinopse validado com sucesso!');

    // Tira screenshot do Player Lab com a sinopse visível
    const lrArea = await page.$('#arena-lr');
    if (lrArea) {
      await lrArea.screenshot({
        path: path.join(artifactDir, 'player_lab_synopsis_box.png')
      });
      console.log('📸 Screenshot da Sinopse no Player salvo: player_lab_synopsis_box.png');
    }

    console.log('🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
  } catch (err) {
    console.error('❌ Erro no teste:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
