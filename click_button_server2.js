const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:8080/admin-alunos.html', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 2000));
  
  // mock window.aefPortalAuth to prevent issues if it is still called
  await page.evaluate(() => {
    window.aefPortalAuth = { ready: async () => {}, getAllStudentsAndMentees: async () => ({users:[], vipMentees:[]}) };
  });

  await page.evaluate(() => {
    const btn = document.querySelector('button[title="Criar Sala de Aula & Curso Individual para Mentorado VIP"]');
    if (btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  await page.screenshot({ path: 'admin-alunos-vip-modal-real.png' });
  await browser.close();
  console.log("Screenshot saved to admin-alunos-vip-modal-real.png");
})();
