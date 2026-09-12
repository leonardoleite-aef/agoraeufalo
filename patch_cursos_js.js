const fs = require('fs');
let content = fs.readFileSync('cursos.html', 'utf8');

// First, inject the registry script in the head
if (!content.includes('aef-courses-registry.js')) {
    content = content.replace('</head>', '  <script src="assets/js/aef-courses-registry.js"></script>\n</head>');
}

// Then replace the MOCK_COURSES and renderGrid logic
const scriptStartMarker = '// Mock Database for Cursos Avulsos (This would be fetched from Firestore in production)';
const scriptEndMarker = '// Modal Logic';

if (content.includes(scriptStartMarker) && content.includes(scriptEndMarker)) {
    const parts1 = content.split(scriptStartMarker);
    const parts2 = parts1[1].split(scriptEndMarker);
    
    const newLogic = `
    // Load courses dynamically from the Registry (or Firestore in the future)
    function loadDynamicCourses() {
      if (!window.AEF_COURSES_REGISTRY) return [];
      
      const courses = [];
      for (const [id, data] of Object.entries(window.AEF_COURSES_REGISTRY)) {
        // Exclude mentorships (studentId) and unpublished courses
        if (data.published === true && !data.studentId) {
          
          // Map to the format expected by the UI
          courses.push({
            id: data.id,
            title: data.title,
            headline: data.description || "Treinamento intensivo prático.",
            tags: data.categories || ["Curso Completo"],
            coverImageUrl: data.coverImageUrl || "assets/images/cover-default-aef.jpg",
            hasActiveOffer: !!data.standaloneCheckoutHotmart,
            salesModal: {
              videoId: data.salesVideoId || "", // If empty, video will be hidden
              bullets: [
                "Aprenda com situações da vida real e contexto nativo.",
                "Material de apoio interativo e PDF para download.",
                "Acesso pelo computador, celular ou tablet."
              ],
              priceDisplay: "Ver Oferta",
              checkoutUrl: data.standaloneCheckoutHotmart || "https://pay.hotmart.com/T107479074N?off=mgwnab3h"
            },
            waitlistFallbackMessage: "Inscrições encerradas no momento. Acompanhe as redes sociais para novas vagas."
          });
        }
      }
      return courses;
    }

    // Render Grid
    function renderGrid() {
      const grid = document.getElementById('courses-grid');
      grid.innerHTML = ''; // Clear skeleton

      window.CURRENT_COURSES = loadDynamicCourses();

      window.CURRENT_COURSES.forEach(course => {
        const card = document.createElement('div');
        card.className = "bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full";
        
        let ctaHtml = '';
        if (course.hasActiveOffer) {
          ctaHtml = \`<button onclick="openSalesModal('\${course.id}')" class="mt-auto w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors">Saiba Mais</button>\`;
        } else {
          ctaHtml = \`<button onclick="alert('\${course.waitlistFallbackMessage}')" class="mt-auto w-full py-3.5 bg-slate-200 text-slate-500 font-bold rounded-xl cursor-not-allowed">Inscrições Esgotadas</button>\`;
        }

        const tagsHtml = course.tags.map(t => \`<span class="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-amber-200/50">\${t}</span>\`).join('');

        card.innerHTML = \`
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
        \`;
        grid.appendChild(card);
      });
    }

    `;
    
    // We also need to fix openSalesModal to use window.CURRENT_COURSES instead of MOCK_COURSES
    // So we will patch openSalesModal as well
    const parts3 = parts2[1].split('function openSalesModal(courseId) {');
    const parts4 = parts3[1].split('function closeSalesModal() {');
    
    const newOpenModal = `
    function openSalesModal(courseId) {
      const course = window.CURRENT_COURSES.find(c => c.id === courseId);
      if(!course || !course.salesModal) return;

      // Populate data
      document.getElementById('modal-title').textContent = course.title;
      document.getElementById('modal-price').textContent = course.salesModal.priceDisplay;
      
      const checkoutBtn = document.getElementById('modal-checkout-btn');
      if (checkoutBtn) checkoutBtn.href = course.salesModal.checkoutUrl;
      
      const tagsContainer = document.getElementById('modal-tags');
      tagsContainer.innerHTML = course.tags.map(t => \`<span class="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-amber-200/50">\${t}</span>\`).join('');

      const bulletsContainer = document.getElementById('modal-bullets');
      bulletsContainer.innerHTML = course.salesModal.bullets.map(b => \`
        <li class="flex items-start gap-2.5 text-slate-700 text-sm">
          <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-500 shrink-0 mt-0.5"></i>
          <span>\${b}</span>
        </li>
      \`).join('');

      const videoFrame = document.getElementById('modal-video');
      if (course.salesModal.videoId) {
        videoFrame.src = \`https://www.youtube.com/embed/\${course.salesModal.videoId}?autoplay=1\`;
        videoFrame.parentElement.style.display = 'block';
      } else {
        videoFrame.src = '';
        videoFrame.parentElement.style.display = 'none'; // hide video container if no video
      }

      lucide.createIcons();

      // Show modal with animation
      modalEl.classList.remove('hidden');
      setTimeout(() => {
        modalEl.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
      }, 10);
    }
    
    `;
    
    content = parts1[0] + newLogic + parts3[0] + newOpenModal + 'function closeSalesModal() {' + parts4[1];
    
    fs.writeFileSync('cursos.html', content);
    console.log("Patched JS");
} else {
    console.log("Could not find markers.");
}
