document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) window.lucide.createIcons();
  if (window.aefPortalAuth) await window.aefPortalAuth.ready();
  
  // 1. Ocultar containers inicialmente (Skeleton behavior)
  const standaloneGrid = document.getElementById('cursos-avulsos-grid');
  const membershipGrid = document.getElementById('planos-assinatura-grid');
  
  if (standaloneGrid) standaloneGrid.innerHTML = '<div class="col-span-full py-10 text-center text-slate-500 font-bold animate-pulse">Carregando catálogo...</div>';
  if (membershipGrid) membershipGrid.innerHTML = '<div class="col-span-full py-10 text-center text-slate-500 font-bold animate-pulse">Carregando ecossistema...</div>';

  try {
    const AEF_COURSES = window.AEF_COURSES_DATA || (window.getAllCoursesMetadata ? window.getAllCoursesMetadata() : {});
    
    // Filtro Universal: Apenas cursos publicados, com Landing Page válida, não-ocultos.
    const validProducts = Object.values(AEF_COURSES).filter(c => 
       c.published && 
       c.salesUrl && 
       c.accessTier !== 'mentoria_vip'
    );

    const membershipProducts = [];
    const standaloneProducts = [];

    validProducts.forEach(c => {
      // accessTier 'all_access' ou 'free' = inclusos no membership
      if (c.accessTier === 'all_access' || c.accessTier === 'free' || (c.categories && c.categories.includes('magic_stories'))) {
        membershipProducts.push(c);
      } else {
        standaloneProducts.push(c);
      }
    });

    const uniqueMembership = [...new Map(membershipProducts.map(item => [item.id, item])).values()];
    const uniqueStandalone = [...new Map(standaloneProducts.map(item => [item.id, item])).values()];

    // --- Renderização da Vitrine: CURSOS AVULSOS (Seção Especial) ---
    if (standaloneGrid) {
      if (uniqueStandalone.length === 0) {
        document.getElementById('cursos-avulsos')?.classList.add('hidden');
      } else {
        standaloneGrid.innerHTML = uniqueStandalone.map(c => {
          const cover = c.coverImageUrl || 'assets/images/cover-placeholder.jpg';
          return `
            <div class="group relative bg-[#0A192F] rounded-3xl overflow-hidden border border-white/10 hover:border-amber-400/50 transition-all duration-300 shadow-xl flex flex-col h-full hover:shadow-2xl hover:-translate-y-1">
              <div class="aspect-[16/9] bg-slate-900 overflow-hidden relative">
                <img src="${cover}" alt="${c.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
                <div class="absolute top-4 right-4 px-3 py-1 bg-amber-500/90 text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg">Curso Avulso</div>
              </div>
              <div class="p-6 flex flex-col flex-1">
                <h3 class="text-lg sm:text-xl font-bold text-white mb-2 leading-tight font-serif">${c.title}</h3>
                <p class="text-xs text-slate-400 leading-relaxed flex-1 line-clamp-3">${c.description || ''}</p>
                <div class="mt-6 pt-5 border-t border-white/10">
                  <a href="${c.salesUrl}" class="w-full px-4 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider text-center shadow-lg transition flex items-center justify-center gap-2">
                    Saiba Mais
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                  </a>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // --- Renderização da Vitrine: ECOSSISTEMA DO CLUB ---
    if (membershipGrid) {
      if (uniqueMembership.length === 0) {
        document.getElementById('planos-assinatura')?.classList.add('hidden');
      } else {
        // Aproveitamos o mesmo container que exibia planos para exibir o Ecossistema do Club
        document.querySelector('#planos-assinatura h2').innerHTML = `O que está incluso no <span class="text-amber-400 italic">AEF Club?</span>`;
        document.querySelector('#planos-assinatura p').innerHTML = `Dezenas de masterclasses, histórias interativas e treinamentos completos liberados com sua assinatura.`;

        membershipGrid.innerHTML = uniqueMembership.map(c => {
          const cover = c.coverImageUrl || 'assets/images/cover-placeholder.jpg';
          return `
            <div class="group relative bg-[#112240] rounded-3xl overflow-hidden border border-white/10 hover:border-emerald-400/50 transition-all duration-300 shadow-xl flex flex-col h-full hover:shadow-2xl hover:-translate-y-1">
              <div class="aspect-[16/9] bg-slate-900 overflow-hidden relative">
                <img src="${cover}" alt="${c.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
                <div class="absolute top-4 right-4 px-3 py-1 bg-emerald-500/90 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg">Incluso no Club</div>
              </div>
              <div class="p-6 flex flex-col flex-1">
                <h3 class="text-lg font-bold text-white mb-2 leading-tight font-serif">${c.title}</h3>
                <p class="text-[11px] text-slate-400 leading-relaxed flex-1 line-clamp-2">${c.description || ''}</p>
                <div class="mt-4 pt-4 border-t border-white/10">
                  <a href="${c.salesUrl}" class="w-full px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-2">
                    Ver Detalhes
                  </a>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // SEO: JSON-LD Schema
    const schemaObj = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": validProducts.map((c, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Course",
          "name": c.title,
          "description": c.description || c.title,
          "url": c.salesUrl,
          "provider": {
            "@type": "Organization",
            "name": "AgoraEuFalo Academy",
            "sameAs": "https://agoraeufalo.com.br"
          }
        }
      }))
    };
    
    if (validProducts.length > 0) {
      const scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.textContent = JSON.stringify(schemaObj);
      document.head.appendChild(scriptTag);
    }
  } catch(err) {
    console.error('Error hydrating product vitrines', err);
    if (standaloneGrid) standaloneGrid.innerHTML = '<div class="col-span-full py-10 text-center text-rose-400">Falha ao carregar catálogo.</div>';
  }
});
