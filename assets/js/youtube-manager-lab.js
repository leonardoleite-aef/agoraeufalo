let db = null;
let currentVideos = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (window.aefPortalAuth) {
    await window.aefPortalAuth.ready();
  }
  
  if (!window.firebase || !window.firebase.firestore) {
    console.error("Firebase falhou ao inicializar.");
    return;
  }
  db = window.firebase.firestore();
  
  // Guard
  if (window.aefPortalAuth) {
    const isAuthed = await window.aefPortalAuth.requireAuth({ redirectUrl: '/login', requireAdmin: true });
    if (!isAuthed) return;
  }
  
  initDropdowns();
  loadVideos();
});

function toggleView(view) {
  document.getElementById('view-dashboard').classList.toggle('hidden', view !== 'dashboard');
  document.getElementById('view-editor').classList.toggle('hidden', view !== 'editor');
  if (view === 'editor' && !document.getElementById('videoId').value) {
    resetForm();
  }
}

function resetForm() {
  document.getElementById('editorForm').reset();
  document.getElementById('videoId').value = '';
  document.getElementById('thumbnailUrl').value = '';
  document.getElementById('thumbPreview').innerHTML = '<span class="text-slate-600 text-sm">Sem capa</span>';
  document.getElementById('editorTitle').innerText = 'Importar Novo Vídeo';
}

async function fetchYtData() {
  const url = document.getElementById('ytUrl').value;
  if (!url) return alert('Cole a URL do YouTube');
  
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  if (!match) return alert('URL inválida. Não foi possível encontrar o ID do vídeo.');
  
  const videoId = match[1];
  document.getElementById('videoId').value = videoId;
  
  // Thumbnail
  const thumbUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  document.getElementById('thumbnailUrl').value = thumbUrl;
  
  const img = new Image();
  img.onload = function() {
    if (this.naturalWidth <= 120) {
      document.getElementById('thumbnailUrl').value = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      document.getElementById('thumbPreview').innerHTML = `<img src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" class="w-full h-full object-cover">`;
    } else {
      document.getElementById('thumbPreview').innerHTML = `<img src="${thumbUrl}" class="w-full h-full object-cover">`;
    }
  };
  img.src = thumbUrl;

  // Title (oEmbed)
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://youtube.com/watch?v=${videoId}&format=json`);
    if (res.ok) {
      const data = await res.json();
      document.getElementById('vTitle').value = data.title || '';
    } else {
      console.warn("oEmbed falhou (CORS ou erro). Digite o título manualmente.");
    }
  } catch (e) {
    console.warn("oEmbed erro de rede. Digite o título manualmente.");
  }
}

function initDropdowns() {
  const courseSel = document.getElementById('refCourse');
  if (!window.AEF_COURSES_REGISTRY) return;
  
  Object.keys(window.AEF_COURSES_REGISTRY).forEach(cid => {
    const c = window.AEF_COURSES_REGISTRY[cid];
    const opt = document.createElement('option');
    opt.value = cid;
    opt.text = c.title || cid;
    courseSel.appendChild(opt);
  });
}

function loadModules() {
  const cid = document.getElementById('refCourse').value;
  const modSel = document.getElementById('refModule');
  const lessSel = document.getElementById('refLesson');
  
  modSel.innerHTML = '<option value="">Selecione o Módulo</option>';
  lessSel.innerHTML = '<option value="">-</option>';
  modSel.disabled = true;
  lessSel.disabled = true;
  
  if (!cid) return;
  
  const course = window.AEF_COURSES_REGISTRY[cid];
  if (!course || !course.modules) return;
  
  course.modules.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.text = m.title || m.id;
    modSel.appendChild(opt);
  });
  modSel.disabled = false;
}

function loadLessons() {
  const cid = document.getElementById('refCourse').value;
  const mid = document.getElementById('refModule').value;
  const lessSel = document.getElementById('refLesson');
  
  lessSel.innerHTML = '<option value="">Selecione a Aula</option>';
  lessSel.disabled = true;
  
  if (!cid || !mid) return;
  
  const course = window.AEF_COURSES_REGISTRY[cid];
  const mod = course.modules.find(m => m.id === mid);
  if (!mod || !mod.lessons) return;
  
  mod.lessons.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.id;
    opt.text = l.title || l.id;
    lessSel.appendChild(opt);
  });
  lessSel.disabled = false;
}

