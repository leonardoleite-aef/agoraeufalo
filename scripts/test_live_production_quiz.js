const puppeteer = require('puppeteer');

(async () => {
  console.log(`🚀 [Full Production Test] Launching Chrome to test all quizzes LIVE on https://admin.agoraeufalo.com.br/quiz ...`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const liveAudioHits = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('.mp3')) {
        liveAudioHits.push({ url, status: response.status() });
        console.log(`📡 [LIVE Audio Response] ${response.status()} -> ${url}`);
      }
    });

    // 1. Navigate to live production Quiz Studio
    await page.goto(`https://admin.agoraeufalo.com.br/quiz`, { waitUntil: 'networkidle2' });

    // TEST 1: Grazi Quiz
    console.log(`\n--- TEST 1: Grazi MS001 (Listening) ---`);
    await page.select('#quizSelect', 'quiz-ms-grazi-01');
    await page.evaluate(() => loadQuiz('quiz-ms-grazi-01'));
    await new Promise(r => setTimeout(r, 500));

    // Q1
    await page.click('#simAudioBtn');
    await new Promise(r => setTimeout(r, 1200));
    await page.click('#sim-opt-0');
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));

    // Q2
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));
    await page.click('#simAudioBtn');
    await new Promise(r => setTimeout(r, 1000));
    await page.click('#sim-opt-0');
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));

    // Q3
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));
    await page.click('#simAudioBtn');
    await new Promise(r => setTimeout(r, 1000));
    await page.click('#sim-opt-0');
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));

    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));

    // TEST 2: DTC Horas (Listening)
    console.log(`\n--- TEST 2: DTC Horas (Listening) ---`);
    await page.select('#quizSelect', 'quiz-dtc-horas-01');
    await page.evaluate(() => loadQuiz('quiz-dtc-horas-01'));
    await new Promise(r => setTimeout(r, 500));

    // Q1 (Opt B)
    await page.click('#simAudioBtn');
    await new Promise(r => setTimeout(r, 1200));
    await page.click('#sim-opt-1');
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));

    // Q2 (Opt A)
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));
    await page.click('#simAudioBtn');
    await new Promise(r => setTimeout(r, 1000));
    await page.click('#sim-opt-0');
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));

    // Q3 (Opt A)
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));
    await page.click('#simAudioBtn');
    await new Promise(r => setTimeout(r, 1000));
    await page.click('#sim-opt-0');
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));

    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));

    // TEST 3: Traditional 100% Text
    console.log(`\n--- TEST 3: QuickStart Traditional (100% Text) ---`);
    await page.select('#quizSelect', 'quiz-quickstart-text-01');
    await page.evaluate(() => loadQuiz('quiz-quickstart-text-01'));
    await new Promise(r => setTimeout(r, 500));

    // Q1 (Opt B)
    await page.click('#sim-opt-1');
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));

    // Q2 (Opt A)
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));
    await page.click('#sim-opt-0');
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));

    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));

    console.log(`\n========================================`);
    console.log(`📊 ALL LIVE AUDIO RESPONSES (TOTAL: ${liveAudioHits.length}):`);
    liveAudioHits.forEach(h => console.log(`  [HTTP ${h.status}] ${h.url}`));
    console.log(`========================================`);

    const allOk = liveAudioHits.length === 6 && liveAudioHits.every(h => h.status === 200);
    if (!allOk) throw new Error("Some audio requests did not return HTTP 200!");

    console.log(`\n✅ ALL 3 LIVE PRODUCTION QUIZZES TESTED AND OPERATIONAL AT 100%!`);
  } catch (err) {
    console.error(`❌ Live production test failed:`, err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
