const fs = require('fs');
let content = fs.readFileSync('cursos.html', 'utf8');

content = content.replace('function loadDynamicCourses() {\n    // Helper to parse Firestore REST response', '// Helper to parse Firestore REST response');
fs.writeFileSync('cursos.html', content);
console.log("Fixed syntax");
