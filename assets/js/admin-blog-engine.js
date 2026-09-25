/**
 * AgoraEuFalo • CMS Omnichannel & Block Engine
 * Motor de administração e publicação para Blog, RSS e Player
 */

class AdminBlogEngine {
  constructor() {
    this.posts = [];
    this.currentPostId = null;
    this.db = null;
    this.init();
  }

  async init() {
    if (window.aefPortalAuth) {
      await window.aefPortalAuth.ready();
      this.db = window.aefPortalAuth.db;
      document.getElementById('header-status').innerText = 'Conectado ao Cloud';
      this.loadPosts();
    } else {
      document.getElementById('header-status').innerText = 'Modo Local (Sem Conexão)';
    }
  }

  async loadPosts() {
    if (!this.db) return;
    try {
      const snap = await this.db.collection('blog_posts').orderBy('createdAt', 'desc').get();
      this.posts = [];
      snap.forEach(doc => {
        this.posts.push({ id: doc.id, ...doc.data() });
      });
      this.renderTable();
    } catch (err) {
      console.error("Erro ao carregar posts:", err);
      // Fallback
    }
  }

  renderTable() {
    const grid = document.getElementById('library-grid');
    if (!grid) return;
    
    if (this.posts.length === 0) {
      grid.innerHTML = `<div class="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200">
        <p class="text-slate-500 font-bold">Nenhum artigo encontrado.</p>
      </div>`;
      return;
    }

    grid.innerHTML = this.posts.map(post => {
      const coverUrl = (post.covers && post.covers.cover169) || post.mediaUrl || 'assets/images/og-magic-stories.jpg';
      return `
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
        <div class="aspect-video bg-slate-900 relative overflow-hidden">
          <img src="${coverUrl}" alt="${post.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/90 text-slate-900 backdrop-blur-xs">${post.status === 'published' ? 'Publicado' : 'Rascunho'}</span>
        </div>
        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h4 class="font-black text-slate-900 leading-tight mb-2">${post.title}</h4>
            <p class="text-xs text-slate-500 line-clamp-2">${post.slug}</p>
          </div>
          <div class="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button onclick="window.blogEngine.editPost('${post.id}')" class="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors">
              Editar
            </button>
            <button onclick="window.blogEngine.showPublishModal('${post.id}')" class="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors">
              Publicar
            </button>
            <button onclick="window.blogEngine.deletePost('${post.id}')" class="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors">
              <i data-lucide="trash" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    `}).join('');
    if (window.lucide) window.lucide.createIcons();
  }
  
  showPublishModal(id) {
    const post = this.posts.find(p => p.id === id);
    if(!post) return;
    
    const snippet = `
<!-- CARD DO ARTIGO: ${post.title} -->
<article class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
  <div class="aspect-video bg-slate-900 relative overflow-hidden">
    <img src="${(post.covers && post.covers.cover169) || 'assets/images/og-magic-stories.jpg'}" alt="${post.title}" class="w-full h-full object-cover">
  </div>
  <div class="p-5">
    <h4 class="font-black text-slate-900 leading-tight mb-2">${post.title}</h4>
    <a href="/blog/${post.slug}.html" class="text-amber-600 font-bold text-sm">Ler Artigo &rarr;</a>
  </div>
</article>`;
    document.getElementById('publish-feed-code').textContent = snippet.trim();
    
    const pubDate = new Date().toUTCString();
    const xmlSnippet = `<item>
  <title>${post.title}</title>
  <link>https://agoraeufalo.com.br/blog/${post.slug}</link>
  <pubDate>${pubDate}</pubDate>
  <description><![CDATA[${post.subtitle || ''}]]></description>
  <enclosure url="${post.mediaUrl || ''}" type="audio/mpeg" />
  <guid isPermaLink="false">${post.id}</guid>
</item>`;
    document.getElementById('publish-xml-code').textContent = xmlSnippet.trim();
    
    document.getElementById('publish-modal').classList.remove('hidden');
    document.getElementById('publish-modal').classList.add('flex');
  }

