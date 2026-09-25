const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log("🚀 Iniciando Teste E2E do CMS Blog...");
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Interceptar console logs do navegador para debug
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // Injetar mock de Auth ANTES do carregamento da página para impedir o redirect
  await page.evaluateOnNewDocument(() => {
    // Bloqueia redirecionamento do window.location
    let mockHref = '';
    Object.defineProperty(window, 'location', {
      value: { 
        href: mockHref,
        replace: (url) => console.log("Blocked redirect to:", url),
        pathname: '/blog-panel.html'
      },
      writable: true
    });

    window.aefPortalAuth = { 
      ready: async () => true,
      requireAuth: async () => ({ uid: "mock-uid", tier: 3 })
    };
  });

  const path = 'file:///Users/macbookpro/Desktop/agoraeufalo_site/blog-panel.html';
  console.log("📂 Acessando: ", path);
  await page.goto(path, { waitUntil: 'networkidle2' });

  // Injetar Mock do Firebase e demais APIs
  await page.evaluate(() => {
    console.log("Mocking Firebase e CloudSync...");
    if (!window.blogEngine) {
      console.error("blogEngine não carregou!");
    } else {
      window.blogEngine.db = {
        collection: (colName) => ({
          doc: () => ({
            set: async (data) => {
              console.log("🔥 FIRESTORE SAVE MOCK INTERCEPTED! DATA:\n", JSON.stringify(data, null, 2));
              window.__TEST_SAVED_DATA__ = data;
              return true;
            }
          })
        })
      };
    }
    window.aefCloudSync = {
      uploadFileToStorage: async (file, path) => {
        console.log(`☁️ MOCK UPLOAD para ${path}: ${file.name || 'blob'}`);
        return `https://mock.storage/${path}/file_${Date.now()}.mp3`;
      }
    };
    window.alert = (msg) => console.log('ALERT INTERCEPTADO:', msg);
  });

  try {
    console.log("1️⃣ Clicando em Novo Artigo...");
    await page.evaluate(() => window.openEditor());
    await page.waitForSelector('#view-editor:not(.hidden)');

    console.log("2️⃣ Preenchendo Título e Status...");
    await page.type('#editor-title', 'Eu consegui publicar no Blog do Leo');
    await page.select('#editor-status', 'published');

    console.log("3️⃣ Inserindo Bloco de Texto...");
    await page.evaluate(() => window.addBlock('paragraph', { text: "este é um teste feito pelo programador e desenvolvedor do AgoraEuFalo para provar que o que eu desenvolvi e codei, funciona. Now, let's see if this thing really works:" }));

    console.log("4️⃣ Inserindo Bloco Listen & Answer...");
    await page.evaluate(() => window.addBlock('audio-reveal', { 
      question: "Wow! It's been working so far! I'm really glad Leo created this!",
      answer: "Wow! Tem funcionado até agora! Estou muito feliz que o Leo criou isso!"
    }));

    console.log("5️⃣ Acionando TTS (Gemini)...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Gravar Voz'));
      if(btn) window.generateTTSForBlock(btn);
    });
    // Aguardar o TTS finalizar
    await new Promise(r => setTimeout(r, 6000));
    
    console.log("6️⃣ Testando extração de legendas SRT...");
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Legendas .SRT'));
        if(btn) window.extractAndSyncAudio(btn);
      }),
    ]);
    
    const srtPath = '/Users/macbookpro/Downloads/VEED-subtitles_Airplane_flights_3_LA_en-US.srt';
    if (fs.existsSync(srtPath)) {
      await fileChooser.accept([srtPath]);
    } else {
      console.log("⚠️ Arquivo SRT não encontrado. Usando mock.");
      fs.writeFileSync('/tmp/mock.srt', '1\n00:00:01,000 --> 00:00:03,000\nHello Leo!\n\n2\n00:00:03,500 --> 00:00:05,000\nTesting SRT!');
      await fileChooser.accept(['/tmp/mock.srt']);
    }
    await new Promise(r => setTimeout(r, 3000));

    console.log("7️⃣ Gerando Imagens (Imagen 3)...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Gerar Capas 35mm'));
      if(btn) window.generateCoverArt(btn);
    });
    console.log("⏳ Aguardando Imagen 3...");
    await new Promise(r => setTimeout(r, 15000));

    console.log("8️⃣ Salvando Post...");
    await page.evaluate(() => window.savePost());
    await new Promise(r => setTimeout(r, 3000));
    
    console.log("✅ TESTE CONCLUÍDO. Fechando navegador.");

  } catch (err) {
    console.error("❌ ERRO NO TESTE:", err);
  }

  await browser.close();
})();
