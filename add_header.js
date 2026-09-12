const fs = require('fs');
let content = fs.readFileSync('aefclub.html', 'utf8');

const headerHTML = `
      <div class="text-center max-w-3xl mx-auto mb-16">
        <span class="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-3 block">Pronto para começar?</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
          Escolha o seu plano e libere seu acesso
        </h2>
        <p class="text-base sm:text-lg text-slate-300">
          Acesso irrestrito a todas as Magic Stories, biblioteca de pronúncia, simulador de diálogo e mentorias semanais.
        </p>
      </div>
`;

content = content.replace(
    '<section id="planos" class="relative pt-20 pb-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-20">\n      \n      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">',
    '<section id="planos" class="relative pt-20 pb-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-20">\n' + headerHTML + '      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">'
);

fs.writeFileSync('aefclub.html', content);
