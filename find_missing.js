const fs = require('fs');

async function run() {
    const files = ['aef-courses-registry.js'];
    let allText = fs.readFileSync('assets/js/aef-courses-registry.js', 'utf8');
    
    const r2Urls = allText.match(/https:\/\/assets\.agoraeufalo\.com\.br[^"\\\s]*/g) || [];
    const uniqueR2Urls = [...new Set(r2Urls)];
    console.log(`Checking ${uniqueR2Urls.length} URLs...`);

    let missing = [];
    // Concurrency 20 for quick HEAD requests
    const CONCURRENCY = 20;
    let index = 0;
    
    async function worker() {
        while (index < uniqueR2Urls.length) {
            const i = index++;
            const url = uniqueR2Urls[i];
            try {
                const res = await fetch(url, { method: 'HEAD' });
                if (res.status !== 200) {
                    missing.push(url);
                }
            } catch(e) {
                missing.push(url);
            }
        }
    }
    
    const workers = [];
    for (let w = 0; w < CONCURRENCY; w++) workers.push(worker());
    await Promise.all(workers);

    fs.writeFileSync('missing_urls.json', JSON.stringify(missing, null, 2));
    console.log(`Found ${missing.length} missing URLs.`);
}
run();
