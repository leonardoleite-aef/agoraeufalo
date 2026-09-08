const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('🚀 Iniciando teste headless do Visual Kit Pipeline em admin-cursos.html...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const filePath = `file://${path.resolve(__dirname, '../admin-cursos.html')}`;

    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    // Injeta sessão de Admin para contornar guarda de rota no teste
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('aef_user_email', 'leonardo@agoraeufalo.com.br');
      localStorage.setItem('aef_user_name', 'Professor Leonardo Leite');
      localStorage.setItem('aef_user_role', 'admin');
      localStorage.setItem('aef_user_tier', 'vip');
      localStorage.setItem('aef_is_admin', 'true');
      localStorage.removeItem('aef_logged_out');
    });

    await page.goto(filePath, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));

    // 1. Verificar elementos do Visual Kit Studio na página
    const checks = await page.evaluate(() => {
      const btnGenerate = document.getElementById('btnGenerateVisualKit');
      const previewThumb = document.getElementById('previewThumbImg');
      const placeholderThumb = document.getElementById('placeholderThumbBox');
      const thumbBadge = document.getElementById('thumbStatusBadge');

      const previewArtwork = document.getElementById('previewArtworkImg');
      const placeholderArtwork = document.getElementById('placeholderArtworkBox');
      const artworkBadge = document.getElementById('artworkStatusBadge');

      const advancedUrls = document.getElementById('advancedVisualUrlsCont');
      const thumbInput = document.getElementById('lessonThumbnailUrlInput');
      const artworkInput = document.getElementById('lessonArtworkUrlInput');

      const aiEngineExists = typeof window.AEFStudioAI !== 'undefined';
      const generateVisualMethodExists = aiEngineExists && typeof window.AEFStudioAI.generateVisualAsset === 'function';

      // Course modal button
      const courseModal = document.getElementById('courseModal');
      const courseCoverInput = document.getElementById('courseModalCoverInput');

      return {
        hasBtnGenerate: !!btnGenerate,
        hasPreviewThumb: !!previewThumb,
        hasPlaceholderThumb: !!placeholderThumb,
        hasThumbBadge: !!thumbBadge,
        hasPreviewArtwork: !!previewArtwork,
        hasPlaceholderArtwork: !!placeholderArtwork,
        hasArtworkBadge: !!artworkBadge,
        hasAdvancedUrls: !!advancedUrls,
        hasThumbInput: !!thumbInput,
        hasArtworkInput: !!artworkInput,
        hasAiEngine: aiEngineExists,
        hasGenerateVisualMethod: generateVisualMethodExists,
        hasCourseModalCoverInput: !!courseCoverInput
      };
    });

    console.log('📊 Verificação de Elementos DOM:');
    console.log(JSON.stringify(checks, null, 2));

    for (const [key, val] of Object.entries(checks)) {
      if (!val) {
        throw new Error(`Falha no check: ${key} é falso!`);
      }
    }

    // 2. Testar simulação de nova aula (garantir que thumbnailUrl e artworkUrl iniciam vazios - zero mocks)
    const newLessonCheck = await page.evaluate(() => {
      // Simular chamada para criar nova aula
      const moduleId = Object.keys(ALL_COURSES).length > 0 ? (ALL_COURSES[activeCourseId]?.modules?.[0]?.id || 'mod-test') : 'mod-test';
      openNewLessonForModule(moduleId);

      const thumbVal = document.getElementById('lessonThumbnailUrlInput').value;
      const artworkVal = document.getElementById('lessonArtworkUrlInput').value;
      const thumbBadgeText = document.getElementById('thumbStatusBadge').innerText;
      const artworkBadgeText = document.getElementById('artworkStatusBadge').innerText;

      return {
        thumbVal,
        artworkVal,
        thumbBadgeText,
        artworkBadgeText,
        isZeroMock: thumbVal === '' && artworkVal === ''
      };
    });

    console.log('🧪 Verificação de Nova Aula (Zero Mocks):', newLessonCheck);
    if (!newLessonCheck.isZeroMock) {
      throw new Error(`Falha: Nova aula não iniciou com URLs vazias! (Thumb: ${newLessonCheck.thumbVal}, Art: ${newLessonCheck.artworkVal})`);
    }

    // 3. Testar atualização reativa de preview ao preencher URL
    const reactiveCheck = await page.evaluate(() => {
      const testUrl = 'https://firebasestorage.googleapis.com/test_thumb.jpg';
      const thumbInput = document.getElementById('lessonThumbnailUrlInput');
      thumbInput.value = testUrl;
      updateMediaPreviews();

      const img = document.getElementById('previewThumbImg');
      const badge = document.getElementById('thumbStatusBadge');
      const placeholder = document.getElementById('placeholderThumbBox');

      return {
        imgSrc: img.src,
        imgVisible: !img.classList.contains('hidden'),
        placeholderHidden: placeholder.classList.contains('hidden'),
        badgeText: badge.innerText
      };
    });

    console.log('⚡ Verificação de Reatividade:', reactiveCheck);
    if (!reactiveCheck.imgVisible || !reactiveCheck.placeholderHidden) {
      throw new Error('Falha na reatividade do preview ao definir URL!');
    }

    // 4. Testar toggle de URLs manuais
    const toggleCheck = await page.evaluate(() => {
      const cont = document.getElementById('advancedVisualUrlsCont');
      const initialHidden = cont.classList.contains('hidden');
      toggleAdvancedVisualUrls();
      const afterToggle = !cont.classList.contains('hidden');
      return { initialHidden, afterToggle };
    });

    console.log('🔄 Verificação do Alternador Sanfona:', toggleCheck);
    if (!toggleCheck.initialHidden || !toggleCheck.afterToggle) {
      throw new Error('Falha no alternador de URLs manuais!');
    }

    console.log('\n✅ TODOS OS TESTES PASSARAM COM SUCESSO! Visual Kit Pipeline 100% validado.');
  } finally {
    await browser.close();
  }
})();
