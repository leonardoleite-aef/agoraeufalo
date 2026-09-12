const fs = require('fs');
const content = fs.readFileSync('cursos.html', 'utf8');

const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('// Checkout Modal Logic'));

if (start !== -1) {
    for (let i = start; i < start + 30; i++) {
        console.log(lines[i]);
    }
} else {
    console.log("NOT FOUND");
}
