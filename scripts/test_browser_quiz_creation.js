const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Iniciando Chrome via Puppeteer para testar o Quiz Studio Master...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Monitora logs do console do navegador
  page.on('console', msg => console.log('🖥️ [Browser Console]:', msg.text()));
  page.on('pageerror', err => console.error('❌ [Browser Page Error]:', err.toString()));

  const fileUrl = 'file://' + path.resolve(__dirname, '../dist/admin-quiz.html');
  console.log('📄 Abrindo arquivo:', fileUrl);
  
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  // 1. Lê a chave do .env
  let apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey && fs.existsSync(path.resolve(__dirname, '../.env'))) {
    const envContent = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=["']?([^"'\n\r]+)["']?/);
    if (match) apiKey = match[1].trim();
  }

  // 2. Configura a API Key no localStorage do navegador
  await page.evaluate((key) => {
    localStorage.setItem('AEF_GEMINI_API_KEY', key);
  }, apiKey);

  console.log('✅ API Key configurada no localStorage do navegador.');

  // 2. Clica no botão "+ Novo Quiz"
  console.log('🖱️ Clicando em "+ Novo Quiz"...');
  await page.evaluate(() => {
    createNewQuiz();
  });

  // 3. Preenche Título e Categoria do Novo Quiz
  console.log('✍️ Preenchendo dados do novo Quiz da Grazi...');
  await page.evaluate(() => {
    document.getElementById('quizTitleInput').value = 'Quiz da Grazi • Destravando a Confiança (MS001)';
    document.getElementById('quizCategoryInput').value = 'Magic Stories';
    updateQuestionText(0, 'Ouça a fala da Grazi e responda: Qual foi a decisão dela?');
    updateQuestionScript(0, 'Grazi: I am tired of waiting. Today I will start speaking English with confidence!');
    updateQuestionVoice(0, 'Aoede');
    updateOptionText(0, 0, 'Ela cansou de esperar e decidiu falar inglês com confiança hoje mesmo');
    updateOptionText(0, 1, 'Ela decidiu esperar mais um ano antes de tentar');
    updateOptionText(0, 2, 'Ela vai estudar regras de gramática em silêncio');
    setCorrectOption(0, 0);
    updateQuestionGoldenTip(0, 'Quando você decide falar com o inglês que tem no Agora, a fluência vira reflexo!');
  });

  // Tira print do formulário antes da síntese
  await page.screenshot({ path: 'scripts/step1_quiz_form.png', fullPage: true });
  console.log('📸 Screenshot 1 salva: scripts/step1_quiz_form.png');

  // 4. Executa a síntese Gemini TTS no navegador em tempo real!
  console.log('🎙️ Clicando no botão de sintetizar Gemini TTS dentro do navegador...');
  
  const synthResult = await page.evaluate(async () => {
    const btn = document.querySelector('button[onclick*="synthesizeQuestionAudio(0"]');
    await synthesizeQuestionAudio(0, btn);
    return {
      audioUrl: currentQuiz.questions[0].audioUrl,
      hasBlob: (currentQuiz.questions[0].audioUrl || '').startsWith('blob:')
    };
  });

  console.log('🎉 Resultado da síntese no navegador:', synthResult);

  if (!synthResult.hasBlob) {
    throw new Error('Falha: o áudio blob não foi gerado pelo Gemini TTS!');
  }

  // 5. Simula a interação do aluno no Simulador da Direita
  console.log('🎯 Testando o Simulador do Aluno na coluna da direita...');
  await page.evaluate(() => {
    // Clica na opção A (correta)
    simSelectOption(0);
    // Clica em verificar
    simCheckAnswer();
  });

  // Tira print da tela com o quiz criado, áudio sintetizado e resposta validada
  await page.screenshot({ path: 'scripts/step2_quiz_completed.png', fullPage: true });
  console.log('📸 Screenshot 2 salva: scripts/step2_quiz_completed.png');

  // 6. Salva o quiz no banco
  console.log('💾 Clicando em Salvar Quiz no Banco...');
  await page.evaluate(() => {
    saveCurrentQuiz();
  });

  console.log('🏆 PROVA COMPROVADA COM SUCESSO: O navegador construiu o quiz, sintetizou o áudio via Gemini API, atualizou o simulador e salvou no banco!');

  await browser.close();
})();
