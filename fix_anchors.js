const fs = require('fs');
let content = fs.readFileSync('aefclub.html', 'utf8');

content = content.replace(/#inscricao/g, '#planos');

fs.writeFileSync('aefclub.html', content);
