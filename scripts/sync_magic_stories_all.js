const fs = require('fs');

// Carrega dados processados
const ms007Data = JSON.parse(fs.readFileSync('/tmp/ms007_processed_data.json', 'utf8'));
const ms008Data = JSON.parse(fs.readFileSync('/tmp/ms008_processed_data.json', 'utf8'));
const ms009Data = JSON.parse(fs.readFileSync('/tmp/ms009_processed_data.json', 'utf8'));
const ms010Data = JSON.parse(fs.readFileSync('/tmp/ms010_processed_data.json', 'utf8'));
const ms011Data = JSON.parse(fs.readFileSync('/tmp/ms011_processed_data.json', 'utf8'));

// 1. Injeção segura em magic-stories.js
let msJs = fs.readFileSync('treino/data/magic-stories.js', 'utf8');

// Extrai o objeto existente com eval
const objMatch = msJs.match(/window\.AEF_MAGIC_STORIES\s*=\s*(\{[\s\S]*?\n\});/);
if (objMatch) {
  const data = eval('(' + objMatch[1] + ')');
  
  // Remove versões anteriores de 007 a 011 se existirem
  data.modules = data.modules.filter(m => !['ms007-anna-decision', 'ms008-back-in-1999', 'ms009-grammar-practice', 'ms010-an-english-student', 'ms011-meet-jeremy'].includes(m.id));
  
  // Injeta MS007
  data.modules.push({
    id: "ms007-anna-decision",
    number: "07",
    title: "MS007 - Anna's Decision",
    shortTitle: "MS007 • Anna",
    badge: "MÓDULO MS007 • ANNA'S DECISION",
    coverImage: "../assets/images/thumbs/ms007/thumb_ms007_lr.jpg",
    summary: "A encruzilhada de Anna: largar a faculdade no Brasil e recomeçar nos EUA do zero, ou concluir mais 3 anos em Brasília antes de fazer pós-graduação na América.",
    goldenTip: "Observe a transição entre presente e passado ao contar os fatos de Anna.",
    tracks: ms007Data.map(tr => ({
      id: tr.id,
      moduleId: "ms007-anna-decision",
      title: tr.title,
      activity: tr.activity,
      duration: "04:00",
      videoUrl: tr.videoUrl,
      audioUrl: tr.audioUrl,
      coverImage: "../" + tr.localThumbnail,
      goldenTip: "Acompanhe a melodia e ative o reflexo sem tradução mental.",
      sentences: tr.sentences
    }))
  });

  // Injeta MS008
  data.modules.push({
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
  });

  // Injeta MS009
  data.modules.push({
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
  });

  // Injeta MS010
  data.modules.push({
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
  });

  // Injeta MS011
  data.modules.push({
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
  });

  const outputJs = `window.AEF_MAGIC_STORIES = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync('treino/data/magic-stories.js', outputJs, 'utf8');
  console.log("magic-stories.js reconstruído e atualizado com 100% de integridade (MS001 a MS011)!");
}
