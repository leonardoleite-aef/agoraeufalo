import re

with open('blog-panel.html', 'r') as f:
    content = f.read()

# 1. UI Injection
ui_html = """            <!-- MÁQUINA VISUAL AI -->
            <div class="p-4 sm:p-5 bg-[#0a0f1a] rounded-2xl border border-amber-500/20 shadow-inner mb-4">
              <h3 class="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                <i data-lucide="wand-2" class="w-4 h-4"></i> Geração de Imagens (Google AI)
              </h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 mb-1">Contexto da História / Artigo (Opcional)</label>
                  <textarea id="ai-img-context" rows="2" placeholder="Ex: Um aluno nervoso tentando falar ingles na alfandega..." class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-amber-500"></textarea>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 mb-1">Foco / Objeto Principal (Em inglês funciona melhor) *</label>
                  <input type="text" id="ai-img-concept" placeholder="Ex: A stressed traveler at airport customs, hyperrealistic" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-amber-500">
                </div>
                <button type="button" id="btn-generate-ai-img" onclick="generateAIImages()" class="w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-900/20 transition-all flex items-center justify-center gap-2">
                  <i data-lucide="image-plus" class="w-4 h-4"></i> Gerar Capas (16:9 e Crop 1:1)
                </button>
                <div id="ai-img-status" class="text-[10px] font-medium text-amber-400 text-center hidden animate-pulse">Iniciando motor de IA...</div>
              </div>
            </div>

            <!-- Imagens -->"""

content = content.replace("            <!-- Imagens -->", ui_html)

# 2. JS Logic Injection
js_logic = """
    // --- GEMINI AI IMAGE GENERATION (IMAGEN 3) ---
    async function generateAIImages() {
      const concept = document.getElementById('ai-img-concept').value.trim();
      if (!concept) {
        alert('Digite o foco principal da imagem.');
        return;
      }
      
      const context = document.getElementById('ai-img-context').value.trim();
      const apiKey = getGeminiApiKey();
      if (!apiKey) return; // aef-portal-auth lida com o prompt da chave

      const btn = document.getElementById('btn-generate-ai-img');
      const statusEl = document.getElementById('ai-img-status');
      
      const originalBtnHTML = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Gerando...';
      if (window.lucide) window.lucide.createIcons();
      statusEl.textContent = 'Chamando Google Imagen 3.0... (pode levar 10s)';
      statusEl.classList.remove('hidden');

      try {
        const promptContext = context ? `Context: ${context} | ` : '';
        const fullPrompt = `${promptContext}Subject: ${concept} | Mandatory Style: Cinematic 35mm film photography, high end editorial style. Professional lighting, depth of field, warm amber and deep navy color grading. No text in the image.`;

        // 1. Chamar Google AI Studio (Imagen 3)
        const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt: fullPrompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: "16:9",
              personGeneration: "ALLOW_ADULT"
            }
          })
        });

        if (!apiRes.ok) {
          const errBody = await apiRes.text();
          throw new Error(`API Error ${apiRes.status}: ${errBody}`);
        }

        const data = await apiRes.json();
        const base64Data = data?.predictions?.[0]?.bytesBase64Encoded;
        if (!base64Data) throw new Error('A API não retornou a imagem base64.');

        statusEl.textContent = 'Imagem recebida! Processando recorte 1:1 e enviando para o R2...';

        // 2. Converter para Blob (16:9 original)
        const byteChars = atob(base64Data);
        const byteArr = new Uint8Array(byteChars.length);
        for(let i=0; i<byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
        const blob16x9 = new Blob([byteArr], { type: 'image/jpeg' });

        // 3. Carregar na memória para fazer o Crop 1:1 via Canvas
        const img = new Image();
        const urlPromise = new Promise((resolve, reject) => {
          img.onload = async () => {
            try {
              const size = Math.min(img.width, img.height);
              const startX = (img.width - size) / 2;
              const startY = (img.height - size) / 2;
              
              const canvas = document.createElement('canvas');
              canvas.width = size;
              canvas.height = size;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size);
              
              canvas.toBlob(async (blob1x1) => {
                try {
                  const ts = Date.now();
                  const file16x9 = new File([blob16x9], `ai-cover-16x9-${ts}.jpg`, { type: 'image/jpeg' });
                  const file1x1 = new File([blob1x1], `ai-cover-1x1-${ts}.jpg`, { type: 'image/jpeg' });
                  
                  // Reutilizamos a função de upload R2 já existente!
                  const url16x9 = await _uploadToStorage(file16x9, 'blog-covers');
                  const url1x1 = await _uploadToStorage(file1x1, 'blog-covers');
                  resolve({ url16x9, url1x1 });
                } catch(e) { reject(e); }
              }, 'image/jpeg', 0.95);
            } catch(e) { reject(e); }
          };
          img.onerror = () => reject(new Error('Erro ao decodificar imagem para crop.'));
        });
        
        img.src = "data:image/jpeg;base64," + base64Data;
        const urls = await urlPromise;

        // 4. Injetar na UI
        document.getElementById('import-post-image-url').value = urls.url16x9;
        document.getElementById('import-podcast-cover-url').value = urls.url1x1;
        
        // Atualizar previews
        const p16 = document.getElementById('img16-preview');
        const p11 = document.getElementById('img11-preview');
        p16.src = urls.url16x9; p16.classList.remove('hidden');
        p11.src = urls.url1x1; p11.classList.remove('hidden');
        document.getElementById('img16-placeholder').classList.add('hidden');
        document.getElementById('img11-placeholder').classList.add('hidden');

        showToast('Artes geradas e publicadas no Cloudflare com sucesso! 🎨', 'success');
        statusEl.textContent = 'Sucesso! Capas aplicadas.';
        setTimeout(() => statusEl.classList.add('hidden'), 3000);

      } catch(err) {
        console.error('AI Image Error:', err);
        alert('Erro ao gerar imagem: ' + err.message);
        statusEl.classList.add('hidden');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalBtnHTML;
        if (window.lucide) window.lucide.createIcons();
      }
    }

    // --- PARSER SRT → trainingTrack ---"""

content = content.replace("    // --- PARSER SRT → trainingTrack ---", js_logic)

with open('blog-panel.html', 'w') as f:
    f.write(content)

print("Injected AI Image Generator!")
