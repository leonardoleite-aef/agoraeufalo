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
      const p = window.location.pathname.replace(/^\/+|\/+$/g, '');
      this.currentPath = p || 'admin';
      this.saveAdminLocation();
      this.init();
      this.enforceAdminAuth();
    }

    async enforceAdminAuth() {
      const p = window.location.pathname.toLowerCase();
      if (p.includes('admin-login') || p.includes('/login')) return;

      // Aguarda o aefPortalAuth inicializar se necessário
      let attempts = 0;
      while (!window.aefPortalAuth && attempts < 30) {
        await new Promise(r => setTimeout(r, 50));
        attempts++;
      }

      if (window.aefPortalAuth) {
        try {
          await window.aefPortalAuth.ready();
          await window.aefPortalAuth.requireAuth({ requireAdmin: true });
        } catch (e) {
          console.warn("🔒 [AEFAdminNav] Erro ao verificar autenticação de admin:", e);
        }
      } else {
        const loginUrl = window.AEFDomainRouter ? window.AEFDomainRouter.getAdminUrl('login') : 'https://admin.agoraeufalo.com.br/login';
        window.location.replace(loginUrl);
      }
    }

    saveAdminLocation() {
      try {
        if (this.currentPath !== 'admin' && this.currentPath !== 'admin.html' && this.currentPath !== '') {
          const toolNames = {
            'alunos': 'Alunos & CRM',
            'admin-alunos': 'Alunos & CRM',
            'admin-alunos.html': 'Alunos & CRM',
            'vendas': 'Vendas & Checkouts',
            'admin-vendas': 'Vendas & Checkouts',
            'admin-vendas.html': 'Vendas & Checkouts',
            'webhooks': 'Webhooks & Automação',
            'admin-webhooks': 'Webhooks & Automação',
            'admin-webhooks.html': 'Webhooks & Automação',
            'marketing': 'Marketing & Blocos',
            'admin-marketing': 'Marketing & Blocos',
            'admin-marketing.html': 'Marketing & Blocos',
            'ofertas': 'Ofertas & Trials',
            'admin-ofertas': 'Ofertas & Trials',
            'admin-ofertas.html': 'Ofertas & Trials',
            'cursos': 'Course Factory',
            'admin-cursos': 'Course Factory',
            'admin-cursos.html': 'Course Factory',
            'pdf-factory': 'PDF Factory',
            'admin-pdf-factory': 'PDF Factory',
            'admin-pdf-factory.html': 'PDF Factory',
            'tts': 'TTS Voice Studio',
            'tts-studio': 'TTS Voice Studio',
            'tts-studio.html': 'TTS Voice Studio',
            'blog': 'Blog CMS',
            'blog-panel': 'Blog CMS',
            'blog-panel.html': 'Blog CMS',
            'seo': 'SEO Manager',
            'seo-manager': 'SEO Manager',
            'seo-manager.html': 'SEO Manager'
          };
          const name = toolNames[this.currentPath] || this.currentPath;
          localStorage.setItem('aef_admin_last_tool_url', `/${this.currentPath.replace('.html', '').replace(/^admin-/, '')}`);
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
      const darkPages = ['cursos', 'admin-cursos', 'vendas', 'admin-vendas', 'webhooks', 'admin-webhooks', 'marketing', 'admin-marketing', 'ofertas', 'admin-ofertas', 'tts', 'tts-studio', 'pdf-factory', 'admin-pdf-factory'];
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
        const isCur = (page === 'admin' && (this.currentPath === 'admin' || this.currentPath === 'admin.html' || this.currentPath === '')) 
          || (page !== 'admin' && this.currentPath.includes(page));
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
              <a href="/" class="flex items-center gap-2" title="Voltar ao Hub Central de Comando">
                <img src="assets/images/AEF-Logo_2026_fundo_escuro-800x300.png" alt="AgoraEuFalo" class="h-6 sm:h-7 object-contain ${logoFilter} hover:opacity-100 transition">
              </a>
              <a href="/" class="px-2 py-0.5 rounded-full ${isDark ? 'bg-amber-500 text-slate-950' : 'bg-amber-100 text-amber-900 border border-amber-300'} font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider hover:opacity-90 transition">
                ADMIN HUB
              </a>
              ${(() => {
                const lastUrl = localStorage.getItem('aef_admin_last_tool_url');
                const lastName = localStorage.getItem('aef_admin_last_tool_name');
                if ((this.currentPath === 'admin' || this.currentPath === 'admin.html' || this.currentPath === '') && lastUrl && lastUrl !== '/' && lastUrl !== '/admin') {
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
              <a href="/" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('admin')}">
                <span>🏛️</span> <span>Hub Central</span>
              </a>
              <a href="/alunos" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('alunos')}">
                <span>👥</span> <span>Alunos & CRM</span>
              </a>
              <a href="/vendas" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('vendas')}">
                <span>⚡</span> <span>Vendas</span>
              </a>
              <a href="/webhooks" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('webhooks')}">
                <span>🔗</span> <span>Webhooks</span>
              </a>
              <a href="/marketing" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('marketing')}">
                <span>🎯</span> <span>Marketing</span>
              </a>
              <a href="/cursos" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('cursos')}">
                <span>🏭</span> <span>Course Factory</span>
              </a>
              <a href="/pdf-factory" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('pdf-factory')}">
                <span>📄</span> <span>PDF Factory</span>
              </a>
              <a href="/tts" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('tts')}">
                <span>🎙️</span> <span>TTS Studio</span>
              </a>
              <a href="/blog" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('blog')}">
                <span>📝</span> <span>Blog CMS</span>
              </a>
              <a href="/seo" class="px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${active('seo')}">
                <span>🔍</span> <span>SEO</span>
              </a>
            </nav>

            <!-- Right: View as Student & Master Profile Actions -->
            <div class="flex items-center gap-2 shrink-0">
              
              <!-- Switch to Student View Button -->
              <a href="${window.AEFDomainRouter ? window.AEFDomainRouter.getAppUrl('portal') : 'portal'}" class="px-2.5 sm:px-3 py-1.5 rounded-xl ${isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 hover:bg-amber-500 hover:text-slate-950' : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-200'} font-bold text-xs transition flex items-center gap-1.5" title="Abrir Portal do Aluno">
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
            <a href="/" class="px-2.5 py-1 rounded-lg shrink-0 ${active('admin')}">🏛️ Hub</a>
            <a href="/alunos" class="px-2.5 py-1 rounded-lg shrink-0 ${active('alunos')}">👥 Alunos</a>
            <a href="/vendas" class="px-2.5 py-1 rounded-lg shrink-0 ${active('vendas')}">⚡ Vendas</a>
            <a href="/webhooks" class="px-2.5 py-1 rounded-lg shrink-0 ${active('webhooks')}">🔗 Webhooks</a>
            <a href="/marketing" class="px-2.5 py-1 rounded-lg shrink-0 ${active('marketing')}">🎯 Marketing</a>
            <a href="/cursos" class="px-2.5 py-1 rounded-lg shrink-0 ${active('cursos')}">📦 Cursos</a>
            <a href="/pdf-factory" class="px-2.5 py-1 rounded-lg shrink-0 ${active('pdf-factory')}">📄 PDF</a>
            <a href="/tts" class="px-2.5 py-1 rounded-lg shrink-0 ${active('tts')}">🎙️ TTS</a>
            <a href="/blog" class="px-2.5 py-1 rounded-lg shrink-0 ${active('blog')}">📝 Blog</a>
            <a href="/seo" class="px-2.5 py-1 rounded-lg shrink-0 ${active('seo')}">🔍 SEO</a>
            <a href="${window.AEFDomainRouter ? window.AEFDomainRouter.getAppUrl('portal') : 'portal'}" class="px-2.5 py-1 rounded-lg shrink-0 text-amber-500 font-bold">👁️ Aluno</a>
          </div>
        </header>
      `;
    }
  }

  window.AEFAdminNav = AEFAdminNav;
  window.aefAdminNav = new AEFAdminNav();
})();
