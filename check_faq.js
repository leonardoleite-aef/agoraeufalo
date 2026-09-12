const fs = require('fs');
const content = fs.readFileSync('aefclub.html', 'utf8');

const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('5. PERGUNTAS FREQUENTES'));

for (let i = start - 2; i < start + 5; i++) {
    console.log(lines[i]);
}
