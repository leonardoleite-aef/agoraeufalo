const fs = require('fs');

const ms007Data = JSON.parse(fs.readFileSync('/tmp/ms007_processed_data.json', 'utf8'));

// 1. Monta as 6 aulas estruturadas no padrão canônico de sala-de-aula.html
const ms007Lessons = [
  {
    id: "ms007-lr",
    title: "Aula 01 • Listen & Read (LR)",
    order: 1,
    duration: "03:32",
    description: "Entrada & Imersão Auditiva • Anna's Decision: Acompanhe a história pelos ouvidos sem traduzir na cabeça.",
    videoUrl: ms007Data.find(x => x.id === 'ms007-lr').videoUrl,
    audioUrl: ms007Data.find(x => x.id === 'ms007-lr').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms007/thumb_ms007_lr.jpg",
    pdfUrl: "Material-PDF/MS007_Annas_Decision_Apostila_Oficial.pdf",
    goldenTip: "Observe pelos ouvidos a diferença entre a grafia e o som real. Mantenha o fluxo contínuo da narração.",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="book-open" class="w-4 h-4 text-[#C68A36]"></i>
              Texto da História (Listen & Read)
            </span>
            <span class="text-[10px] font-mono font-bold text-[#C68A36] bg-[#FDF8F0] px-2 py-0.5 rounded border border-[#C68A36]/30">Imersão Sonora Pura</span>
          </div>

          <div class="space-y-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            <p>Anna is 19 and Flavia is 15. They were both born in Brazil. They both live with their parents in Brasília.</p>
            <p>Anna goes to University in Brasilia and Flavia is still in High School. Flavia goes to American School in Brasília.</p>
            <p>Both girls are planning to go to USA to continue their studies.</p>
            <p>As Anna already goes to University in Brazil, she needs to make a decision. She has to decide if she drops out of the Brazilian university and starts over in America or finishes her university in Brazil first, and then goes to America to get her degree in computer science.</p>
            <p>Anna hasn't decided yet. If she drops out of University in Brazil, she will start from the beginning in America.</p>
            <p>If she stays in Brazil to finish university, she will have 3 more years in Brasília.</p>
            <p class="font-bold text-[#0A192F] pt-1">The question, my friend, is: what do you think Anna needs to do?</p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms-legacy-07"
  },
  {
    id: "ms007-voc",
    title: "Aula 02 • Vocabulary Session (VOC)",
    order: 2,
    duration: "10:24",
    description: "Matriz de Chunks & Tradução Falada Real • Expressões essenciais de vida acadêmica e decisões de carreira.",
    videoUrl: ms007Data.find(x => x.id === 'ms007-voc').videoUrl,
    audioUrl: ms007Data.find(x => x.id === 'ms007-voc').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms007/thumb_ms007_voc.jpg",
    pdfUrl: "Material-PDF/MS007_Annas_Decision_Apostila_Oficial.pdf",
    goldenTip: "Não tente decorar 'drop out' isolado. Absorva o bloco 'drop out of university' com o sentimento da decisão.",
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
              <p class="font-bold text-[#0A192F]">Anna is 19 and Flavia is 15. They were both born in Brazil. They both live with their parents in Brasília.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ A Anna tem 19 anos e a Flávia tem 15. As duas nasceram no Brasil. As duas moram com os pais em Brasília.</p>
            </div>

            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">Anna goes to University in Brasilia and Flavia is still in High School. Flavia goes to American School in Brasília.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ A Anna faz faculdade em Brasília e a Flávia ainda está no Ensino Médio. A Flávia estuda na Escola Americana em Brasília.</p>
            </div>

            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">Both girls are planning to go to USA to continue their studies.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ As duas garotas estão planejando ir para os EUA para continuar os estudos.</p>
            </div>

            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">As Anna already goes to University in Brazil, she needs to make a decision. She has to decide if she drops out of the Brazilian university and starts over in America or finishes her university in Brazil first, and then goes to America to get her degree in computer science.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ Como a Anna já faz faculdade no Brasil, ela precisa tomar uma decisão. Ela tem que decidir se larga a faculdade brasileira e começa do zero nos EUA ou se termina a faculdade no Brasil primeiro, e depois vai para a América fazer pós-graduação em Ciência da Computação.</p>
            </div>

            <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1">
              <p class="font-bold text-[#0A192F]">Anna hasn't decided yet. If she drops out of University in Brazil, she will start from the beginning in America. If she stays in Brazil to finish university, she will have 3 more years in Brasília.</p>
              <p class="text-xs text-[#047857] italic font-medium">↳ A Anna ainda não se decidiu. Se ela largar a faculdade no Brasil, vai começar do comecinho nos EUA. Se ficar no Brasil para terminar a faculdade, terá mais 3 anos em Brasília.</p>
            </div>
          </div>
        </div>

        <!-- Card 2: Matriz de Sound Chunks Acústicos -->
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="layers" class="w-4 h-4 text-[#C68A36]"></i>
              Matriz de Sound Chunks Acústicos
            </span>
            <span class="text-[10px] font-mono font-bold text-[#C68A36]">Blocos Sonoros Prontos</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
              <p class="font-bold text-[#0A192F]">were both born in Brazil</p>
              <p class="text-[11px] text-[#7A7369]">ambas nasceram no Brasil</p>
            </div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
              <p class="font-bold text-[#0A192F]">drops out of the university</p>
              <p class="text-[11px] text-[#7A7369]">abandona / tranca a faculdade</p>
            </div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
              <p class="font-bold text-[#0A192F]">starts over in America</p>
              <p class="text-[11px] text-[#7A7369]">começa do zero nos EUA</p>
            </div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
              <p class="font-bold text-[#0A192F]">get her degree in computer science</p>
              <p class="text-[11px] text-[#7A7369]">conquistar o diploma / fazer pós em computação</p>
            </div>
          </div>
        </div>

        <!-- Card 3: Curiosidades do Leo -->
        <div class="p-5 sm:p-6 rounded-2xl bg-[#FDF8F0] border border-[#C68A36]/40 text-[#0A192F] space-y-3">
          <div class="flex items-center gap-2 pb-2 border-b border-[#C68A36]/20">
            <i data-lucide="sparkles" class="w-4 h-4 text-[#C68A36]"></i>
            <span class="font-black text-xs uppercase tracking-wider text-[#C68A36]">Curiosidades do Leo: O Sentimento da Estrutura</span>
          </div>
          <div class="space-y-2.5 text-xs leading-relaxed">
            <div>
              <p class="font-bold text-[#0A192F]">🔗 'Drop out of school / university':</p>
              <p class="text-slate-700">Expressão autêntica usada nos EUA para quem desiste ou tranca a faculdade antes de se formar.</p>
            </div>
            <div>
              <p class="font-bold text-[#0A192F]">🔗 'Start over':</p>
              <p class="text-slate-700">Não é apenas recomeçar; traz o sentimento de dar um 'reset' completo e começar uma nova jornada do zero.</p>
            </div>
            <div>
              <p class="font-bold text-[#0A192F]">🔗 'Hasn't decided yet':</p>
              <p class="text-slate-700">O <i>yet</i> no final da frase reforça o estado de indefinição que perdura até o momento presente.</p>
            </div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms-legacy-07"
  },
  {
    id: "ms007-la",
    title: "Aula 03 • Listen & Answer (LA)",
    order: 3,
    duration: "05:14",
    description: "Reflexo & Velocidade de Resposta no Diálogo • Bate-pronto oral com as perguntas completas da história.",
    videoUrl: ms007Data.find(x => x.id === 'ms007-la').videoUrl,
    audioUrl: ms007Data.find(x => x.id === 'ms007-la').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms007/thumb_ms007_la.jpg",
    pdfUrl: "Material-PDF/MS007_Annas_Decision_Apostila_Oficial.pdf",
    goldenTip: "Responda imediatamente no áudio! Sem medo de errar, busque velocidade e respostas curtas e naturais.",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="zap" class="w-4 h-4 text-[#D97706]"></i>
              Perguntas de Reflexo (Listen & Answer)
            </span>
            <span class="text-[10px] font-mono font-bold text-[#D97706] bg-[#FDF8F0] px-2 py-0.5 rounded border border-[#D97706]/30">Zero Respostas Prontas</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">
            Ouça o Professor Leo no áudio e responda em voz alta antes da confirmação sonora:
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-800 font-medium pt-2">
            <div class="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">1. How old is Anna?</div>
            <div class="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">2. How old is Flavia?</div>
            <div class="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">3. Where were they born?</div>
            <div class="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">4. Where do they live and who with?</div>
            <div class="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">5. Where does Anna go to university?</div>
            <div class="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">6. Where does Flavia go to school?</div>
            <div class="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">7. What are the girls planning to do?</div>
            <div class="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">8. Why does Anna need to make a decision?</div>
            <div class="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">9. What decision does she have to make?</div>
            <div class="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">10. Has she decided yet?</div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms-legacy-07"
  },
  {
    id: "ms007-lrt",
    title: "Aula 04 • Look & Retell (LRT)",
    order: 4,
    duration: "03:32",
    description: "Speaking Ativo & Reconto Autônomo • Reconte a encruzilhada de Anna com as suas próprias palavras.",
    videoUrl: ms007Data.find(x => x.id === 'ms007-lrt').videoUrl,
    audioUrl: ms007Data.find(x => x.id === 'ms007-lrt').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms007/thumb_ms007_lrt.jpg",
    pdfUrl: "Material-PDF/MS007_Annas_Decision_Apostila_Oficial.pdf",
    goldenTip: "Sem áudio de apoio e sem olhar o texto! Use as perguntas-guia para recontar a história.",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="mic" class="w-4 h-4 text-[#E11D48]"></i>
              Palco de Reconto (Look & Retell)
            </span>
          </div>
          <p class="text-xs text-slate-700 leading-relaxed">
            Grave o seu reconto no Training Player e envie para avaliação com o AI Speech Coach.
          </p>
          <div class="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DC] space-y-1.5 text-xs text-slate-800">
            <p class="font-bold text-[#0A192F]">Palavras-Chave de Apoio:</p>
            <p class="text-[#E11D48] font-mono">Anna (19) • Flavia (15) • Born in Brazil • American School • Plan to go to USA • Drop out vs. Finish university • 3 more years</p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms-legacy-07"
  },
  {
    id: "ms007-lask",
    title: "Aula 05 • Listen & Ask (LASK)",
    order: 5,
    duration: "06:15",
    description: "Desafio de Formulação Rápida de Perguntas • Lidere a conversa criando as perguntas no reflexo.",
    videoUrl: ms007Data.find(x => x.id === 'ms007-lask').videoUrl,
    audioUrl: ms007Data.find(x => x.id === 'ms007-lask').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms007/thumb_ms007_lask.jpg",
    pdfUrl: "Material-PDF/MS007_Annas_Decision_Apostila_Oficial.pdf",
    goldenTip: "Ao ouvir uma afirmação afiada, formule a pergunta correspondente no reflexo antes do gongo.",
    processedContentHtml: `
      <div class="space-y-4">
        <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
            <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
              <i data-lucide="help-circle" class="w-4 h-4 text-[#6366F1]"></i>
              Formulação de Perguntas (Listen & Ask)
            </span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">
            Ouça as respostas e formule a pergunta exata:
          </p>
          <div class="space-y-2 text-xs text-slate-800">
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>"Anna is 19."</i> ➔ <b>Pergunta: How old is Anna?</b></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>"They were both born in Brazil."</i> ➔ <b>Pergunta: Where were they born?</b></div>
            <div class="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">↳ Estímulo: <i>"They live with their parents."</i> ➔ <b>Pergunta: Who do they live with?</b></div>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms-legacy-07"
  },
  {
    id: "ms007-pro",
    title: "Aula 06 • Pronunciation & Connected Speech",
    order: 6,
    duration: "03:47",
    description: "Musicalidade, Boca & Ritmo Mecânico • Conexões sonoras consoante-vogal e Sacada de Ouro do Leo.",
    videoUrl: ms007Data.find(x => x.id === 'ms007-pro').videoUrl,
    audioUrl: ms007Data.find(x => x.id === 'ms007-pro').audioUrl,
    thumbnailUrl: "assets/images/thumbs/ms007/thumb_ms007_pro.jpg",
    pdfUrl: "Material-PDF/MS007_Annas_Decision_Apostila_Oficial.pdf",
    goldenTip: "Ligue 'drops out of' em um único sopro contínuo: /drɒp-saʊ-təv/.",
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
            <p>🔗 <b>drops_out_of</b> ➔ <i>/drɒp-saʊ-təv/</i></p>
            <p>🔗 <b>starts_over_in_America</b> ➔ <i>/stɑːr-tsoʊ-və-rɪ-nə-mɛ-rɪ-kə/</i></p>
            <p>🔗 <b>hasn't_decided_yet</b> ➔ <i>/hæ-zənt-dɪ-saɪ-dɪ-djet/</i></p>
          </div>
        </div>
      </div>
    `,
    trainingTrackId: "ms-legacy-07"
  }
];

