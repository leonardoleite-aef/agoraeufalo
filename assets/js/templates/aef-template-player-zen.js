/**
 * AGORAEUFALO MASTER TEMPLATE: TRAINING PLAYER ZEN MODE (SINGLE ACTIVE CARD & AI SPEECH COACH)
 * Design de Cartão Único de Alto Contraste (Papel Linho Dourado / Honey Ochre)
 * 100% Conforme às Regras Institucionais do AgoraEuFalo
 */

window.AEFPlayerZenTemplate = {
  
  /**
   * Renderiza o Medidor Circular de Compreensibilidade AI (0.0 a 10.0)
   */
  renderCircularGauge: function(score = 8.8, maxScore = 10, label = "Compreensibilidade Real", status = "EXCELENTE") {
    const offset = Math.max(0, 440 * (1 - (score / maxScore)));
    return `
      <div class="text-center space-y-1 my-2">
        <div class="aef-gauge-container">
          <svg class="aef-gauge-svg" viewBox="0 0 160 160">
            <circle class="aef-gauge-track" cx="80" cy="80" r="70" />
            <circle class="aef-gauge-fill" cx="80" cy="80" r="70" style="stroke-dashoffset: ${offset}; transition: stroke-dashoffset 1s ease-out;" />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span class="text-[9px] font-black uppercase tracking-wider text-[#7A7369]">Teste do Gringo</span>
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
   * Renderiza o Card do Teste do Gringo & Transcrição da Fala
   */
  renderEvaluationReport: function(evaluation) {
    if (!evaluation) return '';

    const isSuccess = evaluation.gringoUnderstood;

    return `
      <div class="p-5 sm:p-6 rounded-[28px] bg-[#FFFDF9] border-2 ${isSuccess ? 'border-[#C68A36]' : 'border-amber-400'} shadow-xl space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
        
        <!-- Header do Relatório: Limpo, Elegante e Centralizado -->
        <div class="text-center pb-3.5 border-b border-[#EAE5DC] space-y-2">
          <span class="text-[10px] font-black uppercase tracking-widest text-[#7A7369] block">
            AI Speech Coach • O Teste do Gringo
          </span>
          
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${isSuccess ? 'bg-emerald-600' : 'bg-[#C68A36]'} text-white shadow-sm">
            <i data-lucide="${isSuccess ? 'check-circle' : 'headphones'}" class="w-4 h-4"></i>
            <span class="text-xs font-black uppercase tracking-wider font-mono">
              ${isSuccess ? 'O GRINGO ENTENDEU!' : 'MAIS ESCUTA NECESSÁRIA'}
            </span>
          </div>

          <p class="text-xs ${isSuccess ? 'text-emerald-800' : 'text-[#78350F]'} font-bold">
            ${isSuccess ? 'Mensagem compreendida com naturalidade!' : 'A fala ainda está maturando no seu tempo.'}
          </p>
        </div>

        <!-- Transcrição do que o AI Coach Captou da sua Fala -->
        <div class="space-y-1 text-left">
          <span class="text-[10px] font-black uppercase tracking-wider text-[#7A7369]">Transcrição da sua Fala:</span>
          <div class="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-1">
            <p class="text-xs sm:text-sm text-[#0A192F] font-bold leading-relaxed italic">
              "${evaluation.transcription}"
            </p>
          </div>
        </div>

        <!-- Parecer do Professor Leo Leite -->
        <div class="p-4 rounded-2xl bg-[#FDF8F0] border border-[#C68A36]/50 space-y-1.5 text-left">
          <span class="text-[11px] font-black uppercase tracking-wider text-[#C68A36] flex items-center gap-1.5">
            <i data-lucide="message-square" class="w-4 h-4"></i> Parecer do Professor Leo:
          </span>
          <p class="text-xs sm:text-sm text-[#0A192F] leading-relaxed font-medium">
            "${evaluation.leoTip}"
          </p>
        </div>

        <!-- Botões de Ação do Aluno -->
        <div class="pt-2 flex flex-col sm:flex-row items-center gap-3">
          ${evaluation.audioUrl ? `
            <button onclick="window.playStudentRecording('${evaluation.audioUrl}')" class="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-[#FDF8F0] text-[#0A192F] border border-stone-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer">
              <i data-lucide="play" class="w-3.5 h-3.5 text-[#C68A36]"></i>
              <span>Ouvir Minha Gravação (${evaluation.durationSec}s)</span>
            </button>
          ` : ''}
          <button onclick="window.toggleRetellRecording()" class="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-[#C68A36] hover:bg-[#B3792A] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer">
            <i data-lucide="mic" class="w-3.5 h-3.5"></i>
            <span>${isSuccess ? 'Gravar Novamente (Praticar Mais)' : 'Voltar para Escuta / Tentar de Novo'}</span>
          </button>
        </div>

      </div>
    `;
  },

  /**
   * Renderiza o Palco Zen de Cartão Único Focado (Single Active Card)
   * 100% Limpo: Badges semânticos (ANSWER / ASK A QUESTION), toggle blur e controles essenciais
   */
  renderSingleZenCard: function(item, index, total, activity, isPlaying = false, isLooping = false, isRevealed = false, showTranslationOverride = false) {
    const textEn = item.text || item.en || '';
    const textPt = item.spokenTranslation || item.pt || '';
    const speaker = (activity === 'listen_answer' || activity === 'listen_ask' || activity === 'look_retell') ? null : item.speaker;

    const isClickable = (activity !== 'look_retell');
    const showTranslation = ((activity === 'vocab') || showTranslationOverride) && Boolean(textPt);

    // Identifica se é um card de produção ativa do aluno que deve vir embaçado
    const isSpeakingResponse = (activity === 'listen_answer' && index % 2 === 1) || (activity === 'listen_ask' && index % 2 === 1);
    const shouldBlur = isSpeakingResponse && !isRevealed;

    // Badges Semânticos Obrigatórios Solicitados pelo Professor Leo
    let semanticBadge = null;
    if (activity === 'listen_answer') {
      semanticBadge = (index % 2 === 1) 
        ? `<span class="px-2.5 py-0.5 rounded-lg bg-[#C68A36] text-white text-[11px] font-mono font-black uppercase tracking-wider shadow-xs">ANSWER</span>`
        : `<span class="px-2.5 py-0.5 rounded-lg bg-[#0A192F] text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider shadow-xs">QUESTION</span>`;
    } else if (activity === 'listen_ask') {
      semanticBadge = (index % 2 === 1) 
        ? `<span class="px-2.5 py-0.5 rounded-lg bg-[#C68A36] text-white text-[11px] font-mono font-black uppercase tracking-wider shadow-xs animate-pulse">ASK A QUESTION!</span>`
        : `<span class="px-2.5 py-0.5 rounded-lg bg-[#0A192F] text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider shadow-xs">STATEMENT</span>`;
    } else if (speaker) {
      semanticBadge = `<span class="px-2.5 py-0.5 rounded-lg bg-[#0A192F] text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider shadow-xs">${speaker}</span>`;
    }

    return `
      <div id="zen-active-card" 
           ${isClickable ? `onclick="window.handleCardTouch(${index})"` : ''} 
           class="w-full min-h-[150px] sm:min-h-[220px] p-5 sm:p-7 rounded-[22px] sm:rounded-[28px] bg-[#FDF8F0] border-2 border-[#C68A36] shadow-xl ring-4 ring-[#C68A36]/15 transition-all duration-200 select-none flex flex-col justify-between ${isClickable ? 'cursor-pointer active:scale-[0.99]' : ''}">
        
        <!-- Header do Card: Badges Semânticos (ANSWER / ASK A QUESTION) + Controles Essenciais -->
        <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-[#EAE5DC]">
          <div>
            ${semanticBadge ? semanticBadge : `
              <span class="w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-[#C68A36]/40'} inline-block"></span>
            `}
          </div>

          ${isClickable ? `
            <div class="flex items-center gap-2">
              ${activity === 'pronunciation' ? `
                <button onclick="event.stopPropagation(); window.toggleLoopSentence(${index})" class="w-8 h-8 rounded-full ${isLooping ? 'bg-[#C68A36] text-white shadow-md' : 'bg-white text-slate-600 border border-stone-200'} flex items-center justify-center transition cursor-pointer" title="Repetir frase em loop">
                  <i data-lucide="repeat" class="w-3.5 h-3.5"></i>
                </button>
              ` : ''}
              <div class="w-8 h-8 rounded-full ${isPlaying ? 'bg-[#C68A36] text-white animate-pulse shadow-md' : 'bg-white text-slate-700 border border-stone-200'} flex items-center justify-center shadow-xs">
                <i data-lucide="${isPlaying ? 'pause' : 'play'}" class="w-4 h-4 fill-current"></i>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Corpo da Frase: Inglês Falado Real (Com Cortina Blur & Toggle On Click) -->
        <div class="py-3 sm:py-5 space-y-2.5 flex-1 flex flex-col justify-center text-left relative">
          
          <div class="relative">
            <p onclick="${isSpeakingResponse ? `event.stopPropagation(); window.toggleBlur(${index})` : ''}" class="font-black text-base sm:text-xl text-[#0A192F] leading-snug break-words transition-all duration-300 ${shouldBlur ? 'blur-md select-none opacity-40' : (isSpeakingResponse ? 'cursor-pointer hover:opacity-80' : '')}">
              "${textEn}"
            </p>

            ${shouldBlur ? `
              <div class="absolute inset-0 flex items-center justify-center">
                <button onclick="event.stopPropagation(); window.toggleBlur(${index})" class="px-4 py-2 rounded-full bg-[#0A192F] hover:bg-[#1E3A5F] text-amber-300 font-bold text-xs flex items-center gap-2 shadow-lg ring-2 ring-[#C68A36]/50 cursor-pointer transition active:scale-95">
                  <i data-lucide="eye" class="w-4 h-4"></i>
                  <span>${activity === 'listen_ask' ? 'Revelar Pergunta' : 'Revelar Resposta'}</span>
                </button>
              </div>
            ` : (isSpeakingResponse ? `
              <div class="pt-1">
                <span class="text-[9px] text-[#7A7369] font-mono block italic">↳ Toque no texto para ocultar novamente</span>
              </div>
            ` : '')}
          </div>

          <!-- Tradução Falada Real (EXCLUSIVA DA ABA VOCABULARY) -->
          ${showTranslation ? `
            <div class="pt-2 sm:pt-2.5 border-t border-[#EAE5DC]">
              <p class="text-xs sm:text-sm text-[#78350F] leading-relaxed italic font-medium break-words">
                ↳ ${textPt}
              </p>
            </div>
          ` : ''}
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
  },

  /**
   * Renderiza o Hub do Laboratório "Minhas Coisas" (Faixas Próprias do Aluno)
   */
  renderCustomTracksHub: function(customTracks = [], activeTrackId = '') {
    return `
      <div class="p-6 sm:p-8 rounded-[28px] bg-[#FFFDF9] border border-[#EAE5DC] shadow-xl space-y-6 text-left animate-in fade-in duration-300">
        
        <!-- Header do Laboratório -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE5DC]">
          <div>
            <span class="text-[10px] font-mono font-bold text-[#C68A36] uppercase tracking-wider block">🧪 LABORATÓRIO DO ALUNO</span>
            <h2 class="text-base sm:text-xl font-serif font-black text-[#0A192F]">Minhas Coisas • Treinos Próprios</h2>
            <p class="text-xs text-[#7A7369]">Suba seus áudios em MP3, importe do YouTube ou pratique textos do seu dia a dia.</p>
          </div>

          <button onclick="window.openCustomTrackStudio()" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer shrink-0">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Criar Novo Treino</span>
          </button>
        </div>

        <!-- Lista de Faixas Customizadas -->
        ${customTracks.length === 0 ? `
          <div class="p-8 rounded-2xl bg-[#FAF8F5] border-2 border-dashed border-[#EAE5DC] text-center space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
              <i data-lucide="flask-conical" class="w-6 h-6"></i>
            </div>
            <h4 class="font-black text-sm text-[#0A192F]">Nenhum treino próprio criado ainda</h4>
            <p class="text-xs text-[#7A7369] max-w-md mx-auto">
              Você pode subir um arquivo MP3 que recebeu, colar um vídeo do YouTube ou um e-mail de trabalho para transformar em treino do Método Magic Stories.
            </p>
            <button onclick="window.openCustomTrackStudio()" class="px-5 py-2.5 rounded-xl bg-[#C68A36] hover:bg-[#B3792A] text-white font-bold text-xs uppercase tracking-wider transition shadow-sm inline-flex items-center gap-1.5 cursor-pointer">
              <i data-lucide="upload-cloud" class="w-4 h-4"></i>
              <span>Começar Meu 1º Treino</span>
            </button>
          </div>
        ` : `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${customTracks.map((track, idx) => `
              <div class="p-4 rounded-2xl bg-white border border-[#EAE5DC] hover:border-[#C68A36] shadow-xs flex flex-col justify-between space-y-3 transition">
                <div class="flex items-start gap-3">
                  <div class="w-12 h-12 rounded-xl bg-[#0D1E36] overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                    <img src="${track.coverImage || '../assets/images/cover-default-aef.jpg'}" alt="Capa" class="w-full h-full object-cover">
                  </div>
                  <div class="min-w-0 flex-1">
                    <span class="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 uppercase">
                      ${track.sourceType === 'youtube' ? 'YOUTUBE' : (track.sourceType === 'mp3' ? 'ÁUDIO MP3' : 'TEXTO')}
                    </span>
                    <h4 class="font-black text-xs sm:text-sm text-[#0A192F] truncate mt-0.5">${track.title}</h4>
                    <p class="text-[10px] text-[#7A7369]">${track.sentences?.length || 0} frases • ${track.duration || '01:00'}</p>
                  </div>
                </div>

                <div class="pt-2 border-t border-[#FAF8F5] flex items-center justify-between gap-2">
                  <button onclick="window.playCustomTrack('${track.id}')" class="flex-1 py-1.5 rounded-lg bg-[#C68A36] hover:bg-[#B3792A] text-white font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs">
                    <i data-lucide="play" class="w-3 h-3 fill-current"></i>
                    <span>Treinar</span>
                  </button>

                  <button onclick="window.deleteCustomTrack('${track.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer" title="Excluir Faixa">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}

      </div>
    `;
  }

};

