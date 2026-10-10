/**
 * AgoraEuFalo • Official Home Vitrines & Dynamic Hydration Engine
 * Professor Leonardo Leite
 * 
 * Sincroniza dinamicamente:
 * 1. Bloco YouTube Lab na Home (via Firestore REST API, Zero SDK overhead)
 * 2. Vitrine de Cursos Avulsos (cursos publicados independentes)
 * 3. Vitrine do Ecossistema Club (cursos inclusos na assinatura)
 * 4. Schema.org JSON-LD para SEO de catálogo de cursos
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) window.lucide.createIcons();
  if (window.aefPortalAuth) await window.aefPortalAuth.ready();
  
  // 1. Ocultar containers inicialmente (Skeleton behavior)
  const standaloneGrid = document.getElementById('cursos-avulsos-grid');
  const membershipGrid = document.getElementById('planos-assinatura-grid');
  const ytGrid = document.getElementById('yt-home-grid');
  
  if (standaloneGrid) standaloneGrid.innerHTML = '<div class="col-span-full py-10 text-center text-slate-500 font-bold animate-pulse">Carregando catálogo...</div>';
  if (membershipGrid) membershipGrid.innerHTML = '<div class="col-span-full py-10 text-center text-slate-500 font-bold animate-pulse">Carregando ecossistema...</div>';

  // 1.1. Bloco Dinâmico do YouTube Lab (via Firestore REST API)
  if (ytGrid) {
    try {
      const ytRes = await fetch('https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/youtube_archive');
      if (ytRes.ok) {
        const ytData = await ytRes.json();
        if (ytData.documents && ytData.documents.length > 0) {
          const videos = ytData.documents
            .map(d => d.fields)
            .filter(f => f.status?.stringValue === 'active')
            .map(f => ({
              videoId: f.videoId?.stringValue,
              title: f.title?.stringValue,
              thumbnailUrl: f.thumbnailUrl?.stringValue,
              publishedAt: f.publishedAt?.stringValue,
              homeOrder: parseInt(f.homeOrder?.integerValue || '99', 10),
              featuredOnHome: f.featuredOnHome ? f.featuredOnHome.booleanValue : true,
              materialsAvailable: {
                pdf: f.materialsAvailable?.mapValue?.fields?.pdf?.booleanValue || false,
                audio: f.materialsAvailable?.mapValue?.fields?.audio?.booleanValue || false
              }
            }))
            .filter(v => v.featuredOnHome !== false);

          videos.sort((a, b) => (a.homeOrder - b.homeOrder) || (new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)));

          if (videos.length === 0) {
            document.getElementById('youtube-lab')?.classList.add('hidden');
          } else {
            ytGrid.className = videos.length === 1 ? "max-w-md mx-auto mb-12" : "grid grid-cols-1 md:grid-cols-3 gap-8 mb-12";
            ytGrid.innerHTML = videos.slice(0, 3).map(v => {
              let badgesHtml = '';
              if (v.materialsAvailable.pdf) badgesHtml += `<span class="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 text-[10px] font-bold">📄 PDF</span>`;
              if (v.materialsAvailable.audio) badgesHtml += `<span class="bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 text-[10px] font-bold">🎧 Áudio</span>`;
              return `
                <a href="youtube-lab.html?v=${v.videoId}" class="block bg-[#FAF8F5] border-2 border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition group">
                  <div class="aspect-video bg-slate-900 relative overflow-hidden">
                    <img src="${v.thumbnailUrl}" class="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-500" alt="${v.title}">
                    <div class="absolute inset-0 flex items-center justify-center">
                      <div class="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition"><i data-lucide="play" class="w-6 h-6 fill-white ml-0.5"></i></div>
                    </div>
                  </div>
                  <div class="p-6 space-y-3">
                    <h3 class="text-lg font-bold text-slate-900 leading-tight font-serif">${v.title}</h3>
                    ${badgesHtml ? `<div class="flex gap-2 text-[10px] font-bold uppercase tracking-wider">${badgesHtml}</div>` : ''}
                  </div>
                </a>
              `;
            }).join('');
            if (window.lucide) window.lucide.createIcons();
          }
        } else {
          document.getElementById('youtube-lab')?.classList.add('hidden');
        }
      }
    } catch(err) {
      console.warn('Erro ao carregar YouTube Lab na Home:', err);
    }
  }

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
        const titleEl = document.querySelector('#planos-assinatura h2');
        if (titleEl) titleEl.innerHTML = `O que está incluso no <span class="text-amber-400 italic">AEF Club?</span>`;
        const descEl = document.querySelector('#planos-assinatura p');
        if (descEl) descEl.innerHTML = `Dezenas de masterclasses, histórias interativas e treinamentos completos liberados com sua assinatura.`;

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
