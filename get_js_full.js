const fs = require('fs');
const content = fs.readFileSync('cursos.html', 'utf8');
const scriptStart = content.lastIndexOf('<script>');
console.log(content.substring(scriptStart, content.length));
