const fs = require('fs');
const path = require('path');

// 1. Read batch data and config
const batchData = JSON.parse(fs.readFileSync('/tmp/dtc_batch_results.json', 'utf8'));

// Lesson configs with pedagogical HTML and Golden Tips
const lessonConfigs = {
  'aula-1788738508349': {
    title: 'Como dizer e ENTENDER os anos em Inglês',
    goldenTip: "Nunca tente traduzir anos mentalmente como 'mil novecentos e setenta e três'. O gringo divide em dois blocos de dois dígitos: 19 e 73 (nineteen seventy-three). Repita em blocos de dois até a boca falar no reflexo!",
    processedHtml: `<div class="space-y-6">
  <!-- BOX 1: A REGRA DE OURO DOS ANOS (DIVIDIR EM 2 BLOCOS) -->
  <div class="p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-200 text-slate-900 space-y-3">
    <div class="flex items-center gap-2">
      <span class="text-xl">📅</span>
      <h3 class="font-black text-sm uppercase tracking-wider text-amber-950 font-sans">1. A Regra dos 2 Blocos de 2 Dígitos:</h3>
    </div>
    <p class="text-xs text-slate-700 leading-relaxed">
      Em português falamos <i>mil novecentos e setenta e três</i>. Em inglês, <b>ninguém fala 'one thousand nine hundred'</b>. O cérebro do nativo corta o ano no meio e fala dois blocos sonoros:
    </p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
      <div class="p-3 bg-white rounded-xl border border-amber-200">
        <p class="font-black text-amber-900">Anos Regulares (Bloco A + Bloco B)</p>
        <p class="text-[11px] text-slate-700 mt-1">1973 ➔ <b>nineteen seventy-three</b> (19 + 73)</p>
        <p class="text-[11px] text-slate-700">1984 ➔ <b>nineteen eighty-four</b> (19 + 84)</p>
        <p class="text-[11px] text-slate-700">2026 ➔ <b>twenty twenty-six</b> (20 + 26)</p>
      </div>
      <div class="p-3 bg-white rounded-xl border border-amber-200">
        <p class="font-black text-amber-900">Anos com Zero no Meio ("OH")</p>
        <p class="text-[11px] text-slate-700 mt-1">1905 ➔ <b>nineteen oh-five</b></p>
        <p class="text-[11px] text-slate-700">1908 ➔ <b>nineteen oh-eight</b></p>
        <p class="text-[11px] text-slate-700">2005 ➔ <b>twenty oh-five</b> (ou <i>two thousand five</i>)</p>
      </div>
    </div>
  </div>

  <!-- BOX 2: ANOS CENTENARES (HUNDRED) -->
  <div class="p-5 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-3">
    <h4 class="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
      <span>🏛️ 2. Anos Centenares Zerados (Uso do HUNDRED):</span>
    </h4>
    <div class="space-y-2 text-xs">
      <div class="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
        <p class="font-bold text-amber-950">Anos terminados em 00 ➔ <i>HUNDRED</i></p>
        <p class="text-slate-700 mt-1">• 1800 ➔ <b>eighteen hundred</b></p>
        <p class="text-slate-700">• 1900 ➔ <b>nineteen hundred</b></p>
        <p class="text-slate-700">• 2000 ➔ <b>two thousand</b> (ano dois mil)</p>
      </div>
    </div>
  </div>
</div>`
  },
  'aula-1788738659564': {
    title: 'Datas, Meses e Dias em Inglês (Parte 1)',
    goldenTip: "Para fixar preposição de data: se tiver o dia exato no calendário, use sempre ON (on Monday, on May 4th). Se for o mês ou ano solto, use IN (in May, in 2026).",
    processedHtml: `<div class="space-y-6">
  <!-- BOX 1: A ORDEM MÊS + DIA NOS EUA -->
  <div class="p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-200 text-slate-900 space-y-3">
    <div class="flex items-center gap-2">
      <span class="text-xl">🗓️</span>
      <h3 class="font-black text-sm uppercase tracking-wider text-amber-950 font-sans">1. A Ordem Mês + Dia (Uso de Números Ordinais):</h3>
    </div>
    <p class="text-xs text-slate-700 leading-relaxed">
      No inglês americano, o mês vem <b>antes do dia</b>, e o dia é sempre pronunciado como número ordinal (<i>primeiro, segundo, terceiro...</i>):
    </p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
      <div class="p-3 bg-white rounded-xl border border-amber-200">
        <p class="font-black text-amber-900">Formato Falado</p>
        <p class="text-[11px] text-slate-700 mt-1">May 4th ➔ <b>May fourth</b> (No dia 4 de maio)</p>
        <p class="text-[11px] text-slate-700">July 1st ➔ <b>July first</b> (No dia 1º de julho)</p>
        <p class="text-[11px] text-slate-700">Dec 25th ➔ <b>December twenty-fifth</b> (25 de dez)</p>
      </div>
      <div class="p-3 bg-white rounded-xl border border-amber-200">
        <p class="font-black text-amber-900">Preposição Obrigatória: ON</p>
        <p class="text-[11px] text-slate-700 mt-1"><b>on</b> May 4th ➔ <i>No dia 4 de maio</i></p>
        <p class="text-[11px] text-slate-700"><b>on</b> Monday ➔ <i>Na segunda-feira</i></p>
        <p class="text-[10px] text-amber-800 font-bold mt-1">Dia específico = sempre preposição ON!</p>
      </div>
    </div>
  </div>

  <!-- BOX 2: PREPOSIÇÃO IN (MESES E ANOS ISOLADOS) -->
  <div class="p-5 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-3">
    <h4 class="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
      <span>📌 2. Quando Usar a Preposição IN:</span>
    </h4>
    <div class="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs">
      <p class="font-bold text-amber-950">Mês ou Ano sem o dia específico ➔ Use IN</p>
      <p class="text-slate-700 mt-1">• <b>in</b> July ➔ <i>Em julho</i></p>
      <p class="text-slate-700">• <b>in</b> 2026 ➔ <i>Em 2026</i></p>
      <p class="text-slate-700">• <b>in</b> the morning / <b>in</b> the afternoon ➔ <i>De manhã / À tarde</i></p>
    </div>
  </div>
</div>`
  },
  'aula-1788738792799': {
    title: 'Datas, Meses e Dias em Inglês (Parte 2)',
    goldenTip: "Ao marcar compromissos em inglês, confirme sempre o bloco sonoro completo: 'See you on Thursday the 15th at four PM'. Fale a melodia inteira sem pausas picadas.",
    processedHtml: `<div class="space-y-6">
  <!-- BOX 1: PERGUNTAS E RESPOSTAS DE DATAS -->
  <div class="p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-200 text-slate-900 space-y-3">
    <div class="flex items-center gap-2">
      <span class="text-xl">💬</span>
      <h3 class="font-black text-sm uppercase tracking-wider text-amber-950 font-sans">1. Perguntar e Confirmar Datas no Dia a Dia:</h3>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
      <div class="p-3 bg-white rounded-xl border border-amber-200">
        <p class="font-black text-amber-900">Perguntas Comuns</p>
        <p class="text-[11px] text-slate-700 mt-1">• When is your birthday? ➔ <i>Quando é seu aniversário?</i></p>
        <p class="text-[11px] text-slate-700">• What's today's date? ➔ <i>Que dia é hoje?</i></p>
        <p class="text-[11px] text-slate-700">• When does it start? ➔ <i>Quando começa?</i></p>
      </div>
      <div class="p-3 bg-white rounded-xl border border-amber-200">
        <p class="font-black text-amber-900">Respostas Naturais</p>
        <p class="text-[11px] text-slate-700 mt-1">• It's on October 12th. ➔ <i>É no dia 12 de outubro.</i></p>
        <p class="text-[11px] text-slate-700">• Today is March 15th. ➔ <i>Hoje é 15 de março.</i></p>
        <p class="text-[11px] text-slate-700">• See you on Friday! ➔ <i>Te vejo na sexta!</i></p>
      </div>
    </div>
  </div>

  <!-- BOX 2: ANO BISSEXTO & DETALHES -->
  <div class="p-5 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-3">
    <h4 class="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
      <span>💡 2. Pílulas e Expressões Chave:</span>
    </h4>
    <div class="space-y-2 text-xs">
      <div class="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
        <p class="font-bold text-amber-950">Ano Bissexto ➔ <b>Leap Year</b></p>
        <p class="text-slate-700 mt-1">February has 29 days in a leap year.</p>
      </div>
      <div class="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
        <p class="font-bold text-amber-950">Dias Úteis vs Fim de Semana</p>
        <p class="text-slate-700 mt-1">• <b>Weekdays</b> ➔ <i>Dias de semana (segunda a sexta)</i></p>
        <p class="text-slate-700">• <b>Weekend</b> ➔ <i>Fim de semana (on the weekend)</i></p>
      </div>
    </div>
  </div>
</div>`
  },
  'aula-1788739999000': {
    title: 'Treino Prático • Magic Story de Datas & Horas',
    goldenTip: "A teoria te dá a chave, mas o reflexo só nasce no treino repetido. Não tente decorar regras: ouça a história e responda no bate-pronto até a fala sair sem pensar!",
    processedHtml: `<div class="space-y-6">
  <!-- BOX 1: A HISTÓRIA PRÁTICA INTEGRADA -->
  <div class="p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-200 text-slate-900 space-y-3">
    <div class="flex items-center gap-2">
      <span class="text-xl">🎬</span>
      <h3 class="font-black text-sm uppercase tracking-wider text-amber-950 font-sans">1. A História Prática (Integração Total):</h3>
    </div>
    <p class="text-xs text-slate-700 leading-relaxed">
      Nesta aula de fechamento, você treina todo o ecossistema de horas, datas, anos e compromissos numa conversa real entre dois amigos organizando uma viagem e uma reunião.
    </p>
    <div class="p-3 bg-white rounded-xl border border-amber-200 text-xs space-y-2">
      <p class="font-bold text-amber-950">✦ Foco Auditivo:</p>
      <p class="text-slate-700">• Observe a cadência ao falar horas com <i>quarter to</i>, <i>half past</i> e <i>PM</i>.</p>
      <p class="text-slate-700">• Note a naturalidade ao conectar o dia e o mês (<i>on November 3rd</i>).</p>
      <p class="text-slate-700">• Repita as perguntas em voz alta no mesmo andamento e ritmo musical.</p>
    </div>
  </div>
</div>`
  }
};

