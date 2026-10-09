const fs = require('fs');
let content = fs.readFileSync('curso.html', 'utf8');

// Replace the hardcoded LL
content = content.replace(
  /<div[^>]*>\s*LL\s*<\/div>/g,
  `<div class="w-8 h-8 rounded-full bg-white/10 text-amber-300 flex items-center justify-center font-bold text-xs border border-white/20 cursor-pointer shadow-xs overflow-hidden" id="header-avatar-initials">
    <img src="/assets/images/leonardo-leite.png" alt="Leonardo Leite" class="w-full h-full object-cover rounded-full">
  </div>`
);
fs.writeFileSync('curso.html', content);
