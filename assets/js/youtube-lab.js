const SALA_PATH = 'sala-de-aula-lab.html';
let db = null;
let currentVideoId = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (window.aefPortalAuth) {
    await window.aefPortalAuth.ready();
    await window.aefPortalAuth.checkAndCompleteMagicLink();
  }

  if (!window.firebase || !window.firebase.firestore) return;
  db = window.firebase.firestore();

  const urlParams = new URLSearchParams(window.location.search);
  currentVideoId = urlParams.get('v');

  if (currentVideoId) {
    document.getElementById('view-lesson').classList.remove('hidden');
    loadLessonMode(currentVideoId);
  } else {
    document.getElementById('view-library').classList.remove('hidden');
    loadLibraryMode();
  }
  
  if (window.lucide) window.lucide.createIcons();
});

async function loadLibraryMode() {
  try {
    const snap = await db.collection('youtube_archive').where('status', '==', 'active').get();
    const grid = document.getElementById('libraryGrid');
    grid.innerHTML = '';
    
    if (snap.empty) {
      grid.innerHTML = '<p class="col-span-full text-center text-slate-500">Nenhum vídeo disponível no momento.</p>';
      return;
    }
    
    const docs = snap.docs.map(d => d.data());
    docs.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
    
    docs.forEach(v => {
      const card = document.createElement('a');
      card.href = `?v=${v.videoId}`;
      card.className = "block bg-white rounded-2xl shadow-sm hover:shadow-xl transition overflow-hidden border border-slate-100 group";
      
      const badges = [];
      if (v.materialsAvailable?.pdf) badges.push('📄 PDF');
      if (v.materialsAvailable?.audio) badges.push('🎧 Áudio');
      const badgeHtml = badges.length > 0 ? `<div class="absolute top-3 right-3 bg-[#0A192F]/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded uppercase flex gap-2">${badges.join(' • ')}</div>` : '';

      card.innerHTML = `
        <div class="aspect-video relative overflow-hidden bg-slate-100">
          <img src="${v.thumbnailUrl}" class="w-full h-full object-cover transition duration-500 group-hover:scale-105">
          ${badgeHtml}
          <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition"></div>
        </div>
        <div class="p-6">
          <h3 class="font-bold text-lg text-slate-900 leading-tight line-clamp-2">${v.title}</h3>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (e) {
    console.error("Erro na biblioteca", e);
  }
}

async function loadLessonMode(id) {
  try {
    const docSnap = await db.collection('youtube_archive').doc(id).get();
    if (!docSnap.exists) {
      document.getElementById('lessonTitle').innerText = "Vídeo não encontrado.";
      return;
    }
    
    const v = docSnap.data();
    document.title = `${v.title} - YouTube Lab | AgoraEuFalo`;
    
    // Player Facade
    const playerContainer = document.getElementById('playerContainer');
    playerContainer.innerHTML = `
      <img src="${v.thumbnailUrl}" class="w-full h-full object-cover opacity-80 transition hover:opacity-100 cursor-pointer" onclick="playVideo('${v.videoId}')">
      <button onclick="playVideo('${v.videoId}')" class="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition">
        <div class="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl pl-1"><i data-lucide="play" class="w-10 h-10 text-white fill-white"></i></div>
      </button>
    `;
    
    document.getElementById('lessonTitle').innerText = v.title;
    document.getElementById('lessonDesc').innerText = v.description || '';
    
    // Cross-link
    if (v.referenceClass) {
      const btnContainer = document.getElementById('bridgeContainer');
      const btn = document.getElementById('bridgeBtn');
      const p = new URLSearchParams({ 
        curso: v.referenceClass.courseId, 
        modulo: v.referenceClass.moduleId, 
        aula: v.referenceClass.lessonId,
        src: 'youtube-lab', 
        v: v.videoId 
      });
      btn.href = `${SALA_PATH}?${p}`;
      btn.innerText = v.referenceClass.ctaLabel || 'Treinar esta aula completa na plataforma';
      btnContainer.classList.remove('hidden');
    }
    
    // Materials State Machine
    if (v.materialsAvailable?.pdf || v.materialsAvailable?.audio) {
      document.getElementById('materialsBox').classList.remove('hidden');
      
      firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const matSnap = await db.collection('youtube_archive').doc(id).collection('gated').doc('materials').get();
            if (matSnap.exists) {
              const mat = matSnap.data();
              renderMaterialsAllowed(mat);
            } else {
              renderMaterialsBlocked();
            }
          } catch(err) {
            console.warn("Sem acesso aos materiais:", err);
            renderMaterialsBlocked();
          }
        } else {
          renderMaterialsBlocked();
        }
      });
    }
    
    loadSidebar(id);
    lucide.createIcons();
    
  } catch (e) {
    console.error("Erro na aula", e);
  }
}

window.playVideo = function(id) {
  const user = window.firebase?.auth()?.currentUser;
  if (!user) {
    window.openAuthModal();
    return;
  }
  const container = document.getElementById('playerContainer');
  container.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" class="w-full h-full border-0 absolute inset-0" allow="autoplay; fullscreen"></iframe>`;
}

function renderMaterialsBlocked() {
  document.getElementById('materialsBlocked').classList.remove('hidden');
  document.getElementById('materialsAllowed').classList.add('hidden');
}

function renderMaterialsAllowed(mat) {
  document.getElementById('materialsBlocked').classList.add('hidden');
  const allowed = document.getElementById('materialsAllowed');
  allowed.classList.remove('hidden');
  
  const list = document.getElementById('downloadsList');
  list.innerHTML = '';
  
  if (mat.pdfUrl) {
    const btn = document.createElement('button');
    btn.onclick = () => window.downloadGatedFile(mat.pdfUrl);
    btn.className = "px-4 py-2 bg-white border border-amber-200 rounded-xl text-amber-900 font-bold text-sm flex items-center gap-2 hover:bg-amber-50 transition shadow-sm";
    btn.innerHTML = `<i data-lucide="file-text" class="w-4 h-4"></i> ${mat.pdfLabel || 'PDF'}`;
    list.appendChild(btn);
  }
  if (mat.audioUrl) {
    const btn = document.createElement('button');
    btn.onclick = () => window.downloadGatedFile(mat.audioUrl);
    btn.className = "px-4 py-2 bg-white border border-amber-200 rounded-xl text-amber-900 font-bold text-sm flex items-center gap-2 hover:bg-amber-50 transition shadow-sm";
    btn.innerHTML = `<i data-lucide="headphones" class="w-4 h-4"></i> ${mat.audioLabel || 'MP3'}`;
    list.appendChild(btn);
  }
  if(window.lucide) window.lucide.createIcons();
}

window.downloadGatedFile = async function(targetUrl) {
  const user = window.firebase?.auth()?.currentUser;
  if (!user) {
    window.openAuthModal();
    return;
  }
  
  // Efeito de loading no cursor/botão poderia entrar aqui
  document.body.style.cursor = 'wait';
  
  try {
    const token = await user.getIdToken();
    const res = await fetch('/api/youtube-lab/handshake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authToken: token,
        userId: user.uid,
        targetUrl: targetUrl
      })
    });
    
    if (!res.ok) throw new Error("Acesso negado pelo servidor.");
    
    const data = await res.json();
    if (data.allowed && data.mediaUrl) {
      window.open(data.mediaUrl, '_blank');
    } else {
      throw new Error("Erro na geração do link seguro.");
    }
  } catch (err) {
    alert("Erro ao baixar o arquivo: " + err.message);
  } finally {
    document.body.style.cursor = 'default';
  }
};

