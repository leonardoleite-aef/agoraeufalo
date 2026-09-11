const fs = require('fs');
const file = '/Users/macbookpro/Desktop/agoraeufalo_site/portal.html';
let content = fs.readFileSync(file, 'utf8');

const target = '                    <a href="${resumeUrl}" class="py-2.5 rounded-xl ${isMentorshipCourse ? \\'bg-emerald-700 hover:bg-emerald-600\\' : \\'bg-[#0D1E36] hover:bg-[#C68A36]\\'} text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1 shadow-xs">\n                      <span>Continuar</span>\n                      <i data-lucide="play" class="w-3 h-3 fill-current"></i>\n                    </a>\n          // ——— 2. SEÇÃO "CATÁLOGO COMPLETO DE CURSOS" (RENDERIZA TODOS OS CURSOS) ———';

const replacement = '                    <a href="${resumeUrl}" class="py-2.5 rounded-xl ${isMentorshipCourse ? \\'bg-emerald-700 hover:bg-emerald-600\\' : \\'bg-[#0D1E36] hover:bg-[#C68A36]\\'} text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1 shadow-xs">\n                      <span>Continuar</span>\n                      <i data-lucide="play" class="w-3 h-3 fill-current"></i>\n                    </a>\n                  </div>\n                </div>\n              </div>\n            `;\n          }\n\n          // ——— 2. SEÇÃO "CATÁLOGO COMPLETO DE CURSOS" (RENDERIZA TODOS OS CURSOS) ———';

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
