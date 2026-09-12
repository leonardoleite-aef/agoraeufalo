const fs = require('fs');
const content = fs.readFileSync('aefclub.html', 'utf8');

const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('<body'));

for (let i = start; i < start + 10; i++) {
    console.log(lines[i]);
}
