window.renderConversionPaywallHtml = async function(course, src, thumbnailUrl, isTransparent = false, isCourseMode = false) {
  if (!window.aefOffersRegistry) return `<p>Erro: aefOffersRegistry não carregado</p>`;
  await window.aefOffersRegistry.init();
  const R = window.aefOffersRegistry;
  
  const source = src || new URLSearchParams(window.location.search).get('src') || 'sala_paywall';
  const ytVideo = new URLSearchParams(window.location.search).get('v');
  
  let targetOffer = R.getOfferByProductId(course?.id);
  
  // Se não houver oferta avulsa para o produto, oferecer o Club Anual
  if (!targetOffer || targetOffer.status !== 'active') {
    targetOffer = R.getOfferById('ms-club-anual');
  }

  let bgStyle = '';
  let overlayClass = '';
  
  if (isTransparent) {
    overlayClass = 'bg-[#060D17]/60 backdrop-blur-sm';
  } else {
    bgStyle = thumbnailUrl ? `background-image: url('${thumbnailUrl}'); background-size: cover; background-position: center;` : '';
    overlayClass = thumbnailUrl ? 'bg-[#060D17]/70 backdrop-blur-sm' : 'bg-gradient-to-b from-[#0A192F] via-[#0D1E36] to-[#060D17]';
  }

  const fallbackHtml = `
    <div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 select-none z-50" style="${bgStyle}">
      <div class="absolute inset-0 ${overlayClass}"></div>
      <div class="relative z-10 flex flex-col items-center gap-4">
        <div class="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center text-3xl shadow-xl">🔒</div>
        <h3 class="text-xl sm:text-2xl font-black text-white font-serif">Matrículas Encerradas</h3>
        <p class="text-sm text-slate-300">Entre na fila de espera ou procure no portal.</p>
        <a href="portal-lab.html" class="px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-xs uppercase hover:bg-white/20 transition">Voltar ao Portal</a>
      </div>
    </div>
  `;
  
  if (!targetOffer || targetOffer.status !== 'active') {
    return fallbackHtml;
  }
  
  const offerUrl = R.generateTrackingUrl(targetOffer, source, course?.id);
  const priceText = targetOffer.hotmartSetupSpec?.installmentsFormatted || targetOffer.pricing?.installmentsText || `R$ ${targetOffer.pricing?.offerPrice || ''}`;
  const offerTitle = targetOffer.title || targetOffer.name || 'Upgrade Premium';
  
  const titleText = isCourseMode ? "Este curso é exclusivo" : "Esta aula é exclusiva";
  const descText = isCourseMode ? "Você não tem acesso a este treinamento." : "Para acessar o material completo,";

  let html = `<div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 select-none z-[100]" style="${bgStyle}">
    <div class="absolute inset-0 ${overlayClass}"></div>
    
    <div class="relative z-10 flex flex-col items-center gap-4 w-full">
      <div class="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center text-3xl shadow-xl">
        🔒
      </div>
      <div class="space-y-2 max-w-md">
        <span class="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 font-mono font-bold text-[10px] uppercase tracking-wider">CONTEÚDO EXCLUSIVO</span>
        <h3 class="text-xl sm:text-2xl font-black text-white leading-tight font-serif">${titleText}</h3>
        <p class="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">${descText} faça o upgrade para <b>${offerTitle}</b>.</p>
      </div>
      
      <div class="pt-4 flex flex-col items-center gap-3 w-full justify-center max-w-sm">
        <button onclick="window.aefCheckoutModal ? window.aefCheckoutModal.open('${offerUrl}') : window.open('${offerUrl}', '_blank')" class="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl hover:scale-105 transition">
          Desbloquear Agora (${priceText})
        </button>
  `;
  
  if (ytVideo && source === 'youtube-lab') {
    html += `<a href="youtube-lab.html?v=${ytVideo}" class="w-full px-4 py-3 rounded-xl bg-blue-500/20 text-blue-300 font-bold text-xs hover:bg-blue-500/30 transition shadow-lg">← Voltar ao Vídeo</a>`;
  } else {
    html += `<a href="portal-lab.html" class="w-full px-4 py-3 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition shadow-lg">Voltar ao Portal</a>`;
  }
  
  html += `</div></div></div>`;
  return html;
};

// Global paywall renderer function
window.triggerConversionPaywall = async function(containerEl, course, src, thumbnailUrl, isTransparent = false, isCourseMode = false) {
  containerEl.innerHTML = await window.renderConversionPaywallHtml(course, src, thumbnailUrl, isTransparent, isCourseMode);
};
