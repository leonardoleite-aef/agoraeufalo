const fs = require('fs');

const ms012Data = JSON.parse(fs.readFileSync('/tmp/ms012_processed_data.json', 'utf8'));

// 1. Monta as 8 aulas estruturadas no padrão canônico de sala-de-aula.html
const ms012Lessons = [
  {
    id: "ms012-lr-1",
    title: "Aula 01.1 • Listen & Read (LR Legacy)",
    order: 1,
    duration: "28:39",
    description: "Entrada & Imersão Auditiva Completa • Jeremy aos 16 anos: Driver's Ed, prova de direção, comprar um carro e o fim do ônibus escolar.",
    videoUrl: ms012Data.find(x => x.id === 'ms012-lr-1').videoUrl,
    audioUrl: ms012Data.find(x => x.id === 'ms012-lr-1').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms012/thumb_ms012_lr_1.jpg",
    pdfUrl: "Material-PDF/MS012_Drivers_License_Apostila_Oficial.pdf",
    goldenTip: "Escute com extrema atenção as conexões: 'can drive', 'needs to get', 'going to take', 'by himself'.",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="book-open" class="w-4 h-4 text-[#C68A36]"></i>
              Texto da História (Listen & Read)
            </span>
            <span class="text-[10px] font-mono font-bold text-[#C68A36] bg-[#FDF8F0] px-2 py-0.5 rounded border border-[#C68A36]/30">Driver's License</span>
          </div>

          <div class="space-y-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            <p>Jeremy is 16. He can drive in USA, but first he needs to get his driver's license.</p>
            <p>It's Friday afternoon. Right now Jeremy is at school. He doesn't have basketball practice today. So, in a few minutes he's going to Driver's Ed. He is going to practice his driving with his driving instructor. He's going to take his driving test next week.</p>
            <p>Jeremy is very excited. Why? Because he's buying a car after he gets his license. He is going to be able to drive around town by himself.</p>
            <p class="font-bold text-[#0A192F] pt-1">Do you know what that means? NO MORE SCHOOL BUSES!</p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms012-lr-1"
  },
  {
    id: "ms012-lr-2",
    title: "Aula 01.2 • Listen & Read (LR Extended)",
    order: 2,
    duration: "02:54",
    description: "Leitura Fluida & Imersão Rápida • Versão estendida da história de Driver's License.",
    videoUrl: ms012Data.find(x => x.id === 'ms012-lr-2').videoUrl,
    audioUrl: ms012Data.find(x => x.id === 'ms012-lr-2').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms012/thumb_ms012_lr_2.jpg",
    pdfUrl: "Material-PDF/MS012_Drivers_License_Apostila_Oficial.pdf",
    goldenTip: "Acompanhe sem interrupções fixando a melodia e as conexões.",
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
    trainingTrackId: "ms012-lr-2"
  },
  {
    id: "ms012-voc",
    title: "Aula 02 • Vocabulary Session (VOC)",
    order: 3,
    duration: "09:53",
    description: "Matriz de Chunks & Tradução Falada Real • Driver's Ed, 'by himself' e planos imediatos.",
    videoUrl: ms012Data.find(x => x.id === 'ms012-voc').videoUrl,
    audioUrl: ms012Data.find(x => x.id === 'ms012-voc').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms012/thumb_ms012_voc.jpg",
    pdfUrl: "Material-PDF/MS012_Drivers_License_Apostila_Oficial.pdf",
    goldenTip: "Entenda os múltiplos usos de 'can drive' (sabe dirigir / pode dirigir / tem permissão) e o reflexivo 'by himself' (sozinho / por conta própria).",
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
              <p class="font-bold text-[#0A192F]">Jeremy is 16. He can drive in USA, but first he needs to get his driver's license.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ O Jeremy tem 16 anos. Ele já pode dirigir nos EUA, mas primeiro precisa tirar a carteira de motorista.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">So, in a few minutes he's going to Driver's Ed. He is going to practice his driving with his driving instructor.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ Então, daqui a alguns minutos ele vai para a autoescola. Vai treinar direção com o instrutor dele.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">He's going to take his driving test next week. Jeremy is very excited. Why? Because he's buying a car after he gets his license.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ Ele vai fazer a prova de direção na semana que vem. O Jeremy está super empolgado. Por quê? Porque vai comprar um carro depois que tirar a carteira.</p>
            </div>
            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">He is going to be able to drive around town by himself. Do you know what that means? NO MORE SCHOOL BUSES!</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ Ele vai poder dirigir pela cidade sozinho. Sabe o que isso significa? NUNCA MAIS ÔNIBUS ESCOLAR!</p>
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
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>Driver's Ed</b><br/><span class="text-[11px] text-slate-500">Autoescola (Driver's Education)</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>Take a driving test</b><br/><span class="text-[11px] text-slate-500">Fazer a prova de direção</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>By himself</b><br/><span class="text-[11px] text-slate-500">Sozinho / Por conta própria</span></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]"><b>Be able to drive</b><br/><span class="text-[11px] text-slate-500">Conseguir / Ter como dirigir</span></div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms012-voc"
  },
  {
    id: "ms012-la",
    title: "Aula 03 • Listen & Answer (LA)",
    order: 4,
    duration: "03:52",
    description: "Reflexo & Velocidade de Bate-Pronto • 10 perguntas de reflexo rápido sobre Jeremy e a CNH.",
    videoUrl: ms012Data.find(x => x.id === 'ms012-la').videoUrl,
    audioUrl: ms012Data.find(x => x.id === 'ms012-la').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms012/thumb_ms012_la.jpg",
    pdfUrl: "Material-PDF/MS012_Drivers_License_Apostila_Oficial.pdf",
    goldenTip: "Responda no reflexo com respostas curtas: 'He's 16', 'Yes, he can', 'Next week', 'Buy a car'.",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="zap" class="w-4 h-4 text-[#D97706]"></i>
              10 Perguntas de Reflexo (Listen & Answer)
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800 font-medium pt-2">
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">1. How old is Jeremy?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">2. Can he drive in USA?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">3. What does he need to do to drive?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">4. Where is Jeremy now?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">5. Is he practicing basketball now?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">6. What is he going to do this afternoon?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">7. Who is he driving with?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">8. When is he going to take his driving test?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">9. What is Jeremy going to do if he passes the test?</div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">10. What is he going to be able to do?</div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms012-la"
  },
  {
    id: "ms012-lrt",
    title: "Aula 04 • Look & Retell (LRT)",
    order: 5,
    duration: "03:17",
    description: "Speaking Ativo & Reconto de Conquista • Conte como Jeremy vai se libertar do ônibus escolar.",
    videoUrl: ms012Data.find(x => x.id === 'ms012-lrt').videoUrl,
    audioUrl: ms012Data.find(x => x.id === 'ms012-lrt').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms012/thumb_ms012_lrt.jpg",
    pdfUrl: "Material-PDF/MS012_Drivers_License_Apostila_Oficial.pdf",
    goldenTip: "Conte com entusiasmo a sequência: 'Jeremy is 16... going to Driver's Ed... buying a car... no more school buses!'.",
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
            <p class="text-[#E11D48] font-mono">16 y/o ➔ Needs license ➔ Driver's Ed on Friday ➔ Test next week ➔ Buying a car ➔ Drive by himself ➔ NO MORE BUSES!</p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms012-lrt"
  },
  {
    id: "ms012-lask",
    title: "Aula 05 • Listen & Ask (LASK)",
    order: 6,
    duration: "04:23",
    description: "Desafio de Perguntas Rápidas (Can / When / What) • Formule as perguntas sobre Jeremy no reflexo.",
    videoUrl: ms012Data.find(x => x.id === 'ms012-lask').videoUrl,
    audioUrl: ms012Data.find(x => x.id === 'ms012-lask').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms012/thumb_ms012_lask.jpg",
    pdfUrl: "Material-PDF/MS012_Drivers_License_Apostila_Oficial.pdf",
    goldenTip: "Ao ouvir 'He can drive', responda com a pergunta correspondente: 'Can he drive?'.",
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
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>"Jeremy is 16."</i> ➔ <b>Pergunta: How old is Jeremy?</b></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>"He needs to get his driver's license."</i> ➔ <b>Pergunta: What does he need to do?</b></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>"He's gonna take his test next week."</i> ➔ <b>Pergunta: When is he going to take his test?</b></div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms012-lask"
  },
  {
    id: "ms012-pro-1",
    title: "Aula 06.1 • Pronunciation & Connected Speech",
    order: 7,
    duration: "03:06",
    description: "Musicalidade & Conexões de Driver's License • Ritmo mecânico e Sacada de Ouro do Leo.",
    videoUrl: ms012Data.find(x => x.id === 'ms012-pro-1').videoUrl,
    audioUrl: ms012Data.find(x => x.id === 'ms012-pro-1').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms012/thumb_ms012_pro_1.jpg",
    pdfUrl: "Material-PDF/MS012_Drivers_License_Apostila_Oficial.pdf",
    goldenTip: "Ligue 'needs to get his' (/niːdz-tə-ɡɛ-tɪz/) sem cortes bruscos.",
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
            <p>🔗 <b>needs_to_get_his_driver's_license</b> ➔ <i>/niːdz-tə-ɡɛ-tɪz-draɪ-vərz-laɪ-səns/</i></p>
            <p>🔗 <b>drive_around_town_by_himself</b> ➔ <i>/draɪ-və-raʊnd-taʊn-baɪ-hɪm-sɛlf/</i></p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms012-pro-1"
  },
  {
    id: "ms012-pro-2",
    title: "Aula 06.2 • Pronunciation Deep Dive",
    order: 8,
    duration: "06:54",
    description: "Aprofundamento de Ritmo & Reduções • Treino contínuo e fluência natural.",
    videoUrl: ms012Data.find(x => x.id === 'ms012-pro-2').videoUrl,
    audioUrl: ms012Data.find(x => x.id === 'ms012-pro-2').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms012/thumb_ms012_pro_2.jpg",
    pdfUrl: "Material-PDF/MS012_Drivers_License_Apostila_Oficial.pdf",
    goldenTip: "Repita em loop até que 'be able to' soe perfeitamente fluido.",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="music" class="w-4 h-4 text-[#0D9488]"></i>
              Deep Dive de Pronúncia
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            Treino intensivo de connected speech e cadência natural da língua falada.
          </p>
        </div>
      </div>
    `,
    trainingTrackId: "ms012-pro-2"
  }
];

// 2. Injeta em sala-de-aula.html
let salaHtml = fs.readFileSync('sala-de-aula.html', 'utf8');
if (!salaHtml.includes('ms012-drivers-license')) {
  console.log("Injetando MS012 em sala-de-aula.html...");
  const newModuleObj = {
    id: "ms012-drivers-license",
    title: "MS012 - Driver's License",
    shortTitle: "MS012 (Driver's License)",
    badge: "MÓDULO MS012 • DRIVER'S LICENSE",
    stats: "8 Aulas • 63 min",
    lessons: ms012Lessons
  };
  const rx = /(trainingTrackId:\s*\"ms011-pro\"[\s\S]*?\}\s*\]\s*\})/;
  salaHtml = salaHtml.replace(rx, '$1,\n          ' + JSON.stringify(newModuleObj, null, 12).trim());
  fs.writeFileSync('sala-de-aula.html', salaHtml, 'utf8');
  console.log("sala-de-aula.html atualizado com MS012!");
}

// 3. Injeta em curso.html
let cursoHtml = fs.readFileSync('curso.html', 'utf8');
if (!cursoHtml.includes('ms012-drivers-license')) {
  console.log("Injetando MS012 em curso.html...");
  const cursoModObj = {
    id: "ms012-drivers-license",
    order: 12,
    title: "MS012 - Driver's License",
    description: "A conquista da CNH americana por Jeremy aos 16 anos: Driver's Ed, prova de direção, a compra do carro e o adeus definitivo ao ônibus escolar.",
    lessons: ms012Lessons.map(l => ({
      id: l.id,
      order: l.order,
      title: l.title.replace(' • ', ': '),
      duration: l.duration,
      thumbnailUrl: l.thumbnailUrl
    }))
  };
  const rxC = /(id:\s*\"ms011-meet-jeremy\"[\s\S]*?\}\s*\]\s*\})/;
  cursoHtml = cursoHtml.replace(rxC, '$1,\n          ' + JSON.stringify(cursoModObj, null, 10).trim());
  fs.writeFileSync('curso.html', cursoHtml, 'utf8');
  console.log("curso.html atualizado com MS012!");
}

// 4. Injeta em magic-stories.js
let msJs = fs.readFileSync('treino/data/magic-stories.js', 'utf8');
const objMatch = msJs.match(/window\.AEF_MAGIC_STORIES\s*=\s*(\{[\s\S]*?\n\});/);
if (objMatch) {
  const data = eval('(' + objMatch[1] + ')');
  data.modules = data.modules.filter(m => m.id !== 'ms012-drivers-license');
  data.modules.push({
    id: "ms012-drivers-license",
    number: "12",
    title: "MS012 - Driver's License",
    shortTitle: "MS012 • Driver's License",
    badge: "MÓDULO MS012 • DRIVER'S LICENSE",
    coverImage: "../assets/images/thumbs/ms012/thumb_ms012_lr_1.jpg",
    summary: "Jeremy aos 16 anos nos EUA: permissão para dirigir, autoescola na sexta-feira, teste de direção na próxima semana e a compra do primeiro carro.",
    goldenTip: "Ligue 'needs to get his' e 'by himself' em um fluxo melódico natural.",
    tracks: ms012Data.map(tr => ({
      id: tr.id,
      moduleId: "ms012-drivers-license",
      title: tr.title,
      activity: tr.activity,
      duration: "04:00",
      videoUrl: tr.videoUrl,
      audioUrl: tr.audioUrl,
      coverImage: "../" + tr.localThumbnail,
      goldenTip: "Acompanhe a história da CNH aos 16 anos e ative o reflexo sem tradução mental.",
      sentences: tr.sentences
    }))
  });
  fs.writeFileSync('treino/data/magic-stories.js', `window.AEF_MAGIC_STORIES = ${JSON.stringify(data, null, 2)};\n`, 'utf8');
  console.log("magic-stories.js atualizado com MS012!");
}
