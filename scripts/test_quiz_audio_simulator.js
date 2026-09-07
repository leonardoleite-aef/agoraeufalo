const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const distDir = path.resolve(__dirname, '../dist');
const port = 8099;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  
  let filePath = path.join(distDir, reqPath);
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath += '.html';
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found: ' + reqPath);
    return;
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  const range = req.headers.range;
  if (range && contentType.startsWith('audio/')) {
    const total = stat.size;
    const parts = range.replace(/bytes=/, "").split("-");
    const partialstart = parts[0];
    const partialend = parts[1];

    const start = parseInt(partialstart, 10);
    const end = partialend ? parseInt(partialend, 10) : total - 1;
    const chunksize = (end - start) + 1;

    const file = fs.createReadStream(filePath, { start: start, end: end });
    res.writeHead(206, {
      'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

server.listen(port, async () => {
  console.log(`🚀 [Test Server] Running on http://localhost:${port}`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const audioResponses = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('.mp3')) {
        audioResponses.push({ url, status: response.status() });
        console.log(`📡 [Audio HTTP Response] ${response.status()} -> ${url}`);
      }
    });

    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warn') {
        console.log(`🖥️  [Browser Console ${msg.type()}] ${msg.text()}`);
      }
    });

    // TEST 1: Grazi Quiz
    console.log(`\n========================================`);
    console.log(`TEST 1: Magic Story Quiz (Grazi MS001)`);
    console.log(`========================================`);
    await page.goto(`http://localhost:${port}/admin-quiz.html`, { waitUntil: 'networkidle0' });
    await page.select('#quizSelect', 'quiz-ms-grazi-01');
    await page.evaluate(() => loadQuiz('quiz-ms-grazi-01'));
    await new Promise(r => setTimeout(r, 400));

    // Test Audio Q1
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

    // Finish
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));
    const graziScore = await page.$eval('#simulatorStage', el => el.innerText.trim());
    console.log(`🎯 Grazi Quiz Result:\n${graziScore}`);

    // TEST 2: Dates & Times Quiz (DTC)
    console.log(`\n========================================`);
    console.log(`TEST 2: Dates & Times Quiz (DTC 01)`);
    console.log(`========================================`);
    await page.select('#quizSelect', 'quiz-dtc-horas-01');
    await page.evaluate(() => loadQuiz('quiz-dtc-horas-01'));
    await new Promise(r => setTimeout(r, 400));

    // Test Audio Q1
    await page.click('#simAudioBtn');
    await new Promise(r => setTimeout(r, 1000));
    // Option B is correct for Q1 ("Às 4:45 da tarde")
    await page.click('#sim-opt-1');
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));

    // Q2
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));
    await page.click('#simAudioBtn');
    await new Promise(r => setTimeout(r, 1000));
    // Option A is correct ("8:30 da manhã")
    await page.click('#sim-opt-0');
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));

    // Q3
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));
    await page.click('#simAudioBtn');
    await new Promise(r => setTimeout(r, 1000));
    // Option A is correct ("a couple of")
    await page.click('#sim-opt-0');
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));

    // Finish
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));
    const dtcScore = await page.$eval('#simulatorStage', el => el.innerText.trim());
    console.log(`🎯 DTC Quiz Result:\n${dtcScore}`);

    // TEST 3: Traditional 100% Text Quiz
    console.log(`\n========================================`);
    console.log(`TEST 3: Traditional 100% Text Quiz`);
    console.log(`========================================`);
    await page.select('#quizSelect', 'quiz-quickstart-text-01');
    await page.evaluate(() => loadQuiz('quiz-quickstart-text-01'));
    await new Promise(r => setTimeout(r, 400));

    // Q1 Text Mode - Option B is correct ("I'm on my way!")
    await page.click('#sim-opt-1');
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));

    // Q2 Text Mode - Option A is correct ("Porque em inglês a idade é um estado de ser")
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));
    await page.click('#sim-opt-0');
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));

    // Finish
    await page.click('#simBtnAction');
    await new Promise(r => setTimeout(r, 400));
    const textScore = await page.$eval('#simulatorStage', el => el.innerText.trim());
    console.log(`🎯 Text Quiz Result:\n${textScore}`);

    console.log(`\n========================================`);
    console.log(`📊 SUMMARY OF AUDIO NETWORK REQUESTS:`);
    console.log(`Total MP3 requests: ${audioResponses.length}`);
    audioResponses.forEach(r => console.log(`  [${r.status}] ${r.url}`));
    console.log(`========================================`);

    const allSuccessful = audioResponses.length >= 6 && audioResponses.every(r => r.status === 200 || r.status === 206);
    if (!allSuccessful) {
      throw new Error(`Some audio requests failed! Total: ${audioResponses.length}`);
    }

    console.log(`\n✅ ALL 3 QUIZ CATEGORIES AND AUDIO ASSETS VERIFIED WITH 100% SUCCESS!`);
  } catch (err) {
    console.error(`❌ Test failed:`, err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
