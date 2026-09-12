const fs = require('fs');
const content = fs.readFileSync('cursos.html', 'utf8');

const idx = content.indexOf('id="checkout-modal"');
console.log(content.substring(idx - 150, idx + 100));
