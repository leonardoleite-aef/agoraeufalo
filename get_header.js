const fs = require('fs');
const content = fs.readFileSync('aefclub.html', 'utf8');

const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('<header'));
const end = lines.findIndex(l => l.includes('</header>'));

for (let i = start; i <= end; i++) {
    console.log(lines[i]);
}
