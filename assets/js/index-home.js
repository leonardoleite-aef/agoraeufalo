/**
 * AgoraEuFalo • Official Home Vitrines & Dynamic Hydration Engine
 * Professor Leonardo Leite
 * 
 * Sincroniza dinamicamente:
 * 1. Bloco YouTube Lab na Home (via Firestore REST API, Zero SDK overhead)
 * 2. Vitrine de Cursos Avulsos (Cursos rápidos e workshops)
 * 3. Planos de Assinatura Premium (AEF Club Mensal, Anual e Vitalício via aefOffersRegistry e aefCheckoutModal)
 * 4. Schema.org JSON-LD para SEO de catálogo de cursos
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) window.lucide.createIcons();
  if (window.aefPortalAuth) await window.aefPortalAuth.ready();

  const standaloneGrid = document.getElementById('cursos-avulsos-grid');
  const membershipGrid = document.getElementById('planos-assinatura-grid');
  const ytGrid = document.getElementById('yt-home-grid');

  // =========================================================================
  // 1. Bloco Dinâmico do YouTube Lab (via Firestore REST API)
  // =========================================================================
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

  // =========================================================================
  // 2. Vitrine Oficial de Planos de Assinatura AEF Club (Hotmart Primário)
  // =========================================================================
  if (window.aefOffersRegistry) {
    try {
      await window.aefOffersRegistry.init();
      const R = window.aefOffersRegistry;

      // 2.1. Hidratação dos Planos de Assinatura (Mensal, Anual, Vitalício)
      if (membershipGrid) {
        const planOffers = [
          {
            id: 'ms-club-mensal',
            badge: 'Recorrência Mensal',
            title: 'AEF Club Mensal',
            subtitle: 'Flexibilidade total, sem fidelidade',
            priceHtml: `
              <div class="flex items-baseline gap-1">
                <span class="text-xs text-slate-400 font-bold">R$</span>
                <span class="text-4xl font-black text-white">59</span>
                <span class="text-sm font-bold text-slate-400">,00 /mês</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">Cancele quando quiser no portal</p>
            `,
            features: [
              'Todas as Magic Stories & Masterclasses',
              'Training Player de Bolso no Celular',
              'Apostilas Oficiais Diagramadas (PDF)',
              'Spoken Reflex & Áudios MP3'
            ],
            btnText: 'Assinar Mensal',
            isHighlight: false
          },
          {
            id: 'ms-club-anual',
            badge: 'Plano Oficial',
            highlightBadge: '⭐ MAIS ESCOLHIDO • ECONOMIZE 50%',
            title: 'AEF Club Anual',
            subtitle: 'O plano definitivo para destravar a fala',
            priceHtml: `
              <p class="text-[11px] text-slate-400 line-through">De R$ 997,00 por apenas</p>
              <div class="flex items-baseline gap-1 mt-0.5">
                <span class="text-xs text-amber-400 font-bold">12x de</span>
                <span class="text-4xl font-black text-white">R$ 49</span>
                <span class="text-sm font-bold text-slate-300">,70</span>
              </div>
              <p class="text-[11px] text-amber-300/90 font-medium mt-1">ou R$ 497,00 à vista (apenas R$ 41,40/mês)</p>
            `,
            features: [
              '<strong>Acesso total por 1 ano</strong> a todo o acervo',
              'Todas as 6 Arenas do Método Magic Stories',
              'Training Player Móvel & MediaSession',
              'Todas as Apostilas em PDF de Alta Densidade',
              'Novas histórias e masterclasses mensais'
            ],
            btnText: 'Garantir Plano Anual',
            isHighlight: true
          },
          {
            id: 'all-access-lifetime',
            badge: '💎 Acesso Vitalício',
            title: 'Membro Fundador',
            subtitle: 'Acesso definitivo, pague uma única vez',
            priceHtml: `
              <p class="text-[11px] text-slate-400 line-through">De R$ 2.997,00 por</p>
              <div class="flex items-baseline gap-1 mt-0.5">
                <span class="text-xs text-cyan-400 font-bold">12x de</span>
                <span class="text-4xl font-black text-white">R$ 149</span>
                <span class="text-sm font-bold text-slate-300">,70</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">ou R$ 1.497,00 à vista (pagamento único)</p>
            `,
            features: [
              'Acesso vitalício a todos os cursos presentes',
              'Todos os lançamentos e histórias futuras',
              'Nunca mais pague mensalidade ou anuidade',
              'Condição exclusiva de Membro Fundador'
            ],
            btnText: 'Garantir Acesso Vitalício',
            isHighlight: false
          }
        ];

        membershipGrid.innerHTML = planOffers.map(p => {
          const offer = R.getOfferById(p.id);
          const isPending = !offer || offer.isPendingHotmartLink || !offer.checkoutUrl || offer.checkoutUrl.includes('OFFER_');
          
          let checkoutUrl = '';
          if (offer) {
            checkoutUrl = R.generateTrackingUrl(offer, 'home_plans', offer.id);
          } else {
            checkoutUrl = p.id === 'ms-club-mensal'
              ? 'https://pay.hotmart.com/T107479074N?off=fwk42n3u'
              : (p.id === 'ms-club-anual' ? 'https://pay.hotmart.com/T107479074N?off=mgwnab3h' : 'https://pay.hotmart.com/OFFER_ALL_ACCESS_LIFETIME');
          }

          const actionJs = isPending
            ? `window.open('https://wa.me/5511996160910?text=' + encodeURIComponent('Olá Leo! Tenho interesse no ${p.title} do AgoraEuFalo.'), '_blank')`
            : `if (window.aefCheckoutModal) { window.aefCheckoutModal.open('${checkoutUrl}'); } else { window.location.href = '${checkoutUrl}'; }`;

          if (p.isHighlight) {
            return `
              <div class="bg-gradient-to-b from-[#112240] to-[#0A192F] border-2 border-amber-400 rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative shadow-2xl transform md:-translate-y-4">
                <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1.5">
                  <i data-lucide="sparkles" class="w-3.5 h-3.5 fill-current"></i>
                  <span>${p.highlightBadge}</span>
                </div>
                <div class="space-y-6 pt-2">
                  <div class="flex items-center justify-between">
                    <span class="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-amber-400/30">
                      ${p.badge}
                    </span>
                    <span class="text-[11px] font-bold text-amber-300">12 meses de acesso</span>
                  </div>
                  <div>
                    <h3 class="text-xl font-black text-amber-400 font-serif">${p.title}</h3>
                    <p class="text-xs text-slate-300 mt-1">${p.subtitle}</p>
                  </div>
                  <div>
                    ${p.priceHtml}
                  </div>
                  <div class="pt-4 border-t border-white/10 space-y-3 text-xs text-slate-200 font-medium">
                    ${p.features.map(f => `
                      <div class="flex items-center gap-2.5">
                        <i data-lucide="check-circle-2" class="w-4 h-4 text-amber-400 shrink-0"></i>
                        <span>${f}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
                <div class="mt-8 pt-4">
                  <button 
                    type="button" 
                    onclick="${actionJs}"
                    class="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>${p.btnText}</span>
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>
            `;
          }

          return `
            <div class="bg-white/5 border-2 border-white/10 hover:border-amber-400/30 rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative shadow-xl">
              <div class="space-y-6">
                <div class="flex items-center justify-between">
                  <span class="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                    ${p.badge}
                  </span>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-white">${p.title}</h3>
                  <p class="text-xs text-slate-400 mt-1">${p.subtitle}</p>
                </div>
                <div>
                  ${p.priceHtml}
                </div>
                <div class="pt-4 border-t border-white/10 space-y-3 text-xs text-slate-300">
                  ${p.features.map(f => `
                    <div class="flex items-center gap-2.5">
                      <i data-lucide="check" class="w-4 h-4 text-emerald-400 shrink-0"></i>
                      <span>${f}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
              <div class="mt-8 pt-4">
                <button 
                  type="button" 
                  onclick="${actionJs}"
                  class="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>${p.btnText}</span>
                  <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          `;
        }).join('');

        if (window.lucide) window.lucide.createIcons();
      }

      // 2.2. Hidratação dos Cursos Avulsos & Workshops
      if (standaloneGrid) {
        const standaloneCards = [
          {
            title: 'Dates and Times • Prática Intensiva',
            badge: 'Curso Rápido',
            badgeColor: 'bg-amber-500/90 text-slate-900',
            cover: 'assets/images/cover-dates-and-times-16x9.jpg',
            description: 'Aprenda a dizer e entender datas, horas e períodos em inglês sem fazer contas mentais. Com Magic Story final de consolidação.',
            priceTag: 'Aulas Abertas',
            subPrice: 'Experimente',
            actionUrl: 'lp-dates-and-times.html',
            btnText: 'Acessar',
            isExternalModal: false
          },
          {
            title: 'English QuickStart • Fundamentos da Fala',
            badge: 'Curso Completo',
            badgeColor: 'bg-emerald-500/90 text-white',
            cover: 'assets/images/cover-english-quickstart.jpg',
            description: 'Treinamento focado em destravar o reflexo oral e eliminar a paralisia da tradução mental com repetição neuromuscular.',
            priceTag: 'R$ 197 à vista',
            subPrice: '12x de R$ 19,70 ou',
            actionUrl: 'lp-english-quickstart.html',
            btnText: 'Saiba Mais',
            isExternalModal: false
          },
          {
            title: 'Frases Prontas • Automação Oral',
            badge: 'Vitalício',
            badgeColor: 'bg-purple-500/90 text-white',
            cover: 'assets/images/cover-frases-prontas.jpg',
            description: 'Centenas de blocos conversacionais pré-moldados (Sound Chunks) para você falar com espontaneidade sem travar.',
            priceTag: 'R$ 297 à vista',
            subPrice: '12x de R$ 29,70 ou',
            actionUrl: 'https://wa.me/5511996160910?text=' + encodeURIComponent('Olá Professor Leo! Gostaria de adquirir o curso Frases Prontas no plano vitalício.'),
            btnText: 'Garantir Vaga',
            isExternalModal: false
          }
        ];

        standaloneGrid.innerHTML = standaloneCards.map(c => `
          <div class="group relative bg-[#0A192F] rounded-3xl overflow-hidden border border-white/10 hover:border-amber-400/50 transition-all duration-300 shadow-xl flex flex-col h-full hover:shadow-2xl hover:-translate-y-1">
            <div class="aspect-[16/9] bg-slate-900 overflow-hidden relative">
              <img src="${c.cover}" alt="${c.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
              <div class="absolute top-4 right-4 px-3 py-1 ${c.badgeColor} text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg">${c.badge}</div>
            </div>
            <div class="p-6 flex flex-col flex-1">
              <h3 class="text-lg sm:text-xl font-bold text-white mb-2 leading-tight font-serif">${c.title}</h3>
              <p class="text-xs text-slate-400 leading-relaxed flex-1">${c.description}</p>
              <div class="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-slate-400 block">${c.subPrice}</span>
                  <span class="text-sm font-black text-white">${c.priceTag}</span>
                </div>
                <a href="${c.actionUrl}" class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1.5">
                  <span>${c.btnText}</span>
                  <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                </a>
              </div>
            </div>
          </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
      }

    } catch(err) {
      console.warn('Erro ao hidratar ofertas na Home:', err);
    }
  }

  // =========================================================================
  // 3. SEO: JSON-LD Schema de Catálogo
  // =========================================================================
  const schemaObj = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Course",
          "name": "AgoraEuFalo English Club",
          "description": "Assinatura do ecossistema completo de Magic Stories, Spoken Reflex Studio e treino no celular.",
          "url": "https://agoraeufalo.com.br/#planos-assinatura",
          "provider": {
            "@type": "Organization",
            "name": "AgoraEuFalo Academy",
            "sameAs": "https://agoraeufalo.com.br"
          }
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "item": {
          "@type": "Course",
          "name": "Dates and Times - Curso Rápido",
          "description": "Curso rápido sobre números, horas, datas e períodos em inglês.",
          "url": "https://agoraeufalo.com.br/lp-dates-and-times.html",
          "provider": {
            "@type": "Organization",
            "name": "AgoraEuFalo Academy",
            "sameAs": "https://agoraeufalo.com.br"
          }
        }
      },
      {
        "@type": "ListItem",
        "position": 3,
        "item": {
          "@type": "Course",
          "name": "English QuickStart",
          "description": "Fundamentos da fala em inglês sem tradução mental.",
          "url": "https://agoraeufalo.com.br/lp-english-quickstart.html",
          "provider": {
            "@type": "Organization",
            "name": "AgoraEuFalo Academy",
            "sameAs": "https://agoraeufalo.com.br"
          }
        }
      }
    ]
  };

  const scriptTag = document.createElement('script');
  scriptTag.type = 'application/ld+json';
  scriptTag.textContent = JSON.stringify(schemaObj);
  document.head.appendChild(scriptTag);
});
