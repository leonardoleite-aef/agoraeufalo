const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let updated = content.replace(/projeto-aef\.html/g, 'aefclub.html');
  // Need to be careful with precos.html so we don't mess up if it was already updated
  updated = updated.replace(/"precos\.html"/g, '"aefclub.html#planos"');
  updated = updated.replace(/precos\.html/g, 'aefclub.html#planos');
  if (content !== updated) {
    fs.writeFileSync(file, updated);
    console.log(`Updated ${file}`);
  }
});
