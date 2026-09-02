const fs = require('fs');

const ms008Data = JSON.parse(fs.readFileSync('/tmp/ms008_processed_data.json', 'utf8'));

// 1. Monta as 6 aulas estruturadas no padrão canônico de sala-de-aula.html
const ms008Lessons = [
  {
    id: "ms008-lr",
    title: "Aula 01 • Listen & Read (LR)",
    order: 1,
    duration: "06:10",
    description: "Entrada & Imersão Auditiva • Back in 1999: A história completa do início do namoro de Grazi e Tom, casamento em Cleveland e o nascimento de Anna.",
    videoUrl: ms008Data.find(x => x.id === 'ms008-lr').videoUrl,
    audioUrl: ms008Data.find(x => x.id === 'ms008-lr').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms008/thumb_ms008_lr.jpg",
    pdfUrl: "Material-PDF/MS008_Back_in_1999_Apostila_Oficial.pdf",
    goldenTip: "Observe a transição entre o presente e o passado (meet ➔ met, go ➔ went, get ➔ got). Não traduza: sinta a melodia dos verbos!",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="book-open" class="w-4 h-4 text-[#C68A36]"></i>
              Texto da História (Listen & Read)
            </span>
            <span class="text-[10px] font-mono font-bold text-[#C68A36] bg-[#FDF8F0] px-2 py-0.5 rounded border border-[#C68A36]/30">Back in 1999 (22 Years Ago)</span>
          </div>

          <div class="space-y-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            <p>Grazi first met Tom in USA. They started dating in the USA. Grazi went back to Brazil. Grazi and Tom continued dating online for a few months.</p>
            <p>Tom went to Brazil on vacation and spent time with Grazi. Grazi went to USA with Tom. They got married in Cleveland. They lived in USA for a while.</p>
            <p>Grazi got pregnant. Tom and Grazi decided to move to Brazil. Grazi came back to Brazil first. Grazi started living with her parents in Brasília.</p>
            <p>Tom moved to Brasília, but he kept his job in America. He started working from home in Brazil. He traveled to USA twice a month.</p>
            <p>Tom and Grazi rented an apartment in Brasília. Anna was born. Grazi's parents helped the couple with the baby.</p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms008-lr"
  },
  {
    id: "ms008-voc",
    title: "Aula 02 • Vocabulary Session (VOC)",
    order: 2,
    duration: "08:53",
    description: "Matriz de Chunks & Tradução Falada Real • Dissecação dos verbos regulares e irregulares no passado.",
    videoUrl: ms008Data.find(x => x.id === 'ms008-voc').videoUrl,
    audioUrl: ms008Data.find(x => x.id === 'ms008-voc').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms008/thumb_ms008_voc.jpg",
    pdfUrl: "Material-PDF/MS008_Back_in_1999_Apostila_Oficial.pdf",
    goldenTip: "Guarde as expressões em blocos: 'got pregnant' (ficou grávida), 'got married' (casaram-se), 'spent time' (passou um tempo).",
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
              <p class="font-bold text-[#0A192F]">Grazi first met Tom in USA. They started dating in the USA.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ A Grazi conheceu o Tom pela primeira vez nos EUA. Eles começaram a namorar nos EUA.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">Grazi went back to Brazil. Grazi and Tom continued dating online for a few months.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ A Grazi voltou para o Brasil. A Grazi e o Tom continuaram namorando à distância pela internet por alguns meses.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">Tom went to Brazil on vacation and spent time with Grazi. Grazi went to USA with Tom. They got married in Cleveland.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ O Tom foi para o Brasil de férias e passou um tempo com a Grazi. A Grazi foi para os EUA com o Tom. Eles se casaram em Cleveland.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">Grazi got pregnant. Tom and Grazi decided to move to Brazil. Grazi came back to Brazil first.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ A Grazi ficou grávida. O Tom e a Grazi decidiram se mudar para o Brasil. A Grazi voltou para o Brasil primeiro.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">Tom moved to Brasília, but he kept his job in America. He started working from home in Brazil. He traveled to USA twice a month.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ O Tom se mudou para Brasília, mas manteve o emprego dele na América. Começou a trabalhar em home office no Brasil e viajava para os EUA duas vezes por mês.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">Tom and Grazi rented an apartment in Brasília. Anna was born. Grazi's parents helped the couple with the baby.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ O Tom e a Grazi alugaram um apartamento em Brasília. A Anna nasceu. Os pais da Grazi ajudaram o casal com o bebê.</p>
            </div>
          </div>
        </div>

        <!-- Card 2: Matriz de Verbos no Passado -->
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="layers" class="w-4 h-4 text-[#C68A36]"></i>
              Matriz de Verbos no Passado (Presente ➔ Passado)
            </span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>Meet ➔ Met</b><br/><span class="text-[11px] text-slate-500">Conhecer / Encontrar</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>Go ➔ Went</b><br/><span class="text-[11px] text-slate-500">Ir / Foi</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>Spend ➔ Spent</b><br/><span class="text-[11px] text-slate-500">Gastar / Passar tempo</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>Get ➔ Got</b><br/><span class="text-[11px] text-slate-500">Ficar / Conquistar</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>Come ➔ Came</b><br/><span class="text-[11px] text-slate-500">Vir / Voltou</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>Keep ➔ Kept</b><br/><span class="text-[11px] text-slate-500">Manter / Manteve</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>Is ➔ Was</b><br/><span class="text-[11px] text-slate-500">Era / Nasceu (was born)</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>Rent ➔ Rented</b><br/><span class="text-[11px] text-slate-500">Alugar / Alugou</span></div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms008-voc"
  },
  {
    id: "ms008-la",
    title: "Aula 03 • Listen & Answer (LA)",
    order: 3,
    duration: "08:22",
    description: "Reflexo & Velocidade no Passado • 20 perguntas de bate-pronto cobrindo toda a história de 1999.",
    videoUrl: ms008Data.find(x => x.id === 'ms008-la').videoUrl,
    audioUrl: ms008Data.find(x => x.id === 'ms008-la').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms008/thumb_ms008_la.jpg",
    pdfUrl: "Material-PDF/MS008_Back_in_1999_Apostila_Oficial.pdf",
    goldenTip: "Responda no reflexo com respostas curtas: 'In the USA', 'Yes, they did', 'Twice a month', 'Anna was born'.",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="zap" class="w-4 h-4 text-[#D97706]"></i>
              20 Perguntas de Reflexo (Listen & Answer)
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800 font-medium pt-2">
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">1. Where did they first meet?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">2. What did they start doing?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">3. Where did Grazi go?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">4. What did Grazi and Tom do for a few months?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">5. Where did Tom go?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">6. What did Tom do there?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">7. Where did Grazi and Tom go?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">8. What did they do in Cleveland?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">9. How long did they live in USA?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">10. What happened to Grazi in America?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">11. What did Tom and Grazi decide to do?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">12. Who came to Brazil first?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">13. Who did Grazi live with?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">14. Where did Tom move?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">15. Did Tom quit his job in America?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">16. Where did Tom start working?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">17. How often did he travel?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">18. Did Tom and Grazi buy an apartment?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">19. Who was born?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">20. Who helped with the baby?</div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms008-la"
  },
  {
    id: "ms008-lrt",
    title: "Aula 04 • Look & Retell (LRT)",
    order: 4,
    duration: "07:33",
    description: "Speaking Ativo & Reconto Cronológico • Conte a jornada de Grazi e Tom desde 1999 até o nascimento de Anna.",
    videoUrl: ms008Data.find(x => x.id === 'ms008-lrt').videoUrl,
    audioUrl: ms008Data.find(x => x.id === 'ms008-lrt').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms008/thumb_ms008_lrt.jpg",
    pdfUrl: "Material-PDF/MS008_Back_in_1999_Apostila_Oficial.pdf",
    goldenTip: "Conte os acontecimentos em sequência cronológica no passado: 'First they met... then they started dating... after that they got married...'.",
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
            <p class="font-bold text-[#0A192F]">Linha do Tempo de Apoio:</p>
            <p class="text-[#E11D48] font-mono">1999: Met in USA ➔ Dated online ➔ Got married in Cleveland ➔ Got pregnant ➔ Moved to Brasília ➔ Worked from home ➔ Anna was born</p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms008-lrt"
  },
  {
    id: "ms008-lask",
    title: "Aula 05 • Listen & Ask (LASK)",
    order: 5,
    duration: "10:09",
    description: "Desafio de Negações e Formulação de Perguntas no Passado • Treine o reflexo com 'Didn't' e 'Did...?'",
    videoUrl: ms008Data.find(x => x.id === 'ms008-lask').videoUrl,
    audioUrl: ms008Data.find(x => x.id === 'ms008-lask').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms008/thumb_ms008_lask.jpg",
    pdfUrl: "Material-PDF/MS008_Back_in_1999_Apostila_Oficial.pdf",
    goldenTip: "Na negativa use 'didn't + verbo na base' (didn't meet, didn't go, didn't quit). Crie a pergunta no reflexo!",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="help-circle" class="w-4 h-4 text-[#6366F1]"></i>
              Negações e Perguntas (Listen & Ask)
            </span>
          </div>
          <div class="space-y-2 text-xs text-slate-800">
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Negação: <i>"They didn't first meet in Brazil."</i> ➔ <b>Pergunta: Did they first meet in Brazil? / Where did they meet?</b></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Negação: <i>"Tom didn't quit his job."</i> ➔ <b>Pergunta: Did Tom quit his job?</b></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Negação: <i>"They didn't buy an apartment."</i> ➔ <b>Pergunta: Did they buy an apartment?</b></div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms008-lask"
  },
  {
    id: "ms008-pro",
    title: "Aula 06 • Pronunciation & Connected Speech",
    order: 6,
    duration: "04:17",
    description: "Musicalidade & Conexões no Passado • Ritmo mecânico e Sacada de Ouro do Leo.",
    videoUrl: ms008Data.find(x => x.id === 'ms008-pro').videoUrl,
    audioUrl: ms008Data.find(x => x.id === 'ms008-pro').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms008/thumb_ms008_pro.jpg",
    pdfUrl: "Material-PDF/MS008_Back_in_1999_Apostila_Oficial.pdf",
    goldenTip: "Ligue 'got pregnant' (/ɡɑːt-prɛɡ-nənt/) e 'rented an apartment' (/rɛn-tɪ-dən-ə-pɑːrt-mənt/).",
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
            <p>🔗 <b>started_dating_in_the_USA</b> ➔ <i>/stɑːr-tɪ-deɪ-tɪ-ŋɪn-ðə-ju-ɛs-eɪ/</i></p>
            <p>🔗 <b>went_back_to_Brazil</b> ➔ <i>/wɛnt-bæk-tə-brə-zɪl/</i></p>
            <p>🔗 <b>rented_an_apartment</b> ➔ <i>/rɛn-tɪ-dən-ə-pɑːrt-mənt/</i></p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms008-pro"
  }
];

