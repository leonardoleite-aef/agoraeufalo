window.renderConversionPaywallHtml = async function(course, src) {
  if (!window.aefOffersRegistry) return `<p>Erro: aefOffersRegistry não carregado</p>`;
  await window.aefOffersRegistry.init();
  const R = window.aefOffersRegistry;
  
  const source = src || new URLSearchParams(window.location.search).get('src') || 'sala_paywall';
  const ytVideo = new URLSearchParams(window.location.search).get('v');
  
  const productOffer = R.getOfferByProductId(course.id);
  const clubOffer = R.getOfferById('ms-club-anual');
  
  let html = `<div class="absolute inset-0 bg-gradient-to-b from-[#0A192F] via-[#0D1E36] to-[#060D17] flex flex-col items-center justify-center p-6 text-center space-y-4 select-none z-50">
    <div class="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center text-3xl shadow-xl">
      🔒
    </div>
    <div class="space-y-2 max-w-md">
      <span class="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 font-mono font-bold text-[10px] uppercase tracking-wider">CONTEÚDO EXCLUSIVO</span>
      <h3 class="text-xl sm:text-2xl font-black text-white leading-tight font-serif">Esta aula é exclusiva</h3>
      <p class="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">Faça o upgrade para acessar o treinamento completo.</p>
    </div>
    <div class="pt-2 flex flex-col items-center gap-3 w-full justify-center max-w-sm">`;
    
  if (clubOffer) {
    const clubUrl = R.generateTrackingUrl(clubOffer, source, course.id);
    html += `<button onclick="window.aefCheckoutModal.open('${clubUrl}')" class="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl hover:scale-105 transition">Assinar o Club (${clubOffer.pricing})</button>`;
  }
  
  // Note: SHOW_STANDALONE_OFFER_TO_FREE is false by default in spec
  const SHOW_STANDALONE_OFFER_TO_FREE = false;
  
  if (SHOW_STANDALONE_OFFER_TO_FREE && productOffer && productOffer.id !== (clubOffer ? clubOffer.id : '')) {
    const prodUrl = R.generateTrackingUrl(productOffer, source, course.id);
    html += `<button onclick="window.aefCheckoutModal.open('${prodUrl}')" class="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition">Comprar Curso Avulso (${productOffer.pricing})</button>`;
  }
  
  if (ytVideo && source === 'youtube-lab') {
    html += `<a href="youtube-lab.html?v=${ytVideo}" class="w-full px-4 py-3 rounded-xl bg-blue-500/20 text-blue-300 font-bold text-xs hover:bg-blue-500/30 transition">← Voltar ao Vídeo</a>`;
  } else {
    html += `<a href="portal-lab.html" class="w-full px-4 py-3 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition">Voltar ao Portal</a>`;
  }
  
  html += `</div></div>`;
  return html;
};

// Global paywall renderer function
window.triggerConversionPaywall = async function(containerEl, course, src) {
  containerEl.innerHTML = await window.renderConversionPaywallHtml(course, src);
};
