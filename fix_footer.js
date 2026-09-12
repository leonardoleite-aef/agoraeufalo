const fs = require('fs');
let content = fs.readFileSync('aefclub.html', 'utf8');

// Change contact section background
content = content.replace(
    '<section class="py-12 bg-[#060D17] border-t border-white/10">',
    '<section class="py-12 bg-[#0A192F]">'
);

fs.writeFileSync('aefclub.html', content);