const newModuleObj = {
  id: "ms007-anna-decision",
  title: "MS007 - Anna's Decision",
  shortTitle: "MS007 (Anna's Decision)",
  badge: "MÓDULO MS007 • ANNA'S DECISION",
  stats: "6 Aulas • 33 min",
  lessons: ms007Lessons
};

// 2. Injeta em sala-de-aula.html
let salaHtml = fs.readFileSync('sala-de-aula.html', 'utf8');
if (!salaHtml.includes('ms007-anna-decision')) {
  console.log("Injetando MS007 em sala-de-aula.html...");
  const marker = 'id: "ms006-how-they-met",';
  // Encontra o fechamento do módulo ms006
  const mod6Idx = salaHtml.indexOf(marker);
  if (mod6Idx !== -1) {
    // Acha o fim do array lessons do ms006 e o fim do objeto do módulo
    const insertAfter = 'trainingTrackId: "ms-legacy-06"\n              }\n            ]\n          }';
    if (salaHtml.includes(insertAfter)) {
      const injection = insertAfter + ',\n          ' + JSON.stringify(newModuleObj, null, 12).trim();
      salaHtml = salaHtml.replace(insertAfter, injection);
      fs.writeFileSync('sala-de-aula.html', salaHtml, 'utf8');
      console.log("sala-de-aula.html atualizado com MS007!");
    }
  }
}

