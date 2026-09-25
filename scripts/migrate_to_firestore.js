const fs = require('fs');

// 1. Injeta os arquivos no ambiente simulando o navegador
global.window = {};

const files = [
  './assets/js/aef-courses-registry.js',
  './treino/data/quickstart.js',
  './treino/data/magic-stories.js',
  './treino/data/estevao.js',
  './treino/data/andre.js',
  './treino/data/thomas.js',
  './treino/data/matheus.js',
  './treino/data/public.js'
];

console.log("🚀 Iniciando Migration: JS Estático -> Firestore");
console.log("-------------------------------------------------");

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    eval(content);
    console.log(`✅ Lido: ${file}`);
  } catch (err) {
    console.error(`❌ Erro ao ler ${file}:`, err.message);
  }
});

// 2. Formatador JSON -> Firestore REST API
function buildFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      if (v.length > 0 && typeof v[0] === 'object') {
        fields[k] = { arrayValue: { values: v.map(item => ({ mapValue: { fields: buildFields(item) } })) } };
      } else if (v.length > 0 && typeof v[0] === 'string') {
        fields[k] = { arrayValue: { values: v.map(str => ({ stringValue: str })) } };
      } else {
        fields[k] = { arrayValue: { values: [] } };
      }
    } else if (typeof v === 'boolean') {
      fields[k] = { booleanValue: v };
    } else if (typeof v === 'number') {
      if (Number.isInteger(v)) {
        fields[k] = { integerValue: v.toString() };
      } else {
        fields[k] = { doubleValue: v };
      }
    } else if (typeof v === 'string') {
      fields[k] = { stringValue: v };
    } else if (typeof v === 'object') {
      fields[k] = { mapValue: { fields: buildFields(v) } };
    }
  }
  return fields;
}

// Otimiza promessas para não estourar limite do fetch
const delay = ms => new Promise(r => setTimeout(r, ms));

async function saveDoc(collectionPath, docId, data) {
  const safeId = String(docId).replace(/[^a-zA-Z0-9_-]/g, '');
  const url = `https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/${collectionPath}/${safeId}?updateMask.fieldPaths=` + Object.keys(buildFields(data)).join("&updateMask.fieldPaths=");
  
  const payload = { name: url.split('?')[0].replace('https://firestore.googleapis.com/v1/', ''), fields: buildFields(data) };
  
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      console.error(`⚠️ Falha ao salvar ${collectionPath}/${safeId}:`, await res.text());
    } else {
      process.stdout.write('.');
    }
  } catch(e) {
    console.error(`⚠️ Erro de rede em ${safeId}:`, e.message);
  }
}

// 3. Execução da Migração
async function run() {
  let stats = { courses: 0, modules: 0, lessons: 0, studentTracks: 0 };

  console.log("\n📦 Migrando Cursos Principais (Registry)...");
  const registry = window.AEF_COURSES_REGISTRY || {};
  for (const cid of Object.keys(registry)) {
    const course = registry[cid];
    await saveDoc('courses', cid, { title: course.title, badge: course.badge || '', published: course.published !== false });
    stats.courses++;
    
    for (const mod of (course.modules || [])) {
      await saveDoc(`courses/${cid}/modules`, mod.id, { title: mod.title, order: mod.order || 1, published: mod.published !== false });
      stats.modules++;
      
      for (const les of (mod.lessons || [])) {
        await saveDoc(`courses/${cid}/modules/${mod.id}/lessons`, les.id, les);
        stats.lessons++;
        await delay(20);
      }
    }
  }

  console.log("\n📦 Migrando Magic Stories...");
  const ms = window.AEF_MAGIC_STORIES || {};
  if (ms.modules) {
    for (const mod of ms.modules) {
      await saveDoc(`courses/ms-legacy/modules`, mod.id, { title: mod.title, badge: mod.badge || '' });
      stats.modules++;
      for (const track of (mod.tracks || [])) {
        await saveDoc(`courses/ms-legacy/modules/${mod.id}/lessons`, track.id, track);
        stats.lessons++;
        await delay(20);
      }
    }
  }

  console.log("\n📦 Migrando Quickstart...");
  const qs = window.AEF_QUICKSTART || {};
  if (qs.modules) {
    for (const mod of qs.modules) {
      await saveDoc(`courses/english-quickstart/modules`, mod.id, { title: mod.title, badge: mod.badge || '' });
      stats.modules++;
      for (const track of (mod.tracks || [])) {
        await saveDoc(`courses/english-quickstart/modules/${mod.id}/lessons`, track.id, track);
        stats.lessons++;
        await delay(20);
      }
    }
  }

  console.log("\n📦 Migrando Trilhas VIP...");
  const students = [
    { data: window.AEF_STUDENT_ESTEVAO, id: 'estevaopin' },
    { data: window.AEF_STUDENT_ANDRE, id: 'andre' },
    { data: window.AEF_STUDENT_THOMAS, id: 'thomasskt21' },
    { data: window.AEF_STUDENT_MATHEUS, id: 'mateus' }
  ];
  for (const s of students) {
    if (s.data && s.data.tracks) {
      for (const track of s.data.tracks) {
        await saveDoc(`students/${s.id}/tracks`, track.id, track);
        stats.studentTracks++;
        await delay(20);
      }
    }
  }

  console.log("\n📦 Migrando Vitrine Free (Sugestões)...");
  const pub = window.AEF_STUDENT_PUBLIC || {};
  if (pub.tracks) {
    for (const [index, track] of pub.tracks.entries()) {
      track.order = index + 1;
      await saveDoc('suggestions', track.id, track);
      stats.studentTracks++;
      await delay(20);
    }
  }

  console.log("\n\n✅ MIGRAÇÃO CONCLUÍDA!");
  console.log(`Resumo: ${stats.courses} Cursos, ${stats.modules} Módulos, ${stats.lessons} Aulas Regulares, ${stats.studentTracks} Trilhas (VIP/Free).`);
}

run();
