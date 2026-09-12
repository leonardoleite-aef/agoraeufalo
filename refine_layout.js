const fs = require('fs');
let content = fs.readFileSync('aefclub.html', 'utf8');

content = content.replace('<div class="bg-[#060D17] w-full pt-16">', '<div class="bg-[#060D17] w-full">');
content = content.replace('class="relative py-20 max-w-6xl', 'class="relative pt-20 pb-8 max-w-6xl');
content = content.replace('class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"', 'class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-8"');

fs.writeFileSync('aefclub.html', content);
