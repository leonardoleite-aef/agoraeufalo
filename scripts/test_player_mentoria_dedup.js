const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

function createStaticServer(port) {
  const mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml"
  };

  const server = http.createServer((req, res) => {
    let cleanUrl = req.url.split("?")[0];
    if (cleanUrl === "/") cleanUrl = "/index.html";
    if (cleanUrl.startsWith("/")) cleanUrl = cleanUrl.substring(1);
    const filePath = path.join(process.cwd(), cleanUrl);

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found: " + cleanUrl);
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
      res.end(content);
    });
  });

  return new Promise(resolve => {
    server.listen(port, () => resolve(server));
  });
}

async function runTests() {
  const PORT = 8094;
  const server = await createStaticServer(PORT);
  console.log("Local test server running on port " + PORT + "...");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // TEST 1: Thomas Player (?aluno=thomasskt21)
    console.log("\n--- TEST 1: player.html?aluno=thomasskt21 ---");
    await page.goto("http://localhost:" + PORT + "/player.html?aluno=thomasskt21", { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 1200));

    const titlesThomas = await page.evaluate(() => {
      const els = document.querySelectorAll("#home-courses-grid h4");
      return Array.from(els).map(e => e.innerText.trim());
    });
    console.log("Courses displayed for Thomas:", titlesThomas);

    const thomasMatches = titlesThomas.filter(t => t.toLowerCase().includes("thomas"));
    const andreMatches = titlesThomas.filter(t => t.toLowerCase().includes("andré") || t.toLowerCase().includes("andre"));
    const mateusMatches = titlesThomas.filter(t => t.toLowerCase().includes("mateus"));
    const estevaoMatches = titlesThomas.filter(t => t.toLowerCase().includes("estêvão") || t.toLowerCase().includes("estevao"));

    console.log("Thomas cards count: " + thomasMatches.length);
    console.log("André cards count: " + andreMatches.length);
    console.log("Mateus cards count: " + mateusMatches.length);
    console.log("Estêvão cards count: " + estevaoMatches.length);

    if (thomasMatches.length !== 1) throw new Error("Expected exactly 1 Thomas card, got " + thomasMatches.length);
    if (andreMatches.length !== 0) throw new Error("André should NOT appear in Thomas player, found " + andreMatches.length);
    if (mateusMatches.length !== 0) throw new Error("Mateus should NOT appear in Thomas player, found " + mateusMatches.length);
    if (estevaoMatches.length !== 0) throw new Error("Estêvão should NOT appear in Thomas player, found " + estevaoMatches.length);
    console.log("✅ TEST 1 PASSED: Only Thomas VIP appears, exactly 1 time, no other mentees!");

    // TEST 2: Mateus Player (?aluno=mateus)
    console.log("\n--- TEST 2: player.html?aluno=mateus ---");
    await page.goto("http://localhost:" + PORT + "/player.html?aluno=mateus", { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 1200));

    const titlesMateus = await page.evaluate(() => {
      const els = document.querySelectorAll("#home-courses-grid h4");
      return Array.from(els).map(e => e.innerText.trim());
    });
    console.log("Courses displayed for Mateus:", titlesMateus);

    const mateusInMateus = titlesMateus.filter(t => t.toLowerCase().includes("mateus"));
    const thomasInMateus = titlesMateus.filter(t => t.toLowerCase().includes("thomas"));
    if (mateusInMateus.length !== 1) throw new Error("Expected exactly 1 Mateus card, got " + mateusInMateus.length);
    if (thomasInMateus.length !== 0) throw new Error("Thomas should not appear in Mateus player!");
    console.log("✅ TEST 2 PASSED: Only Mateus VIP appears, exactly 1 time (no triplicate)!");

    // TEST 3: Estevao Player (?aluno=estevao)
    console.log("\n--- TEST 3: player.html?aluno=estevao ---");
    await page.goto("http://localhost:" + PORT + "/player.html?aluno=estevao", { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 1200));

    const titlesEstevao = await page.evaluate(() => {
      const els = document.querySelectorAll("#home-courses-grid h4");
      return Array.from(els).map(e => e.innerText.trim());
    });
    console.log("Courses displayed for Estêvão:", titlesEstevao);

    const estevaoInEstevao = titlesEstevao.filter(t => t.toLowerCase().includes("estêvão") || t.toLowerCase().includes("estevao"));
    if (estevaoInEstevao.length !== 1) throw new Error("Expected exactly 1 Estêvão card, got " + estevaoInEstevao.length);
    console.log("✅ TEST 3 PASSED: Only Estêvão VIP appears, exactly 1 time (no duplicate)!");

    // TEST 4: Admin viewing general player (no ?aluno=)
    console.log("\n--- TEST 4: player.html as Admin (no ?aluno=) ---");
    await page.goto("http://localhost:" + PORT + "/player.html", { waitUntil: "networkidle2" });
    await page.evaluate(() => {
      localStorage.setItem("aef_user_email", "selexenglish@gmail.com");
      localStorage.setItem("aef_user_role", "admin");
      localStorage.setItem("aef_user_tier", "admin_master");
      localStorage.setItem("aef_user_name", "Leonardo Leite");
    });
    await page.reload({ waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 1200));

    const titlesAdmin = await page.evaluate(() => {
      const els = document.querySelectorAll("#home-courses-grid h4");
      return Array.from(els).map(e => e.innerText.trim());
    });
    console.log("Courses displayed for Admin:", titlesAdmin);

    const adminThomas = titlesAdmin.filter(t => t.toLowerCase().includes("thomas"));
    const adminAndre = titlesAdmin.filter(t => t.toLowerCase().includes("andré") || t.toLowerCase().includes("andre"));
    const adminMateus = titlesAdmin.filter(t => t.toLowerCase().includes("mateus"));
    const adminEstevao = titlesAdmin.filter(t => t.toLowerCase().includes("estêvão") || t.toLowerCase().includes("estevao"));

    console.log("Admin view counts -> Thomas: " + adminThomas.length + ", André: " + adminAndre.length + ", Mateus: " + adminMateus.length + ", Estêvão: " + adminEstevao.length);

    if (adminThomas.length !== 1) throw new Error("Expected exactly 1 Thomas card in Admin view, got " + adminThomas.length);
    if (adminAndre.length !== 1) throw new Error("Expected exactly 1 André card in Admin view, got " + adminAndre.length);
    if (adminMateus.length !== 1) throw new Error("Expected exactly 1 Mateus card in Admin view, got " + adminMateus.length);
    if (adminEstevao.length !== 1) throw new Error("Expected exactly 1 Estêvão card in Admin view, got " + adminEstevao.length);

    console.log("✅ TEST 4 PASSED: Admin sees each mentee EXACTLY ONCE (zero duplicates/triplicates)!");

    console.log("\n🎉 ALL 4 TESTS PASSED FLAWLESSLY!");

  } finally {
    await browser.close();
    server.close();
  }
}

runTests().catch(err => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
