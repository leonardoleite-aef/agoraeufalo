const fs = require('fs');
const content = fs.readFileSync('aefclub.html', 'utf8');

const ids = ['o-metodo', 'sobre-o-professor', 'o-que-inclui', 'depoimentos'];
for (const id of ids) {
    console.log(`${id}: ${content.includes('id="' + id + '"')}`);
}
