(function() {
  let currentAudio = null;
  let currentActiveButton = null;

  window.playAefSnippet = function(buttonElement, audioUrl) {
    if (!buttonElement || !audioUrl) return;

    // Se clicar no botão que já está tocando, pausa
    if (currentAudio && currentActiveButton === buttonElement && !currentAudio.paused) {
      currentAudio.pause();
      resetButtonUI(buttonElement);
      return;
    }

    // Para qualquer outro áudio tocando
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      if (currentActiveButton) resetButtonUI(currentActiveButton);
    }

    // Toca o arquivo de áudio MP3 de estúdio
    const audio = new Audio(audioUrl);
    currentAudio = audio;
    currentActiveButton = buttonElement;

    setButtonPlayingUI(buttonElement);

    audio.play().then(() => {
      audio.onended = () => {
        resetButtonUI(buttonElement);
        currentAudio = null;
        currentActiveButton = null;
      };
      audio.onerror = () => {
        console.error("Erro ao carregar arquivo de áudio de estúdio:", audioUrl);
        resetButtonUI(buttonElement);
        currentAudio = null;
        currentActiveButton = null;
      };
    }).catch(err => {
      console.error("Falha na reprodução do áudio:", err);
      resetButtonUI(buttonElement);
      currentAudio = null;
      currentActiveButton = null;
    });
  };

  function setButtonPlayingUI(btn) {
    btn.dataset.originalHtml = btn.dataset.originalHtml || btn.innerHTML;
    btn.classList.add('ring-2', 'ring-amber-400', 'bg-amber-500', 'text-slate-950', 'scale-105');
    btn.classList.remove('bg-amber-500/10', 'text-amber-900');
    btn.innerHTML = `<span class="inline-block animate-pulse font-bold text-[10px]">🔊 Tocando...</span>`;
  }

  function resetButtonUI(btn) {
    if (btn.dataset.originalHtml) {
      btn.innerHTML = btn.dataset.originalHtml;
    }
    btn.classList.remove('ring-2', 'ring-amber-400', 'bg-amber-500', 'text-slate-950', 'scale-105');
    btn.classList.add('bg-amber-500/10', 'text-amber-900');
    if (window.lucide) lucide.createIcons();
  }
})();
