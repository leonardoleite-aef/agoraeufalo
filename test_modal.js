const fs = require('fs');
const content = fs.readFileSync('cursos.html', 'utf8');

const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('// Simulate network delay'));

for (let i = start - 40; i < start + 10; i++) {
    if (lines[i]) console.log(lines[i]);
}
