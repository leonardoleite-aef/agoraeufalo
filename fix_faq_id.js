const fs = require('fs');
let content = fs.readFileSync('aefclub.html', 'utf8');

content = content.replace('<section class="py-16 sm:py-20 bg-[#0A192F] text-white">', '<section id="faq" class="py-16 sm:py-20 bg-[#0A192F] text-white">');

fs.writeFileSync('aefclub.html', content);
