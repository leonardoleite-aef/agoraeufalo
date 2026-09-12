const fs = require('fs');
const content = fs.readFileSync('cursos.html', 'utf8');

const scriptStart = content.lastIndexOf('<script>');
const lastHtml = content.substring(scriptStart - 200, scriptStart + 200);
console.log(lastHtml);
