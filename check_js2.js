const fs = require('fs');
const content = fs.readFileSync('cursos.html', 'utf8');
const endIdx = content.indexOf('function openSalesModal(courseId) {');
console.log(content.substring(endIdx - 500, endIdx + 100));
