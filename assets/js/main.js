// AgoraEuFalo - Interatividades da Home

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar Ícones Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Formulário de Captura de Lead
  const leadForm = document.getElementById('lead-form');
  const leadInput = document.getElementById('lead-input');
  const leadFeedback = document.getElementById('lead-feedback');
  const leadSubmitBtn = document.getElementById('lead-submit-btn');

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = leadInput ? leadInput.value.trim() : '';
      if (!val) return;

      // Estado de carregamento
      if (leadSubmitBtn) {
        leadSubmitBtn.disabled = true;
        leadSubmitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          Enviando...
        `;
      }

      setTimeout(() => {
        if (leadForm) leadForm.classList.add('hidden');
        if (leadFeedback) {
          leadFeedback.classList.remove('hidden');
          leadFeedback.classList.add('flex');
        }
      }, 700);
    });
  }

  // 3. Player de Vídeo / Modal Didática
  const videoCover = document.getElementById('video-cover');
  const videoEmbedContainer = document.getElementById('video-embed-container');
  const playBtn = document.getElementById('play-video-btn');

  function startVideo() {
    if (videoCover && videoEmbedContainer) {
      videoCover.classList.add('hidden');
      videoEmbedContainer.classList.remove('hidden');
      // Inserir iframe ou vídeo quando houver URL real
      videoEmbedContainer.innerHTML = `
        <div class="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white p-8 text-center">
          <div class="w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
          </div>
          <h4 class="text-xl font-bold mb-2">Vídeo Demonstrativo da Didática</h4>
          <p class="text-slate-400 text-sm max-w-md mb-4">Insira o link oficial do YouTube ou Vimeo do Professor Leonardo Leite para reprodução imediata.</p>
          <span class="inline-flex items-center text-xs text-amber-400/80 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
            Espaço reservado para o vídeo da Metodologia
          </span>
        </div>
      `;
    }
  }

  if (playBtn) {
    playBtn.addEventListener('click', startVideo);
  }
  if (videoCover) {
    videoCover.addEventListener('click', startVideo);
  }

  // 4. Smooth scroll para âncoras
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
});
