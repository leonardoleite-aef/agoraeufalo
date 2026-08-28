/**
 * AGORAEUFALO MASTER TEMPLATE: TRAINING PLAYER ZEN MODE (SINGLE ACTIVE CARD)
 * Design de Cartão Único de Alto Contraste (Papel Linho Dourado / Honey Ochre)
 * 100% Conforme às Regras Institucionais do AgoraEuFalo
 */

window.AEFPlayerZenTemplate = {
  
  /**
   * Renderiza o Medidor Circular de Compreensibilidade AI (8.8/10)
   */
  renderCircularGauge: function(score = 8.8, maxScore = 10, label = "Spoken Intelligibility", status = "EXCELENTE") {
    const offset = Math.max(0, 440 * (1 - (score / maxScore)));
    return `
      <div class="text-center space-y-1 my-2">
        <div class="aef-gauge-container">
          <svg class="aef-gauge-svg" viewBox="0 0 160 160">
            <circle class="aef-gauge-track" cx="80" cy="80" r="70" />
            <circle class="aef-gauge-fill" cx="80" cy="80" r="70" style="stroke-dashoffset: ${offset};" />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span class="text-[9px] font-black uppercase tracking-wider text-[#7A7369]">AI Coach</span>
            <div class="flex items-baseline gap-0.5 leading-none my-0.5">
              <span class="text-3xl sm:text-4xl font-black text-[#0A192F] font-mono tracking-tight">${score.toFixed(1)}</span>
            </div>
            <span class="text-[10px] font-bold text-[#7A7369] font-mono">/ ${maxScore}</span>
            <span class="text-[9px] font-bold text-[#C68A36] uppercase tracking-widest mt-0.5">${label}</span>
          </div>
        </div>
        <div class="flex flex-col items-center">
          <span class="text-xs font-black tracking-widest text-[#0A192F] uppercase">${status}</span>
          <div class="flex items-center gap-1 text-[#C68A36] text-xs mt-0.5">
            <i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i>
            <i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i>
            <i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i>
            <i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i>
            <i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Renderiza o Palco Zen de Cartão Único Focado (Single Active Card)
   */
  renderSingleZenCard: function(item, index, total, activity, isPlaying = false, isLooping = false) {
    const textEn = item.text || item.en || '';
    const textPt = item.spokenTranslation || item.pt || '';
    const speaker = item.speaker || (index % 2 === 0 ? 'Leo' : 'Speaker 2');

    let cardBadge = `FRASE ${index + 1} DE ${total}`;
    let isClickable = true;

    if (activity === 'listen_read') {
      cardBadge = speaker ? `${speaker.toUpperCase()} • FRASE ${index + 1}/${total}` : `FRASE ${index + 1}/${total}`;
    } else if (activity === 'vocab') {
      cardBadge = `CHUNK & VOCABULARY ${index + 1}/${total}`;
    } else if (activity === 'listen_answer') {
      cardBadge = (index % 2 === 0) ? `PERGUNTA ${Math.floor(index / 2) + 1}` : `RESPOSTA PADRÃO`;
    } else if (activity === 'look_retell') {
      cardBadge = `GUIA VISUAL ${index + 1}/${total}`;
      isClickable = false;
    } else if (activity === 'listen_ask') {
      cardBadge = (index % 2 === 0) ? `AFIRMAÇÃO / NEGATIVA` : `PERGUNTA DO ALUNO`;
    } else if (activity === 'pronunciation') {
      cardBadge = `RITMO & PRONÚNCIA ${index + 1}/${total}`;
    }

    const showTranslation = (activity === 'vocab') && Boolean(textPt);

    return `
      <div id="zen-active-card" 
           ${isClickable ? `onclick="window.handleCardTouch(${index})"` : ''} 
           class="w-full min-h-[220px] sm:min-h-[240px] p-6 sm:p-7 rounded-[28px] bg-[#FDF8F0] border-2 border-[#C68A36] shadow-xl ring-4 ring-[#C68A36]/15 transition-all duration-200 select-none flex flex-col justify-between ${isClickable ? 'cursor-pointer active:scale-[0.99]' : ''}">
        
        <!-- Header do Card: Speaker Badge + Botões de Ação -->
        <div class="flex items-center justify-between gap-3 pb-3 border-b border-[#EAE5DC]">
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-xl bg-[#C68A36] text-white text-xs font-mono font-black uppercase tracking-wider shadow-xs">
              ${cardBadge}
            </span>
          </div>

          ${isClickable ? `
            <div class="flex items-center gap-2">
              ${activity === 'pronunciation' ? `
                <button onclick="event.stopPropagation(); window.toggleLoopSentence(${index})" class="w-8 h-8 rounded-full ${isLooping ? 'bg-[#C68A36] text-white shadow-md' : 'bg-white text-slate-600 border border-stone-200'} flex items-center justify-center transition" title="Repetir frase em loop">
                  <i data-lucide="repeat" class="w-4 h-4"></i>
                </button>
              ` : ''}
              <div class="w-8 h-8 rounded-full ${isPlaying ? 'bg-[#C68A36] text-white animate-pulse shadow-md' : 'bg-white text-slate-700 border border-stone-200'} flex items-center justify-center shadow-xs">
                <i data-lucide="${isPlaying ? 'pause' : 'play'}" class="w-4 h-4 fill-current"></i>
              </div>
            </div>
          ` : `
            <span class="text-[10px] font-bold text-[#7A7369] uppercase font-mono">Autonomous Retell</span>
          `}
        </div>

        <!-- Corpo da Frase: Inglês Falado Real -->
        <div class="py-4 space-y-2.5 flex-1 flex flex-col justify-center">
          <p class="font-black text-base sm:text-xl text-[#0A192F] leading-snug break-words">
            "${textEn}"
          </p>

          <!-- Tradução Falada Real (EXCLUSIVA DA ABA VOCABULARY) -->
          ${showTranslation ? `
            <div class="pt-2.5 border-t border-[#EAE5DC]">
              <p class="text-xs sm:text-sm text-[#78350F] leading-relaxed italic font-medium break-words">
                ↳ ${textPt}
              </p>
            </div>
          ` : ''}
        </div>

        <!-- Rodapé do Card: Dica de Toque -->
        <div class="flex items-center justify-between text-[11px] text-[#7A7369] pt-2 border-t border-[#EAE5DC]/80 font-medium">
          <span class="flex items-center gap-1">
            <i data-lucide="hand" class="w-3.5 h-3.5 text-[#C68A36]"></i>
            <span>${isPlaying ? 'Toque para pausar' : 'Toque para ouvir'}</span>
          </span>
          <span class="font-mono font-bold text-[#C68A36]">AgoraEuFalo Spoken Reflex</span>
        </div>

      </div>
    `;
  },

  /**
   * Card de Sound Chunk Isolado (FrasesProntas)
   */
  renderSoundChunkCard: function(chunk, index) {
    return `
      <div class="p-3.5 rounded-2xl bg-white border border-[#EAE5DC] hover:border-[#C68A36] shadow-xs flex items-center justify-between gap-3 transition">
        <div class="min-w-0 space-y-0.5">
          <span class="text-[9px] font-mono font-bold text-[#C68A36] bg-[#FDF8F0] px-1.5 py-0.2 rounded border border-[#C68A36]/30 uppercase">
            CHUNK #${index + 1}
          </span>
          <p class="font-black text-xs sm:text-sm text-[#0A192F]">"${chunk.en}"</p>
          <p class="text-[11px] text-[#78350F] italic">↳ ${chunk.pt}</p>
        </div>

        <button onclick="window.playChunkAudio('${chunk.audioUrl || ''}', ${index})" class="w-8 h-8 rounded-full bg-[#C68A36] hover:bg-[#B3792A] active:scale-95 text-white flex items-center justify-center shadow-xs shrink-0 cursor-pointer" title="Ouvir Chunk">
          <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
  }

};
