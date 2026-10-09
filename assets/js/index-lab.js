document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) window.lucide.createIcons();
  if (window.aefPortalAuth) await window.aefPortalAuth.ready();
  
  // 1. YouTube Lab Dynamic Block
  if (window.firebase && window.firebase.firestore) {
    try {
      const snap = await window.firebase.firestore().collection('youtube_archive')
        .where('featuredOnHome', '==', true)
        .where('status', '==', 'active')
        .get();
        
      const videos = [];
      snap.forEach(doc => videos.push(doc.data()));
      videos.sort((a, b) => (a.homeOrder || 99) - (b.homeOrder || 99));
      
      const ytGrid = document.getElementById('yt-home-grid');
      if (videos.length === 0) {
        document.getElementById('youtube-lab').classList.add('hidden');
      } else {
        ytGrid.innerHTML = videos.slice(0, 3).map(v => {
          let badgesHtml = '';
          if (v.materialsAvailable?.pdf) badgesHtml += `<span class="bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-200">📄 PDF</span>`;
          if (v.materialsAvailable?.audio) badgesHtml += `<span class="bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-200">🎧 Áudio</span>`;
          return `
            <a href="youtube-lab.html?v=${v.videoId}" class="block bg-[#FAF8F5] border-2 border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition group">
              <div class="aspect-video bg-slate-900 relative">
                <img src="${v.thumbnailUrl}" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-500">
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg"><i data-lucide="play" class="w-6 h-6 fill-white ml-1"></i></div>
                </div>
              </div>
              <div class="p-6 space-y-3">
                <h3 class="text-lg font-bold text-slate-900 leading-tight">${v.title}</h3>
                <div class="flex gap-2 text-[10px] font-bold uppercase tracking-wider">${badgesHtml}</div>
              </div>
            </a>
          `;
        }).join('');
        lucide.createIcons();
      }
    } catch(err) {
      console.error('Error fetching youtube archive', err);
      document.getElementById('youtube-lab').classList.add('hidden');
    }
  }

  // 2. Dynamic Pricing Blocks
  if (window.aefOffersRegistry) {
    await window.aefOffersRegistry.init();
    const R = window.aefOffersRegistry;
    
    // Standalone Courses
    const standaloneIds = ['eqs-completo', 'frases-prontas-vitalicio'];
    const coursesGrid = document.getElementById('cursos-avulsos-grid');
    if (coursesGrid) {
      const html = standaloneIds.map(id => {
        const offer = R.getOfferById(id);
        if (!offer || offer.status !== 'active') return '';
        const url = R.generateTrackingUrl(offer, 'home_lab', offer.id);
        return `
          <div class="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div class="p-6 space-y-3">
              <h3 class="text-lg font-bold text-slate-900">${offer.name}</h3>
              <p class="text-xs text-slate-500 leading-relaxed min-h-[40px]">${offer.description || 'Curso prático.'}</p>
            </div>
            <div class="px-6 pb-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span class="font-black text-lg text-slate-900">${offer.pricing}</span>
              <button onclick="window.aefCheckoutModal.open('${url}')" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer">
                Comprar
              </button>
            </div>
          </div>
        `;
      }).join('');
      if (html) {
        coursesGrid.innerHTML = html;
      } else {
        document.getElementById('cursos-avulsos').classList.add('hidden');
      }
    }

    // Plans
    const planIds = ['ms-club-mensal', 'ms-club-anual', 'all-access-lifetime'];
    const plansGrid = document.getElementById('planos-assinatura-grid');
    if (plansGrid) {
      const html = planIds.map(id => {
        const offer = R.getOfferById(id);
        if (!offer || offer.status !== 'active') return '';
        const url = R.generateTrackingUrl(offer, 'home_lab', offer.id);
        const isHighlight = id === 'ms-club-anual';
        return `
          <div class="${isHighlight ? 'bg-gradient-to-b from-[#112240] to-[#0A192F] border-amber-400 transform md:-translate-y-4' : 'bg-white/5 border-white/10 hover:border-amber-400/30'} border-2 rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative shadow-xl">
            ${isHighlight ? '<div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">Mais Recomendado</div>' : ''}
            <div class="space-y-6">
              <div>
                <h3 class="text-xl font-bold ${isHighlight ? 'text-amber-400' : 'text-white'}">${offer.name}</h3>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="${isHighlight ? 'text-4xl' : 'text-3xl'} font-black text-white">${offer.pricing}</span>
              </div>
              <p class="text-sm text-slate-300 min-h-[60px]">${offer.description || ''}</p>
            </div>
            <button onclick="window.aefCheckoutModal.open('${url}')" class="mt-8 w-full py-3.5 rounded-xl ${isHighlight ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-amber-500/20' : 'bg-white/10 hover:bg-white/20 text-white'} border border-white/15 font-bold text-xs uppercase tracking-wider transition cursor-pointer">
              Assinar ${offer.name}
            </button>
          </div>
        `;
      }).join('');
      plansGrid.innerHTML = html;
    }
  }
});
