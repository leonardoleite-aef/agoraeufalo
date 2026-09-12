const fs = require('fs');
let content = fs.readFileSync('aefclub.html', 'utf8');

// Change wrapper from #060D17 to #0A192F
content = content.replace('<div class="bg-[#060D17] w-full">', '<div class="bg-[#0A192F] w-full">');

// FAQ section currently has a border-t that might look weird if it's the same color. 
// Let's remove the border-t from FAQ to make it seamless.
content = content.replace('class="py-16 sm:py-20 bg-[#0A192F] border-t border-white/10 text-white"', 'class="py-16 sm:py-20 bg-[#0A192F] text-white"');

fs.writeFileSync('aefclub.html', content);
