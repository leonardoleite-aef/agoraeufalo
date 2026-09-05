/**
 * =========================================================================
 * AgoraEuFalo • Universal Hotmart Checkout Modal Engine
 * Professor Leonardo Leite
 * =========================================================================
 * Abre qualquer link de checkout da Hotmart em modal interno de luxo (in-page popup),
 * sem redirecionar ou tirar o aluno do portal / plataforma de estudos.
 * 
 * Funcionalidades:
 * 1. Auto-injeção no DOM: Não precisa duplicar o HTML do modal em cada página;
 * 2. Intercepção Automática: Detecta cliques em links da Hotmart (pay.hotmart.com) ou [data-open-checkout="true"];
 * 3. Loading Seguro: Exibe feedback visual elegante enquanto o checkout carrega;
 * 4. Resiliência: Botão "Abrir em aba externa" como fallback no cabeçalho;
 * 5. Acessibilidade: Fechamento com tecla ESC, clique no backdrop ou botão 'X'.
 * =========================================================================
 */

(function (window) {
  'use strict';

  class AEFCheckoutModal {
    constructor() {
      this.modalId = 'checkout-modal';
      this.iframeContainerId = 'checkout-iframe-container';
      this.externalLinkId = 'checkout-modal-external-link';
      this.closeBtnId = 'close-checkout-modal';
      this.loadingId = 'checkout-iframe-loading';
      this.isInitialized = false;
      this.currentUrl = '';
    }

    /**
     * Garante que o modal exista no DOM
     */
    ensureModalInDOM() {
      let modal = document.getElementById(this.modalId);
      if (modal) {
        this.attachEvents(modal);
        return modal;
      }

      // Injeta o modal oficial com padrão nobre Deep Navy / SSL / Calm EdTech
      const modalHtml = `
        <div 
          id="${this.modalId}" 
          class="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md hidden items-center justify-center px-3 sm:px-4 md:px-6 opacity-0 transition-opacity duration-300"
          style="padding-top: max(3.5rem, env(safe-area-inset-top, 3rem)); padding-bottom: max(1.5rem, env(safe-area-inset-bottom, 1rem));"
        >
          <div class="relative w-full max-w-4xl h-[86vh] sm:h-[92vh] max-h-[850px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            
            <!-- Header da Janela de Checkout -->
            <div class="h-14 px-4 sm:px-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 select-none">
              <div class="flex items-center gap-2 sm:gap-3">
                <span class="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  AgoraEuFalo<span class="text-amber-400">.</span>
                </span>
                <span class="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-bold border border-emerald-500/30">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                  <span>Ambiente Seguro (SSL)</span>
                </span>
              </div>
              
              <div class="flex items-center gap-2">
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  id="${this.externalLinkId}"
                  data-bypass-checkout-modal="true"
                  class="text-xs text-slate-400 hover:text-amber-300 hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-amber-400/50 transition-colors cursor-pointer"
                  title="Caso prefira pagar em uma janela externa"
                >
                  <span>Abrir em aba externa</span>
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 3h6v6"/><path d="10 14 11-11"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  </svg>
                </a>
                <button 
                  type="button" 
                  id="${this.closeBtnId}"
                  class="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-white flex items-center justify-center border border-slate-700 transition-all cursor-pointer"
                  aria-label="Fechar Checkout"
                >
                  <svg class="w-5 h-5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Container do Iframe do Checkout da Hotmart -->
            <div class="relative w-full flex-grow bg-slate-900 overflow-hidden flex flex-col" id="${this.iframeContainerId}">
              <!-- Iframe e loader inseridos dinamicamente -->
            </div>

          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHtml);
      modal = document.getElementById(this.modalId);
      this.attachEvents(modal);
      return modal;
    }

    /**
     * Vincula ouvintes de fechamento (Botão, Backdrop e Tecla ESC)
     */
    attachEvents(modal) {
      if (!modal) return;
      const closeBtn = document.getElementById(this.closeBtnId);
      if (closeBtn && !closeBtn.dataset.aefBound) {
        closeBtn.dataset.aefBound = "true";
        closeBtn.onclick = () => this.close();
      }

      if (!modal.dataset.aefBound) {
        modal.dataset.aefBound = "true";
        modal.onclick = (e) => {
          if (e.target === modal) {
            this.close();
          }
        };
      }

      if (!this.escBound) {
        this.escBound = true;
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            const m = document.getElementById(this.modalId);
            if (m && !m.classList.contains('hidden')) {
              this.close();
            }
          }
        });
      }
    }

    /**
     * Abre o modal com a URL fornecida
     */
    open(url) {
      if (!url) {
        console.warn("[AEFCheckoutModal] Nenhuma URL de checkout fornecida.");
        return;
      }

      this.currentUrl = url;
      const modal = this.ensureModalInDOM();
      const container = document.getElementById(this.iframeContainerId);
      const extLink = document.getElementById(this.externalLinkId);

      if (extLink) {
        extLink.href = url;
      }

      // Injeta tela de loading + Iframe
      if (container) {
        container.innerHTML = `
          <div id="${this.loadingId}" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white z-10 space-y-3 transition-opacity duration-300">
            <div class="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs font-bold text-amber-300 font-mono tracking-wider">Carregando ambiente seguro de pagamento...</p>
            <p class="text-[11px] text-slate-400">Processado via Hotmart Oficial</p>
          </div>
          <iframe 
            id="aef-checkout-iframe"
            class="w-full h-full border-0 bg-white" 
            src="${url}" 
            title="Checkout Seguro Hotmart" 
            allow="payment; camera; microphone; geolocation"
            loading="eager"
          ></iframe>
        `;

        const iframe = document.getElementById('aef-checkout-iframe');
        if (iframe) {
          iframe.onload = () => {
            const loader = document.getElementById(this.loadingId);
            if (loader) {
              loader.classList.add('opacity-0');
              setTimeout(() => {
                if (loader.parentNode) loader.remove();
              }, 300);
            }
          };
        }
      }

      // Animação de entrada
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';

      requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
      });
    }

    /**
     * Fecha o modal e limpa o iframe
     */
    close() {
      const modal = document.getElementById(this.modalId);
      const container = document.getElementById(this.iframeContainerId);
      if (!modal) return;

      modal.classList.remove('opacity-100');
      modal.classList.add('opacity-0');

      setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        if (container) container.innerHTML = '';
        document.body.style.overflow = '';
      }, 250);
    }

    /**
     * Inicia a delegação global de cliques para automação 100% zero-touch
     */
    initClickDelegation() {
      if (this.isInitialized) return;
      this.isInitialized = true;

      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('a[href*="pay.hotmart.com"], [data-open-checkout="true"], [data-aef-checkout="true"]');
        if (!trigger) return;

        // Se o elemento for o botão de aba externa ou tiver bypass explícito, deixa o navegador seguir normalmente
        if (trigger.id === this.externalLinkId || trigger.getAttribute('data-bypass-checkout-modal') === 'true') {
          return;
        }

        const url = trigger.getAttribute('data-checkout-url') || trigger.getAttribute('href');
        if (url && (url.includes('pay.hotmart.com') || trigger.hasAttribute('data-open-checkout') || trigger.hasAttribute('data-aef-checkout'))) {
          e.preventDefault();
          this.open(url);
        }
      });
    }
  }

  // Instância Singleton e Exportação Global
  const instance = new AEFCheckoutModal();
  window.aefCheckoutModal = instance;

  // Funções Globais Diretas
  window.aefOpenCheckout = (url) => instance.open(url);
  window.aefCloseCheckout = () => instance.close();
  window.openCheckoutModal = (url) => instance.open(url);
  window.closeCheckoutModal = () => instance.close();

  // Inicializa delegação quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => instance.initClickDelegation());
  } else {
    instance.initClickDelegation();
  }

})(window);
