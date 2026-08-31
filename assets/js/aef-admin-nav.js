/**
 * AgoraEuFalo - Unified Admin Navigation Bar (Glassmorphism Luminous Edition)
 * Professor Leonardo Leite
 * Seamless 1-click navigation across all Admin Tools with RBAC verification.
 */

(function () {
  'use strict';

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

    render() {
      let container = document.getElementById('aef-admin-header-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'aef-admin-header-container';
        document.body.insertBefore(container, document.body.firstChild);
      }

      const active = (page) => this.currentPath.includes(page) 
        ? 'bg-slate-900 text-white font-bold shadow-sm' 
        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 font-bold';

      container.innerHTML = `
        <header class="bg-white/85 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 shadow-sm">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
            
            <!-- Left: Brand & Admin Label -->
            <div class="flex items-center gap-3 shrink-0">
              <a href="admin-alunos.html" class="flex items-center gap-2">
                <img src="assets/images/AEF-Logo_2026_fundo_escuro-800x300.png" alt="AgoraEuFalo" class="h-7 object-contain filter invert opacity-90 hover:opacity-100 transition">
              </a>
              <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px] uppercase tracking-wider border border-amber-200">
                ADMIN COMMAND
              </span>
            </div>

            <!-- Center: Navigation Links -->
            <nav class="hidden lg:flex items-center gap-1.5 overflow-x-auto py-1">
              <a href="admin-alunos.html" class="px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 ${active('admin-alunos.html') ? 'bg-slate-900 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 font-bold'}">
                <span>👥</span> <span>Alunos & Mentoria</span>
              </a>
              <a href="admin-ofertas.html" class="px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 ${active('admin-ofertas.html')}">
                <span>🎯</span> <span>Ofertas & Trials</span>
              </a>
              <a href="tts-studio.html" class="px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 ${active('tts-studio.html')}">
                <span>🎙️</span> <span>TTS Studio</span>
              </a>
              <a href="admin-cursos.html" class="px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 ${active('admin-cursos.html')}">
                <span>📦</span> <span>Cursos & Módulos</span>
              </a>
              <a href="admin-publico.html" class="px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 ${active('admin-publico.html')}">
                <span>🌐</span> <span>Sugestões & Leads</span>
              </a>
              <a href="blog-panel.html" class="px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 ${active('blog-panel.html')}">
                <span>📝</span> <span>Blog Panel</span>
              </a>
            </nav>

            <!-- Right: View as Student & Profile Actions -->
            <div class="flex items-center gap-2.5 shrink-0">
              <!-- Switch to Student View -->
              <a href="portal.html" class="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 font-bold text-xs transition border border-amber-200 flex items-center gap-1.5" title="Ver como Aluno">
                <span>👁️</span> <span class="hidden sm:inline">Ver como Aluno</span>
              </a>

              <!-- Master Profile Avatar -->
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-950 flex items-center justify-center font-black text-xs shadow-sm">
                  PL
                </div>
                <span class="hidden md:inline text-xs font-bold text-slate-800">Prof. Leo</span>
              </div>
            </div>

          </div>

          <!-- Mobile Sub-Navigation Bar -->
          <div class="lg:hidden px-4 py-2 border-t border-slate-200/80 bg-white/95 flex items-center gap-2 overflow-x-auto text-[11px] scrollbar-none">
            <a href="admin-alunos.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('admin-alunos.html') ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'}">👥 Alunos</a>
            <a href="admin-ofertas.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('admin-ofertas.html')}">🎯 Ofertas</a>
            <a href="tts-studio.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('tts-studio.html')}">🎙️ TTS</a>
            <a href="admin-cursos.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('admin-cursos.html')}">📦 Cursos</a>
            <a href="admin-publico.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('admin-publico.html')}">🌐 Sugestões</a>
            <a href="blog-panel.html" class="px-2.5 py-1 rounded-lg shrink-0 ${active('blog-panel.html')}">📝 Blog</a>
            <a href="portal.html" class="px-2.5 py-1 rounded-lg shrink-0 text-amber-700 font-bold">👁️ Aluno</a>
          </div>
        </header>
      `;
    }
  }

  // Global instance
  window.aefAdminNav = new AEFAdminNav();
})();
