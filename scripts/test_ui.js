const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    await page.evaluateOnNewDocument(() => {
      let originalLocationHref = window.location.href;
      Object.defineProperty(window, 'location', {
        get() {
          return {
            href: originalLocationHref,
            search: new URL(originalLocationHref).search,
            pathname: new URL(originalLocationHref).pathname
          };
        },
        set(val) { } // block redirect
      });
    });

    console.log('\n--- INICIANDO BATERIA DE TESTES - FOCO VIP ---');

    await page.goto('http://localhost:8000/index.html');
    await page.evaluate(() => {
      localStorage.setItem('aef_user_profile', JSON.stringify({
        uid: 'test_user_123',
        name: 'Aluno Teste',
        tier: 'club_premium',
        email: 'teste@agoraeufalo.com.br'
      }));
    });

    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().includes('aef-portal-auth.js')) {
        request.respond({
          status: 200,
          contentType: 'application/javascript',
          body: `
            window.aefPortalAuth = {
              init: async () => {},
              isLoggedIn: () => true,
              currentProfile: { uid: 'test_user_123', tier: 'club_premium' },
              requireLogin: () => {},
              requireTier: () => true
            };
          `
        });
      } else {
        request.continue();
      }
    });

    async function testMentee(menteeId, name) {
      console.log(`\n🧪 TESTANDO VIP: ${name} (${menteeId})`);
      await page.goto(`http://localhost:8000/treino/player.html?course=vip&module=${menteeId}`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 4500)); 
      
      const stats = await page.evaluate(() => {
        const title = document.getElementById('lesson-title')?.innerText || 'N/A';
        const badgeCount = document.getElementById('playlist-count-badge')?.innerText || '0';
        
        // As faixas da playlist são botões
        const playlistItems = Array.from(document.querySelectorAll('#playlist-items-container button')).map(b => b.innerText.split('\\n')[0].trim());
        
        return { title, badgeCount, playlistItems };
      });
      
      console.log(`✅ VIP ${name}:`);
      console.log(`  - Título Principal Renderizado: "${stats.title}"`);
      console.log(`  - Total de Faixas na Playlist (Badge): ${stats.badgeCount}`);
      if (stats.playlistItems.length > 0) {
        console.log(`  - Primeiras faixas:`);
        stats.playlistItems.slice(0, 3).forEach(t => console.log(`      🎵 ${t}`));
      } else {
         console.log(`  - ALERTA: Nenhuma faixa encontrada no DOM do container.`);
      }
    }

    await testMentee('estevaopin', 'Estêvão Pinheiro');
    await testMentee('andre', 'André Barrote');
    await testMentee('thomasskt21', 'Thomas Henrique Silva');

    console.log('\n🎉 TESTES DE MENTORADOS CONCLUÍDOS!');

  } catch (err) {
    console.error('❌ Erro no teste:', err);
  } finally {
    if (browser) await browser.close();
    process.exit(0);
  }
})();
