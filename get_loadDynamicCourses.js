const fs = require('fs');
const content = fs.readFileSync('cursos.html', 'utf8');

const start = content.indexOf('function loadDynamicCourses() {');
const end = content.indexOf('function renderGrid() {');
console.log(content.substring(start, end));
