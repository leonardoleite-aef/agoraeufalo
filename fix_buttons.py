import re

with open('admin-alunos.html', 'r') as f:
    content = f.read()

# Add hasVipSpace calculation right after isVIP
target_isVIP = "const isVIP = (s.tier === 'vip_mentorship' || s.tier === 'vip') || (s.categories && s.categories.includes('member_mentoria'));"
if target_isVIP in content:
    content = content.replace(target_isVIP, target_isVIP + "\n        const hasVipSpace = s.enrolledProducts && s.enrolledProducts.includes('mentoria-' + s.id);")

# Find the block for isVIP buttons
old_buttons = """                ${isVIP ? `
                  <button onclick="openPrescribeModal('${s.id}', '${s.name}')" class="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer" title="Prescrever Áudio VIP">
                    <i data-lucide="mic" class="w-3 h-3 text-amber-700"></i>
                    <span>Prescrever</span>
                  </button>
                  <a href="curso.html?curso=mentoria-${s.id}" target="_blank" class="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500 hover:text-slate-950 text-amber-900 border border-amber-300 text-[11px] font-bold transition inline-flex items-center gap-1" title="Ver Vitrine do Curso do Mentorado">
                    <i data-lucide="book-open" class="w-3 h-3"></i>
                    <span>Sala VIP</span> <span>↗</span>
                  </a>
                  <a href="admin-cursos.html?curso=mentoria-${s.id}" target="_blank" class="p-1.5 rounded-lg bg-white/80 hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 transition" title="Editar Aulas & Módulos no Course Studio">
                    <i data-lucide="layers" class="w-3.5 h-3.5"></i>
                  </a>
                  <a href="treino/player.html?aluno=${s.id}" target="_blank" class="px-2 py-1 rounded-lg bg-slate-900 hover:bg-amber-50 hover:text-amber-900 text-white text-[11px] font-bold transition inline-flex items-center gap-1" title="Abrir Player no Celular">
                    <span>Player</span> <span>↗</span>
                  </a>
                ` : ''}"""

new_buttons = """                ${isVIP ? (hasVipSpace ? `
                  <button onclick="openPrescribeModal('${s.id}', '${(s.name || '').replace(/'/g, "\\'")}')" class="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer" title="Prescrever Áudio VIP">
                    <i data-lucide="mic" class="w-3 h-3 text-amber-700"></i>
                    <span>Prescrever</span>
                  </button>
                  <a href="curso.html?curso=mentoria-${s.id}" target="_blank" class="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500 hover:text-slate-950 text-amber-900 border border-amber-300 text-[11px] font-bold transition inline-flex items-center gap-1" title="Ver Vitrine do Curso do Mentorado">
                    <i data-lucide="book-open" class="w-3 h-3"></i>
                    <span>Sala VIP</span> <span>↗</span>
                  </a>
                  <a href="admin-cursos.html?curso=mentoria-${s.id}" target="_blank" class="p-1.5 rounded-lg bg-white/80 hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 transition" title="Editar Aulas & Módulos no Course Studio">
                    <i data-lucide="layers" class="w-3.5 h-3.5"></i>
                  </a>
                  <a href="treino/player.html?aluno=${s.id}" target="_blank" class="px-2 py-1 rounded-lg bg-slate-900 hover:bg-amber-50 hover:text-amber-900 text-white text-[11px] font-bold transition inline-flex items-center gap-1" title="Abrir Player no Celular">
                    <span>Player</span> <span>↗</span>
                  </a>
                ` : `
                  <button onclick="openCreateVipSpaceModal('${s.id}', '${(s.name || '').replace(/'/g, "\\'")}', '${s.email}')" class="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer" title="Criar Curso e Sala do Mentorado no Banco de Dados">
                    <i data-lucide="sparkles" class="w-3 h-3 text-amber-600"></i>
                    <span>Gerar Sala VIP</span>
                  </button>
                `) : ''}"""

if old_buttons in content:
    content = content.replace(old_buttons, new_buttons)
else:
    print("Could not find old buttons block to replace!")

with open('admin-alunos.html', 'w') as f:
    f.write(content)

print("Replaced successfully")
