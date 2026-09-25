const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log("🚀 Iniciando Teste E2E do CMS (SEM AUTH REDIRECT)...");
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-web-security'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  const path = 'file:///Users/macbookpro/Desktop/agoraeufalo_site/blog-panel-test.html';
  await page.goto(path, { waitUntil: 'networkidle0' });

  // Mock
  await page.evaluate(() => {
    window.blogEngine.db = {
      collection: (colName) => ({
        doc: () => ({
          set: async (data) => {
            console.log("🔥 FIRESTORE SALVOU! DATA:\n", JSON.stringify(data, null, 2));
            return true;
          }
        })
      })
    };
    
    window.aefCloudSync = {
      uploadFileToStorage: async (file, pathStr) => {
        console.log(`☁️ MOCK UPLOAD para ${pathStr}: ${file.name}`);
        return `https://mock.storage/${pathStr}/${file.name}`;
      }
    };
  });

  try {
    console.log("1️⃣ Abrindo Editor...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Novo Artigo'));
      if(btn) btn.click();
    });
    await page.waitForSelector('#view-editor:not(.hidden)');

    console.log("2️⃣ Preenchendo form...");
    await page.type('#editor-title', 'Eu consegui publicar no Blog do Leo');
    await page.select('#editor-status', 'published');
    await page.type('#editor-slug', 'eu-consegui-publicar-no-blog-do-leo');

    console.log("3️⃣ Inserindo Bloco de Texto...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Texto'));
      if(btn) btn.click();
    });
    await page.waitForSelector('textarea[placeholder="Escreva seu texto aqui..."]');
    await page.type('textarea[placeholder="Escreva seu texto aqui..."]', "este é um teste feito pelo programador e desenvolvedor do AgoraEuFalo para provar que o que eu desenvolvi e codei, funciona. Now, let's see if this thing really works:");

    console.log("4️⃣ Inserindo Bloco Listen & Answer...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Listen & Answer'));
      if(btn) btn.click();
    });
    
    await page.evaluate(() => {
       const inputs = Array.from(document.querySelectorAll('.phrase-input'));
       const phraseInput = inputs[inputs.length - 1]; // last one
       if (phraseInput) {
          phraseInput.value = "Wow! It's been working so far! I'm really glad Leo created this!";
          phraseInput.dispatchEvent(new Event('input'));
       }
    });

    console.log("5️⃣ Acionando TTS (Gemini API Real)...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Gravar Voz (Gemini)'));
      if(btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 6000));
    
    console.log("6️⃣ Simulando upload de Vídeo (Mídia Principal)...");
    const [videoChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Fazer Upload'));
        if(btn) btn.click();
      }),
    ]);
    const videoPath = '/Users/macbookpro/Downloads/Airplane_flights_3_LA.mp4';
    if (fs.existsSync(videoPath)) {
      await videoChooser.accept([videoPath]);
    } else {
      fs.writeFileSync('/tmp/mock.mp4', 'dummy_video');
      await videoChooser.accept(['/tmp/mock.mp4']);
    }
    await new Promise(r => setTimeout(r, 3000));

    console.log("7️⃣ Extraindo Legendas (.SRT) sem chamar STT (Zero API)...");
    const [srtChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Legendas .SRT'));
        if(btn) btn.click();
      }),
    ]);
    const srtPath = '/Users/macbookpro/Downloads/VEED-subtitles_Airplane_flights_3_LA_en-US.srt';
    if (fs.existsSync(srtPath)) {
      await srtChooser.accept([srtPath]);
    } else {
      fs.writeFileSync('/tmp/mock.srt', '1\n00:00:01,000 --> 00:00:03,000\nHello Leo!\n\n2\n00:00:03,500 --> 00:00:05,000\nTesting SRT!');
      await srtChooser.accept(['/tmp/mock.srt']);
    }
    await new Promise(r => setTimeout(r, 2000)); 

    console.log("8️⃣ Gerando Imagens (Imagen 3 API Real)...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Gerar Capas 35mm'));
      if(btn) btn.click();
    });
    console.log("⏳ Aguardando Imagen 3...");
    await new Promise(r => setTimeout(r, 12000)); 

    console.log("9️⃣ Salvando Post...");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Salvar Post'));
      if(btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 3000));
    
    console.log("✅ TESTE CONCLUÍDO.");
  } catch (err) {
    console.error("❌ ERRO:", err);
  }
  await browser.close();
})();