// 3. Injeta em curso.html (Vitrine)
let cursoHtml = fs.readFileSync('curso.html', 'utf8');
if (!cursoHtml.includes('ms007-anna-decision')) {
  console.log("Injetando MS007 em curso.html...");
  const cursoModObj = {
    id: "ms007-anna-decision",
    title: "MS007 - Anna's Decision",
    badge: "MÓDULO MS007",
    stats: "6 Aulas • 33 min",
    lessons: ms007Lessons.map(l => ({
      id: l.id,
      title: l.title,
      duration: l.duration,
      videoUrl: l.videoUrl,
      thumbnailUrl: l.thumbnailUrl,
      pdfUrl: l.pdfUrl,
      hasTrainingTrack: true,
      trainingTrackId: l.trainingTrackId
    }))
  };
  const cursoMarker = 'id: "ms006-how-they-met",';
  const cursoInsertAfter = 'trainingTrackId: "ms-legacy-06"\n            }\n          ]\n        }';
  if (cursoHtml.includes(cursoInsertAfter)) {
    cursoHtml = cursoHtml.replace(cursoInsertAfter, cursoInsertAfter + ',\n        ' + JSON.stringify(cursoModObj, null, 10).trim());
    fs.writeFileSync('curso.html', cursoHtml, 'utf8');
    console.log("curso.html atualizado com MS007!");
  }
}

