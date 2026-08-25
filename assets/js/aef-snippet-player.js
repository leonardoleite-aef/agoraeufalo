/**
 * AgoraEuFalo Universal Snippet Audio Player
 * Handles instant playback of audio snippets across Blog boxes, Chunks, and Exercises.
 * Supports MP3 playback with automatic graceful Web Speech API fallback.
 */

(function() {
  let currentAudio = null;
  let currentActiveButton = null;

  window.playAefSnippet = function(buttonElement, audioUrl, fallbackText) {
    if (!buttonElement) return;

    // If clicking the same playing button, pause it
    if (currentAudio && currentActiveButton === buttonElement && !currentAudio.paused) {
      currentAudio.pause();
      resetButtonUI(buttonElement);
      return;
    }

    // Stop any previously playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      if (currentActiveButton) resetButtonUI(currentActiveButton);
    }

    // Update Button to Playing State
    setButtonPlayingUI(buttonElement);

    // Try HTML5 Audio with MP3
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      currentAudio = audio;
      currentActiveButton = buttonElement;

      audio.play().then(() => {
        audio.onended = () => {
          resetButtonUI(buttonElement);
          currentAudio = null;
          currentActiveButton = null;
        };
        audio.onerror = () => {
          // If MP3 fails or 404s, use speech synthesis fallback
          speakFallback(fallbackText, buttonElement);
        };
      }).catch(err => {
        console.warn("Audio play error, using fallback synthesis:", err);
        speakFallback(fallbackText, buttonElement);
      });
    } else if (fallbackText) {
      speakFallback(fallbackText, buttonElement);
    }
  };

  function speakFallback(text, buttonElement) {
    if (!window.speechSynthesis || !text) {
      resetButtonUI(buttonElement);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/\[.*?\]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 0.92;

    utterance.onend = () => {
      resetButtonUI(buttonElement);
      currentAudio = null;
      currentActiveButton = null;
    };
    utterance.onerror = () => {
      resetButtonUI(buttonElement);
      currentAudio = null;
      currentActiveButton = null;
    };

    setButtonPlayingUI(buttonElement);
    currentActiveButton = buttonElement;
    window.speechSynthesis.speak(utterance);
  }

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
