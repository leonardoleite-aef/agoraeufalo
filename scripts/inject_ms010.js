const fs = require('fs');

const ms010Data = JSON.parse(fs.readFileSync('/tmp/ms010_processed_data.json', 'utf8'));

// 1. Monta as 7 aulas estruturadas no padrão canônico de sala-de-aula.html
const ms010Lessons = [
  {
    id: "ms010-lr-1",
    title: "Aula 01.1 • Listen & Read (LR Legacy)",
    order: 1,
    duration: "38:45",
    description: "Entrada & Imersão Auditiva Completa • A história de Carlos, administrador de empresas em Belo Horizonte que decide dominar o inglês para ser promovido e viajar para os EUA.",
    videoUrl: ms010Data.find(x => x.id === 'ms010-lr-1').videoUrl,
    audioUrl: ms010Data.find(x => x.id === 'ms010-lr-1').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms010/thumb_ms010_lr_1.jpg",
    pdfUrl: "Material-PDF/MS010_An_English_Student_Apostila_Oficial.pdf",
    goldenTip: "Escute com extrema atenção muito mais pelos ouvidos do que pelos olhos. Mantenha o fluxo da fala natural!",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="book-open" class="w-4 h-4 text-[#C68A36]"></i>
              Texto da História (Listen & Read)
            </span>
            <span class="text-[10px] font-mono font-bold text-[#C68A36] bg-[#FDF8F0] px-2 py-0.5 rounded border border-[#C68A36]/30">An English Student</span>
          </div>

          <div class="space-y-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            <p>Hello! My name is Carlos and I'm 37 years old. I'm from Belo Horizonte, Brazil. I'm going to talk a little about myself.</p>
            <p>I'm a business administrator. I graduated from UFMG 15 years ago. I went to public school all my life.</p>
            <p>I was born in a middle-class family and lived with my parents and two sisters until I finished university.</p>
            <p>After I graduated, I got a job at a technology company and moved out from my parents' home. I got married two years later. Today I live with my wife and daughter in Belo.</p>
            <p>I really like my job. I love sports, and I really enjoy outdoor activities such as hiking and biking. I love spending time with my wife and kid and traveling with them sometimes.</p>
            <p>Right now my focus is to learn how to understand and speak English. I am learning and practicing my English every day. If I improve my English I'll be promoted in the next six months.</p>
            <p>Next year my family and I are going to spend some time in USA. So I really need to be able to communicate well in English. My wife and daughter are also learning English. They are planning to go to school in America next year.</p>
            <p class="font-bold text-[#0A192F] pt-1">What about you? Tell me a little about yourself!</p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms010-lr-1"
  },
  {
    id: "ms010-lr-2",
    title: "Aula 01.2 • Listen & Read (LR Extended)",
    order: 2,
    duration: "04:32",
    description: "Leitura Fluida & Imersão Rápida • Versão estendida da história para fixação de ritmo.",
    videoUrl: ms010Data.find(x => x.id === 'ms010-lr-2').videoUrl,
    audioUrl: ms010Data.find(x => x.id === 'ms010-lr-2').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms010/thumb_ms010_lr_2.jpg",
    pdfUrl: "Material-PDF/MS010_An_English_Student_Apostila_Oficial.pdf",
    goldenTip: "Acompanhe sem pausas, sincronizando a cadência da voz com o texto.",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="headphones" class="w-4 h-4 text-[#1A56DB]"></i>
              Imersão Rápida Contínua
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            Treine a escuta direta da história completa em ritmo contínuo.
          </p>
        </div>
      </div>
    `,
    trainingTrackId: "ms010-lr-2"
  },
  {
    id: "ms010-voc",
    title: "Aula 02 • Vocabulary Session (VOC)",
    order: 3,
    duration: "09:19",
    description: "Matriz de Chunks & Tradução Falada Real • Vocabulário autobiográfico e profissional.",
    videoUrl: ms010Data.find(x => x.id === 'ms010-voc').videoUrl,
    audioUrl: ms010Data.find(x => x.id === 'ms010-voc').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms010/thumb_ms010_voc.jpg",
    pdfUrl: "Material-PDF/MS010_An_English_Student_Apostila_Oficial.pdf",
    goldenTip: "Guarde os blocos sonoros: 'graduated from UFMG' (me formei na UFMG), 'moved out from my parents' home' (saí da casa dos meus pais), 'need to be able to communicate' (preciso saber me comunicar).",
    processedContentHtml: `
      <div class="space-y-4">
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
              <p class="font-bold text-[#0A192F]">Hello! My name is Carlos and I'm 37 years old. I'm from Belo Horizonte Brazil.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ Olá! Meu nome é Carlos e tenho 37 anos. Sou de Belo Horizonte, Brasil.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">I'm a business administrator. I graduated from UFMG 15 years ago. I went to public school all my life.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ Sou administrador de empresas. Me formei na UFMG há 15 anos. Estudei em escola pública a vida inteira.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">After I graduated, I got a job at a technology company and moved out from my parents' home. I got married two years later.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ Depois que me formei, arrumei um emprego numa empresa de tecnologia e saí da casa dos meus pais. Me casei dois anos depois.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">Right now my focus is to learn how to understand and speak English. If I improve my English I'll be promoted in the next six months.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ No momento meu foco é aprender a entender e falar inglês. Se eu melhorar meu inglês, serei promovido nos próximos seis meses.</p>
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
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>graduated from UFMG</b><br/><span class="text-[11px] text-slate-500">me formei na UFMG</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>moved out from my parents' home</b><br/><span class="text-[11px] text-slate-500">saí da casa dos meus pais</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>enjoy outdoor activities</b><br/><span class="text-[11px] text-slate-500">curto atividades ao ar livre</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>be able to communicate</b><br/><span class="text-[11px] text-slate-500">ser capaz de me comunicar</span></div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms010-voc"
  },
  {
    id: "ms010-la",
    title: "Aula 03 • Listen & Answer (LA)",
    order: 4,
    duration: "05:28",
    description: "Reflexo & Velocidade Autobiográfica • 15 perguntas de bate-pronto sobre a vida de Carlos.",
    videoUrl: ms010Data.find(x => x.id === 'ms010-la').videoUrl,
    audioUrl: ms010Data.find(x => x.id === 'ms010-la').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms010/thumb_ms010_la.jpg",
    pdfUrl: "Material-PDF/MS010_An_English_Student_Apostila_Oficial.pdf",
    goldenTip: "Responda no reflexo com respostas curtas e objetivas!",
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
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">1. How old is Carlos?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">2. Where's he from?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">3. What does he do?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">4. When did he graduate?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">5. Where did he graduate from?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">6. What kind of school did he go to?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">7. When did he move out?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">8. Did he get married? When?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">9. Does he have kids? How many?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">10. What are his plans for the future?</div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms010-la"
  },
  {
    id: "ms010-lrt",
    title: "Aula 04 • Look & Retell (LRT)",
    order: 5,
    duration: "08:59",
    description: "Speaking Ativo & Personal Storytelling • Reconte a história de Carlos e pratique a sua própria apresentação.",
    videoUrl: ms010Data.find(x => x.id === 'ms010-lrt').videoUrl,
    audioUrl: ms010Data.find(x => x.id === 'ms010-lrt').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms010/thumb_ms010_lrt.jpg",
    pdfUrl: "Material-PDF/MS010_An_English_Student_Apostila_Oficial.pdf",
    goldenTip: "Use a estrutura de Carlos para falar de você mesmo: 'My name is... I graduated from... I got a job at...'.",
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
            <p class="font-bold text-[#0A192F]">Desafio Tell Me About Yourself:</p>
            <p class="text-[#E11D48] font-mono">Carlos (37) • Belo Horizonte • UFMG • Public School • Tech company • Married + Daughter • Hiking & Biking • Focus on English • Promotion in 6 months</p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms010-lrt"
  },
  {
    id: "ms010-lask",
    title: "Aula 05 • Listen & Ask (LASK)",
    order: 6,
    duration: "07:00",
    description: "Desafio de Perguntas Pessoais • Formule perguntas rápidas de entrevista e apresentação.",
    videoUrl: ms010Data.find(x => x.id === 'ms010-lask').videoUrl,
    audioUrl: ms010Data.find(x => x.id === 'ms010-lask').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms010/thumb_ms010_lask.jpg",
    pdfUrl: "Material-PDF/MS010_An_English_Student_Apostila_Oficial.pdf",
    goldenTip: "Formule a pergunta de bate-pronto ao ouvir as respostas sobre Carlos.",
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
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>"He's 37."</i> ➔ <b>Pergunta: How old is he?</b></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>"He graduated from UFMG."</i> ➔ <b>Pergunta: Where did he graduate from?</b></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>"He went to public school."</i> ➔ <b>Pergunta: What kind of school did he go to?</b></div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms010-lask"
  },
  {
    id: "ms010-pro",
    title: "Aula 06 • Pronunciation & Connected Speech",
    order: 7,
    duration: "06:19",
    description: "Musicalidade & Ritmo de Apresentação • Conexões de consoante-vogal e Sacada de Ouro do Leo.",
    videoUrl: ms010Data.find(x => x.id === 'ms010-pro').videoUrl,
    audioUrl: ms010Data.find(x => x.id === 'ms010-pro').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms010/thumb_ms010_pro.jpg",
    pdfUrl: "Material-PDF/MS010_An_English_Student_Apostila_Oficial.pdf",
    goldenTip: "Ligue 'graduated from' (/ɡræ-dʒu-eɪ-tɪd-frəm/) e 'moved out from' (/muːvd-aʊt-frəm/) com naturalidade.",
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
            <p>🔗 <b>graduated_from_UFMG</b> ➔ <i>/ɡræ-dʒu-eɪ-tɪd-frəm-ju-ɛf-ɛm-dʒiː/</i></p>
            <p>🔗 <b>moved_out_from</b> ➔ <i>/muːvd-aʊt-frəm/</i></p>
            <p>🔗 <b>be_able_to_communicate</b> ➔ <i>/bi-eɪ-bəl-tə-kə-mju-nɪ-keɪt/</i></p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms010-pro"
  }
];