  editPost(id) {
    const post = this.posts.find(p => p.id === id);
    if (!post) return;
    
    this.currentPostId = id;
    
    // Povoar UI
    document.getElementById('editor-title').value = post.title || '';
    document.getElementById('editor-slug').value = post.slug || '';
    if(document.getElementById('editor-subtitle')) document.getElementById('editor-subtitle').value = post.subtitle || '';
    if(document.getElementById('editor-golden-tip')) document.getElementById('editor-golden-tip').value = post.goldenTip || '';
    document.getElementById('editor-status').value = post.status || 'draft';
    
    
    
    
    // Mídia
    document.getElementById('editor-youtube').value = post.mediaUrl || '';
    
    // Limpar e reconstruir blocos
    const container = document.getElementById('editor-blocks-container');
    container.innerHTML = '';
    
    if (post.blocks && post.blocks.length > 0) {
      post.blocks.forEach(block => {
         if (block.type === 'paragraph') {
           window.addBlock('paragraph', block.data);
         } else if (block.type === 'audio-reveal') {
           window.addBlock('audio-reveal', block.data);
         }
      });
    }
    
    window.openEditor();
  }
  openEditor() {
    document.getElementById('view-editor').classList.remove('hidden');
    document.getElementById('view-editor').classList.add('flex');
    if (!this.currentPostId) {
       document.getElementById('editor-title').value = '';
       document.getElementById('editor-subtitle').value = '';
       document.getElementById('editor-slug').value = '';
       document.getElementById('editor-youtube').value = '';
       document.getElementById('editor-golden-tip').value = '';
       document.getElementById('editor-blocks-container').innerHTML = '';
       window.blogEngine.currentTrainingTrack = null;
    }
  }
  
  closeEditor() {
    document.getElementById('view-editor').classList.add('hidden');
    document.getElementById('view-editor').classList.remove('flex');
    this.currentPostId = null;
  }
}

window.blogEngine = new AdminBlogEngine();

window.openEditor = () => window.blogEngine.openEditor();
window.closeEditor = () => window.blogEngine.closeEditor();

window.addBlock = function(type, data = null) {
  const container = document.getElementById('editor-blocks-container');
  const div = document.createElement('div');
  div.className = 'editor-block relative bg-white border border-slate-200 p-4 rounded-xl shadow-sm group';
  
  if (type === 'paragraph') {
    div.innerHTML = `
      <div class="absolute -top-3 left-4 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">PARÁGRAFO</div>
      <button onclick="this.closest('.editor-block').remove()" class="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg hidden group-hover:block"><i data-lucide="trash" class="w-4 h-4"></i></button>
      <textarea rows="3" class="w-full text-sm border-none focus:ring-0 resize-none mt-2 text-slate-700" placeholder="Escreva seu texto aqui...">${data ? data.text : ''}</textarea>
    `;
  } else if (type === 'audio-reveal') {
    div.innerHTML = `
      <div class="absolute -top-3 left-4 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">LISTEN & ANSWER</div>
      <button onclick="this.closest('.editor-block').remove()" class="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg hidden group-hover:block"><i data-lucide="trash" class="w-4 h-4"></i></button>
      
      <div class="mt-3 space-y-3">
        <input type="hidden" class="url-input" value="${data ? data.audioUrl : ''}">
        <div>
          <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Áudio Sincronizado</label>
          <div class="flex items-center gap-2 mt-1">
            <button onclick="window.generateTTSForBlock(this)" class="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors">
              <i data-lucide="${data && data.audioUrl ? 'check' : 'mic'}" class="w-3.5 h-3.5 ${data && data.audioUrl ? 'text-emerald-600' : ''}"></i> ${data && data.audioUrl ? 'Pronto' : 'Gravar Voz (Gemini)'}
            </button>
          </div>
        </div>
        <div>
          <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Pergunta (O que o Aluno Ouve)</label>
          <input type="text" class="phrase-input w-full p-2 text-sm border border-slate-200 rounded-lg" value="${data ? data.question : ''}" placeholder="Ex: Where is Grazi from?">
        </div>
        <div>
          <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Resposta Esperada (Oculta)</label>
          <input type="text" class="answer-input w-full p-2 text-sm border border-slate-200 rounded-lg" value="${data ? data.answer : ''}" placeholder="Ex: She is from Brasília.">
        </div>
      </div>
    `;
  }
  
  container.appendChild(div);
  if (window.lucide) window.lucide.createIcons();
};


