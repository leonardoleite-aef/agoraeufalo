const fs = require('fs');

const ms011Data = JSON.parse(fs.readFileSync('/tmp/ms011_processed_data.json', 'utf8'));

// 1. Monta as 6 aulas estruturadas no padrão canônico de sala-de-aula.html
const ms011Lessons = [
  {
    id: "ms011-lr",
    title: "Aula 01 • Listen & Read (LR)",
    order: 1,
    duration: "03:23",
    description: "Entrada & Imersão Auditiva • Conheça Jeremy: 16 anos, morador de Des Moines WA, estudante na Mount Rainier High School e jogador do time JV de basquete.",
    videoUrl: ms011Data.find(x => x.id === 'ms011-lr').videoUrl,
    audioUrl: ms011Data.find(x => x.id === 'ms011-lr').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms011/thumb_ms011_lr.jpg",
    pdfUrl: "Material-PDF/MS011_Meet_Jeremy_Apostila_Oficial.pdf",
    goldenTip: "Escute com máxima atenção a cadência dos verbos na terceira pessoa (lives, has, gets up, starts, stays, picks him up).",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="book-open" class="w-4 h-4 text-[#C68A36]"></i>
              Texto da História (Listen & Read)
            </span>
            <span class="text-[10px] font-mono font-bold text-[#C68A36] bg-[#FDF8F0] px-2 py-0.5 rounded border border-[#C68A36]/30">Meet Jeremy</span>
          </div>

          <div class="space-y-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            <p>Jeremy is a boy who lives in Des Moines, WA. He is 16 and he lives in a nice house with his family. He has a brother and a sister, Josh and Amanda. Josh is 21 and Amanda is 18.</p>
            <p>His parents are Steve and Anna. Steve is an entrepreneur and Anna is a yoga instructor. They are the Thompson family! They all live in a house very close to the sea.</p>
            <p>Jeremy is a student. He goes to Mount Rainier High School in Des Moines. He is a sophomore. He loves basketball. Actually, he practices in the school JV basketball team.</p>
            <p>Jeremy likes going to the movies, riding his bike around town, and playing the guitar. But his favorite thing in the world is ice cream! Yeah! Jeremy is a typical teenager!</p>
            <p>Every day he gets up at 6, gets dressed, has some breakfast, and takes the school bus. He starts school at 7:10. He stays at school until 5 because he has basketball practice. At 5:15 his sister picks him up at school and they go home.</p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms011-lr"
  },
  {
    id: "ms011-voc",
    title: "Aula 02 • Vocabulary Session (VOC)",
    order: 2,
    duration: "13:58",
    description: "Matriz de Chunks & Tradução Falada Real • Vocabulário de vida escolar americana, família e rotina diária.",
    videoUrl: ms011Data.find(x => x.id === 'ms011-voc').videoUrl,
    audioUrl: ms011Data.find(x => x.id === 'ms011-voc').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms011/thumb_ms011_voc.jpg",
    pdfUrl: "Material-PDF/MS011_Meet_Jeremy_Apostila_Oficial.pdf",
    goldenTip: "Entenda o conceito de 'sophomore' (aluno do 2º ano do Ensino Médio americano) e 'JV team' (Junior Varsity - time de base da escola).",
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
              <p class="font-bold text-[#0A192F]">Jeremy is a boy who lives in Des Moines WA. He is 16 and he lives in a nice house with his family.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ O Jeremy é um garoto que mora em Des Moines, no estado de Washington. Ele tem 16 anos e mora numa casa bem legal com a família dele.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">Steve is an entrepreneur and Anna is a yoga instructor. They all live in a house very close to the sea.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ O Steve é empresário e a Anna é instrutora de yoga. Todos eles moram numa casa bem pertinho do mar.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">He goes to Mount Rainier High School. He is a sophomore. He practices in the school JV basketball team.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ Ele estuda na Mount Rainier High School. Está no segundo ano do ensino médio e treina no time juvenil de basquete da escola.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">Everyday he gets up at 6, gets dressed, has some breakfast and takes the school bus.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ Todo dia ele acorda às 6h, se veste, toma café da manhã e pega o ônibus escolar.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">At 5:15 his sister picks him up at school and they go home.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ Às 5:15 a irmã dele passa na escola para buscá-lo e eles vão para casa.</p>
            </div>
          </div>
        </div>

        <!-- Card 2: Chunks de Vida Escolar -->
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="layers" class="w-4 h-4 text-[#C68A36]"></i>
              Matriz de Chunks & Cultura Escolar Americana
            </span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>Sophomore</b><br/><span class="text-[11px] text-slate-500">2º ano do High School</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>JV Team</b><br/><span class="text-[11px] text-slate-500">Junior Varsity (Juvenil)</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>Takes the bus</b><br/><span class="text-[11px] text-slate-500">Pega o ônibus amarelo</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>Picks him up</b><br/><span class="text-[11px] text-slate-500">Busca ele de carro</span></div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms011-voc"
  },
  {
    id: "ms011-la",
    title: "Aula 03 • Listen & Answer (LA)",
    order: 3,
    duration: "06:42",
    description: "Reflexo & Velocidade na 3ª Pessoa • 22 perguntas de bate-pronto sobre a vida de Jeremy.",
    videoUrl: ms011Data.find(x => x.id === 'ms011-la').videoUrl,
    audioUrl: ms011Data.find(x => x.id === 'ms011-la').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms011/thumb_ms011_la.jpg",
    pdfUrl: "Material-PDF/MS011_Meet_Jeremy_Apostila_Oficial.pdf",
    goldenTip: "Responda no reflexo com respostas curtas: 'In Des Moines', 'He's 16', 'At 6:00', 'His sister'.",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="zap" class="w-4 h-4 text-[#D97706]"></i>
              22 Perguntas de Reflexo (Listen & Answer)
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800 font-medium pt-2">
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">1. Where is Jeremy from?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">2. Where does he live?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">3. How old is he?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">4. Who does he live with?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">5. Does he have brothers and sisters?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">6. How old is Josh?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">7. How old is Amanda?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">8. What are his parents' names?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">9. What does Steve do?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">10. What does Anna do?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">11. Where do the Thompsons live?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">12. Where does Jeremy go to school?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">13. What grade is he in?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">14. What sports does he like?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">15. What time does he get up?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">16. How does he get home?</div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms011-la"
  },
  {
    id: "ms011-lrt",
    title: "Aula 04 • Look & Retell (LRT)",
    order: 4,
    duration: "12:43",
    description: "Speaking Ativo & Reconto de Rotina • Descreva um dia na vida de Jeremy.",
    videoUrl: ms011Data.find(x => x.id === 'ms011-lrt').videoUrl,
    audioUrl: ms011Data.find(x => x.id === 'ms011-lrt').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms011/thumb_ms011_lrt.jpg",
    pdfUrl: "Material-PDF/MS011_Meet_Jeremy_Apostila_Oficial.pdf",
    goldenTip: "Reconte a rotina diária em sequência: 'He gets up at 6... has breakfast... takes the bus... starts school at 7:10...'.",
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
            <p class="font-bold text-[#0A192F]">Linha do Tempo de Jeremy:</p>
            <p class="text-[#E11D48] font-mono">6:00 AM (Gets up) ➔ Breakfast + Bus ➔ 7:10 AM (School starts) ➔ Sophomore @ Mount Rainier ➔ JV Basketball Practice ➔ 5:15 PM (Amanda picks him up)</p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms011-lrt"
  },
  {
    id: "ms011-lask",
    title: "Aula 05 • Listen & Ask (LASK)",
    order: 5,
    duration: "10:03",
    description: "Desafio de Perguntas em 3ª Pessoa (Does/Where/When) • Formule as perguntas sobre Jeremy no reflexo.",
    videoUrl: ms011Data.find(x => x.id === 'ms011-lask').videoUrl,
    audioUrl: ms011Data.find(x => x.id === 'ms011-lask').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms011/thumb_ms011_lask.jpg",
    pdfUrl: "Material-PDF/MS011_Meet_Jeremy_Apostila_Oficial.pdf",
    goldenTip: "Treine a inversão natural do auxiliar: 'He lives in Des Moines' ➔ 'Where does he live?'",
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
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>"He lives in Des Moines WA."</i> ➔ <b>Pergunta: Where does he live?</b></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>"He gets up at 6."</i> ➔ <b>Pergunta: What time does he get up?</b></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>"His sister picks him up at school."</i> ➔ <b>Pergunta: Who picks him up at school?</b></div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms011-lask"
  },
  {
    id: "ms011-pro",
    title: "Aula 06 • Pronunciation & Connected Speech",
    order: 6,
    duration: "04:47",
    description: "Musicalidade & Conexões de Rotina • Ritmo mecânico e Sacada de Ouro do Leo.",
    videoUrl: ms011Data.find(x => x.id === 'ms011-pro').videoUrl,
    audioUrl: ms011Data.find(x => x.id === 'ms011-pro').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms011/thumb_ms011_pro.jpg",
    pdfUrl: "Material-PDF/MS011_Meet_Jeremy_Apostila_Oficial.pdf",
    goldenTip: "Ligue 'picks him up' (/pɪk-sɪ-mʌp/) e 'gets up at six' (/ɡɛts-ʌ-pæt-sɪks/) em uma melodia contínua.",
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
            <p>🔗 <b>gets_up_at_six</b> ➔ <i>/ɡɛts-ʌ-pæt-sɪks/</i></p>
            <p>🔗 <b>picks_him_up_at_school</b> ➔ <i>/pɪk-sɪ-mʌ-pæt-skuːl/</i></p>
            <p>🔗 <b>lives_in_a_nice_house</b> ➔ <i>/lɪvz-ɪn-ə-naɪs-haʊs/</i></p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms011-pro"
  }
];