const durations = {
  'aula-1788738508349': '06:45',
  'aula-1788738659564': '08:20',
  'aula-1788738792799': '07:15',
  'aula-1788739999000': '11:40'
};

const allCourses = require('../assets/js/aef-courses-registry.js');

const c3_lessons = [];
const c4_lessons = [];

batchData.forEach(item => {
  const lid = item.lessonId;
  const mid = item.moduleId;
  const cfg = lessonConfigs[lid] || {};
  
  const lessonObj = {
    id: lid,
    moduleId: mid,
    courseId: 'dtc_curso',
    title: cfg.title || item.title,
    order: item.order || 1,
    duration: durations[lid] || '05:00',
    videoUrl: item.videoUrl || '',
    audioUrl: item.audioUrl || '',
    thumbnailUrl: 'assets/images/thumbs/dtc_intro_thumb.jpg',
    artworkUrl: 'assets/images/cover-dates-and-times-square.jpg',
    pdfUrl: '',
    goldenTip: cfg.goldenTip || '',
    rawScript: item.transcript || '',
    processedContentHtml: cfg.processedHtml || '',
    published: true
  };
  
  if (mid === 'ciclo-03') {
    c3_lessons.push(lessonObj);
  } else if (mid === 'ciclo-04') {
    c4_lessons.push(lessonObj);
  }
});

// Update in allCourses
const dtc = allCourses['dtc_curso'];
if (dtc && dtc.modules) {
  const m3 = dtc.modules.find(m => m.id === 'ciclo-03');
  if (m3) m3.lessons = c3_lessons;
  const m4 = dtc.modules.find(m => m.id === 'ciclo-04');
  if (m4) m4.lessons = c4_lessons;
}

// Write back to aef-courses-registry.js
const fileContent = `/**
 * AgoraEuFalo - Master Canonical Courses Registry (Single Source of Truth)
 * Professor Leonardo Leite
 * Fully structured hierarchy: Courses > Modules > Lessons
 */
const AEF_COURSES_DATA = ${JSON.stringify(allCourses, null, 2)};

if (typeof window !== "undefined") {
  window.AEF_COURSES_REGISTRY = AEF_COURSES_DATA;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = AEF_COURSES_DATA;
}
`;

fs.writeFileSync(path.join(__dirname, '../assets/js/aef-courses-registry.js'), fileContent, 'utf8');
console.log('Successfully updated assets/js/aef-courses-registry.js!');
