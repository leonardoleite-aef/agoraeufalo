const fs = require('fs');
const acorn = require('acorn');

const html = fs.readFileSync('portal.html', 'utf8');
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1];
  try {
    acorn.parse(code, { ecmaVersion: 2020 });
  } catch (e) {
    console.error('Syntax error in portal.html script at index ' + match.index, e);
  }
}