// ==========================================
// GEMINI MINI TTS ENGINE & UPLOAD
// ==========================================
window.generateTTSForBlock = async function(btnElement) {
  const block = btnElement.closest('.editor-block');
  if (!block) return;
  
  const questionInput = block.querySelector('.phrase-input');
  const urlInput = block.querySelector('.url-input');
  const textToRead = questionInput.value.trim();
  
  if (!textToRead) {
    alert("Digite a frase em inglês primeiro antes de gerar o áudio.");
    return;
  }
  
  btnElement.innerHTML = '<i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i> Gravando...';
  if (window.lucide) window.lucide.createIcons();
  
  try {
    const API_KEY = getGeminiApiKey();
    if (!API_KEY) return;
    const MODEL = 'gemini-3.1-flash-tts-preview';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
    
    const payload = {
      contents: [{
        role: "user",
        parts: [
          { text: "Read the following text aloud as audio speech. Generate only audio output. Do not generate any text response." },
          { text: textToRead }
        ]
      }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } } }
      }
    };
    
    console.log("SENDING TTS REQUEST TO GEMINI...");
    let response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    // Retry 1x no 500 (Oficial fallback)
    if (response.status === 500) {
      await new Promise(r => setTimeout(r, 1500));
      response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    
    if (!response.ok) { const text = await response.text(); console.error("GEMINI ERROR:", text); throw new Error("Erro na API Gemini TTS: " + text); }
    
    console.log("GOT TTS RESPONSE FROM GEMINI", response.status);
    const json = await response.json();
    let base64Audio = '';
    
    if (json.candidates && json.candidates[0].content && json.candidates[0].content.parts) {
       const part = json.candidates[0].content.parts.find(p => p.inlineData);
       if (part && part.inlineData) {
         base64Audio = part.inlineData.data;
       }
    }
    
    if (!base64Audio) throw new Error("Nenhum áudio retornado pelo modelo.");
    
    // Converter Base64 para Blob MP3/WAV
    const byteCharacters = atob(base64Audio);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    const audioBlob = new Blob(byteArrays, { type: 'audio/mpeg' });
    
    // Subir para o Firebase Storage
    if (!window.aefCloudSync) throw new Error("Cloud Sync não disponível para upload.");
    
    btnElement.innerHTML = '<i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i> Subindo Nuvem...';
    if (window.lucide) window.lucide.createIcons();
    
    const fileName = `tts_phrase_${Date.now()}.mp3`;
    console.log("STARTING UPLOAD TO STORAGE...");
    const uploadedUrl = await window.aefCloudSync.uploadFileToStorage(
       new File([audioBlob], fileName, { type: 'audio/mpeg' }), 
       "audio/blog_tts"
    );
    
    console.log("UPLOAD SUCCESS, URL:", uploadedUrl);
    if (uploadedUrl) {
      urlInput.value = uploadedUrl;
      btnElement.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600"></i> Pronto';
      btnElement.classList.replace('bg-amber-100', 'bg-emerald-100');
    } else {
      throw new Error("Upload retornou vazio.");
    }
    
  } catch (err) {
    console.error(err);
    alert("Falha ao gerar/subir o áudio: " + err.message);
    btnElement.innerHTML = '<i data-lucide="mic" class="w-3.5 h-3.5"></i> Gravar Voz (Gemini)';
  }
  
  if (window.lucide) window.lucide.createIcons();
}

// ==========================================
// MÍDIA PRINCIPAL UPLOAD
// ==========================================
window.uploadMainMedia = async function(btnElement) {
  if (!window.aefCloudSync) {
    alert("Erro: aefCloudSync não carregado.");
    return;
  }
  
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'audio/*,video/*';
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const originalHtml = btnElement.innerHTML;
    btnElement.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Subindo...';
    if (window.lucide) window.lucide.createIcons();
    
    try {
      const pathStr = file.type.startsWith('video/') ? "videos/blog_media" : "audio/blog_media";
      console.log("STARTING UPLOAD TO STORAGE...");
    const uploadedUrl = await window.aefCloudSync.uploadFileToStorage(file, pathStr);
      console.log("UPLOAD SUCCESS, URL:", uploadedUrl);
    if (uploadedUrl) {
        document.getElementById('editor-youtube').value = uploadedUrl;
        btnElement.innerHTML = '<i data-lucide="check" class="w-4 h-4 text-emerald-600"></i> Upload OK';
        btnElement.classList.replace('text-slate-600', 'text-emerald-700');
        btnElement.classList.replace('bg-white', 'bg-emerald-50');
      }
    } catch (err) {
      console.error(err);
      alert("Falha no upload: " + err.message);
      btnElement.innerHTML = originalHtml;
      if (window.lucide) window.lucide.createIcons();
    }
  };
  document.body.appendChild(fileInput); fileInput.click(); setTimeout(()=>fileInput.remove(),1000);
}

