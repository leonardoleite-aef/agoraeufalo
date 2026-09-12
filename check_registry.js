const fs = require('fs');
const content = fs.readFileSync('assets/js/aef-courses-registry.js', 'utf8');

// just extract the first 150 lines to see the structure of a standard course
console.log(content.split('\n').slice(0, 150).join('\n'));
