/**
 * AgoraEuFalo - Universal Cloud FilePicker & Media Manager
 * Professor Leonardo Leite
 * Provides an advanced native-like file picker with Drag & Drop,
 * file preview (Audio/Video/Image/PDF), and direct upload to Firebase / Google Cloud Storage.
 */

(function () {
  class AEFFilePickerManager {
    constructor() {
      this.currentOptions = null;
      this.selectedFile = null;
      this.isUploading = false;
      this._initDOM();
    }

    _initDOM() {
      if (document.getElementById("aef-filepicker-modal")) return;

      const modalHtml = `
        <div id="aef-filepicker-modal" class="hidden fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[#0A192F] border-2 border-amber-400 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl text-white relative animate-in fade-in zoom-in duration-200">
            
            <!-- Header -->
            <div class="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-lg">
                  ☁️
                </div>
                <div>
                  <h3 id="aef-fp-title" class="font-bold text-sm text-white">Google Cloud Media FilePicker</h3>
                  <p id="aef-fp-subtitle" class="text-[11px] text-slate-400">Envio direto para o Firebase / Google Cloud Storage</p>
                </div>
              </div>
              <button onclick="window.AEFFilePicker.close()" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
                ✕
              </button>
            </div>

            <!-- Drop Zone Area -->
            <div id="aef-fp-dropzone" ondragover="window.AEFFilePicker.handleDragOver(event)" ondragleave="window.AEFFilePicker.handleDragLeave(event)" ondrop="window.AEFFilePicker.handleDrop(event)" onclick="document.getElementById('aef-fp-hidden-input').click()" class="border-2 border-dashed border-amber-400/40 hover:border-amber-400 bg-white/5 hover:bg-amber-500/5 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl transition">
                📂
              </div>
              <p class="font-bold text-xs text-slate-200">
                Arraste seu arquivo aqui ou <span class="text-amber-400 underline">clique para procurar (Browse)</span>
              </p>
              <p id="aef-fp-formats" class="text-[10px] text-slate-400">Suporta MP3, MP4, WebM, PNG, JPG, PDF</p>
              <input type="file" id="aef-fp-hidden-input" class="hidden" onchange="window.AEFFilePicker.handleFileSelect(this.files)">
            </div>

            <!-- File Selected Preview Card -->
            <div id="aef-fp-preview-container" class="hidden mt-4 p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5 truncate">
                  <span id="aef-fp-file-icon" class="text-xl shrink-0">📄</span>
                  <div class="truncate">
                    <p id="aef-fp-filename" class="font-bold text-xs text-white truncate">arquivo.mp4</p>
                    <p id="aef-fp-filesize" class="text-[10px] text-slate-400">0 MB</p>
                  </div>
                </div>
                <button onclick="window.AEFFilePicker.clearSelectedFile()" class="text-rose-400 hover:text-rose-300 text-xs font-bold px-2 py-1">
                  Trocar
                </button>
              </div>

              <!-- Media Preview Area -->
              <div id="aef-fp-media-preview" class="hidden rounded-xl overflow-hidden bg-black max-h-48 flex items-center justify-center">
                <!-- Injected preview -->
              </div>
            </div>

            <!-- Progress Bar -->
            <div id="aef-fp-progress-container" class="hidden mt-4 space-y-1.5">
              <div class="flex items-center justify-between text-[11px] font-bold">
                <span id="aef-fp-progress-status" class="text-amber-300">Enviando para a Nuvem Google...</span>
                <span id="aef-fp-progress-pct" class="text-amber-400 font-mono">0%</span>
              </div>
              <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/10">
                <div id="aef-fp-progress-bar" class="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-150" style="width: 0%"></div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
              <span class="text-[10px] text-slate-500 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Armazenamento Seguro GCP</span>
              </span>
              <div class="flex items-center gap-2">
                <button onclick="window.AEFFilePicker.close()" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition">
                  Cancelar
                </button>
                <button id="aef-fp-btn-upload" onclick="window.AEFFilePicker.executeUpload()" disabled class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-md flex items-center gap-1.5 cursor-pointer">
                  <span>Subir para Nuvem</span>
                  <span>🚀</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      `;

      const div = document.createElement("div");
      div.innerHTML = modalHtml;
      document.body.appendChild(div.firstElementChild);
    }

    /**
     * Opens the FilePicker modal
     * @param {Object} options
     *   - accept: 'audio/*', 'video/*', 'image/*', 'application/pdf'
     *   - folder: 'videos/public', 'audio/students/estevao', 'materials/pdf'
     *   - title: Custom modal title
     *   - onComplete: function(downloadUrl, metadata)
     */
    open(options = {}) {
      this._initDOM();
      this.currentOptions = Object.assign({
        accept: "*/*",
        folder: "uploads",
        title: "Google Cloud FilePicker",
        subtitle: "Selecione ou arraste um arquivo para envio direto à nuvem",
        onComplete: null
      }, options);

      this.selectedFile = null;
      this.isUploading = false;

      // Update UI
      document.getElementById("aef-fp-title").innerText = this.currentOptions.title;
      document.getElementById("aef-fp-subtitle").innerText = this.currentOptions.subtitle;
      
      const input = document.getElementById("aef-fp-hidden-input");
      input.value = "";
      input.accept = this.currentOptions.accept;

      document.getElementById("aef-fp-dropzone").classList.remove("hidden");
      document.getElementById("aef-fp-preview-container").classList.add("hidden");
      document.getElementById("aef-fp-progress-container").classList.add("hidden");
      document.getElementById("aef-fp-btn-upload").disabled = true;

      document.getElementById("aef-filepicker-modal").classList.remove("hidden");
    }

    close() {
      const modal = document.getElementById("aef-filepicker-modal");
      if (modal) modal.classList.add("hidden");
    }

    handleDragOver(e) {
      e.preventDefault();
      document.getElementById("aef-fp-dropzone").classList.add("border-amber-400", "bg-amber-500/10");
    }

    handleDragLeave(e) {
      e.preventDefault();
      document.getElementById("aef-fp-dropzone").classList.remove("border-amber-400", "bg-amber-500/10");
    }

    handleDrop(e) {
      e.preventDefault();
      document.getElementById("aef-fp-dropzone").classList.remove("border-amber-400", "bg-amber-500/10");
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        this.handleFileSelect(e.dataTransfer.files);
      }
    }

    handleFileSelect(files) {
      if (!files || files.length === 0) return;
      const file = files[0];
      this.selectedFile = file;

      // Update Preview Card
      document.getElementById("aef-fp-filename").innerText = file.name;
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      document.getElementById("aef-fp-filesize").innerText = `${sizeMB} MB • ${file.type || "Arquivo"}`;

      let icon = "📄";
      const mediaPreview = document.getElementById("aef-fp-media-preview");
      mediaPreview.innerHTML = "";
      mediaPreview.classList.add("hidden");

      if (file.type.startsWith("audio/")) {
        icon = "🎧";
        const audioUrl = URL.createObjectURL(file);
        mediaPreview.innerHTML = `<audio controls src="${audioUrl}" class="w-full p-2"></audio>`;
        mediaPreview.classList.remove("hidden");
      } else if (file.type.startsWith("video/")) {
        icon = "🎬";
        const videoUrl = URL.createObjectURL(file);
        mediaPreview.innerHTML = `<video controls src="${videoUrl}" class="max-h-40 w-full object-contain"></video>`;
        mediaPreview.classList.remove("hidden");
      } else if (file.type.startsWith("image/")) {
        icon = "🖼️";
        const imgUrl = URL.createObjectURL(file);
        mediaPreview.innerHTML = `<img src="${imgUrl}" class="max-h-36 object-contain">`;
        mediaPreview.classList.remove("hidden");
      } else if (file.type.includes("pdf")) {
        icon = "📑";
      }

      document.getElementById("aef-fp-file-icon").innerText = icon;
      document.getElementById("aef-fp-dropzone").classList.add("hidden");
      document.getElementById("aef-fp-preview-container").classList.remove("hidden");
      document.getElementById("aef-fp-btn-upload").disabled = false;
    }

    clearSelectedFile() {
      this.selectedFile = null;
      document.getElementById("aef-fp-hidden-input").value = "";
      document.getElementById("aef-fp-preview-container").classList.add("hidden");
      document.getElementById("aef-fp-dropzone").classList.remove("hidden");
      document.getElementById("aef-fp-btn-upload").disabled = true;
    }

    async executeUpload() {
      if (!this.selectedFile || this.isUploading) return;
      this.isUploading = true;

      const uploadBtn = document.getElementById("aef-fp-btn-upload");
      uploadBtn.disabled = true;
      uploadBtn.innerHTML = `<div class="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div><span>Enviando...</span>`;

      const progressContainer = document.getElementById("aef-fp-progress-container");
      const progressBar = document.getElementById("aef-fp-progress-bar");
      const progressPct = document.getElementById("aef-fp-progress-pct");
      const progressStatus = document.getElementById("aef-fp-progress-status");

      progressContainer.classList.remove("hidden");

      try {
        if (!window.aefCloudSync) throw new Error("Módulo de sincronização em nuvem aefCloudSync não carregado.");

        const downloadUrl = await window.aefCloudSync.uploadFileToStorage(
          this.selectedFile,
          this.currentOptions.folder,
          (pct) => {
            progressBar.style.width = pct + "%";
            progressPct.innerText = pct + "%";
            progressStatus.innerText = `Enviando para o Google Cloud (${pct}%)...`;
          }
        );

        progressStatus.innerText = "✅ Upload concluído com sucesso!";
        progressBar.style.width = "100%";
        progressPct.innerText = "100%";

        setTimeout(() => {
          this.close();
          if (this.currentOptions.onComplete) {
            this.currentOptions.onComplete(downloadUrl, {
              name: this.selectedFile.name,
              size: this.selectedFile.size,
              type: this.selectedFile.type
            });
          }
        }, 600);

      } catch (err) {
        alert("Erro no upload para a Nuvem: " + err.message);
        progressStatus.innerText = "❌ Falha no upload";
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = `<span>Tentar Novamente</span><span>🚀</span>`;
      } finally {
        this.isUploading = false;
      }
    }
  }

  // Global Singleton
  window.AEFFilePicker = new AEFFilePickerManager();
})();
