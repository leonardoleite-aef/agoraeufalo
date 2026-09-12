const fs = require('fs');
const lines = fs.readFileSync('cursos.html', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('MODAL POPUP DE CHECKOUT INTERNO'));
for(let i=idx-5; i<=idx; i++) {
  console.log(lines[i]);
}
