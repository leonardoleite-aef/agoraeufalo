const fs = require('fs');

const batchData = JSON.parse(fs.readFileSync('/tmp/batch_ms15_to_30_data.json', 'utf8'));

console.log(`Lendo ${batchData.length} módulos processados da esteira batch...`);

// 1. Atualiza treino/data/magic-stories.js
let msJs = fs.readFileSync('treino/data/magic-stories.js', 'utf8');
const objMatch = msJs.match(/window\.AEF_MAGIC_STORIES\s*=\s*(\{[\s\S]*?\n\});/);
if (objMatch) {
  const data = eval('(' + objMatch[1] + ')');
  
  for (const item of batchData) {
    const mod = item.mod;
    const lessons = item.lessons;
    
    // Remove se já existir
    data.modules = data.modules.filter(m => m.id !== mod.id);
    
    data.modules.push({
      id: mod.id,
      number: String(mod.num),
      title: mod.title,
      shortTitle: `MS${mod.code} • ${mod.shortTitle}`,
      badge: `MÓDULO MS${mod.code} • ${mod.shortTitle.toUpperCase()}`,
      coverImage: `../assets/images/thumbs/ms${mod.code}/thumb_ms${mod.code}_lr.jpg`,
      summary: `Módulo oficial MS${mod.code}: ${mod.shortTitle}. Treinamento das 6 etapas ativas com áudio sincronizado e foco no reflexo imediato.`,
      goldenTip: "Pratique com repetições diárias até que a resposta saia sem tradução mental.",
      tracks: lessons.map(l => ({
        id: l.id,
        moduleId: mod.id,
        title: l.title,
        activity: l.activity,
        duration: l.duration,
        videoUrl: l.videoUrl,
        audioUrl: l.audioUrl,
        coverImage: `../${l.thumbnailUrl}`,
        goldenTip: "Acompanhe o áudio contínuo e ative o reflexo.",
        sentences: l.sentences
      }))
    });
  }
  
  fs.writeFileSync('treino/data/magic-stories.js', `window.AEF_MAGIC_STORIES = ${JSON.stringify(data, null, 2)};\n`, 'utf8');
  console.log("✅ magic-stories.js atualizado com MS015 a MS030!");
}

// 2. Atualiza sala-de-aula.html
let salaHtml = fs.readFileSync('sala-de-aula.html', 'utf8');
const seedsMatch = salaHtml.match(/const COURSE_SEEDS = (\{[\s\S]*?\n\s*\});/);
if (seedsMatch) {
  const seeds = eval('(' + seedsMatch[1] + ')');
  
  for (const item of batchData) {
    const mod = item.mod;
    const lessons = item.lessons;
    
    // Remove se já existir
    seeds['ms-legacy'].modules = seeds['ms-legacy'].modules.filter(m => m.id !== mod.id);
    
    const formattedLessons = lessons.map(l => {
      let contentHtml = `
        <div class="space-y-4">
          <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
              <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
                <i data-lucide="sparkles" class="w-4 h-4 text-[#C68A36]"></i>
                ${l.title}
              </span>
              <span class="text-[10px] font-mono font-bold text-[#C68A36] bg-[#FDF8F0] px-2 py-0.5 rounded border border-[#C68A36]/30">Prática Ativa</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              Treino canônico de Magic Stories: audição focada, ativação de vocabulário e automatização de reflexo.
            </p>
          </div>
        </div>
      `;
      
      return {
        id: l.id,
        title: l.title,
        order: l.order,
        duration: l.duration,
        description: `Treino de ${l.title} do módulo ${mod.title}.`,
        videoUrl: l.videoUrl,
        audioUrl: l.audioUrl,
        thumbnailUrl: l.thumbnailUrl,
        pdfUrl: l.pdfUrl,
        goldenTip: "Concentre-se na melodia sonora das frases e repita em voz alta.",
        processedContentHtml: contentHtml,
        trainingTrackId: l.id
      };
    });
    
    seeds['ms-legacy'].modules.push({
      id: mod.id,
      title: mod.title,
      shortTitle: `MS${mod.code} (${mod.shortTitle})`,
      badge: `MÓDULO MS${mod.code} • ${mod.shortTitle.toUpperCase()}`,
      stats: `${lessons.length} Aulas`,
      lessons: formattedLessons
    });
  }
  
  const updatedSeedsStr = JSON.stringify(seeds, null, 2);
  salaHtml = salaHtml.replace(/const COURSE_SEEDS = \{[\s\S]*?\n\s*\};/, `const COURSE_SEEDS = ${updatedSeedsStr};`);
  fs.writeFileSync('sala-de-aula.html', salaHtml, 'utf8');
  console.log("✅ sala-de-aula.html atualizado com MS015 a MS030!");
}

// 3. Atualiza curso.html
let cursoHtml = fs.readFileSync('curso.html', 'utf8');
const regMatch = cursoHtml.match(/const COURSES_REGISTRY = (\{[\s\S]*?\n\s*\});/);
if (regMatch) {
  const registry = eval('(' + regMatch[1] + ')');
  
  for (const item of batchData) {
    const mod = item.mod;
    const lessons = item.lessons;
    
    registry['ms-legacy'].modules = registry['ms-legacy'].modules.filter(m => m.id !== mod.id);
    
    registry['ms-legacy'].modules.push({
      id: mod.id,
      order: mod.num,
      title: mod.title,
      description: `Módulo oficial MS${mod.code}: ${mod.shortTitle}.`,
      lessons: lessons.map(l => ({
        id: l.id,
        order: l.order,
        title: l.title.replace(' • ', ': '),
        duration: l.duration,
        thumbnailUrl: l.thumbnailUrl
      }))
    });
  }
  
  const updatedRegStr = JSON.stringify(registry, null, 2);
  cursoHtml = cursoHtml.replace(/const COURSES_REGISTRY = \{[\s\S]*?\n\s*\};/, `const COURSES_REGISTRY = ${updatedRegStr};`);
  fs.writeFileSync('curso.html', cursoHtml, 'utf8');
  console.log("✅ curso.html atualizado com MS015 a MS030!");
}
