const fs = require('fs');
let code = fs.readFileSync('assets/js/aef-cloud-sync.js', 'utf8');

if (!code.includes('Promise.race')) {
  // We want to add a timeout to the initial courses.get() call to prevent hanging
  code = code.replace(
    'const coursesSnap = await this.db.collection("courses").get();',
    `const coursesSnap = await Promise.race([
      this.db.collection("courses").get(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout on courses.get()")), 5000))
    ]);`
  );
  fs.writeFileSync('assets/js/aef-cloud-sync.js', code);
  console.log("Patched");
} else {
  console.log("Already patched");
}
