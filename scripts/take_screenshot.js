const puppeteer = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    const filePath = path.join('/Users/macbookpro/Desktop/agoraeufalo_site', req.url);
    if (fs.existsSync(filePath)) {
        res.writeHead(200);
        res.end(fs.readFileSync(filePath));
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(8080, async () => {
    try {
        const browser = await puppeteer.launch({
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            headless: true,
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 1024 });
        await page.goto('http://localhost:8080/blog/eu-consegui-publicar-no-blog-do-leo.html', { waitUntil: 'networkidle2' });
        await page.screenshot({ path: '/Users/macbookpro/.gemini/antigravity/brain/ef0d10c2-1ec7-4016-ad93-718c9843ab45/print_url.png', fullPage: true });
        await browser.close();
        console.log('Screenshot taken!');
    } catch (e) {
        console.error(e);
    } finally {
        server.close();
        process.exit(0);
    }
});
