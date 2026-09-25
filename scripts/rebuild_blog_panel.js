const fs = require('fs');

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR" class="h-full bg-slate-50">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AEF Admin | Blog CMS</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="assets/js/aef-domain-router.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js"></script>
  <script src="assets/js/aef-cloud-sync.js"></script>
  <script src="assets/js/aef-portal-auth.js"></script>
  <script src="assets/js/aef-admin-nav.js"></script>
  <!-- Our new Blog Engine -->
  <script src="assets/js/admin-blog-engine.js"></script>

  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .prose-preview h2 { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-top: 1.5rem; margin-bottom: 0.75rem; }
    .prose-preview p { margin-bottom: 1rem; }
    .prose-preview strong { font-weight: 800; color: #0f172a; }
  </style>
</head>
<body class="h-full flex flex-col">

  <div id="aef-admin-nav-container"></div>

  <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <div class="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center">
            <i data-lucide="newspaper" class="w-4 h-4"></i>
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Biblioteca de Artigos</h2>
        </div>
        <p class="text-sm font-medium text-slate-500">Gestão Editorial • <span id="header-status">Conectando...</span></p>
      </div>
      <div class="flex items-center gap-2">
        <a href="https://agoraeufalo.com.br/blog" target="_blank" class="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-2xs">
          <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Ver Blog Público
        </a>
        <button onclick="window.blogEngine.openEditor()" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-xs active:scale-95">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i> Adicionar Artigo
        </button>
      </div>
    </div>

    <!-- CARDS GRID -->
    <div id="library-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
       <!-- Populated by JS -->
    </div>
  </main>

  <!-- ========================================================================= -->
  <!-- MODAL: EDITOR DE ARTIGO (BLOCK ENGINE)                                   -->
  <!-- ========================================================================= -->
  <div id="view-editor" class="fixed inset-0 z-50 bg-slate-50 hidden flex-col overflow-hidden">
    <div class="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <button onclick="window.blogEngine.closeEditor()" class="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
          <i data-lucide="arrow-left" class="w-5 h-5"></i>
        </button>
        <h2 class="text-lg font-black text-slate-900">Editor de Artigo</h2>
      </div>
      <div class="flex items-center gap-2">
        <select id="editor-status" class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold">
          <option value="draft">🟡 Rascunho</option>
          <option value="published">🟢 Publicado</option>
        </select>
        <button onclick="window.blogEngine.savePost()" class="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5">
          <i data-lucide="save" class="w-3.5 h-3.5"></i> Salvar Post
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
      <div class="max-w-3xl w-full space-y-6">
        
        <!-- Metadata -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <input type="hidden" id="edit-post-id">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Título</label>
            <input type="text" id="editor-title" class="w-full p-2 border border-slate-200 rounded-lg text-sm font-bold">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Subtítulo</label>
            <textarea id="editor-subtitle" rows="2" class="w-full p-2 border border-slate-200 rounded-lg text-sm"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Slug (URL)</label>
              <input type="text" id="editor-slug" class="w-full p-2 border border-slate-200 rounded-lg text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">URL Mídia (YouTube/MP4)</label>
              <div class="flex gap-2">
                <input type="url" id="editor-youtube" class="flex-1 p-2 border border-slate-200 rounded-lg text-sm">
                <button onclick="window.uploadMainMedia(this)" class="px-3 py-2 bg-slate-100 rounded-lg text-xs font-bold hover:bg-slate-200 whitespace-nowrap flex items-center gap-1">
                  <i data-lucide="upload" class="w-3.5 h-3.5"></i> Upload
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-sm sticky top-0 z-10">
          <button onclick="window.addBlock('paragraph')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 text-slate-700">
            <i data-lucide="type" class="w-3.5 h-3.5"></i> Texto
          </button>
          <button onclick="window.addBlock('audio-reveal')" class="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs font-bold flex items-center gap-1 text-amber-900 border border-amber-200">
            <i data-lucide="mic" class="w-3.5 h-3.5"></i> Listen & Answer
          </button>
          <div class="w-px h-5 bg-slate-200 mx-1"></div>
          <button onclick="window.extractAndSyncAudio(this)" class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-bold flex items-center gap-1 text-indigo-900 border border-indigo-200 ml-auto">
            <i data-lucide="subtitles" class="w-3.5 h-3.5"></i> Legendas .SRT
          </button>
        </div>

        <!-- Blocks Container -->
        <div id="editor-blocks-container" class="space-y-4 min-h-[300px]">
          <!-- Blocks injected here -->
        </div>

        <!-- Golden Tip -->
        <div class="bg-amber-50 p-6 rounded-2xl border border-amber-200 mt-8">
          <label class="block text-xs font-black text-amber-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <i data-lucide="award" class="w-4 h-4"></i> A Sacada de Ouro do Leo
          </label>
          <input type="text" id="editor-golden-tip" class="w-full p-2 border border-amber-200 rounded-lg bg-white text-sm">
        </div>

      </div>
    </div>
  </div>

  <!-- MODAL DE SUCESSO / PUBLICAÇÃO -->
  <div id="publish-modal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl p-6 max-w-xl w-full space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-black text-slate-900 text-lg">Artigo Publicado!</h3>
        <button onclick="document.getElementById('publish-modal').classList.add('hidden'); document.getElementById('publish-modal').classList.remove('flex');" class="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
      
      <div class="space-y-4">
          <div>
              <p class="text-xs font-bold text-slate-700 mb-1">Snippet HTML (Para o Feed do Blog - index.html):</p>
              <pre class="p-3.5 bg-slate-900 rounded-xl overflow-x-auto text-[10px] font-mono text-emerald-400 max-h-32 border border-slate-800"><code id="publish-feed-code"></code></pre>
              <button onclick="navigator.clipboard.writeText(document.getElementById('publish-feed-code').textContent); alert('HTML Copiado!')" class="mt-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex gap-1">Copiar HTML</button>
          </div>
          <div>
              <p class="text-xs font-bold text-slate-700 mb-1">Snippet XML/RSS (Para Agregadores e Podcast):</p>
              <pre class="p-3.5 bg-slate-900 rounded-xl overflow-x-auto text-[10px] font-mono text-amber-400 max-h-32 border border-slate-800"><code id="publish-xml-code"></code></pre>
              <button onclick="navigator.clipboard.writeText(document.getElementById('publish-xml-code').textContent); alert('XML Copiado!')" class="mt-2 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-900 font-bold text-xs flex gap-1">Copiar XML</button>
          </div>
      </div>
    </div>
  </div>

</body>
</html>
`;
fs.writeFileSync('/Users/macbookpro/Desktop/agoraeufalo_site/blog-panel.html', htmlContent);
console.log("Written new blog-panel.html connecting to block engine!");
