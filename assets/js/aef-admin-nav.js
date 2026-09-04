/**
 * AgoraEuFalo - Unified Master Admin Navigation Bar (Adaptive Theme Edition)
 * Professor Leonardo Leite
 * 
 * Seamless 1-click navigation across all 7 Backoffice tools with auto-theme adaptation (Dark/Light).
 */

(function () {
  'use strict';

  // Destrói imediatamente qualquer overlay de senha legado vindo do cache do navegador
  try {
    sessionStorage.setItem("AEF_MASTER_SESSION_AUTH", "true");
    const killLegacyGate = () => {
      const ov = document.getElementById('aef-auth-gate-overlay');
      if (ov) ov.remove();
      const st = document.getElementById('aef-gate-style');
      if (st) st.remove();
    };
    killLegacyGate();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', killLegacyGate);
    }
    setTimeout(killLegacyGate, 100);
    setTimeout(killLegacyGate, 500);
  } catch (e) {}

  class AEFAdminNav {
    constructor() {
      this.currentPath = window.location.pathname.split('/').pop() || 'admin-alunos.html';
      this.saveAdminLocation();
      this.init();
    }

    saveAdminLocation() {
      try {
        if (this.currentPath !== 'admin.html') {
          const toolNames = {
            'admin-alunos.html': 'Alunos & CRM',
            'admin-vendas.html': 'Vendas & Checkouts',
            'admin-marketing.html': 'Marketing & Blocos',
            'admin-ofertas.html': 'Ofertas & Trials',
            'admin-cursos.html': 'Course Studio',
            'admin-pdf-factory.html': 'PDF Factory',
            'tts-studio.html': 'TTS Voice Studio',
            'admin-publico.html': 'Leads & Sugestões',
            'blog-panel.html': 'Blog CMS',
            'seo-manager.html': 'SEO Manager'
          };
          const name = toolNames[this.currentPath] || this.currentPath;
          localStorage.setItem('aef_admin_last_tool_url', this.currentPath);
          localStorage.setItem('aef_admin_last_tool_name', name);
          localStorage.setItem('aef_admin_last_tool_time', Date.now());
        }
      } catch (e) {}
    }

    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.render());
      } else {
        this.render();
      }
    }

    isDarkTheme() {
      const darkPages = ['admin-cursos.html', 'admin-vendas.html', 'admin-marketing.html', 'admin-ofertas.html', 'tts-studio.html', 'admin-publico.html', 'admin-pdf-factory.html'];
      return darkPages.some(p => this.currentPath.includes(p)) || document.body.classList.contains('bg-[#060D17]') || document.body.classList.contains('bg-[#0A192F]') || document.body.classList.contains('bg-[#0B0F17]') || document.body.classList.contains('bg-[#080D1A]');
    }

    render() {
      let container = document.getElementById('aef-admin-header-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'aef-admin-header-container';
        document.body.insertBefore(container, document.body.firstChild);
      }

      const isDark = this.isDarkTheme();

      const active = (page) => {
        const isCur = this.currentPath.includes(page);
        if (isDark) {
          return isCur 
            ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
            : 'text-slate-300 hover:text-white hover:bg-white/10 font-bold';
        } else {
          return isCur 
            ? 'bg-slate-900 text-white font-bold shadow-sm' 
            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 font-bold';
        }
      };

      const headerBg = isDark 
        ? 'bg-[#0A192F]/95 border-b border-white/10 text-white' 
        : 'bg-white/90 border-b border-slate-200/80 text-slate-900';

      const logoFilter = isDark ? '' : 'filter invert opacity-90';

      container.innerHTML = `
        <header class="${headerBg} backdrop-blur-xl sticky top-0 z-50 shadow-md">
          <div class="max-w-[98vw] 2xl:max-w-[1920px] mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-3">
            
            <!-- Left: Brand & Admin Label -->
            <div class="flex items-center gap-2.5 shrink-0">
              <a href="admin.html" class="flex items-center gap-2" title="Voltar ao Hub Central de Comando">
                <img src="assets/images/AEF-Logo_2026_fundo_escuro-800x300.png" alt="AgoraEuFalo" class="h-6 sm:h-7 object-contain ${logoFilter} hover:opacity-100 transition">
              </a>
              <a href="admin.html" class="px-2 py-0.5 rounded-full ${isDark ? 'bg-amber-500 text-slate-950' : 'bg-amber-100 text-amber-900 border border-amber-300'} font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider hover:opacity-90 transition">
                ADMIN HUB
              </a>
              ${(() => {
                const lastUrl = localStorage.getItem('aef_admin_last_tool_url');
                const lastName = localStorage.getItem('aef_admin_last_tool_name');
                if (this.currentPath === 'admin.html' && lastUrl && lastUrl !== 'admin.html') {
                  return `
                    <a href="${lastUrl}" class="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold hover:bg-emerald-500 hover:text-slate-950 transition" title="Continuar de onde parou no Admin">
                      <span>↩ Retomar:</span>
                      <span class="font-extrabold">${lastName || 'Última Ferramenta'}</span>
                    </a>
                  `;
                }
                return '';
              })()}
            </div>

            <!-- Center: Navigation Links Across All 7 Tools -->
            <nav class="hidden lg:flex items-center gap-1 overflow-x-auto py-1 text-xs">
              <a href="admin.html" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('admin.html')}">
                <span>🏛️</span> <span>Hub Central</span>
              </a>
              <a href="admin-alunos.html" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('admin-alunos.html')}">
                <span>👥</span> <span>Alunos & CRM</span>
              </a>
              <a href="admin-vendas.html" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('admin-vendas.html')}">
                <span>⚡</span> <span>Vendas</span>
              </a>
              <a href="admin-marketing.html" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('admin-marketing.html')}">
                <span>🎯</span> <span>Marketing</span>
              </a>
              <a href="admin-cursos.html" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('admin-cursos.html')}">
                <span>📦</span> <span>Course Studio</span>
              </a>
              <a href="admin-pdf-factory.html" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('admin-pdf-factory.html')}">
                <span>📄</span> <span>PDF Factory</span>
              </a>
              <a href="tts-studio.html" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('tts-studio.html')}">
                <span>🎙️</span> <span>TTS Studio</span>
              </a>
              <a href="admin-publico.html" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('admin-publico.html')}">
                <span>🌐</span> <span>Leads & Sugestões</span>
              </a>
              <a href="blog-panel.html" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('blog-panel.html')}">
                <span>📝</span> <span>Blog CMS</span>
              </a>
              <a href="seo-manager.html" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('seo-manager.html')}">
                <span>🔍</span> <span>SEO</span>
              </a>
            </nav>

            <!-- Right: View as Student & Master Profile Actions -->
            <div class="flex items-center gap-2 shrink-0">
              
              <!-- Seletor God-Mode: Ver como Aluno -->
              <div class="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-100 border border-slate-200'} text-xs">
                <span class="text-[10px] font-bold ${isDark ? 'text-amber-400' : 'text-amber-800'} uppercase tracking-wider flex items-center gap-1">
                  <span>👁️</span> <span class="hidden xl:inline">Ver como:</span>
                </span>
                <select id="aef-admin-impersonate-select" onchange="AEFAdminNav.handleImpersonate(this.value)" class="bg-transparent font-bold text-[11px] ${isDark ? 'text-slate-200' : 'text-slate-800'} focus:outline-none cursor-pointer">
                  <option value="admin_master" class="bg-slate-900 text-amber-300">👑 Leo (God Mode)</option>
                  <option value="free" class="bg-slate-900 text-slate-100">🌱 Aluno Free</option>
                  <option value="first_steps_free" class="bg-slate-900 text-emerald-300 font-bold">🎁 Ex-Aluno First Steps (Tier Free)</option>
                  <option value="club_annual" class="bg-slate-900 text-slate-100">🎓 Membro Club</option>
                  <optgroup label="👑 Mentorados VIP" class="bg-slate-900 text-amber-400">
                    <option value="vip:andre" class="bg-slate-900 text-slate-100">André (VIP)</option>
                    <option value="vip:estevao" class="bg-slate-900 text-slate-100">Estêvão (VIP)</option>
                    <option value="vip:thomas" class="bg-slate-900 text-slate-100">Thomas (VIP)</option>
                    <option value="vip:matheus" class="bg-slate-900 text-slate-100">Matheus (VIP)</option>
                  </optgroup>
                </select>
              </div>

              <!-- Switch to Student View Button -->
              <a href="portal.html" class="px-2.5 sm:px-3 py-1.5 rounded-xl ${isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 hover:bg-amber-500 hover:text-slate-950' : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-200'} font-bold text-xs transition flex items-center gap-1.5" title="Abrir Portal do Aluno">
                <span>Portal ↗</span>
              </a>

              <!-- Master Profile Avatar -->
              <div class="flex items-center gap-1.5">
                <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-950 flex items-center justify-center font-black text-xs shadow-sm">
                  PL
                </div>
                <span class="hidden 2xl:inline text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}">Prof. Leo</span>
              </div>
            </div>

          </div>

          <!-- Mobile Sub-Navigation Bar (Scrollable) -->
          <div class="lg:hidden px-3 py-1.5 border-t ${isDark ? 'border-white/10 bg-[#0A192F]' : 'border-slate-200/80 bg-white'} flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <a href="admin.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('admin.html')}">🏛️ Hub</a>
            <a href="admin-alunos.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('admin-alunos.html')}">👥 Alunos</a>
            <a href="admin-vendas.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('admin-vendas.html')}">⚡ Vendas</a>
            <a href="admin-marketing.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('admin-marketing.html')}">🎯 Marketing</a>
            <a href="admin-cursos.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('admin-cursos.html')}">📦 Cursos</a>
            <a href="admin-pdf-factory.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('admin-pdf-factory.html')}">📄 PDF</a>
            <a href="tts-studio.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('tts-studio.html')}">🎙️ TTS</a>
            <a href="admin-publico.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('admin-publico.html')}">🌐 Leads</a>
            <a href="blog-panel.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('blog-panel.html')}">📝 Blog</a>
            <a href="seo-manager.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('seo-manager.html')}">🔍 SEO</a>
            <a href="portal.html" class="px-2.5 py-1 rounded-lg shrink-0 text-amber-500 font-bold">👁️ Aluno</a>
          </div>
        </header>
      `;

      // Sincroniza valor atual do impersonate
      try {
        const rawImp = sessionStorage.getItem('aef_impersonate_state') || localStorage.getItem('aef_impersonate_state');
        if (rawImp) {
          const imp = JSON.parse(rawImp);
          const sel = document.getElementById('aef-admin-impersonate-select');
          if (sel) {
            if (imp.tier === 'vip' && imp.studentId) {
              sel.value = `vip:${imp.studentId}`;
            } else {
              sel.value = imp.tier || 'free';
            }
          }
        }
      } catch (e) {}
    }

    static handleImpersonate(val) {
      if (val === 'admin_master') {
        sessionStorage.removeItem('aef_impersonate_state');
        try { localStorage.removeItem('aef_impersonate_state'); } catch(e) {}
        if (window.aefPortalAuth) {
          try { window.aefPortalAuth.clearImpersonation(); return; } catch(e) {}
        }
        window.location.reload();
        return;
      }

      let stateObj = null;
      if (val === 'first_steps_free') {
        stateObj = {
          tier: 'free',
          preset: 'first_steps_free',
          studentId: 'ex_aluno_first_steps',
          studentName: 'Ex-Aluno First Steps',
          studentEmail: 'exaluno@resgate.agoraeufalo.com.br',
          enrolledProducts: ['first-steps', 'english-quickstart'],
          active: true,
          timestamp: Date.now()
        };
      } else if (val.startsWith('vip:')) {
        const sId = val.replace('vip:', '');
        const names = { andre: 'André Barrote', estevao: 'Estêvão', thomas: 'Thomas', matheus: 'Matheus' };
        stateObj = {
          tier: 'vip',
          studentId: sId,
          studentName: names[sId] || (sId.charAt(0).toUpperCase() + sId.slice(1)),
          studentEmail: `${sId}@vip.agoraeufalo.com.br`,
          active: true,
          timestamp: Date.now()
        };
      } else {
        stateObj = {
          tier: val,
          studentId: null,
          studentName: val === 'free' ? 'Aluno Free' : 'Membro Club',
          studentEmail: `aluno-${val}@simulado.agoraeufalo.com.br`,
          active: true,
          timestamp: Date.now()
        };
      }

      sessionStorage.setItem('aef_impersonate_state', JSON.stringify(stateObj));
      try { localStorage.setItem('aef_impersonate_state', JSON.stringify(stateObj)); } catch(e) {}

      // Redireciona sempre para o portal para visualização imediata da experiência do aluno
      window.location.href = 'portal.html';
    }
  }

  window.AEFAdminNav = AEFAdminNav;
  window.aefAdminNav = new AEFAdminNav();
})();
