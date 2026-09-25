const puppeteer = require('puppeteer');
(async () => {
  try {
    const browser = await puppeteer.launch({ 
      headless: "new",
      userDataDir: '/Users/macbookpro/Library/Application Support/Google/Chrome'
    });
    console.log("Success");
    await browser.close();
  } catch(e) {
    console.error("Error:", e.message);
  }
})();
