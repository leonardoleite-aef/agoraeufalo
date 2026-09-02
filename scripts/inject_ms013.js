const fs = require('fs');

const ms013Data = JSON.parse(fs.readFileSync('/tmp/ms013_processed_data.json', 'utf8'));

// 1. Monta as 6 aulas estruturadas no padrão canônico de sala-de-aula.html
const ms013Lessons = [
  {
    id: "ms013-lr",
    title: "Aula 01 • Listen & Read (LR)",
    order: 1,
    duration: "03:15",
    description: "Entrada & Imersão Auditiva Completa • A história de Jeremy projetada no Present Perfect contínuo: 'has lived for 10 years'.",
    videoUrl: ms013Data.find(x => x.id === 'ms013-lr').videoUrl,
    audioUrl: ms013Data.find(x => x.id === 'ms013-lr').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms013/thumb_ms013_lr.jpg",
    pdfUrl: "Material-PDF/MS013_Verb_Tense_Practice_Apostila_Oficial.pdf",
    goldenTip: "Observe com atenção aos ouvidos a melodia do Present Perfect: 'has lived for 10 years', 'has been an entrepreneur'.",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="book-open" class="w-4 h-4 text-[#C68A36]"></i>
              Texto da História (Listen & Read)
            </span>
            <span class="text-[10px] font-mono font-bold text-[#C68A36] bg-[#FDF8F0] px-2 py-0.5 rounded border border-[#C68A36]/30">Verb Tense Practice</span>
          </div>

          <div class="space-y-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            <p class="font-bold text-[#0A192F]">Now, let's imagine that this situation has been the same for 10 years:</p>
            <p>Jeremy <b>has lived</b> in Des Moines WA for 10 years. He <b>has lived</b> in a nice house with his family for 10 years.</p>
            <p>His father Steve <b>has been</b> an entrepreneur for 10 years. His mother Anna <b>has been</b> a yoga instructor for 10 years. They all <b>have lived</b> in a house very close to the sea for 10 years.</p>
            <p>Jeremy <b>has been</b> a student for 10 years. He <b>has been going</b> to Mount Rainier High School for 1 year. He <b>has been practicing</b> in the JV basketball team for 1 year.</p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms013-lr"
  },
  {
    id: "ms013-voc",
    title: "Aula 02 • Vocabulary Session (VOC)",
    order: 2,
    duration: "13:46",
    description: "Matriz de Chunks & O Sentimento da Estrutura • Transição do Presente Simples para o Present Perfect contínuo com 'for 10 years'.",
    videoUrl: ms013Data.find(x => x.id === 'ms013-voc').videoUrl,
    audioUrl: ms013Data.find(x => x.id === 'ms013-voc').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms013/thumb_ms013_voc.jpg",
    pdfUrl: "Material-PDF/MS013_Verb_Tense_Practice_Apostila_Oficial.pdf",
    goldenTip: "O Present Perfect com 'for' não é passado acabado; é uma ação que começou lá atrás e continua valendo até hoje.",
    processedContentHtml: `
      <div class="space-y-4">
        <!-- Card 1: Tradução Falada Real -->
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="languages" class="w-4 h-4 text-[#C68A36]"></i>
              Texto com Tradução Falada Real
            </span>
            <span class="text-[10px] font-mono font-bold text-[#C68A36] bg-[#FDF8F0] px-2 py-0.5 rounded border border-[#C68A36]/30">Português Brasileiro Real</span>
          </div>

          <div class="space-y-3 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">Jeremy has lived in Des Moines WA for 10 years.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ O Jeremy mora em Des Moines há 10 anos (começou há 10 anos e continua morando lá).</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">His father Steve has been an entrepreneur for 10 years.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ O pai dele, o Steve, é empresário há 10 anos.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">His mother Anna has been a yoga instructor for 10 years.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ A mãe dele, a Anna, trabalha como instrutora de yoga há 10 anos.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">He has been practicing in the JV basketball team for 1 year.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ Ele vem treinando no time júnior de basquete há 1 ano.</p>
            </div>
          </div>
        </div>

        <!-- Card 2: Chunks Acústicos -->
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="layers" class="w-4 h-4 text-[#C68A36]"></i>
              Matriz de Chunks Sonoros
            </span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>Has lived for 10 years</b><br/><span class="text-[11px] text-slate-500">Mora há 10 anos</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>Has been an entrepreneur</b><br/><span class="text-[11px] text-slate-500">É empresário há...</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>Has been going to</b><br/><span class="text-[11px] text-slate-500">Vem frequentando</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>For the past year</b><br/><span class="text-[11px] text-slate-500">Durante o último ano</span></div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms013-voc"
  },
  {
    id: "ms013-la",
    title: "Aula 03 • Listen & Answer (LA)",
    order: 3,
    duration: "08:18",
    description: "Reflexo & Velocidade de Resposta no Present Perfect • Perguntas de 'How long?' e 'Where has he lived?'.",
    videoUrl: ms013Data.find(x => x.id === 'ms013-la').videoUrl,
    audioUrl: ms013Data.find(x => x.id === 'ms013-la').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms013/thumb_ms013_la.jpg",
    pdfUrl: "Material-PDF/MS013_Verb_Tense_Practice_Apostila_Oficial.pdf",
    goldenTip: "Responda de bate-pronto: 'In Des Moines', 'For 10 years', 'An entrepreneur'.",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="zap" class="w-4 h-4 text-[#D97706]"></i>
              Perguntas de Reflexo (Listen & Answer)
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800 font-medium pt-2">
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">1. Where has Jeremy lived for the past 10 years?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">2. How long has Jeremy lived in a house with his family?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">3. How long has Steve been an entrepreneur?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">4. What has Anna done for the past 10 years?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">5. How long has Jeremy been a student?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">6. Where has Jeremy been going to school for the past year?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">7. Has Jeremy been practicing basketball for 10 years?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">8. How long has he been practicing with the JV team?</div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms013-la"
  },
  {
    id: "ms013-lrt",
    title: "Aula 04 • Look & Retell (LRT)",
    order: 4,
    duration: "05:48",
    description: "Speaking Ativo & Reconto Temporal • Conte a história de Jeremy e sua família usando a perspectiva de 10 anos.",
    videoUrl: ms013Data.find(x => x.id === 'ms013-lrt').videoUrl,
    audioUrl: ms013Data.find(x => x.id === 'ms013-lrt').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms013/thumb_ms013_lrt.jpg",
    pdfUrl: "Material-PDF/MS013_Verb_Tense_Practice_Apostila_Oficial.pdf",
    goldenTip: "Use as âncoras de tempo: 'for 10 years', 'for the past year', 'since he was a kid'.",
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
            <p class="font-bold text-[#0A192F]">Linha de Apoio do Reconto:</p>
            <p class="text-[#E11D48] font-mono">Lived in Des Moines (10 yrs) ➔ Steve entrepreneur (10 yrs) ➔ Anna yoga instructor (10 yrs) ➔ High School (1 yr) ➔ JV Basketball (1 yr)</p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms013-lrt"
  },
  {
    id: "ms013-lask",
    title: "Aula 05 • Listen & Ask (LASK)",
    order: 5,
    duration: "16:41",
    description: "Desafio de Perguntas Rápidas (How long / Where / What) • Formule as perguntas no Present Perfect no reflexo.",
    videoUrl: ms013Data.find(x => x.id === 'ms013-lask').videoUrl,
    audioUrl: ms013Data.find(x => x.id === 'ms013-lask').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms013/thumb_ms013_lask.jpg",
    pdfUrl: "Material-PDF/MS013_Verb_Tense_Practice_Apostila_Oficial.pdf",
    goldenTip: "Ao ouvir 'He lives in Des Moines' + 'for 10 years', pergunte: 'How long has he lived in Des Moines?'.",
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
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>\"He lives in Des Moines (for 10 years)\"</i> ➔ <b>Pergunta: How long has he lived in Des Moines?</b></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>\"His father is an entrepreneur (for 10 years)\"</i> ➔ <b>Pergunta: How long has his father been an entrepreneur?</b></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>\"Jeremy plays basketball (for 1 year)\"</i> ➔ <b>Pergunta: How long has Jeremy been playing basketball?</b></div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms013-lask"
  },
  {
    id: "ms013-pro",
    title: "Aula 06 • Pronunciation & Connected Speech",
    order: 6,
    duration: "05:41",
    description: "Musicalidade & Conexões do Present Perfect • Reduções de 'has lived' (/həz-lɪvd/) e 'has been' (/həz-bɪn/).",
    videoUrl: ms013Data.find(x => x.id === 'ms013-pro').videoUrl,
    audioUrl: ms013Data.find(x => x.id === 'ms013-pro').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms013/thumb_ms013_pro.jpg",
    pdfUrl: "Material-PDF/MS013_Verb_Tense_Practice_Apostila_Oficial.pdf",
    goldenTip: "Ligue 'has lived in a' (/həz-lɪvd-ɪ-nə/) em um único sopro vocal sem pausas.",
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
            <p>🔗 <b>has_lived_in_a_nice_house</b> ➔ <i>/həz-lɪvd-ɪ-nə-naɪs-haʊs/</i></p>
            <p>🔗 <b>has_been_an_entrepreneur</b> ➔ <i>/həz-bɪ-nən-ɑːn-trə-prə-nʊr/</i></p>
            <p>🔗 <b>for_the_past_ten_years</b> ➔ <i>/fər-ðə-pæst-tɛn-jɪrz/</i></p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms013-pro"
  }
];

// 2. Injeta em sala-de-aula.html
let salaHtml = fs.readFileSync('sala-de-aula.html', 'utf8');
if (!salaHtml.includes('ms013-verb-tense-practice')) {
  console.log("Injetando MS013 em sala-de-aula.html...");
  const newModuleObj = {
    id: "ms013-verb-tense-practice",
    title: "MS013 - Verb Tense Practice",
    shortTitle: "MS013 (Verb Tense Practice)",
    badge: "MÓDULO MS013 • VERB TENSE PRACTICE",
    stats: "6 Aulas • 53 min",
    lessons: ms013Lessons
  };
  const rx = /(trainingTrackId:\s*\"ms012-pro-2\"[\s\S]*?\}\s*\]\s*\})/;
  salaHtml = salaHtml.replace(rx, '$1,\n          ' + JSON.stringify(newModuleObj, null, 12).trim());
  fs.writeFileSync('sala-de-aula.html', salaHtml, 'utf8');
  console.log("sala-de-aula.html atualizado com MS013!");
}

// 3. Injeta em curso.html
let cursoHtml = fs.readFileSync('curso.html', 'utf8');
if (!cursoHtml.includes('ms013-verb-tense-practice')) {
  console.log("Injetando MS013 em curso.html...");
  const cursoModObj = {
    id: "ms013-verb-tense-practice",
    order: 13,
    title: "MS013 - Verb Tense Practice",
    description: "Prática intensiva de tempos verbais com a história de Jeremy: transição do Presente Simples para o Present Perfect contínuo com 'for 10 years'.",
    lessons: ms013Lessons.map(l => ({
      id: l.id,
      order: l.order,
      title: l.title.replace(' • ', ': '),
      duration: l.duration,
      thumbnailUrl: l.thumbnailUrl
    }))
  };
  const rxC = /(id:\s*\"ms012-drivers-license\"[\s\S]*?\}\s*\]\s*\})/;
  cursoHtml = cursoHtml.replace(rxC, '$1,\n          ' + JSON.stringify(cursoModObj, null, 10).trim());
  fs.writeFileSync('curso.html', cursoHtml, 'utf8');
  console.log("curso.html atualizado com MS013!");
}

// 4. Injeta em magic-stories.js
let msJs = fs.readFileSync('treino/data/magic-stories.js', 'utf8');
const objMatch = msJs.match(/window\.AEF_MAGIC_STORIES\s*=\s*(\{[\s\S]*?\n\});/);
if (objMatch) {
  const data = eval('(' + objMatch[1] + ')');
  data.modules = data.modules.filter(m => m.id !== 'ms013-verb-tense-practice');
  data.modules.push({
    id: "ms013-verb-tense-practice",
    number: "13",
    title: "MS013 - Verb Tense Practice",
    shortTitle: "MS013 • Verb Tense",
    badge: "MÓDULO MS013 • VERB TENSE PRACTICE",
    coverImage: "../assets/images/thumbs/ms013/thumb_ms013_lr.jpg",
    summary: "Jeremy e sua família em Des Moines sob a perspectiva de 10 anos: o uso fluido do Present Perfect (has lived, has been) e Connected Speech.",
    goldenTip: "Ligue 'has lived in a' e 'for 10 years' em uma única respiração melódica.",
    tracks: ms013Data.map(tr => ({
      id: tr.id,
      moduleId: "ms013-verb-tense-practice",
      title: tr.title,
      activity: tr.activity,
      duration: "04:00",
      videoUrl: tr.videoUrl,
      audioUrl: tr.audioUrl,
      coverImage: "../" + tr.localThumbnail,
      goldenTip: "Acompanhe a história no Present Perfect e ative o reflexo sem tradução mental.",
      sentences: tr.sentences
    }))
  });
  fs.writeFileSync('treino/data/magic-stories.js', `window.AEF_MAGIC_STORIES = ${JSON.stringify(data, null, 2)};\n`, 'utf8');
  console.log("magic-stories.js atualizado com MS013!");
}
