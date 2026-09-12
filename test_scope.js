const fs = require('fs');
const content = fs.readFileSync('cursos.html', 'utf8');

const scriptStart = content.lastIndexOf('<script src="assets/js/aef-courses-registry.js"></script>');
const bodyScriptStart = content.lastIndexOf('<script>');
console.log("Body Script starts at: " + bodyScriptStart);

const fnIdx = content.indexOf('function openSalesModal');
console.log("Function is at: " + fnIdx);

const domInitIdx = content.indexOf("document.addEventListener('DOMContentLoaded'");
console.log("DOM Init is at: " + domInitIdx);
