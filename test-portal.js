const fs = require('fs');
const html = fs.readFileSync('portal.html', 'utf8');
console.log("Portal HTML has salesUrl mapping:", html.includes("salesUrl: f.salesUrl?.stringValue || ''"));
