const fs = require('fs');

const ms014Data = JSON.parse(fs.readFileSync('/tmp/ms014_processed_data.json', 'utf8'));

// 1. Monta as 6 aulas estruturadas no padrão canônico de sala-de-aula.html
const ms014Lessons = [
  {
    id: "ms014-lr",
    title: "Aula 01 • Listen & Read (LR)",
    order: 1,
    duration: "05:14",
    description: "Entrada & Imersão Auditiva • Jeremy Goes to Town: Jeremy compra sua picape, vai ao jogo de futebol da escola, convida Becky para comer no Red Robin's em Seattle e passa por um momento hilário e embaraçoso.",
    videoUrl: ms014Data.find(x => x.id === 'ms014-lr').videoUrl,
    audioUrl: ms014Data.find(x => x.id === 'ms014-lr').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms014/thumb_ms014_lr.jpg",
    pdfUrl: "Material-PDF/MS014_Jeremy_Goes_to_Town_Apostila_Oficial.pdf",
    goldenTip: "Acompanhe as expressões cotidianas: 'night on the town', 'grab a bite', 'I gotta get going!', 'stick around'.",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="book-open" class="w-4 h-4 text-[#C68A36]"></i>
              Texto da História (Listen & Read)
            </span>
            <span class="text-[10px] font-mono font-bold text-[#C68A36] bg-[#FDF8F0] px-2 py-0.5 rounded border border-[#C68A36]/30">Jeremy Goes to Town</span>
          </div>

          <div class="space-y-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            <p>Jeremy bought a car last weekend. He bought a pick up truck. How did he buy his car? Well, he has saved money for about 2 years now and his parents helped him a little bit. From now on, no more school buses!</p>
            <p>It was a Friday evening and Jeremy was very excited. He and his friends were going to have a night on the town.</p>
            <p>First they went to a football game at school. Jeremy saw a beautiful girl: Becky. He invited her to grab a bite after the game.</p>
            <p>So, Jeremy, Becky, and some friends went to Red Robin's in Seattle. It's a great place! They all had chicken wings, steak, and baked potato. Jeremy and Becky talked and had fun together.</p>
            <p>At 11 PM Jeremy said: "I gotta get going!" And Becky said: "So soon? Stick around and have a beer with me!"</p>
            <p>Jeremy got surprised and asked: "What do you mean? How old are you?" Becky answered: "21. What about you?" Jeremy got embarrassed and said: "16."</p>
            <p class="font-bold text-[#0A192F] pt-1">Is Jeremy too young for Becky? Is Becky too old for Jeremy? You tell me!</p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms014-lr"
  },
  {
    id: "ms014-voc",
    title: "Aula 02 • Vocabulary Session (VOC)",
    order: 2,
    duration: "12:36",
    description: "Matriz de Chunks & Tradução Falada Real • Expressões idiomáticas americanas autênticas.",
    videoUrl: ms014Data.find(x => x.id === 'ms014-voc').videoUrl,
    audioUrl: ms014Data.find(x => x.id === 'ms014-voc').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms014/thumb_ms014_voc.jpg",
    pdfUrl: "Material-PDF/MS014_Jeremy_Goes_to_Town_Apostila_Oficial.pdf",
    goldenTip: "Aprenda o uso do modificador 'too' para excesso: 'too young' (jovem demais), 'too old' (velha demais), 'too expensive' (caro demais).",
    processedContentHtml: `
      <div class="space-y-4">
        <!-- Card 1: Texto com Tradução Falada Real -->
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
              <p class="font-bold text-[#0A192F]">Jeremy bought a car last weekend. He bought a pick up truck.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ O Jeremy comprou um carro no fim de semana passado. Comprou uma picape.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">He and his friends were going to have a night on the town.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ Ele e os amigos iam curtir uma noitada na cidade.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">He invited her to grab a bite after the game.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ Ele convidou ela para comer alguma coisa rápida depois do jogo.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">At 11pm Jeremy said: "I gotta get going!" And Becky said: "Stick around and have a beer with me!"</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ Às 23h o Jeremy disse: "Preciso dar o fora / ir embora!". E a Becky: "Já? Fica mais um pouco e toma uma cerveja comigo!"</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">Jeremy got embarrassed and said: "16."</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ O Jeremy ficou morrendo de vergonha e disse: "16."</p>
            </div>
          </div>
        </div>

        <!-- Card 2: Chunks Acústicos & Expressões -->
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="layers" class="w-4 h-4 text-[#C68A36]"></i>
              Matriz de Chunks & Expressões Idiomáticas
            </span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>have a night on the town</b><br/><span class="text-[11px] text-slate-500">curtir uma noitada</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>grab a bite</b><br/><span class="text-[11px] text-slate-500">fazer um lanche rápido</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>I gotta get going!</b><br/><span class="text-[11px] text-slate-500">preciso ir embora!</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>stick around</b><br/><span class="text-[11px] text-slate-500">fica por aqui / não vai</span></div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms014-voc"
  },
  {
    id: "ms014-la",
    title: "Aula 03 • Listen & Answer (LA)",
    order: 3,
    duration: "08:42",
    description: "Reflexo & Velocidade de Bate-Pronto • 18 perguntas de reflexo rápido sobre a saída de Jeremy e Becky.",
    videoUrl: ms014Data.find(x => x.id === 'ms014-la').videoUrl,
    audioUrl: ms014Data.find(x => x.id === 'ms014-la').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms014/thumb_ms014_la.jpg",
    pdfUrl: "Material-PDF/MS014_Jeremy_Goes_to_Town_Apostila_Oficial.pdf",
    goldenTip: "Responda no reflexo com respostas curtas: 'A pickup truck', 'At Red Robin's', 'Becky is 21', 'Jeremy is 16'.",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="zap" class="w-4 h-4 text-[#D97706]"></i>
              18 Perguntas de Reflexo (Listen & Answer)
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800 font-medium pt-2">
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">1. What did Jeremy buy last week?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">2. Who bought a car last week?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">3. What kind of car did Jeremy buy?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">4. How long has Jeremy saved money?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">5. When was Jeremy very excited?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">6. Why was he so excited?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">7. Where did they go first?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">8. Who did Jeremy see at the game?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">9. What did Jeremy invite Becky to do?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">10. Where did they go after the game?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">11. What did they have for dinner?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">12. What did Jeremy say at 11 PM?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">13. What did Becky say?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">14. How old is Becky?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">15. How old is Jeremy?</div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms014-la"
  },
  {
    id: "ms014-lrt",
    title: "Aula 04 • Look & Retell (LRT)",
    order: 4,
    duration: "04:47",
    description: "Speaking Ativo & Storytelling • Reconte a noite de Jeremy desde a compra da picape até a surpresa final.",
    videoUrl: ms014Data.find(x => x.id === 'ms014-lrt').videoUrl,
    audioUrl: ms014Data.find(x => x.id === 'ms014-lrt').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms014/thumb_ms014_lrt.jpg",
    pdfUrl: "Material-PDF/MS014_Jeremy_Goes_to_Town_Apostila_Oficial.pdf",
    goldenTip: "Reconte em tom divertido a reviravolta das idades: 'Jeremy was 16... Becky was 21!'.",
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
            <p class="font-bold text-[#0A192F]">Linha do Tempo de Jeremy & Becky:</p>
            <p class="text-[#E11D48] font-mono">Bought pickup truck ➔ Football game @ school ➔ Met Becky ➔ Red Robin's in Seattle ➔ 11 PM ('I gotta go') ➔ 'Have a beer' ➔ 16 vs 21!</p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms014-lrt"
  },
  {
    id: "ms014-lask",
    title: "Aula 05 • Listen & Ask (LASK)",
    order: 5,
    duration: "07:27",
    description: "Desafio de Perguntas Rápidas • Formule perguntas narrativas de bate-pronto ao ouvir os acontecimentos.",
    videoUrl: ms014Data.find(x => x.id === 'ms014-lask').videoUrl,
    audioUrl: ms014Data.find(x => x.id === 'ms014-lask').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms014/thumb_ms014_lask.jpg",
    pdfUrl: "Material-PDF/MS014_Jeremy_Goes_to_Town_Apostila_Oficial.pdf",
    goldenTip: "Ao ouvir 'He bought a pick up truck', formule de imediato: 'What kind of car did he buy?'.",
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
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>"He bought a pick up truck."</i> ➔ <b>Pergunta: What kind of car did he buy?</b></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>"They went to Red Robin's."</i> ➔ <b>Pergunta: Where did they go after the game?</b></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>"Becky is 21."</i> ➔ <b>Pergunta: How old is Becky?</b></div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms014-lask"
  },
  {
    id: "ms014-pro",
    title: "Aula 06 • Pronunciation & Connected Speech",
    order: 6,
    duration: "05:00",
    description: "Musicalidade & Reduções Cotidianas • Ritmo mecânico e Sacada de Ouro do Leo.",
    videoUrl: ms014Data.find(x => x.id === 'ms014-pro').videoUrl,
    audioUrl: ms014Data.find(x => x.id === 'ms014-pro').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms014/thumb_ms014_pro.jpg",
    pdfUrl: "Material-PDF/MS014_Jeremy_Goes_to_Town_Apostila_Oficial.pdf",
    goldenTip: "Ligue 'I gotta get going' (/aɪ-ɡɑː-də-ɡɛt-ɡoʊ-ɪŋ/) e 'grab a bite' (/ɡræ-bə-baɪt/) sem engasgos.",
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
            <p>🔗 <b>have_a_night_on_the_town</b> ➔ <i>/hæ-və-naɪ-tɑːn-ðə-taʊn/</i></p>
            <p>🔗 <b>grab_a_bite</b> ➔ <i>/ɡræ-bə-baɪt/</i></p>
            <p>🔗 <b>I_gotta_get_going</b> ➔ <i>/aɪ-ɡɑː-də-ɡɛt-ɡoʊ-ɪŋ/</i></p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms014-pro"
  }
];

// 2. Injeta em sala-de-aula.html
let salaHtml = fs.readFileSync('sala-de-aula.html', 'utf8');
if (!salaHtml.includes('ms014-jeremy-goes-to-town')) {
  console.log("Injetando MS014 em sala-de-aula.html...");
  const newModuleObj = {
    id: "ms014-jeremy-goes-to-town",
    title: "MS014 - Jeremy Goes to Town",
    shortTitle: "MS014 (Jeremy Goes to Town)",
    badge: "MÓDULO MS014 • JEREMY GOES TO TOWN",
    stats: "6 Aulas • 44 min",
    lessons: ms014Lessons
  };
  const rx = /(trainingTrackId:\s*\"ms013-pro\"[\s\S]*?\}\s*\]\s*\})/;
  salaHtml = salaHtml.replace(rx, '$1,\n          ' + JSON.stringify(newModuleObj, null, 12).trim());
  fs.writeFileSync('sala-de-aula.html', salaHtml, 'utf8');
  console.log("sala-de-aula.html atualizado com MS014!");
}

// 3. Injeta em curso.html
let cursoHtml = fs.readFileSync('curso.html', 'utf8');
if (!cursoHtml.includes('ms014-jeremy-goes-to-town')) {
  console.log("Injetando MS014 em curso.html...");
  const cursoModObj = {
    id: "ms014-jeremy-goes-to-town",
    order: 14,
    title: "MS014 - Jeremy Goes to Town",
    description: "A noite de Jeremy após comprar sua picape: o jogo de futebol da escola, o encontro com Becky no Red Robin's em Seattle e a divertida confusão das idades (16 vs 21).",
    lessons: ms014Lessons.map(l => ({
      id: l.id,
      order: l.order,
      title: l.title.replace(' • ', ': '),
      duration: l.duration,
      thumbnailUrl: l.thumbnailUrl
    }))
  };
  const rxC = /(id:\s*\"ms013-verb-tense-practice\"[\s\S]*?\}\s*\]\s*\})/;
  cursoHtml = cursoHtml.replace(rxC, '$1,\n          ' + JSON.stringify(cursoModObj, null, 10).trim());
  fs.writeFileSync('curso.html', cursoHtml, 'utf8');
  console.log("curso.html atualizado com MS014!");
}

// 4. Injeta em magic-stories.js
let msJs = fs.readFileSync('treino/data/magic-stories.js', 'utf8');
const objMatch = msJs.match(/window\.AEF_MAGIC_STORIES\s*=\s*(\{[\s\S]*?\n\});/);
if (objMatch) {
  const data = eval('(' + objMatch[1] + ')');
  data.modules = data.modules.filter(m => m.id !== 'ms014-jeremy-goes-to-town');
  data.modules.push({
    id: "ms014-jeremy-goes-to-town",
    number: "14",
    title: "MS014 - Jeremy Goes to Town",
    shortTitle: "MS014 • Goes to Town",
    badge: "MÓDULO MS014 • JEREMY GOES TO TOWN",
    coverImage: "../assets/images/thumbs/ms014/thumb_ms014_lr.jpg",
    summary: "Jeremy compra sua picape, curte a noite com os amigos no Red Robin's em Seattle e vive um momento cômico ao descobrir que a garota com quem conversava tem 21 anos.",
    goldenTip: "Ligue 'I gotta get going' e 'grab a bite' com a naturalidade do inglês falado.",
    tracks: ms014Data.map(tr => ({
      id: tr.id,
      moduleId: "ms014-jeremy-goes-to-town",
      title: tr.title,
      activity: tr.activity,
      duration: "04:30",
      videoUrl: tr.videoUrl,
      audioUrl: tr.audioUrl,
      coverImage: "../" + tr.localThumbnail,
      goldenTip: "Acompanhe a história e ative o reflexo sem tradução mental.",
      sentences: tr.sentences
    }))
  });
  fs.writeFileSync('treino/data/magic-stories.js', `window.AEF_MAGIC_STORIES = ${JSON.stringify(data, null, 2)};\n`, 'utf8');
  console.log("magic-stories.js atualizado com MS014!");
}
