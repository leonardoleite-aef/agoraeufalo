const fs = require('fs');
let content = fs.readFileSync('cursos.html', 'utf8');

const scriptStartMarker = '// Load courses dynamically from the Registry (or Firestore in the future)';
const scriptEndMarker = '// Modal Logic';

if (content.includes(scriptStartMarker) && content.includes(scriptEndMarker)) {
    const parts1 = content.split(scriptStartMarker);
    const parts2 = parts1[1].split(scriptEndMarker);
    
    const newLogic = `
    // Helper to parse Firestore REST response
    function parseFirestoreDoc(doc) {
      const fields = doc.fields || {};
      const obj = {};
      for (const [key, val] of Object.entries(fields)) {
        if (val.stringValue !== undefined) obj[key] = val.stringValue;
        else if (val.booleanValue !== undefined) obj[key] = val.booleanValue;
        else if (val.integerValue !== undefined) obj[key] = parseInt(val.integerValue, 10);
        else if (val.doubleValue !== undefined) obj[key] = parseFloat(val.doubleValue);
        else if (val.arrayValue !== undefined) obj[key] = val.arrayValue.values ? val.arrayValue.values.map(v => v.stringValue) : [];
        else if (val.mapValue !== undefined) obj[key] = parseFirestoreDoc({fields: val.mapValue.fields});
      }
      return obj;
    }

    // Load courses dynamically from Firestore
    async function loadDynamicCourses() {
      let coursesData = [];
      let offersData = [];
      
      try {
        // Fetch Courses
        const coursesRes = await fetch("https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/courses");
        if (coursesRes.ok) {
          const data = await coursesRes.json();
          if (data && data.documents) {
            coursesData = data.documents.map(doc => {
              const obj = parseFirestoreDoc(doc);
              obj.id = obj.id || doc.name.split("/").pop();
              return obj;
            });
          }
        }
      } catch (err) {
        console.warn("Failed to fetch courses, falling back to registry.", err);
        if (window.AEF_COURSES_REGISTRY) {
          coursesData = Object.values(window.AEF_COURSES_REGISTRY);
        }
      }

      try {
        // Fetch Offers
        const offersRes = await fetch("https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/offers");
        if (offersRes.ok) {
          const data = await offersRes.json();
          if (data && data.documents) {
            offersData = data.documents.map(doc => {
              const obj = parseFirestoreDoc(doc);
              obj.id = obj.id || doc.name.split("/").pop();
              return obj;
            });
          }
        }
      } catch (err) {
        console.warn("Failed to fetch offers.", err);
      }

      // Arrays para separar as categorias
      const clubCourses = [];
      const standaloneCourses = [];
      
      // Process courses
      for (const data of coursesData) {
        // Regra 1: Ignora cursos em rascunho
        if (data.published === false) continue;
        
        // Regra 2: Ignora mentorias VIP individuais (possui studentId ou começa com mentoria-)
        if (data.studentId || data.id.startsWith('mentoria-')) continue;

        // Formata os dados básicos
        const course = {
          id: data.id,
          title: data.title || "Curso AEF",
          headline: data.description || "Treinamento intensivo prático.",
          tags: data.categories || ["Curso Completo"],
          coverImageUrl: data.coverImageUrl || "assets/images/cover-default-aef.jpg",
          accessTier: data.accessTier || "all_access",
          waitlistFallbackMessage: "Inscrições encerradas no momento. Acompanhe as redes sociais para novas vagas.",
          hasActiveOffer: false,
          isClubIncluded: false,
          salesModal: null
        };

        // Categorização Visual: Club vs Avulso
        if (course.accessTier === 'all_access' || course.accessTier === 'free') {
          course.isClubIncluded = true;
          // Os cursos do clube usam o botão "Desbloquear com o Club" que direciona para o plano anual
          course.hasActiveOffer = true; 
          course.salesModal = {
            videoId: "",
            bullets: [
              "Acesso liberado imediatamente pela assinatura AEF Club.",
              "Material de apoio interativo e PDF para download.",
              "Acesso pelo computador, celular ou tablet."
            ],
            priceDisplay: "Incluso no Club",
            checkoutUrl: "aefclub.html#planos",
            customCtaText: "Desbloquear com o Club"
          };
          clubCourses.push(course);
        } 
        else if (course.accessTier === 'standalone') {
          course.isClubIncluded = false;
          
          // Buscar a melhor oferta ativa para este curso
          const productOffers = offersData.filter(o => o.productId === course.id && o.status === 'active');
          
          if (productOffers.length > 0) {
            // Se houver múltiplas, pega a mais recente por createdAt/updatedAt
            productOffers.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
            const activeOffer = productOffers[0];
            
            if (activeOffer.checkoutUrl && !activeOffer.checkoutUrl.includes('OFFER_')) {
              course.hasActiveOffer = true;
              course.salesModal = {
                videoId: activeOffer.salesPageData?.videoEmbedUrl || "", 
                bullets: activeOffer.salesPageData?.differentials || [
                  "Aprenda com situações da vida real e contexto nativo.",
                  "Material de apoio interativo e PDF para download.",
                  "Acesso pelo computador, celular ou tablet."
                ],
                priceDisplay: activeOffer.pricing?.offerPrice ? \`R$ \${activeOffer.pricing.offerPrice.toFixed(2).replace('.', ',')}\` : "Ver Oferta",
                checkoutUrl: activeOffer.checkoutUrl,
                customCtaText: "Saiba Mais"
              };
            }
          }
          standaloneCourses.push(course);
        }
      }
      
      return { clubCourses, standaloneCourses };
    }

    // Render Grid
    async function renderGrid() {
      const grid = document.getElementById('courses-grid');
      // Adicionando um container extra caso não exista, mas o grid original serve pro Avulso.
      // Vamos reconstruir o HTML da seção para suportar duas categorias.
      
      const { clubCourses, standaloneCourses } = await loadDynamicCourses();
      window.CURRENT_COURSES = [...clubCourses, ...standaloneCourses]; // for modal

      let html = "";

      // Seção 1: Inclusos no Club
      if (clubCourses.length > 0) {
        html += \`
          <div class="mb-12">
            <h3 class="text-2xl font-serif font-bold text-slate-900 mb-2">Disponíveis no AEF Club</h3>
            <p class="text-slate-600 mb-8">Todos os cursos abaixo são liberados imediatamente na sua assinatura.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        \`;
        
        clubCourses.forEach(course => html += renderCard(course));
        
        html += \`
            </div>
          </div>
        \`;
      }

      // Seção 2: Avulsos
      if (standaloneCourses.length > 0) {
        html += \`
          <div>
            <h3 class="text-2xl font-serif font-bold text-slate-900 mb-2">Cursos Específicos (Avulsos)</h3>
            <p class="text-slate-600 mb-8">Treinamentos focados vendidos separadamente.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        \`;
        
        standaloneCourses.forEach(course => html += renderCard(course));
        
        html += \`
            </div>
          </div>
        \`;
      }
      
      if (clubCourses.length === 0 && standaloneCourses.length === 0) {
        html = '<p class="text-center text-slate-500 py-10">Nenhum curso disponível no momento.</p>';
      }

      grid.innerHTML = html;
      grid.classList.remove('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-8'); // Remove from parent to allow sections
    }

    function renderCard(course) {
      let ctaHtml = '';
      if (course.hasActiveOffer) {
        const ctaText = course.salesModal?.customCtaText || "Saiba Mais";
        const ctaStyle = course.isClubIncluded 
          ? "bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold"
          : "bg-slate-900 hover:bg-slate-800 text-white font-bold";
          
        if (course.isClubIncluded) {
            // Vai direto pra assinatura
            ctaHtml = \`<a href="aefclub.html#planos" class="mt-auto w-full py-3.5 \${ctaStyle} rounded-xl transition-colors text-center inline-block">\${ctaText}</a>\`;
        } else {
            // Abre o modal de vendas do curso
            ctaHtml = \`<button onclick="openSalesModal('\${course.id}')" class="mt-auto w-full py-3.5 \${ctaStyle} rounded-xl transition-colors">\${ctaText}</button>\`;
        }
      } else {
        ctaHtml = \`<button onclick="alert('\${course.waitlistFallbackMessage}')" class="mt-auto w-full py-3.5 bg-slate-200 text-slate-500 font-bold rounded-xl cursor-not-allowed">Inscrições Esgotadas</button>\`;
      }

      const tagsHtml = course.tags.map(t => \`<span class="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-amber-200/50">\${t}</span>\`).join('');

      return \`
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
          <div class="h-48 bg-slate-200 relative overflow-hidden group">
            <img src="\${course.coverImageUrl}" alt="\${course.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onerror="this.style.display='none'; this.parentElement.classList.add('bg-slate-800')">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div class="p-6 flex-grow flex flex-col">
            <div class="flex flex-wrap gap-1.5 mb-3">\${tagsHtml}</div>
            <h3 class="font-serif font-bold text-xl text-slate-900 mb-2">\${course.title}</h3>
            <p class="text-sm text-slate-600 mb-6 leading-relaxed">\${course.headline}</p>
            \${ctaHtml}
          </div>
        </div>
      \`;
    }

    `;
    
    content = parts1[0] + newLogic + parts2[1];
    fs.writeFileSync('cursos.html', content);
    console.log("Patched JS");
} else {
    console.log("Could not find markers.");
}
