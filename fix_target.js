const fs = require('fs');
let content = fs.readFileSync('cursos.html', 'utf8');

// The aefclub.html#planos link inside the modal has target="_blank"
// We should remove it so it navigates the same window.
const oldLink = `href="aefclub.html#planos" 
            target="_blank" 
            rel="noopener noreferrer"`;

const newLink = `href="aefclub.html#planos"`;

content = content.replace(oldLink, newLink);

fs.writeFileSync('cursos.html', content);
console.log("Fixed target.");
