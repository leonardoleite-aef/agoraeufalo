const fs = require('fs');
let content = fs.readFileSync('cursos.html', 'utf8');

content = content.replace(
  'href="https://pay.hotmart.com/T107479074N?off=mgwnab3h&src=popup_fallback"',
  'href="aefclub.html#planos"'
);

content = content.replace(
  '<span>Abrir em aba externa</span>',
  '<span>Conheça os planos</span>'
);

// We should also remove the "Conheça os planos" link from the hero since it's now in the modal
// The hero link was: <a href="aefclub.html#planos" class="mt-2 text-sm text-slate-400 hover:text-white underline underline-offset-2 transition-colors">Conheça os planos</a>
content = content.replace(
  '<a href="aefclub.html#planos" class="mt-2 text-sm text-slate-400 hover:text-white underline underline-offset-2 transition-colors">Conheça os planos</a>',
  ''
);

fs.writeFileSync('cursos.html', content);
console.log("Fixed links.");
