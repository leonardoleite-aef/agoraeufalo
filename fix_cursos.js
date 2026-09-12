const fs = require('fs');
let content = fs.readFileSync('cursos.html', 'utf8');

// 1. Change the bucket assignment
content = content.replace(
  "if (course.accessTier === 'all_access' || course.accessTier === 'free') {",
  "if (course.accessTier === 'all_access') {"
);

// 2. Add badge for free courses in renderGrid
const badgeHtml = `
              ${course.accessTier === 'free' 
                ? '<span class="absolute top-4 right-4 px-3 py-1 bg-emerald-500 text-white text-xs font-black tracking-wider uppercase rounded-full shadow-lg border border-emerald-400">Grátis</span>' 
                : ''}
              ${course.hasActiveOffer && course.accessTier !== 'free'
                ? '<span class="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-[10px] font-black tracking-wider uppercase rounded-full shadow-md">Inscrições Abertas</span>' 
                : ''}
`;
// Replace the old active offer badge logic:
const oldBadgeLogic = `
              ${course.hasActiveOffer && !isClub
                ? \`<span class="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-[10px] font-black tracking-wider uppercase rounded-full shadow-md">Inscrições Abertas</span>\` 
                : ''}
`;

content = content.replace(oldBadgeLogic, badgeHtml);

// 3. Update the button rendering logic for standalone courses
const oldBtnLogic = `
              ${isClub 
                ? \`<button onclick="openSalesModal('\${course.id}')" class="w-full px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md active:scale-95 transition-all text-center flex items-center justify-center gap-2">
                     <i data-lucide="lock" class="w-4 h-4 text-amber-500"></i> Desbloquear com o Club
                   </button>\`
                : (course.hasActiveOffer
                   ? \`<button onclick="openSalesModal('\${course.id}')" class="w-full px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-sm shadow-md active:scale-95 transition-all text-center">
                        Saiba Mais
                      </button>\`
                   : \`<button disabled class="w-full px-5 py-3 rounded-xl bg-slate-200 text-slate-400 font-bold text-sm border border-slate-300 cursor-not-allowed text-center">
                        Inscrições Esgotadas
                      </button>\`)
              }
`;

const newBtnLogic = `
              ${isClub 
                ? \`<button onclick="openSalesModal('\${course.id}')" class="w-full px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md active:scale-95 transition-all text-center flex items-center justify-center gap-2">
                     <i data-lucide="lock" class="w-4 h-4 text-amber-500"></i> Desbloquear com o Club
                   </button>\`
                : (course.accessTier === 'free'
                   ? \`<a href="portal.html" class="w-full px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm shadow-md active:scale-95 transition-all text-center flex items-center justify-center gap-2">
                        <i data-lucide="play" class="w-4 h-4"></i> Acessar Grátis
                      </a>\`
                   : (course.hasActiveOffer
                     ? \`<button onclick="openSalesModal('\${course.id}')" class="w-full px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-sm shadow-md active:scale-95 transition-all text-center">
                          Saiba Mais
                        </button>\`
                     : \`<button disabled class="w-full px-5 py-3 rounded-xl bg-slate-200 text-slate-400 font-bold text-sm border border-slate-300 cursor-not-allowed text-center">
                          Inscrições Esgotadas
                        </button>\`))
              }
`;

content = content.replace(oldBtnLogic, newBtnLogic);
fs.writeFileSync('cursos.html', content);
console.log("Patched cursos.html with Free badges");