// 2. Injeta em sala-de-aula.html
let salaHtml = fs.readFileSync('sala-de-aula.html', 'utf8');
if (!salaHtml.includes('ms010-an-english-student')) {
  console.log("Injetando MS010 em sala-de-aula.html...");
  const newModuleObj = {
    id: "ms010-an-english-student",
    title: "MS010 - An English Student",
    shortTitle: "MS010 (An English Student)",
    badge: "MÓDULO MS010 • AN ENGLISH STUDENT",
    stats: "7 Aulas • 80 min",
    lessons: ms010Lessons
  };
  const rx = /(trainingTrackId:\s*\"ms009-pro\"[\s\S]*?\}\s*\]\s*\})/;
  salaHtml = salaHtml.replace(rx, '$1,\n          ' + JSON.stringify(newModuleObj, null, 12).trim());
  fs.writeFileSync('sala-de-aula.html', salaHtml, 'utf8');
  console.log("sala-de-aula.html atualizado com MS010!");
}

// 3. Injeta em curso.html
let cursoHtml = fs.readFileSync('curso.html', 'utf8');
if (!cursoHtml.includes('ms010-an-english-student')) {
  console.log("Injetando MS010 em curso.html...");
  const cursoModObj = {
    id: "ms010-an-english-student",
    order: 10,
    title: "MS010 - An English Student",
    description: "A história de Carlos: apresentação pessoal, carreira, rotina e o plano de aprender inglês para ser promovido e morar temporariamente nos EUA.",
    lessons: ms010Lessons.map(l => ({
      id: l.id,
      order: l.order,
      title: l.title.replace(' • ', ': '),
      duration: l.duration,
      thumbnailUrl: l.thumbnailUrl
    }))
  };
  const rxC = /(id:\s*\"ms009-grammar-practice\"[\s\S]*?\}\s*\]\s*\})/;
  cursoHtml = cursoHtml.replace(rxC, '$1,\n          ' + JSON.stringify(cursoModObj, null, 10).trim());
  fs.writeFileSync('curso.html', cursoHtml, 'utf8');
  console.log("curso.html atualizado com MS010!");
}

// 4. Injeta em magic-stories.js
let msPlayerJs = fs.readFileSync('treino/data/magic-stories.js', 'utf8');
if (!msPlayerJs.includes('ms010-an-english-student')) {
  console.log("Injetando MS010 em magic-stories.js...");
  const playerModuleObj = {
    id: "ms010-an-english-student",
    number: "10",
    title: "MS010 - An English Student",
    shortTitle: "MS010 • English Student",
    badge: "MÓDULO MS010 • AN ENGLISH STUDENT",
    coverImage: "../assets/images/thumbs/ms010/thumb_ms010_lr_1.jpg",
    summary: "A jornada autobiográfica de Carlos: formação, família, esportes e o desafio de falar inglês com fluência para viajar e ser promovido.",
    goldenTip: "Treine a sua própria apresentação pessoal com base nas estruturas desta lição.",
    tracks: ms010Data.map(tr => ({
      id: tr.id,
      moduleId: "ms010-an-english-student",
      title: tr.title,
      activity: tr.activity,
      duration: "06:00",
      videoUrl: tr.videoUrl,
      audioUrl: tr.audioUrl,
      coverImage: "../" + tr.localThumbnail,
      goldenTip: "Acompanhe a história autobiográfica e ative o reflexo sem tradução mental.",
      sentences: tr.sentences
    }))
  };
  
  const endModulePattern = /(\n\s*modules:\s*\[[\s\S]*?)(\n\s*\]\s*\n\s*\};)/;
  msPlayerJs = msPlayerJs.replace(endModulePattern, '$1,\n    ' + JSON.stringify(playerModuleObj, null, 4) + '$2');
  fs.writeFileSync('treino/data/magic-stories.js', msPlayerJs, 'utf8');
  console.log("magic-stories.js atualizado com MS010!");
}
