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
      this.init();
    }

    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.render());
      } else {
        this.render();
      }
    }

    isDarkTheme() {
      const darkPages = ['admin-cursos.html', 'admin-ofertas.html', 'tts-studio.html', 'admin-publico.html'];
      return darkPages.some(p => this.currentPath.includes(p)) || document.body.classList.contains('bg-[#060D17]') || document.body.classList.contains('bg-[#0A192F]') || document.body.classList.contains('bg-[#0B0F17]');
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
            </div>

            <!-- Center: Navigation Links Across All 7 Tools -->
            <nav class="hidden lg:flex items-center gap-1 overflow-x-auto py-1 text-xs">
              <a href="admin.html" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('admin.html')}">
                <span>🏛️</span> <span>Hub Central</span>
              </a>
              <a href="admin-alunos.html" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('admin-alunos.html')}">
                <span>👥</span> <span>Alunos & CRM</span>
              </a>
              <a href="admin-ofertas.html" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('admin-ofertas.html')}">
                <span>🎯</span> <span>Ofertas & Trials</span>
              </a>
              <a href="admin-cursos.html" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('admin-cursos.html')}">
                <span>📦</span> <span>Course Studio</span>
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
              <!-- Switch to Student View -->
              <a href="portal.html" class="px-2.5 sm:px-3 py-1.5 rounded-xl ${isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 hover:bg-amber-500 hover:text-slate-950' : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-200'} font-bold text-xs transition flex items-center gap-1.5" title="Ver como Aluno">
                <span>👁️</span> <span class="hidden sm:inline">Portal do Aluno ↗</span>
              </a>

              <!-- Master Profile Avatar -->
              <div class="flex items-center gap-1.5">
                <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-950 flex items-center justify-center font-black text-xs shadow-sm">
                  PL
                </div>
                <span class="hidden xl:inline text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}">Prof. Leo</span>
              </div>
            </div>

          </div>

          <!-- Mobile Sub-Navigation Bar (Scrollable) -->
          <div class="lg:hidden px-3 py-1.5 border-t ${isDark ? 'border-white/10 bg-[#0A192F]' : 'border-slate-200/80 bg-white'} flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <a href="admin.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('admin.html')}">🏛️ Hub</a>
            <a href="admin-alunos.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('admin-alunos.html')}">👥 Alunos</a>
            <a href="admin-ofertas.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('admin-ofertas.html')}">🎯 Ofertas</a>
            <a href="admin-cursos.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('admin-cursos.html')}">📦 Cursos</a>
            <a href="tts-studio.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('tts-studio.html')}">🎙️ TTS</a>
            <a href="admin-publico.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('admin-publico.html')}">🌐 Leads</a>
            <a href="blog-panel.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('blog-panel.html')}">📝 Blog</a>
            <a href="seo-manager.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('seo-manager.html')}">🔍 SEO</a>
            <a href="portal.html" class="px-2.5 py-1 rounded-lg shrink-0 text-amber-500 font-bold">👁️ Aluno</a>
          </div>
        </header>
      `;
    }
  }

  window.aefAdminNav = new AEFAdminNav();
})();
