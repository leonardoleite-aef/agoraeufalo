const fs = require('fs');
let content = fs.readFileSync('aefclub.html', 'utf8');
content = content.replace('id="planos"', 'id="planos" style="background-color: #060D17;"');
fs.writeFileSync('aefclub.html', content);
