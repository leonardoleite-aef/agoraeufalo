/**
 * AgoraEuFalo • Sales Page & Migration Landing Page Generator Engine
 * Professor Leonardo Leite
 * 
 * Gera páginas de vendas completas (HTML5 responsivo, Design System AEF)
 * e páginas de resgate de migração para ofertas customizadas.
 */

(function (window) {
  'use strict';

  class AEFSalesPageGenerator {
    /**
     * Gera o código HTML completo da Landing Page de Vendas da Oferta
     */
    generateSalesPageHtml(offer, coursesList = []) {
      const title = offer.title || "Oferta Especial • AgoraEuFalo";
      const slug = offer.slug || "oferta";
      const badge = offer.badge || "OFERTA EXCLUSIVA";
      const headline = offer.salesPageData?.mainHeadline || "Pare de estudar regras. Repita a experiência até a fala virar reflexo.";
      const targetAudience = offer.salesPageData?.targetAudience || "Quem deseja falar inglês com naturalidade e velocidade de resposta.";
      const differentials = offer.salesPageData?.differentials || [
        "Acesso completo ao acervo de histórias Magic Stories",
        "Spoken Reflex Studio: Treino de escuta e fala ativa",
        "Modo Avião no Player para treinar 100% offline",
        "AI Speech Coach avaliando sua pronúncia e ritmo (0 a 10)",
        "Apostilas canônicas diagramadas de 8 páginas em PDF A4",
        "Suporte direto no WhatsApp do Professor Leo"
      ];
      const hasVideo = offer.salesPageData?.hasVideo || false;
      const videoUrl = offer.salesPageData?.videoEmbedUrl || "";
      let ytId = "";
      if (videoUrl) {
        const match = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        if (match && match[1]) ytId = match[1];
      }

      const checkoutUrl = offer.pricing?.checkoutUrl || "#matricula";
      const offerPrice = offer.pricing?.offerPrice || 497;
      const fullPrice = offer.pricing?.fullPrice || 997;
      const installments = offer.pricing?.installments || "12x de R$ 49,90";
      const trialMode = offer.pricing?.trialMode || "none";
      const trialDays = offer.pricing?.trialDays || 0;

      let trialBadgeHtml = "";
      if (trialMode === 'free_trial') {
        trialBadgeHtml = `<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold uppercase">🎁 ${trialDays} Dias Grátis • Cancele quando quiser</div>`;
      } else if (trialMode === 'test_drive') {
        trialBadgeHtml = `<div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold uppercase">⚡ Test-Drive de ${trialDays} Dias • Experimente na Prática</div>`;
      }

      const grantedCoursesIds = offer.grantedCourses || [];
      const matchedCourses = coursesList.filter(c => grantedCoursesIds.includes(c.id || c.slug));

      return `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Professor Leonardo Leite • AgoraEuFalo</title>
  <meta name="description" content="${headline}">
  <link rel="icon" type="image/svg+xml" href="../assets/images/favicon.svg">
  <meta name="theme-color" content="#0A192F">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&family=Fira+Code:wght@400;500;700&display=swap" rel="stylesheet">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            serif: ['"Playfair Display"', 'Georgia', 'serif'],
            mono: ['"Fira Code"', 'monospace']
          },
          colors: {
            aef: {
              navy: '#0A192F',
              midnight: '#0D1E36',
              gold: '#C68A36',
              'gold-light': '#E5A955',
              cream: '#FAF8F5',
              border: '#EAE5DC'
            }
          }
        }
      }
    }
  </script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-serif { font-family: 'Playfair Display', serif; }
    .font-mono { font-family: 'Fira Code', monospace; }
  </style>
</head>
<body class="bg-[#FAF8F5] text-slate-900 selection:bg-amber-400 selection:text-slate-950 antialiased">

  <!-- 1. TOP ANNOUNCEMENT BAR -->
  <aside class="bg-[#0A192F] text-slate-200 text-center py-2 px-4 text-xs font-bold border-b border-white/10 flex items-center justify-center gap-2">
    <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
    <span>${badge}: Vagas Oficiais Abertas com o Professor Leonardo Leite</span>
  </aside>

  <!-- 2. NAVBAR -->
  <header class="bg-[#FAF8F5]/90 backdrop-blur-md sticky top-0 z-40 border-b border-[#EAE5DC]">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
      <a href="../index.html" class="flex items-center gap-2">
        <span class="font-serif font-black text-xl tracking-tight text-[#0A192F]">Agora<span class="text-[#C68A36]">EuFalo</span></span>
      </a>
      <div class="flex items-center gap-3">
        <a href="#matricula" class="px-4 sm:px-5 py-2.5 rounded-full bg-[#0A192F] hover:bg-[#C68A36] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition shadow-sm">
          Garantir Minha Vaga ➔
        </a>
      </div>
    </div>
  </header>

  <!-- 3. HERO SECTION -->
  <section class="relative bg-gradient-to-b from-[#0A192F] via-[#0D1E36] to-[#0A192F] text-white py-14 sm:py-20 px-4 sm:px-6 overflow-hidden">
    <div class="max-w-4xl mx-auto text-center space-y-6 relative z-10">
      
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
        <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
        <span>${title}</span>
      </div>

      <h1 class="font-serif font-black text-2xl sm:text-4xl md:text-5xl leading-tight text-white">
        ${headline}
      </h1>

      <p class="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
        ${targetAudience}
      </p>

      ${trialBadgeHtml}

      <!-- VIDEO STAGE (SE HABILITADO) -->
      ${ytId ? `
      <div class="relative max-w-3xl mx-auto rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-2xl bg-black aspect-video mt-8">
        <iframe class="w-full h-full" src="https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0" title="Apresentação Oficial" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
      ` : ''}

      <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="${checkoutUrl}" class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#C68A36] hover:bg-[#B3792A] text-white font-black text-base sm:text-lg uppercase tracking-wider transition shadow-xl hover:scale-105 transform cursor-pointer flex items-center justify-center gap-2">
          <span>Quero Começar Agora</span>
          <i data-lucide="arrow-right" class="w-5 h-5"></i>
        </a>
      </div>

      <div class="flex items-center justify-center gap-6 text-xs text-slate-400 pt-2 font-mono">
        <span class="flex items-center gap-1.5"><i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i> Garantia Incondicional 7 Dias</span>
        <span class="flex items-center gap-1.5"><i data-lucide="zap" class="w-4 h-4 text-amber-400"></i> Acesso Imediato</span>
      </div>
    </div>
  </section>

  <!-- 4. MANIFESTO PEDAGÓGICO DO PROFESSOR LEO -->
  <section class="py-16 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto">
    <div class="bg-amber-50/80 border-2 border-amber-200 rounded-3xl p-6 sm:p-10 space-y-6 text-slate-900 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-[#0A192F] text-amber-300 font-bold flex items-center justify-center text-sm shrink-0">
          LL
        </div>
        <div>
          <h3 class="font-serif font-black text-lg sm:text-xl text-[#0A192F]">O Princípio de 35 Anos de Sala de Aula</h3>
          <span class="text-xs font-bold text-[#C68A36] uppercase tracking-wider">Professor Leonardo Leite</span>
        </div>
      </div>
      <blockquote class="font-serif italic text-lg sm:text-xl text-slate-800 leading-relaxed">
        "Inglês não é matéria de escola para passar em prova; inglês é experiência viva. Repetir a experiência da mesma história até a fala virar reflexo."
      </blockquote>
      <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
        Quem estuda regras e decoreba trava na hora de conversar porque o cérebro tenta montar árvores gramaticais antes de falar. No método <strong>AgoraEuFalo</strong>, trabalhamos a musculatura oral e a velocidade de resposta no bate-pronto através de histórias envolventes e 6 atividades canônicas de escuta e fala ativa.
      </p>
    </div>
  </section>

  <!-- 5. O QUE VOCÊ RECEBE NESTA OFERTA -->
  <section class="py-16 bg-white border-y border-[#EAE5DC] px-4 sm:px-6">
    <div class="max-w-5xl mx-auto space-y-12">
      <div class="text-center space-y-3">
        <span class="text-xs font-mono font-bold text-[#C68A36] uppercase tracking-widest">O QUE ESTÁ INCLUSO</span>
        <h2 class="font-serif font-black text-2xl sm:text-3xl text-[#0A192F]">O Arsenal Completo do Aluno AgoraEuFalo</h2>
      </div>

      <!-- Grid de Cursos Inclusos -->
      ${matchedCourses.length > 0 ? `
      <div class="grid grid-cols-1 md:grid-cols-${Math.min(3, matchedCourses.length)} gap-6">
        ${matchedCourses.map(c => `
          <div class="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl overflow-hidden shadow-xs hover:border-[#C68A36] transition flex flex-col justify-between">
            <div class="h-40 bg-[#0A192F] overflow-hidden relative">
              <img src="../${c.coverImageUrl || 'assets/images/cover-default-aef.jpg'}" alt="${c.title}" class="w-full h-full object-cover">
              <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#C68A36] text-white font-mono font-black text-[9px] uppercase tracking-wider">
                ${c.badge || 'CURSO INCLUSO'}
              </span>
            </div>
            <div class="p-5 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h4 class="font-black text-base text-[#0A192F] leading-snug">${c.title}</h4>
                <p class="text-xs text-slate-600 line-clamp-3 mt-1 leading-relaxed">${c.description || ''}</p>
              </div>
              <span class="text-[11px] font-mono font-bold text-emerald-700 flex items-center gap-1 mt-3">
                <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Acesso 100% Liberado
              </span>
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <!-- Diferenciais do Sistema -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
        ${differentials.map(diff => `
          <div class="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 flex items-start gap-3">
            <div class="w-7 h-7 rounded-xl bg-[#C68A36] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>
            </div>
            <p class="text-xs sm:text-sm font-bold text-slate-900 leading-snug">${diff}</p>
          </div>
        `).join('')}
      </div>

    </div>
  </section>

  <!-- 6. TABELA DE PREÇO & CHECKOUT -->
  <section id="matricula" class="py-20 px-4 sm:px-6 bg-gradient-to-b from-[#FAF8F5] via-amber-50/40 to-[#FAF8F5]">
    <div class="max-w-lg mx-auto bg-white border-2 border-[#C68A36] rounded-3xl p-6 sm:p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
      
      <div class="space-y-1">
        <span class="text-xs font-mono font-bold text-[#C68A36] uppercase tracking-wider">${badge}</span>
        <h3 class="font-serif font-black text-2xl sm:text-3xl text-[#0A192F]">${title}</h3>
      </div>

      <div class="py-4 border-y border-[#EAE5DC] space-y-2">
        <span class="text-xs text-slate-400 line-through">De R$ ${fullPrice.toFixed(2).replace('.', ',')}</span>
        <div class="space-y-1">
          <p class="text-xs font-bold text-slate-600 uppercase">Por Apenas</p>
          <p class="text-3xl sm:text-4xl font-black text-[#0A192F] font-serif">${installments}</p>
          <p class="text-xs text-slate-500 font-mono">ou R$ ${offerPrice.toFixed(2).replace('.', ',')} à vista</p>
        </div>
      </div>

      <a href="${checkoutUrl}" class="w-full py-4 rounded-2xl bg-[#C68A36] hover:bg-[#B3792A] text-white font-black text-base uppercase tracking-wider transition shadow-xl flex items-center justify-center gap-2 cursor-pointer">
        <span>Matricular com Desconto</span>
        <i data-lucide="lock" class="w-4 h-4"></i>
      </a>

      <div class="space-y-2 text-xs text-slate-500">
        <p class="flex items-center justify-center gap-1.5 font-bold text-slate-700">
          <i data-lucide="shield" class="w-4 h-4 text-emerald-600"></i> Pagamento 100% Seguro via Hotmart / Stripe
        </p>
        <p>Acesso liberado imediatamente no seu e-mail com Magic Link.</p>
      </div>

    </div>
  </section>

  <!-- 7. DUVIDAS-BOX COM WHATSAPP DIRETO DO LEO -->
  <section class="py-12 px-4 sm:px-6 max-w-3xl mx-auto">
    <div class="bg-white border-2 border-emerald-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
      <div class="flex items-center gap-4">
        <div class="relative">
          <div class="w-14 h-14 rounded-full bg-[#0A192F] text-amber-300 font-black text-lg flex items-center justify-center border-2 border-emerald-400 shadow-md">
            LL
          </div>
          <span class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse"></span>
        </div>
        <div>
          <span class="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider">💬 Resposta Direta do Leo</span>
          <h4 class="font-serif font-black text-base sm:text-lg text-[#0A192F]">Ficou com alguma dúvida sobre a oferta?</h4>
          <p class="text-xs text-slate-600">Fale diretamente no meu WhatsApp pessoal antes de entrar.</p>
        </div>
      </div>
      <a href="https://wa.me/5531988880000?text=Ol%C3%A1%20Professor%20Leo!%20Tenho%20uma%20d%C3%BAvida%20sobre%20a%20oferta" target="_blank" class="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm shrink-0">
        <i data-lucide="message-circle" class="w-4 h-4"></i>
        <span>Chamar no WhatsApp</span>
      </a>
    </div>
  </section>

  <!-- 8. FOOTER -->
  <footer class="bg-[#0A192F] text-slate-400 py-10 px-4 text-center text-xs space-y-3 border-t border-white/10">
    <p class="font-serif font-bold text-sm text-white">AgoraEuFalo • Professor Leonardo Leite</p>
    <p>© 2026 Todos os direitos reservados. Plataforma de Treino de Reflexo Oral.</p>
    <div class="flex items-center justify-center gap-4 text-[11px] pt-2">
      <a href="../termos-de-uso.html" class="hover:text-amber-400">Termos de Uso</a>
      <span>•</span>
      <a href="../politica-de-privacidade.html" class="hover:text-amber-400">Política de Privacidade</a>
    </div>
  </footer>

  <script>
    if (window.lucide) window.lucide.createIcons();
  </script>
</body>
</html>`;
    }
  }

  window.aefSalesPageGenerator = new AEFSalesPageGenerator();
})(window);