async function loadSidebar(currentId) {
  try {
    const snap = await db.collection('youtube_archive').where('status', '==', 'active').limit(7).get();
    const grid = document.getElementById('sidebarGrid');
    grid.innerHTML = '';
    
    let count = 0;
    snap.forEach(doc => {
      const v = doc.data();
      if (v.videoId === currentId) return;
      if (count >= 6) return;
      count++;
      
      const card = document.createElement('a');
      card.href = `?v=${v.videoId}`;
      card.className = "flex gap-3 group";
      card.innerHTML = `
        <div class="w-32 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0 relative">
          <img src="${v.thumbnailUrl}" class="w-full h-full object-cover transition group-hover:scale-105">
        </div>
        <div>
          <h4 class="font-bold text-sm text-slate-800 leading-tight group-hover:text-amber-600 transition line-clamp-2">${v.title}</h4>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch(e) {}
}

window.openAuthModal = function() {
  document.getElementById('authModal').classList.remove('hidden');
}

window.closeAuthModal = function() {
  document.getElementById('authModal').classList.add('hidden');
}

window.handleGoogleSignIn = async function() {
  if (window.aefPortalAuth) {
    await window.aefPortalAuth.signInWithGoogle();
    closeAuthModal();
    // onAuthStateChanged will trigger and re-render materials automatically
  }
}

window.handleMagicLink = async function(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail').value;
  const btn = document.getElementById('btnMagic');
  btn.disabled = true;
  btn.innerText = 'Enviando...';
  
  if (window.aefPortalAuth) {
    try {
      const redirectUrl = location.origin + location.pathname + '?v=' + currentVideoId;
      await window.aefPortalAuth.sendMagicLink(email, redirectUrl);
      const msg = document.getElementById('authMsg');
      msg.innerText = `Enviamos um link para ${email}. Clique nele para acessar.`;
      msg.classList.remove('hidden');
    } catch(err) {
      alert("Erro ao enviar: " + err.message);
    }
  }
  btn.disabled = false;
  btn.innerText = 'Enviar link de acesso mágico';
}