async function saveVideo(e) {
  e.preventDefault();
  if (!db) return alert("Conexão com banco falhou");
  
  const videoId = document.getElementById('videoId').value;
  if (!videoId) return alert("Puxe os dados do vídeo primeiro.");
  
  const courseId = document.getElementById('refCourse').value;
  const moduleId = document.getElementById('refModule').value;
  const lessonId = document.getElementById('refLesson').value;
  
  if (courseId && (!moduleId || !lessonId)) {
    return alert("Vínculo incompleto: selecione Módulo e Aula, ou deixe o Curso vazio.");
  }
  
  const btn = document.getElementById('btnSave');
  btn.disabled = true;
  btn.innerText = 'Salvando...';
  
  const pdfUrl = document.getElementById('vPdf').value.trim();
  const audioUrl = document.getElementById('vAudio').value.trim();
  
  const mainDoc = {
    videoId,
    title: document.getElementById('vTitle').value.trim(),
    description: document.getElementById('vDesc').value.trim(),
    thumbnailUrl: document.getElementById('thumbnailUrl').value,
    status: document.getElementById('vActive').checked ? 'active' : 'draft',
    featuredOnHome: document.getElementById('vHome').checked,
    homeOrder: parseInt(document.getElementById('vHomeOrder').value) || 1,
    materialsAvailable: {
      pdf: !!pdfUrl,
      audio: !!audioUrl
    },
    referenceClass: courseId ? {
      courseId, moduleId, lessonId
    } : null,
    updatedAt: new Date().toISOString()
  };
  
  if (!mainDoc.publishedAt) mainDoc.publishedAt = mainDoc.updatedAt; // Simplification for now

  const gatedDoc = {
    pdfUrl,
    audioUrl,
    pdfLabel: pdfUrl ? "Apostila da aula (PDF)" : "",
    audioLabel: audioUrl ? "Áudio da aula (MP3)" : "",
    updatedAt: new Date().toISOString()
  };
  
  try {
    await db.collection('youtube_archive').doc(videoId).set(mainDoc, { merge: true });
    await db.collection('youtube_archive').doc(videoId).collection('gated').doc('materials').set(gatedDoc, { merge: true });
    alert("Vídeo salvo com sucesso!");
    toggleView('dashboard');
    loadVideos();
  } catch(err) {
    console.error(err);
    alert("Erro ao salvar: " + err.message);
  } finally {
    btn.disabled = false;
    btn.innerText = 'Salvar Vídeo';
  }
}

async function loadVideos() {
  if (!db) return;
  try {
    const snap = await db.collection('youtube_archive').orderBy('publishedAt', 'desc').get();
    const tbody = document.getElementById('videosTableBody');
    currentVideos = [];
    tbody.innerHTML = '';
    
    if (snap.empty) {
      tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-slate-500">Nenhum vídeo cadastrado.</td></tr>';
      document.getElementById('badgeTotal').innerText = '0';
      return;
    }
    
    document.getElementById('badgeTotal').innerText = snap.size;
    
    snap.forEach(doc => {
      const v = doc.data();
      currentVideos.push(v);
      
      const tr = document.createElement('tr');
      tr.className = "hover:bg-white/5 transition";
      tr.innerHTML = `
        <td class="px-6 py-4 flex items-center gap-3">
          <img src="${v.thumbnailUrl}" class="w-16 h-9 object-cover rounded shadow">
          <span class="font-bold text-white truncate max-w-xs">${v.title}</span>
        </td>
        <td class="px-6 py-4">
          <span class="px-2 py-1 rounded text-[10px] font-bold uppercase ${v.status==='active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}">${v.status}</span>
        </td>
        <td class="px-6 py-4">
          ${v.featuredOnHome ? `<span class="text-amber-400"><i data-lucide="star" class="w-4 h-4 inline"></i> Ordem: ${v.homeOrder}</span>` : '<span class="text-slate-600">-</span>'}
        </td>
        <td class="px-6 py-4 text-right">
          <button onclick="editVideo('${v.videoId}')" class="text-blue-400 hover:text-blue-300 text-xs font-bold">Editar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    lucide.createIcons();
  } catch(e) {
    console.error("Load videos error", e);
  }
}

window.editVideo = async function(id) {
  const v = currentVideos.find(x => x.videoId === id);
  if (!v) return;
  
  resetForm();
  document.getElementById('editorTitle').innerText = 'Editar Vídeo';
  
  document.getElementById('ytUrl').value = `https://youtube.com/watch?v=${id}`;
  document.getElementById('videoId').value = id;
  document.getElementById('thumbnailUrl').value = v.thumbnailUrl || '';
  if (v.thumbnailUrl) document.getElementById('thumbPreview').innerHTML = `<img src="${v.thumbnailUrl}" class="w-full h-full object-cover">`;
  
  document.getElementById('vTitle').value = v.title || '';
  document.getElementById('vDesc').value = v.description || '';
  document.getElementById('vActive').checked = v.status === 'active';
  document.getElementById('vHome').checked = !!v.featuredOnHome;
  document.getElementById('vHomeOrder').value = v.homeOrder || 1;
  
  if (v.referenceClass) {
    document.getElementById('refCourse').value = v.referenceClass.courseId;
    loadModules();
    setTimeout(() => {
      document.getElementById('refModule').value = v.referenceClass.moduleId;
      loadLessons();
      setTimeout(() => {
        document.getElementById('refLesson').value = v.referenceClass.lessonId;
      }, 50);
    }, 50);
  }
  
  // Fetch gated
  try {
    const gSnap = await db.collection('youtube_archive').doc(id).collection('gated').doc('materials').get();
    if (gSnap.exists) {
      const g = gSnap.data();
      document.getElementById('vPdf').value = g.pdfUrl || '';
      document.getElementById('vAudio').value = g.audioUrl || '';
    }
  } catch(e) {
    console.warn("No gated data or permission denied", e);
  }
  
  toggleView('editor');
};