// 2. Injeta em sala-de-aula.html
let salaHtml = fs.readFileSync('sala-de-aula.html', 'utf8');
if (!salaHtml.includes('ms011-meet-jeremy')) {
  console.log("Injetando MS011 em sala-de-aula.html...");
  const newModuleObj = {
    id: "ms011-meet-jeremy",
    title: "MS011 - Meet Jeremy",
    shortTitle: "MS011 (Meet Jeremy)",
    badge: "MÓDULO MS011 • MEET JEREMY",
    stats: "6 Aulas • 51 min",
    lessons: ms011Lessons
  };
  const rx = /(trainingTrackId:\s*\"ms010-pro\"[\s\S]*?\}\s*\]\s*\})/;
  salaHtml = salaHtml.replace(rx, '$1,\n          ' + JSON.stringify(newModuleObj, null, 12).trim());
  fs.writeFileSync('sala-de-aula.html', salaHtml, 'utf8');
  console.log("sala-de-aula.html atualizado com MS011!");
}

// 3. Injeta em curso.html
let cursoHtml = fs.readFileSync('curso.html', 'utf8');
if (!cursoHtml.includes('ms011-meet-jeremy')) {
  console.log("Injetando MS011 em curso.html...");
  const cursoModObj = {
    id: "ms011-meet-jeremy",
    order: 11,
    title: "MS011 - Meet Jeremy",
    description: "A vida de Jeremy, um típico adolescente americano de 16 anos em Des Moines WA: família, High School, time de basquete JV e rotina diária.",
    lessons: ms011Lessons.map(l => ({
      id: l.id,
      order: l.order,
      title: l.title.replace(' • ', ': '),
      duration: l.duration,
      thumbnailUrl: l.thumbnailUrl
    }))
  };
  const rxC = /(id:\s*\"ms010-an-english-student\"[\s\S]*?\}\s*\]\s*\})/;
  cursoHtml = cursoHtml.replace(rxC, '$1,\n          ' + JSON.stringify(cursoModObj, null, 10).trim());
  fs.writeFileSync('curso.html', cursoHtml, 'utf8');
  console.log("curso.html atualizado com MS011!");
}

// 4. Injeta em magic-stories.js
let msPlayerJs = fs.readFileSync('treino/data/magic-stories.js', 'utf8');
if (!msPlayerJs.includes('ms011-meet-jeremy')) {
  console.log("Injetando MS011 em magic-stories.js...");
  const playerModuleObj = {
    id: "ms011-meet-jeremy",
    number: "11",
    title: "MS011 - Meet Jeremy",
    shortTitle: "MS011 • Meet Jeremy",
    badge: "MÓDULO MS011 • MEET JEREMY",
    coverImage: "../assets/images/thumbs/ms011/thumb_ms011_lr.jpg",
    summary: "Conheça Jeremy (16 anos, Des Moines WA): sophomore na Mount Rainier High School, rotina matinal das 6h, treino no time JV de basquete e a família Thompson.",
    goldenTip: "Ligue 'picks him up' e 'gets up at six' como se fossem uma palavra única.",
    tracks: ms011Data.map(tr => ({
      id: tr.id,
      moduleId: "ms011-meet-jeremy",
      title: tr.title,
      activity: tr.activity,
      duration: "05:00",
      videoUrl: tr.videoUrl,
      audioUrl: tr.audioUrl,
      coverImage: "../" + tr.localThumbnail,
      goldenTip: "Acompanhe a rotina em 3ª pessoa e ative o reflexo sem tradução mental.",
      sentences: tr.sentences
    }))
  };
  
  const endModulePattern = /(\n\s*modules:\s*\[[\s\S]*?)(\n\s*\]\s*\n\s*\};)/;
  msPlayerJs = msPlayerJs.replace(endModulePattern, '$1,\n    ' + JSON.stringify(playerModuleObj, null, 4) + '$2');
  fs.writeFileSync('treino/data/magic-stories.js', msPlayerJs, 'utf8');
  console.log("magic-stories.js atualizado com MS011!");
}
