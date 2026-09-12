const fs = require('fs');
let content = fs.readFileSync('admin-cursos.html', 'utf8');

// Insert the HTML for Legacy Checkboxes
const legacyHtml = `
            <div class="mt-4 pt-3 border-t border-white/10">
              <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">Acesso Estendido (Alunos Legados)</label>
              <p class="text-[10px] text-slate-500 mb-2 leading-tight">Marque abaixo se você deseja que alunos que migraram das bases antigas tenham acesso gratuito a este curso (independente da assinatura Club).</p>
              <div class="space-y-1.5 flex flex-col">
                <label class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#112240]/60 border border-white/10 hover:border-amber-400/40 cursor-pointer transition">
                  <input type="checkbox" value="legado_1" class="course-legacy-chk rounded text-amber-500 bg-[#0B0F17] border-white/20 focus:ring-0 w-3.5 h-3.5">
                  <span class="text-xs text-white/90 font-semibold">📦 Liberar para Legado 1 (MS-Legacy)</span>
                </label>
                <label class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#112240]/60 border border-white/10 hover:border-amber-400/40 cursor-pointer transition">
                  <input type="checkbox" value="legado_2" class="course-legacy-chk rounded text-emerald-500 bg-[#0B0F17] border-white/20 focus:ring-0 w-3.5 h-3.5">
                  <span class="text-xs text-white/90 font-semibold">📦 Liberar para Legado 2 (Primeiro AEF)</span>
                </label>
              </div>
            </div>
`;
content = content.replace('</div>\n            \n            <div class="flex items-center gap-3 mt-6 pt-4 border-t border-white/10">', '</div>\n            ' + legacyHtml + '\n            <div class="flex items-center gap-3 mt-6 pt-4 border-t border-white/10">');

// Clear checkboxes on new
content = content.replace(
  'document.querySelectorAll(\'.course-cat-chk\').forEach(chk => {',
  'document.querySelectorAll(\'.course-legacy-chk\').forEach(chk => chk.checked = false);\n      document.querySelectorAll(\'.course-cat-chk\').forEach(chk => {'
);

// Populate checkboxes on edit
content = content.replace(
  'let cats = course.categories || [\'foundations\'];',
  `let cats = course.categories || ['foundations'];
      let legacyGrants = course.legacyGrants || [];
      document.querySelectorAll('.course-legacy-chk').forEach(chk => {
        chk.checked = legacyGrants.includes(chk.value);
      });`
);

// Save checkboxes on save
content = content.replace(
  'const selectedCats = [];',
  `const selectedCats = [];
      const selectedLegacy = [];
      document.querySelectorAll('.course-legacy-chk:checked').forEach(c => selectedLegacy.push(c.value));`
);

content = content.replace(
  'courseObj.categories = selectedCats;',
  'courseObj.categories = selectedCats;\n      courseObj.legacyGrants = selectedLegacy;'
);

fs.writeFileSync('admin-cursos.html', content);
console.log("Patched admin-cursos.html");
