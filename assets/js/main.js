// AgoraEuFalo - Interatividades da Sales Page Oficial

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar Ícones Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Infográfico Interativo: O Ciclo Magic Stories (6 Vértices)
  const magicStepsData = [
    {
      id: 1,
      name: "Listen & Read",
      tag: "Entrada & Imersão",
      icon: "headphones",
      desc: "Imersão auditiva com texto e áudio sincronizados para conectar o som à grafia e absorver o ritmo nativo da história."
    },
    {
      id: 2,
      name: "Vocabulary",
      tag: "Estudo & Glossário",
      icon: "book-open",
      desc: "Compreensão aprofundada das palavras e expressões-chave em contexto real, sem decoreba de listas isoladas."
    },
    {
      id: 3,
      name: "Listen & Answer",
      tag: "Reflexo & Velocidade",
      icon: "zap",
      desc: "Perguntas rápidas e dinâmicas que condicionam o seu cérebro a responder no reflexo, eliminando a tradução mental."
    },
    {
      id: 4,
      name: "Look & Retell",
      tag: "Produção Própria",
      icon: "mic",
      desc: "Você reconta a história com suas próprias palavras a partir de estímulos visuais, ativando a musculatura da fala."
    },
    {
      id: 5,
      name: "Listen & Ask",
      tag: "Desafio de Formulação",
      icon: "message-circle",
      desc: "Inversão de postura: você é desafiado a formular perguntas estruturadas com agilidade e autonomia."
    },
    {
      id: 6,
      name: "Pronúncia",
      tag: "Musicalidade & Ritmo",
      icon: "volume-2",
      desc: "Calibração final de linked sounds (sons conectados), ritmo e entonação para uma fala natural e compreensível."
    }
  ];

  const vertexElements = document.querySelectorAll('.hex-vertex');
  const stepButtons = document.querySelectorAll('.cycle-step-btn');
  
  // Elementos Desktop
  const stepNameDesktop = document.getElementById('active-step-name-desktop');
  const stepTagDesktop = document.getElementById('active-step-tag-desktop');
  const stepDescDesktop = document.getElementById('active-step-desc-desktop');
  const stepNumberDesktop = document.getElementById('active-step-number-desktop');

  // Elementos Mobile
  const stepNameMobile = document.getElementById('active-step-name-mobile');
  const stepTagMobile = document.getElementById('active-step-tag-mobile');
  const stepDescMobile = document.getElementById('active-step-desc-mobile');
  const stepNumberMobile = document.getElementById('active-step-number-mobile');

  function updateActiveStep(stepIndex) {
    const step = magicStepsData[stepIndex - 1];
    if (!step) return;

    // Atualizar nós do SVG
    vertexElements.forEach(el => {
      if (parseInt(el.getAttribute('data-step')) === stepIndex) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Atualizar botões de navegação rápida (Desktop e Mobile)
    stepButtons.forEach(btn => {
      if (parseInt(btn.getAttribute('data-step')) === stepIndex) {
        btn.classList.add('active', 'bg-slate-900', 'text-white', 'border-amber-500');
        btn.classList.remove('bg-white', 'text-slate-700', 'border-slate-200');
      } else {
        btn.classList.remove('active', 'bg-slate-900', 'text-white', 'border-amber-500');
        btn.classList.add('bg-white', 'text-slate-700', 'border-slate-200');
      }
    });

    // Atualizar caixa de detalhes no Desktop
    if (stepNameDesktop) stepNameDesktop.textContent = `${step.id}. ${step.name}`;
    if (stepTagDesktop) stepTagDesktop.textContent = step.tag;
    if (stepDescDesktop) stepDescDesktop.textContent = step.desc;
    if (stepNumberDesktop) stepNumberDesktop.textContent = `Etapa 0${step.id} de 06`;

    // Atualizar caixa de detalhes no Mobile
    if (stepNameMobile) stepNameMobile.textContent = `${step.id}. ${step.name}`;
    if (stepTagMobile) stepTagMobile.textContent = step.tag;
    if (stepDescMobile) stepDescMobile.textContent = step.desc;
    if (stepNumberMobile) stepNumberMobile.textContent = `Etapa 0${step.id} de 06`;
  }

  // Eventos de clique e hover nos vértices do Hexágono
  vertexElements.forEach(el => {
    const stepId = parseInt(el.getAttribute('data-step'));
    el.addEventListener('mouseenter', () => updateActiveStep(stepId));
    el.addEventListener('click', () => updateActiveStep(stepId));
  });

  // Eventos de clique nos botões de passo
  stepButtons.forEach(btn => {
    const stepId = parseInt(btn.getAttribute('data-step'));
    btn.addEventListener('click', () => updateActiveStep(stepId));
    btn.addEventListener('mouseenter', () => updateActiveStep(stepId));
  });

  // 3. Acordeão do FAQ
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    if (header) {
      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });

        if (isActive) {
          item.classList.remove('active');
        } else {
          item.classList.add('active');
        }
      });
    }
  });

  // 4. Player de Vídeo / VSL no Topo
  const videoCover = document.getElementById('video-cover');
  const videoEmbedContainer = document.getElementById('video-embed-container');
  const playBtn = document.getElementById('play-video-btn');

  function startVideo() {
    if (videoCover && videoEmbedContainer) {
      videoCover.classList.add('hidden');
      videoEmbedContainer.classList.remove('hidden');
      videoEmbedContainer.innerHTML = `
        <div class="w-full h-full min-h-[320px] sm:min-h-[420px] flex flex-col items-center justify-center bg-slate-950 text-white p-8 text-center relative">
          <div class="w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
          </div>
          <h4 class="text-xl sm:text-2xl font-bold mb-2">Aula Magna: O Método AgoraEuFalo</h4>
          <p class="text-slate-400 text-sm max-w-md mb-5">
            Espaço reservado para o vídeo oficial (YouTube / Vimeo / Wistia / Panda Video) do Professor Leonardo Leite.
          </p>
          <span class="inline-flex items-center text-xs text-amber-400 font-semibold bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/30">
            A metodologia na prática: escuta ativa & destrave imediato
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

  // 5. Formulário de Captura de Lead
  const leadForm = document.getElementById('lead-form');
  const leadInput = document.getElementById('lead-input');
  const leadFeedback = document.getElementById('lead-feedback');
  const leadSubmitBtn = document.getElementById('lead-submit-btn');

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = leadInput ? leadInput.value.trim() : '';
      if (!val) return;

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

  // 6. Modal Lightbox de Vídeo (Depoimentos dos Alunos)
  const videoModal = document.getElementById('video-modal');
  const closeVideoModalBtn = document.getElementById('close-video-modal');
  const modalPlayerContainer = document.getElementById('modal-player-container');
  const videoTriggers = document.querySelectorAll('.video-facade, .open-video-btn');

  function openVideoModal(youtubeId) {
    if (!videoModal || !modalPlayerContainer || !youtubeId) return;

    modalPlayerContainer.innerHTML = `
      <iframe 
        class="w-full h-full" 
        src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1" 
        title="Depoimento Aluno AgoraEuFalo" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        allowfullscreen
      ></iframe>
    `;

    videoModal.classList.remove('hidden');
    videoModal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    // Fade in
    requestAnimationFrame(() => {
      videoModal.classList.remove('opacity-0');
      videoModal.classList.add('opacity-100');
    });
  }

  function closeVideoModal() {
    if (!videoModal || !modalPlayerContainer) return;

    videoModal.classList.remove('opacity-100');
    videoModal.classList.add('opacity-0');

    setTimeout(() => {
      videoModal.classList.remove('flex');
      videoModal.classList.add('hidden');
      modalPlayerContainer.innerHTML = '';
      document.body.style.overflow = '';
    }, 250);
  }

  videoTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const youtubeId = trigger.getAttribute('data-youtube-id');
      if (youtubeId) {
        openVideoModal(youtubeId);
      }
    });
  });

  if (closeVideoModalBtn) {
    closeVideoModalBtn.addEventListener('click', closeVideoModal);
  }

  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) {
        closeVideoModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal && !videoModal.classList.contains('hidden')) {
      closeVideoModal();
    }
  });

  // 7. Smooth scroll para âncoras internas
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

  // 8. Barra Fixa de Conversão Mobile (Sticky CTA)
  const stickyMobileCta = document.getElementById('sticky-mobile-cta');
  if (stickyMobileCta) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 420) {
        stickyMobileCta.classList.remove('translate-y-full');
      } else {
        stickyMobileCta.classList.add('translate-y-full');
      }
    }, { passive: true });
  }

  // 9. Modal Popup de Checkout Hotmart Interno
  const checkoutModal = document.getElementById('checkout-modal');
  const closeCheckoutModalBtn = document.getElementById('close-checkout-modal');
  const checkoutIframeContainer = document.getElementById('checkout-iframe-container');
  const checkoutTriggers = document.querySelectorAll('[data-open-checkout="true"]');

  function openCheckoutModal(checkoutUrl) {
    if (!checkoutModal || !checkoutIframeContainer) return;

    const url = checkoutUrl || 'https://pay.hotmart.com/E106082992D?src=popup_site';

    checkoutIframeContainer.innerHTML = `
      <iframe 
        class="w-full h-full border-0" 
        src="${url}" 
        title="Checkout Seguro Hotmart" 
        allow="payment"
      ></iframe>
    `;

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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && checkoutModal && !checkoutModal.classList.contains('hidden')) {
      closeCheckoutModal();
    }
  });
});