// ==========================================
// GEMINI STT (LISTEN & READ SYNC)
// ==========================================
window.extractAndSyncAudio = async function(btnElement) {
  const mediaUrl = document.getElementById('editor-youtube').value.trim();
  if (!mediaUrl) {
    alert("Informe a URL do Vídeo/Áudio ou faça upload do arquivo primeiro.");
    return;
  }
  
  if (window.aefAudioHub) {
    alert("Para extração dos timestamps, você pode:\n1. Selecionar o arquivo de legendas (.srt) do YouTube para economizar API.\n2. Ou selecionar o vídeo/áudio bruto para o Gemini transcrever.");
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*,video/*,.srt';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const originalText = btnElement.innerHTML;
      btnElement.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Processando...';
      if (window.lucide) window.lucide.createIcons();
      
      try {
        let alignedSentences = [];
        
        if (file.name.toLowerCase().endsWith('.srt')) {
          // Processamento LOCAL e Imediato do SRT (Zero API)
          const textContent = await file.text();
          const blocks = textContent.replace(/\r\n|\r/g, '\n').split('\n\n');
          
          blocks.forEach(block => {
            const lines = block.split('\n').filter(l => l.trim() !== '');
            if (lines.length >= 3) {
              const timecode = lines[1];
              const text = lines.slice(2).join(' ').trim();
              
              // Converte 00:01:23,450 (SRT) ou 00:01:23.450 (VTT) para [01:23.4]
              const match = timecode.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d+)/);
              if (match) {
                let h = match[1];
                let m = match[2];
                let s = match[3];
                let ms = match[4].substring(0, 1);
                let formattedTime = h === '00' ? `${m}:${s}.${ms}` : `${h}:${m}:${s}.${ms}`;
                alignedSentences.push({ timestamp: formattedTime, text: text });
              }
            }
          });
        } else {
          // Fallback para Gemini STT se for vídeo ou áudio bruto
          const API_KEY = getGeminiApiKey();
    if (!API_KEY) return;
          alignedSentences = await window.aefAudioHub.transcribeAudioWithGemini(file, API_KEY);
        }
        
        if (alignedSentences && alignedSentences.length > 0) {
          window.blogEngine.currentTrainingTrack = alignedSentences;
          alert(`Sincronia extraída com sucesso! (${alignedSentences.length} blocos gerados)`);
        } else {
          alert("Nenhuma frase pôde ser extraída do arquivo.");
        }
      } catch (err) {
        console.error(err);
        alert("Erro no processamento: " + err.message);
      } finally {
        btnElement.innerHTML = originalText;
        if (window.lucide) window.lucide.createIcons();
      }
    };
    document.body.appendChild(fileInput); fileInput.click(); setTimeout(()=>fileInput.remove(),1000);
  } else {
    alert("AEF Audio Hub não carregado.");
  }
}

// ==========================================
// GEMINI IMAGEN (COVER ART 35mm)
// ==========================================
window.generateCoverArt = async function(btnElement) {
  const title = document.getElementById('editor-title').value.trim();
  if (!title) {
    alert("Preencha o título do artigo para basear a geração da imagem.");
    return;
  }
  
  const originalText = btnElement.innerHTML;
  btnElement.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Pintando Arte...';
  if (window.lucide) window.lucide.createIcons();
  
  try {
    const API_KEY = getGeminiApiKey();
    if (!API_KEY) return;
    const MODEL = 'gemini-3.1-flash-image';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
    
    const promptText = `Cinematic 35mm film photography, high end editorial style. Concept: ${title}. Professional lighting, depth of field, warm amber and deep navy color grading. No text in the image.`;
    
    // Gerar a Capa 16:9
    const payload169 = {
      contents: [{ role: "user", parts: [{ text: "Aspect ratio 16:9. " + promptText }] }],
      generationConfig: { responseModalities: ["IMAGE"] }
    };
    
    const res169 = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload169)
    });
    
    if (!res169.ok) { const txt = await res169.text(); console.error("IMG ERRO 16:9:", txt); throw new Error("Falha 16:9"); }
    const data169 = await res169.json();
    const b64_169 = data169.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    // Gerar a Capa 1:1
    const payload11 = {
      contents: [{ role: "user", parts: [{ text: "Aspect ratio 1:1. " + promptText }] }],
      generationConfig: { responseModalities: ["IMAGE"] }
    };
    
    const res11 = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload11)
    });
    
    if (!res11.ok) { const txt = await res11.text(); console.error("IMG ERRO 1:1:", txt); throw new Error("Falha 1:1"); }
    const data11 = await res11.json();
    const b64_11 = data11.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (b64_169 && b64_11) {
       const img169 = document.getElementById('preview-169');
       const img11 = document.getElementById('preview-11');
       
       img169.src = `data:image/jpeg;base64,${b64_169}`;
       img11.src = `data:image/jpeg;base64,${b64_11}`;
       img169.classList.remove('hidden');
       img11.classList.remove('hidden');
       
       window.blogEngine.currentCoversBase64 = {
         cover169: b64_169,
         cover11: b64_11
       };
    } else {
      throw new Error("Formato de resposta de imagem inválido.");
    }
  } catch (err) {
    console.error(err);
    alert("Erro ao gerar arte: " + err.message);
  } finally {
    btnElement.innerHTML = originalText;
    if (window.lucide) window.lucide.createIcons();
  }
};

// Função de salvamento orquestrada na UI
async function savePost() {
  if (!window.blogEngine.db) {
    alert("Erro: Firestore não conectado.");
    return;
  }
  
  const title = document.getElementById('editor-title').value;
  const slug = document.getElementById('editor-slug').value || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // Coletar blocos do DOM
  const blocks = [];
  const container = document.getElementById('editor-blocks-container');
  const blockElements = container.querySelectorAll('.editor-block');
  
  blockElements.forEach(el => {
    const textarea = el.querySelector('textarea');
    if (textarea) {
      blocks.push({
        type: 'paragraph',
        data: { text: textarea.value }
      });
    }
    const inputs = el.querySelectorAll('input');
    if (inputs.length === 3) {
      blocks.push({
        type: 'audio-reveal',
        data: {
          audioUrl: inputs[0].value,
          question: inputs[1].value,
          answer: inputs[2].value
        }
      });
    }
  });

  const postData = {
    title,
    subtitle: document.getElementById('editor-subtitle')?.value || '',
    goldenTip: document.getElementById('editor-golden-tip')?.value || '',
    slug,
    status: document.getElementById('editor-status').value,
    distBlog: true,
    distRss: true,
    distPlayer: true,
    mediaUrl: document.getElementById('editor-youtube').value,
    blocks: blocks,
    updatedAt: new Date().toISOString(),
    trainingTrack: window.blogEngine.currentTrainingTrack || null
  };
  
  try {
    // Fazer upload das capas geradas se existirem na memória
    if (window.blogEngine.currentCoversBase64 && window.aefCloudSync) {
       const b169 = window.blogEngine.currentCoversBase64.cover169;
       const b11 = window.blogEngine.currentCoversBase64.cover11;
       
       const arr169 = Uint8Array.from(atob(b169), c => c.charCodeAt(0));
       const arr11 = Uint8Array.from(atob(b11), c => c.charCodeAt(0));
       
       const blob169 = new Blob([arr169], { type: 'image/jpeg' });
       const blob11 = new Blob([arr11], { type: 'image/jpeg' });
       
       const url169 = await window.aefCloudSync.uploadFileToStorage(new File([blob169], `cover_169_${Date.now()}.jpg`, { type: 'image/jpeg' }), "images/blog_covers");
       const url11 = await window.aefCloudSync.uploadFileToStorage(new File([blob11], `cover_11_${Date.now()}.jpg`, { type: 'image/jpeg' }), "images/blog_covers");
       
       if (url169) postData.imageUrl = url169;
       if (url11) postData.squareImageUrl = url11;
       
       window.blogEngine.currentCoversBase64 = null; // Clear after use
    }
    
    const docRef = window.blogEngine.currentPostId 
      ? window.blogEngine.db.collection('blog_posts').doc(window.blogEngine.currentPostId)
      : window.blogEngine.db.collection('blog_posts').doc();
      
    await docRef.set(postData, { merge: true });
    
    alert("Artigo salvo com sucesso!");
    window.blogEngine.loadPosts();
    window.closeEditor();
  } catch (err) {
    console.error(err);
    alert("Erro ao salvar o artigo.");
  }
}
