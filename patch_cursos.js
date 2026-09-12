const fs = require('fs');

let cursosHTML = fs.readFileSync('cursos.html', 'utf8');

const checkoutModalHTML = `
  <!-- MODAL POPUP DE CHECKOUT INTERNO (HOTMART IN-PAGE POPUP)                  -->
  <!-- ========================================================================= -->
  <div 
    id="checkout-modal" 
    class="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md hidden items-center justify-center px-3 sm:px-4 md:px-6 opacity-0 transition-opacity duration-300"
    style="padding-top: max(3.5rem, env(safe-area-inset-top, 3rem)); padding-bottom: max(1.5rem, env(safe-area-inset-bottom, 1rem));"
  >
    <div class="relative w-full max-w-4xl h-[86vh] sm:h-[92vh] max-h-[850px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
      
      <!-- Header da Janela de Checkout -->
      <div class="h-14 px-4 sm:px-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div class="flex items-center gap-2 sm:gap-3">
          <span class="font-extrabold text-sm sm:text-base text-white tracking-tight">
            AgoraEuFalo<span class="text-brand-accent">.</span>
          </span>
          <span class="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-bold border border-emerald-500/30">
            <i data-lucide="shield-check" class="w-3 h-3 sm:w-3.5 sm:h-3.5"></i>
            <span>Ambiente Seguro (SSL)</span>
          </span>
        </div>
        
        <div class="flex items-center gap-2">
          <a 
            href="https://pay.hotmart.com/T107479074N?off=mgwnab3h&src=popup_fallback" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="text-xs text-slate-400 hover:text-amber-300 hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-amber-400/50 transition-colors"
          >
            <span>Abrir em aba externa</span>
            <i data-lucide="external-link" class="w-3 h-3"></i>
          </a>
          <button 
            type="button" 
            id="close-checkout-modal"
            class="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-white flex items-center justify-center border border-slate-700 transition-all cursor-pointer"
            aria-label="Fechar Checkout"
          >
            <i data-lucide="x" class="w-5 h-5 sm:w-4 sm:h-4"></i>
          </button>
        </div>
      </div>

      <!-- Container do Iframe do Checkout da Hotmart -->
      <div class="relative w-full flex-grow bg-slate-50 overflow-hidden" id="checkout-iframe-container">
        <!-- O iframe do checkout será injetado dinamicamente no clique -->
      </div>

    </div>
  </div>
`;

if (!cursosHTML.includes('checkout-modal')) {
    // Insert just before <script> tags at the end of the body
    cursosHTML = cursosHTML.replace('  <script>', checkoutModalHTML + '\n  <script>');
    
    // Also we need to inject the logic into the DOMContentLoaded event in cursos.html
    const scriptLogic = `
    // Checkout Modal Logic
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckoutModalBtn = document.getElementById('close-checkout-modal');
    const checkoutIframeContainer = document.getElementById('checkout-iframe-container');
    const checkoutTriggers = document.querySelectorAll('[data-open-checkout="true"]');

    function openCheckoutModal(checkoutUrl) {
      if (!checkoutModal || !checkoutIframeContainer) return;
      const url = checkoutUrl || 'https://pay.hotmart.com/T107479074N?off=mgwnab3h&src=popup_site';
      checkoutIframeContainer.innerHTML = \`
        <iframe 
          class="w-full h-full border-0" 
          src="\${url}" 
          title="Checkout Seguro Hotmart" 
          allow="payment"
        ></iframe>
      \`;
      checkoutModal.classList.remove('hidden');
      checkoutModal.classList.add('flex');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        checkoutModal.classList.remove('opacity-0');
        checkoutModal.classList.add('opacity-100');
      });
    }

    function closeCheckoutModal() {
      if (!checkoutModal || !checkoutIframeContainer) return;
      checkoutModal.classList.remove('opacity-100');
      checkoutModal.classList.add('opacity-0');
      setTimeout(() => {
        checkoutModal.classList.remove('flex');
        checkoutModal.classList.add('hidden');
        checkoutIframeContainer.innerHTML = '';
        document.body.style.overflow = '';
      }, 250);
    }

    checkoutTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const href = trigger.getAttribute('href');
        openCheckoutModal(href);
      });
    });

    if (closeCheckoutModalBtn) {
      closeCheckoutModalBtn.addEventListener('click', closeCheckoutModal);
    }
    if (checkoutModal) {
      checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
          closeCheckoutModal();
        }
      });
    }
    `;

    // inject script inside the init block
    cursosHTML = cursosHTML.replace('// Simulate network delay', scriptLogic + '\n      // Simulate network delay');
    
    fs.writeFileSync('cursos.html', cursosHTML);
    console.log('patched');
} else {
    console.log('already patched');
}
