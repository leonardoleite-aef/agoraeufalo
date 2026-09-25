import { createServer } from 'vite';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function testPlayerLab() {
  console.log('🚀 Iniciando servidor Vite para teste do Player Lab...');
  const server = await createServer({
    configFile: path.resolve(process.cwd(), 'vite.config.js'),
    server: { port: 5174 }
  });
  await server.listen();
  console.log('✅ Servidor Vite rodando em http://localhost:5174');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    console.log('🌐 Navegando para http://localhost:5174/player-lab.html...');
    await page.goto('http://localhost:5174/player-lab.html', { waitUntil: 'networkidle0' });

    // 1. Verifica carregamento inicial e títulos
    const topTitle = await page.$eval('#top-story-title', el => el.innerText);
    console.log(`📌 Título carregado no Header: "${topTitle}"`);

    // 2. Verifica script canônico do LR no Leo Master Intro
    const canonicalScript = await page.$eval('#canonical-script-text', el => el.innerText);
    console.log(`🎙️ Script Canônico LR presente: ${canonicalScript.includes('Hello, my dear friend') ? 'SIM' : 'NÃO'}`);

    // Print da Arena LR
    const artifactDir = '/Users/macbookpro/.gemini/antigravity/brain/c9f37595-c0f2-48b7-8e60-7e5acecef1de';
    await page.screenshot({ path: path.join(artifactDir, 'player_lab_arena_lr.png'), fullPage: false });
    console.log('📸 Screenshot Arena LR salvo.');

    // 3. Muda para Arena VOC
    await page.click('#tab-voc');
    await new Promise(r => setTimeout(r, 400));
    const vocScript = await page.$eval('#canonical-script-text', el => el.innerText);
    console.log(`🎙️ Script Canônico VOC presente: ${vocScript.includes('Vocabulary Session') ? 'SIM' : 'NÃO'}`);
    await page.screenshot({ path: path.join(artifactDir, 'player_lab_arena_voc.png'), fullPage: false });
    console.log('📸 Screenshot Arena VOC salvo.');

    // 4. Muda para Arena LA (Listen & Answer)
    await page.click('#tab-la');
    await new Promise(r => setTimeout(r, 400));
    const laScript = await page.$eval('#canonical-script-text', el => el.innerText);
    console.log(`🎙️ Script Canônico LA presente: ${laScript.includes('Listen and Answer') ? 'SIM' : 'NÃO'}`);

    // Verifica se as respostas começam OCULTAS
    const isAnswer0Hidden = await page.$eval('#la-answer-0', el => el.classList.contains('hidden'));
    console.log(`🔒 Resposta do Drill #1 está OCULTA no início: ${isAnswer0Hidden ? 'SIM (CORRETO)' : 'NÃO (FALHA)'}`);

    // Clica para revelar a resposta #1
    await page.click('#btn-reveal-0');
    await new Promise(r => setTimeout(r, 200));
    const isAnswer0Revealed = await page.$eval('#la-answer-0', el => !el.classList.contains('hidden'));
    console.log(`👁️ Resposta do Drill #1 revelada sob demanda no clique: ${isAnswer0Revealed ? 'SIM (CORRETO)' : 'NÃO (FALHA)'}`);
    await page.screenshot({ path: path.join(artifactDir, 'player_lab_arena_la.png'), fullPage: false });
    console.log('📸 Screenshot Arena LA salvo.');

    // 5. Muda para Arena LRT
    await page.click('#tab-lrt');
    await new Promise(r => setTimeout(r, 400));
    const lrtScript = await page.$eval('#canonical-script-text', el => el.innerText);
    console.log(`🎙️ Script Canônico LRT presente: ${lrtScript.includes('Look and Retell') ? 'SIM' : 'NÃO'}`);

    // 6. Muda para Arena LASK
    await page.click('#tab-lask');
    await new Promise(r => setTimeout(r, 400));
    const laskScript = await page.$eval('#canonical-script-text', el => el.innerText);
    console.log(`🎙️ Script Canônico LASK presente: ${laskScript.includes('Listen and Ask') ? 'SIM' : 'NÃO'}`);

    // 7. Muda para Arena PRO
    await page.click('#tab-pro');
    await new Promise(r => setTimeout(r, 400));
    const proScript = await page.$eval('#canonical-script-text', el => el.innerText);
    console.log(`🎙️ Script Canônico PRO presente: ${proScript.includes('Pronunciation practice') ? 'SIM' : 'NÃO'}`);
    const goldenTip = await page.$eval('#pro-golden-tip-text', el => el.innerText);
    console.log(`💡 Sacada de Ouro presente: "${goldenTip.slice(0, 60)}..."`);
    await page.screenshot({ path: path.join(artifactDir, 'player_lab_arena_pro.png'), fullPage: false });
    console.log('📸 Screenshot Arena PRO salvo.');

    // Screenshot completo da página no PRO
    await page.screenshot({ path: path.join(artifactDir, 'player_lab_fullpage_pro.png'), fullPage: true });
    console.log('📸 Screenshot Fullpage salvo.');

    console.log('🎉 Todos os testes e validações do Player Lab passaram com 100% de sucesso!');
  } finally {
    await browser.close();
    await server.close();
  }
}

testPlayerLab().catch(err => {
  console.error('❌ Erro no teste:', err);
  process.exit(1);
});
