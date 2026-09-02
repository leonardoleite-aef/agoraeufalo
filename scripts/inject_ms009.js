const fs = require('fs');

const ms009Data = JSON.parse(fs.readFileSync('/tmp/ms009_processed_data.json', 'utf8'));

// 1. Monta as 6 aulas estruturadas no padrão canônico de sala-de-aula.html
const ms009Lessons = [
  {
    id: "ms009-lr",
    title: "Aula 01 • Listen & Read (LR)",
    order: 1,
    duration: "05:07",
    description: "Entrada & Imersão Auditiva • The Story in 5 Years: Acompanhe a história projetada 5 anos no futuro.",
    videoUrl: ms009Data.find(x => x.id === 'ms009-lr').videoUrl,
    audioUrl: ms009Data.find(x => x.id === 'ms009-lr').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms009/thumb_ms009_lr.jpg",
    pdfUrl: "Material-PDF/MS009_The_Story_in_Five_Years_Apostila_Oficial.pdf",
    goldenTip: "Observe pelos ouvidos como o falante nativo alterna espontaneamente entre 'will', 'is going to' e 'gonna'.",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="book-open" class="w-4 h-4 text-[#C68A36]"></i>
              Texto da História (Listen & Read)
            </span>
            <span class="text-[10px] font-mono font-bold text-[#C68A36] bg-[#FDF8F0] px-2 py-0.5 rounded border border-[#C68A36]/30">The Story in 5 Years</span>
          </div>

          <div class="space-y-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            <p>Imagine the story in 5 years from now.</p>
            <p>In five years, Grazi will meet Tom in USA. They will start dating. In five years Grazi is gonna go back to Brazil and they will continue dating online for a few months.</p>
            <p>In five years Tom is going to travel to Brazil on vacation to spend some time with Grazi. In five years Grazi will go to USA with Tom and they are gonna get married.</p>
            <p>In five years, they will live in USA for a while. Grazi is going to get pregnant and they will decide to move back to Brazil. Grazi will come first.</p>
            <p>In five years, after Grazi gets to Brazil, she will live with her parents in Brasília. In five years, Tom is going to move to Brasília but he'll keep his job in America. He will start working from home in Brazil and he's gonna travel to USA twice a month.</p>
            <p>In five years Tom and Grazi are going to rent an apartment in Brasília. In five years their first daughter will be born and Grazi's parents will help the couple with the baby.</p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms009-lr"
  },
  {
    id: "ms009-voc",
    title: "Aula 02 • Vocabulary Session (VOC)",
    order: 2,
    duration: "06:55",
    description: "Matriz de Chunks & Tradução Falada Real • As 3 formas de futuro no inglês real (Will / Is going to / Gonna).",
    videoUrl: ms009Data.find(x => x.id === 'ms009-voc').videoUrl,
    audioUrl: ms009Data.find(x => x.id === 'ms009-voc').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms009/thumb_ms009_voc.jpg",
    pdfUrl: "Material-PDF/MS009_The_Story_in_Five_Years_Apostila_Oficial.pdf",
    goldenTip: "'Will' expressa decisão e previsão; 'Going to / Gonna' expressa planos já desenhados no horizonte.",
    processedContentHtml: `
      <div class="space-y-4">
        <!-- Card 1: Texto com Tradução Falada Real -->
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="languages" class="w-4 h-4 text-[#C68A36]"></i>
              Texto da História com Tradução Falada Real
            </span>
            <span class="text-[10px] font-mono font-bold text-[#C68A36] bg-[#FDF8F0] px-2 py-0.5 rounded border border-[#C68A36]/30">Português Brasileiro Real</span>
          </div>

          <div class="space-y-3 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">In five years, Grazi will meet Tom in USA. They will start dating.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ Daqui a 5 anos, a Grazi vai conhecer o Tom nos EUA. Eles vão começar a namorar.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">In five years Grazi is gonna go back to Brazil and they will continue dating online for a few months.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ Daqui a 5 anos a Grazi vai voltar para o Brasil e eles vão continuar namorando online por alguns meses.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">Tom is going to travel to Brazil on vacation to spend some time with Grazi. Grazi will go to USA with Tom and they are gonna get married.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ O Tom vai viajar para o Brasil de férias para passar um tempo com a Grazi. A Grazi vai para os EUA com o Tom e eles vão se casar.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">Grazi is going to get pregnant and they will decide to move back to Brazil. Grazi will come first.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ A Grazi vai ficar grávida e eles vão decidir se mudar de volta para o Brasil. A Grazi vai vir primeiro.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">Tom is going to move to Brasília but he'll keep his job in America. He will start working from home in Brazil and he's gonna travel to USA twice a month.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ O Tom vai se mudar para Brasília mas vai manter o emprego dele na América. Ele vai começar a trabalhar de casa no Brasil e vai viajar para os EUA duas vezes por mês.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">Tom and Grazi are going to rent an apartment in Brasília. Their first daughter will be born and Grazi's parents will help the couple with the baby.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ O Tom e a Grazi vão alugar um apartamento em Brasília. A primeira filha deles vai nascer e os pais da Grazi vão ajudar o casal com o bebê.</p>
            </div>
          </div>
        </div>

        <!-- Card 2: As 3 Formas do Futuro -->
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="layers" class="w-4 h-4 text-[#C68A36]"></i>
              As 3 Formas Naturais do Futuro
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
              <span class="font-black text-blue-900 block text-sm">1. WILL</span>
              <span class="text-slate-600">Previsão direta e certeza:<br/><b>They will meet in USA.</b></span>
            </div>
            <div class="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
              <span class="font-black text-emerald-900 block text-sm">2. IS GOING TO</span>
              <span class="text-slate-600">Plano já em andamento:<br/><b>Tom is going to travel.</b></span>
            </div>
            <div class="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
              <span class="font-black text-amber-900 block text-sm">3. GONNA (Redução)</span>
              <span class="text-slate-600">Ritmo da fala rápida real:<br/><b>Grazi is gonna go back.</b></span>
            </div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms009-voc"
  },
  {
    id: "ms009-la",
    title: "Aula 03 • Listen & Answer (LA)",
    order: 3,
    duration: "07:50",
    description: "Reflexo & Velocidade no Futuro • Perguntas de bate-pronto projetadas em 5 anos.",
    videoUrl: ms009Data.find(x => x.id === 'ms009-la').videoUrl,
    audioUrl: ms009Data.find(x => x.id === 'ms009-la').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms009/thumb_ms009_la.jpg",
    pdfUrl: "Material-PDF/MS009_The_Story_in_Five_Years_Apostila_Oficial.pdf",
    goldenTip: "Responda no reflexo com respostas curtas e naturais no futuro!",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="zap" class="w-4 h-4 text-[#D97706]"></i>
              Perguntas de Reflexo no Futuro (Listen & Answer)
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800 font-medium pt-2">
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">1. Where will Grazi meet Tom?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">2. What will they start doing?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">3. Where is Grazi gonna go?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">4. What will they do for a few months?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">5. Where is Tom going to travel on vacation?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">6. What is Tom going to do in Brazil?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">7. What will Tom and Grazi do in USA 5 years from now?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">8. Where will they live?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">9. What is gonna happen to Grazi in America?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">10. What will they decide to do?</div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms009-la"
  },
  {
    id: "ms009-lrt",
    title: "Aula 04 • Look & Retell (LRT)",
    order: 4,
    duration: "04:54",
    description: "Speaking Ativo & Reconto no Futuro • Projete a vida de Grazi e Tom nos próximos 5 anos.",
    videoUrl: ms009Data.find(x => x.id === 'ms009-lrt').videoUrl,
    audioUrl: ms009Data.find(x => x.id === 'ms009-lrt').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms009/thumb_ms009_lrt.jpg",
    pdfUrl: "Material-PDF/MS009_The_Story_in_Five_Years_Apostila_Oficial.pdf",
    goldenTip: "Use 'In five years...' para introduzir cada evento futuro da história.",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="mic" class="w-4 h-4 text-[#E11D48]"></i>
              Palco de Reconto (Look & Retell)
            </span>
          </div>
          <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1.5 text-xs text-slate-800">
            <p class="font-bold text-[#0A192F]">Palavras-Chave de Apoio:</p>
            <p class="text-[#E11D48] font-mono">In 5 years: Will meet in USA ➔ Will start dating ➔ Gonna go back to Brazil ➔ Will get married ➔ Is gonna get pregnant ➔ Will rent an apartment ➔ First daughter will be born</p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms009-lrt"
  },
  {
    id: "ms009-lask",
    title: "Aula 05 • Listen & Ask (LASK)",
    order: 5,
    duration: "09:08",
    description: "Desafio de Perguntas no Futuro • Formule as perguntas rápidas com Will e Is going to.",
    videoUrl: ms009Data.find(x => x.id === 'ms009-lask').videoUrl,
    audioUrl: ms009Data.find(x => x.id === 'ms009-lask').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms009/thumb_ms009_lask.jpg",
    pdfUrl: "Material-PDF/MS009_The_Story_in_Five_Years_Apostila_Oficial.pdf",
    goldenTip: "Formule a pergunta de bate-pronto ao ouvir as respostas afirmativas.",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="help-circle" class="w-4 h-4 text-[#6366F1]"></i>
              Formulação de Perguntas (Listen & Ask)
            </span>
          </div>
          <div class="space-y-2 text-xs text-slate-800">
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>"They will meet in America."</i> ➔ <b>Pergunta: Where will they meet?</b></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>"They will start dating."</i> ➔ <b>Pergunta: What will they start doing?</b></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>"He is going to travel to Brazil."</i> ➔ <b>Pergunta: Where is he going to travel?</b></div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms009-lask"
  },
  {
    id: "ms009-pro",
    title: "Aula 06 • Pronunciation & Connected Speech",
    order: 6,
    duration: "05:24",
    description: "Musicalidade & Reduções de Futuro • Ritmo mecânico e Sacada de Ouro do Leo.",
    videoUrl: ms009Data.find(x => x.id === 'ms009-pro').videoUrl,
    audioUrl: ms009Data.find(x => x.id === 'ms009-pro').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms009/thumb_ms009_pro.jpg",
    pdfUrl: "Material-PDF/MS009_The_Story_in_Five_Years_Apostila_Oficial.pdf",
    goldenTip: "Ligue 'is gonna go' (/ɪz-ɡənə-ɡoʊ/) e 'he'll keep' (/hiːl-kiːp/) sem pausas duras.",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="music" class="w-4 h-4 text-[#0D9488]"></i>
              Connected Speech & Linking Sounds
            </span>
          </div>
          <div class="space-y-2 text-xs sm:text-sm text-slate-800 leading-relaxed font-mono">
            <p>🔗 <b>is_gonna_go_back</b> ➔ <i>/ɪz-ɡənə-ɡoʊ-bæk/</i></p>
            <p>🔗 <b>he'll_keep_his_job</b> ➔ <i>/hiːl-kiːp-hɪz-dʒɑːb/</i></p>
            <p>🔗 <b>daughter_will_be_born</b> ➔ <i>/dɔː-tər-wɪl-bi-bɔːrn/</i></p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms009-pro"
  }
];

// 2. Injeta em sala-de-aula.html
let salaHtml = fs.readFileSync('sala-de-aula.html', 'utf8');
if (!salaHtml.includes('ms009-grammar-practice')) {
  console.log("Injetando MS009 em sala-de-aula.html...");
  const newModuleObj = {
    id: "ms009-grammar-practice",
    title: "MS009 - Grammar Practice",
    shortTitle: "MS009 (Grammar Practice)",
    badge: "MÓDULO MS009 • GRAMMAR PRACTICE",
    stats: "6 Aulas • 39 min",
    lessons: ms009Lessons
  };
  const marker = 'id: "ms008-back-in-1999",';
  const insertAfter = 'trainingTrackId: "ms008-pro"\n              }\n            ]\n          }';
  if (salaHtml.includes(insertAfter)) {
    const injection = insertAfter + ',\n          ' + JSON.stringify(newModuleObj, null, 12).trim();
    salaHtml = salaHtml.replace(insertAfter, injection);
    fs.writeFileSync('sala-de-aula.html', salaHtml, 'utf8');
    console.log("sala-de-aula.html atualizado com MS009!");
  }
}

// 3. Injeta em curso.html
let cursoHtml = fs.readFileSync('curso.html', 'utf8');
if (!cursoHtml.includes('ms009-grammar-practice')) {
  console.log("Injetando MS009 em curso.html...");
  const cursoModObj = {
    id: "ms009-grammar-practice",
    order: 9,
    title: "MS009 - Grammar Practice (The Story in 5 Years)",
    description: "Projeção da história 5 anos no futuro: domínio de Will, Is going to, Gonna e a musicalidade de planos e previsões.",
    lessons: ms009Lessons.map(l => ({
      id: l.id,
      order: l.order,
      title: l.title.replace(' • ', ': '),
      duration: l.duration,
      thumbnailUrl: l.thumbnailUrl
    }))
  };
  const cursoInsertAfter = 'thumbnailUrl: "assets/images/thumbs/ms008/thumb_ms008_pro.jpg" }\n            ]\n          }';
  if (cursoHtml.includes(cursoInsertAfter)) {
    cursoHtml = cursoHtml.replace(cursoInsertAfter, cursoInsertAfter + ',\n          ' + JSON.stringify(cursoModObj, null, 10).trim());
    fs.writeFileSync('curso.html', cursoHtml, 'utf8');
    console.log("curso.html atualizado com MS009!");
  }
}

// 4. Injeta em magic-stories.js
let msPlayerJs = fs.readFileSync('treino/data/magic-stories.js', 'utf8');
if (!msPlayerJs.includes('ms009-grammar-practice')) {
  console.log("Injetando MS009 em magic-stories.js...");
  const playerModuleObj = {
    id: "ms009-grammar-practice",
    number: "09",
    title: "MS009 - Grammar Practice",
    shortTitle: "MS009 • In 5 Years",
    badge: "MÓDULO MS009 • GRAMMAR PRACTICE",
    coverImage: "../assets/images/thumbs/ms009/thumb_ms009_lr.jpg",
    summary: "A projeção da história de Grazi e Tom nos próximos 5 anos: o uso fluido de Will, Going to e Gonna no inglês falado.",
    goldenTip: "Ligue 'is gonna go back' e 'he'll keep his job' em um único sopro contínuo.",
    tracks: ms009Data.map(tr => ({
      id: tr.id,
      moduleId: "ms009-grammar-practice",
      title: tr.title,
      activity: tr.activity,
      duration: "05:00",
      videoUrl: tr.videoUrl,
      audioUrl: tr.audioUrl,
      coverImage: "../" + tr.localThumbnail,
      goldenTip: "Acompanhe a melodia falada no futuro e ative o reflexo sem tradução mental.",
      sentences: tr.sentences
    }))
  };
  
  const endModulePattern = /(\n\s*modules:\s*\[[\s\S]*?)(\n\s*\]\s*\n\s*\};)/;
  msPlayerJs = msPlayerJs.replace(endModulePattern, '$1,\n    ' + JSON.stringify(playerModuleObj, null, 4) + '$2');
  fs.writeFileSync('treino/data/magic-stories.js', msPlayerJs, 'utf8');
  console.log("magic-stories.js atualizado com MS009!");
}