// 2. Injeta em sala-de-aula.html
let salaHtml = fs.readFileSync('sala-de-aula.html', 'utf8');
if (!salaHtml.includes('ms008-back-in-1999')) {
  console.log("Injetando MS008 em sala-de-aula.html...");
  const newModuleObj = {
    id: "ms008-back-in-1999",
    title: "MS008 - Back in 1999",
    shortTitle: "MS008 (Back in 1999)",
    badge: "MÓDULO MS008 • BACK IN 1999",
    stats: "6 Aulas • 45 min",
    lessons: ms008Lessons
  };
  const marker = 'id: "ms007-anna-decision",';
  const insertAfter = 'trainingTrackId: "ms007-pro"\n              }\n            ]\n          }';
  if (salaHtml.includes(insertAfter)) {
    const injection = insertAfter + ',\n          ' + JSON.stringify(newModuleObj, null, 12).trim();
    salaHtml = salaHtml.replace(insertAfter, injection);
    fs.writeFileSync('sala-de-aula.html', salaHtml, 'utf8');
    console.log("sala-de-aula.html atualizado com MS008!");
  }
}

// 3. Injeta em curso.html
let cursoHtml = fs.readFileSync('curso.html', 'utf8');
if (!cursoHtml.includes('ms008-back-in-1999')) {
  console.log("Injetando MS008 em curso.html...");
  const cursoModObj = {
    id: "ms008-back-in-1999",
    order: 8,
    title: "MS008 - Back in 1999",
    description: "A história do início do namoro de Grazi e Tom nos EUA em 1999, casamento em Cleveland, gravidez e a decisão de morar no Brasil.",
    lessons: ms008Lessons.map(l => ({
      id: l.id,
      order: l.order,
      title: l.title.replace(' • ', ': '),
      duration: l.duration,
      thumbnailUrl: l.thumbnailUrl
    }))
  };
  const cursoInsertAfter = 'thumbnailUrl: "assets/images/thumbs/ms007/thumb_ms007_pro.jpg" }\n            ]\n          }';
  if (cursoHtml.includes(cursoInsertAfter)) {
    cursoHtml = cursoHtml.replace(cursoInsertAfter, cursoInsertAfter + ',\n          ' + JSON.stringify(cursoModObj, null, 10).trim());
    fs.writeFileSync('curso.html', cursoHtml, 'utf8');
    console.log("curso.html atualizado com MS008!");
  }
}

