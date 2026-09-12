const fs = require('fs');
const content = fs.readFileSync('aefclub.html', 'utf8');

const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('WRAPPER DARK MODE'));

for (let i = start - 15; i < start + 5; i++) {
    console.log(lines[i]);
}