// 4. Injeta em treino/data/magic-stories.js (Training Player)
let msPlayerJs = fs.readFileSync('treino/data/magic-stories.js', 'utf8');
if (!msPlayerJs.includes('ms007-anna-decision')) {
  console.log("Injetando MS007 em magic-stories.js...");
  const playerModuleObj = {
    id: "ms007-anna-decision",
    number: "07",
    title: "MS007 - Anna's Decision",
    shortTitle: "MS007 • Anna's Decision",
    badge: "MÓDULO MS007 • ANNA'S DECISION",
    coverImage: "../assets/images/thumbs/ms007/thumb_ms007_lr.jpg",
    summary: "A encruzilhada de Anna: largar a faculdade no Brasil e recomeçar nos EUA, ou concluir mais 3 anos em Brasília antes de fazer pós-graduação na América.",
    goldenTip: "Ligue 'drops out of' e 'starts over in' em um único fluxo sonoro contínuo.",
    tracks: ms007Data.map(tr => ({
      id: tr.id,
      moduleId: "ms007-anna-decision",
      title: tr.title,
      activity: tr.activity,
      duration: "04:00",
      videoUrl: tr.videoUrl,
      audioUrl: tr.audioUrl,
      coverImage: "../" + tr.localThumbnail,
      goldenTip: "Acompanhe a melodia falada em tempo real e ative o reflexo sem tradução mental.",
      sentences: tr.sentences
    }))
  };
  
  const endModulePattern = /(\n\s*modules:\s*\[[\s\S]*?)(\n\s*\]\s*\n\s*\};)/;
  msPlayerJs = msPlayerJs.replace(endModulePattern, '$1,\n    ' + JSON.stringify(playerModuleObj, null, 4) + '$2');
  fs.writeFileSync('treino/data/magic-stories.js', msPlayerJs, 'utf8');
  console.log("magic-stories.js atualizado com MS007!");
}