// 4. Injeta em magic-stories.js
let msPlayerJs = fs.readFileSync('treino/data/magic-stories.js', 'utf8');
if (!msPlayerJs.includes('ms008-back-in-1999')) {
  console.log("Injetando MS008 em magic-stories.js...");
  const playerModuleObj = {
    id: "ms008-back-in-1999",
    number: "08",
    title: "MS008 - Back in 1999",
    shortTitle: "MS008 • Back in 1999",
    badge: "MÓDULO MS008 • BACK IN 1999",
    coverImage: "../assets/images/thumbs/ms008/thumb_ms008_lr.jpg",
    summary: "A jornada de 1999: primeiro encontro nos EUA, namoro online, casamento em Cleveland, volta para o Brasil e o nascimento de Anna.",
    goldenTip: "Treine a melodia dos verbos irregulares no passado (met, went, spent, got, came, kept, was born).",
    tracks: ms008Data.map(tr => ({
      id: tr.id,
      moduleId: "ms008-back-in-1999",
      title: tr.title,
      activity: tr.activity,
      duration: "06:00",
      videoUrl: tr.videoUrl,
      audioUrl: tr.audioUrl,
      coverImage: "../" + tr.localThumbnail,
      goldenTip: "Acompanhe a melodia falada no passado e ative o reflexo sem tradução mental.",
      sentences: tr.sentences
    }))
  };
  
  const endModulePattern = /(\n\s*modules:\s*\[[\s\S]*?)(\n\s*\]\s*\n\s*\};)/;
  msPlayerJs = msPlayerJs.replace(endModulePattern, '$1,\n    ' + JSON.stringify(playerModuleObj, null, 4) + '$2');
  fs.writeFileSync('treino/data/magic-stories.js', msPlayerJs, 'utf8');
  console.log("magic-stories.js atualizado com MS008!");
}
