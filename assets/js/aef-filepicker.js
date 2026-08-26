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
      this.domReady = false;

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          this.domReady = true;
          this._initDOM();
        });
      } else {
        this.domReady = true;
        this._initDOM();
      }
    }

    _initDOM() {
      if (!document.body || document.getElementById("aef-filepicker-modal")) return;

      const modalHtml = `
        <div id="aef-filepicker-modal" class="hidden fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[#0A192F] border-2 border-amber-400 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl text-white relative">
            
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
              <button type="button" onclick="window.AEFFilePicker.close()" class="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer">
                ✕
              </button>
            </div>

            <!-- Hidden File Input (Outside of clickable zones to prevent recursion) -->
            <input type="file" id="aef-fp-hidden-input" class="hidden" onchange="window.AEFFilePicker.handleFileSelect(this.files)">

            <!-- Drop Zone Area -->
            <div id="aef-fp-dropzone" ondragover="window.AEFFilePicker.handleDragOver(event)" ondragleave="window.AEFFilePicker.handleDragLeave(event)" ondrop="window.AEFFilePicker.handleDrop(event)" class="border-2 border-dashed border-amber-400/40 hover:border-amber-400 bg-white/5 hover:bg-amber-500/5 rounded-2xl p-6 text-center transition flex flex-col items-center justify-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl">
                📂
              </div>
              <div>
                <p class="font-bold text-xs text-slate-200">
                  Arraste seu arquivo aqui ou clique no botão abaixo
                </p>
                <p id="aef-fp-formats" class="text-[10px] text-slate-400 mt-0.5">Suporta MP3, MP4, WebM, PNG, JPG, PDF</p>
              </div>
              
              <button type="button" onclick="document.getElementById('aef-fp-hidden-input').click()" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-sm cursor-pointer flex items-center gap-1.5">
                <span>📁 Procurar Arquivo (Browse)</span>
              </button>
            </div>

            <!-- File Selected Preview Card -->
            <div id="aef-fp-preview-container" class="hidden mt-4 p-4 rounded-2xl bg-white/10 border border-white/15 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5 truncate">
                  <span id="aef-fp-file-icon" class="text-2xl shrink-0">📄</span>
                  <div class="truncate">
                    <p id="aef-fp-filename" class="font-bold text-xs text-white truncate">arquivo.mp4</p>
                    <p id="aef-fp-filesize" class="text-[10px] text-slate-400 font-mono">0 MB</p>
                  </div>
                </div>
                <button type="button" onclick="window.AEFFilePicker.clearSelectedFile()" class="text-rose-400 hover:text-rose-300 text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-white/5 transition cursor-pointer">
                  Trocar
                </button>
              </div>

              <!-- Media Preview Area -->
              <div id="aef-fp-media-preview" class="hidden rounded-xl overflow-hidden bg-black/50 p-2 border border-white/10 flex items-center justify-center">
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
              <span class="text-[10px] text-slate-400 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Google Cloud Storage</span>
              </span>
              <div class="flex items-center gap-2">
                <button type="button" onclick="window.AEFFilePicker.close()" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition cursor-pointer">
                  Cancelar
                </button>
                <button id="aef-fp-btn-upload" type="button" onclick="window.AEFFilePicker.executeUpload()" disabled class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:pointer-events-none text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-md flex items-center gap-1.5 cursor-pointer">
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
      const titleEl = document.getElementById("aef-fp-title");
      const subtitleEl = document.getElementById("aef-fp-subtitle");
      if (titleEl) titleEl.innerText = this.currentOptions.title;
      if (subtitleEl) subtitleEl.innerText = this.currentOptions.subtitle;
      
      const input = document.getElementById("aef-fp-hidden-input");
      if (input) {
        input.value = "";
        input.accept = this.currentOptions.accept;
      }

      const dropzone = document.getElementById("aef-fp-dropzone");
      const previewCont = document.getElementById("aef-fp-preview-container");
      const progressCont = document.getElementById("aef-fp-progress-container");
      const uploadBtn = document.getElementById("aef-fp-btn-upload");

      if (dropzone) dropzone.classList.remove("hidden");
      if (previewCont) previewCont.classList.add("hidden");
      if (progressCont) progressCont.classList.add("hidden");
      if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = `<span>Subir para Nuvem</span><span>🚀</span>`;
      }

      const modal = document.getElementById("aef-filepicker-modal");
      if (modal) modal.classList.remove("hidden");
    }

    close() {
      const modal = document.getElementById("aef-filepicker-modal");
      if (modal) modal.classList.add("hidden");
    }

    handleDragOver(e) {
      e.preventDefault();
      const dropzone = document.getElementById("aef-fp-dropzone");
      if (dropzone) dropzone.classList.add("border-amber-400", "bg-amber-500/10");
    }

    handleDragLeave(e) {
      e.preventDefault();
      const dropzone = document.getElementById("aef-fp-dropzone");
      if (dropzone) dropzone.classList.remove("border-amber-400", "bg-amber-500/10");
    }

    handleDrop(e) {
      e.preventDefault();
      const dropzone = document.getElementById("aef-fp-dropzone");
      if (dropzone) dropzone.classList.remove("border-amber-400", "bg-amber-500/10");
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.handleFileSelect(e.dataTransfer.files);
      }
    }

    handleFileSelect(files) {
      if (!files || files.length === 0) return;
      const file = files[0];
      this.selectedFile = file;

      // Update Preview Card
      const nameEl = document.getElementById("aef-fp-filename");
      const sizeEl = document.getElementById("aef-fp-filesize");
      const iconEl = document.getElementById("aef-fp-file-icon");

      if (nameEl) nameEl.innerText = file.name;
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      if (sizeEl) sizeEl.innerText = `${sizeMB} MB • ${file.type || "Arquivo"}`;

      let icon = "📄";
      const mediaPreview = document.getElementById("aef-fp-media-preview");
      if (mediaPreview) {
        mediaPreview.innerHTML = "";
        mediaPreview.classList.add("hidden");

        if (file.type.startsWith("audio/")) {
          icon = "🎧";
          const audioUrl = URL.createObjectURL(file);
          mediaPreview.innerHTML = `<audio controls src="${audioUrl}" class="w-full"></audio>`;
          mediaPreview.classList.remove("hidden");
        } else if (file.type.startsWith("video/")) {
          icon = "🎬";
          const videoUrl = URL.createObjectURL(file);
          mediaPreview.innerHTML = `<video controls src="${videoUrl}" class="max-h-40 w-full object-contain"></video>`;
          mediaPreview.classList.remove("hidden");
        } else if (file.type.startsWith("image/")) {
          icon = "🖼️";
          const imgUrl = URL.createObjectURL(file);
          mediaPreview.innerHTML = `<img src="${imgUrl}" class="max-h-36 object-contain rounded-lg">`;
          mediaPreview.classList.remove("hidden");
        } else if (file.type.includes("pdf")) {
          icon = "📑";
        }
      }

      if (iconEl) iconEl.innerText = icon;

      const dropzone = document.getElementById("aef-fp-dropzone");
      const previewCont = document.getElementById("aef-fp-preview-container");
      const uploadBtn = document.getElementById("aef-fp-btn-upload");

      if (dropzone) dropzone.classList.add("hidden");
      if (previewCont) previewCont.classList.remove("hidden");
      if (uploadBtn) uploadBtn.disabled = false;
    }

    clearSelectedFile() {
      this.selectedFile = null;
      const input = document.getElementById("aef-fp-hidden-input");
      if (input) input.value = "";
      
      const dropzone = document.getElementById("aef-fp-dropzone");
      const previewCont = document.getElementById("aef-fp-preview-container");
      const uploadBtn = document.getElementById("aef-fp-btn-upload");

      if (previewCont) previewCont.classList.add("hidden");
      if (dropzone) dropzone.classList.remove("hidden");
      if (uploadBtn) uploadBtn.disabled = true;
    }

    async executeUpload() {
      if (!this.selectedFile || this.isUploading) return;
      this.isUploading = true;

      const uploadBtn = document.getElementById("aef-fp-btn-upload");
      if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = `<div class="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div><span>Enviando...</span>`;
      }

      const progressContainer = document.getElementById("aef-fp-progress-container");
      const progressBar = document.getElementById("aef-fp-progress-bar");
      const progressPct = document.getElementById("aef-fp-progress-pct");
      const progressStatus = document.getElementById("aef-fp-progress-status");

      if (progressContainer) progressContainer.classList.remove("hidden");

      try {
        if (!window.aefCloudSync) throw new Error("Módulo de sincronização em nuvem aefCloudSync não carregado.");

        const downloadUrl = await window.aefCloudSync.uploadFileToStorage(
          this.selectedFile,
          this.currentOptions.folder,
          (pct) => {
            if (progressBar) progressBar.style.width = pct + "%";
            if (progressPct) progressPct.innerText = pct + "%";
            if (progressStatus) progressStatus.innerText = `Enviando para o Google Cloud (${pct}%)...`;
          }
        );

        if (progressStatus) progressStatus.innerText = "✅ Upload concluído com sucesso!";
        if (progressBar) progressBar.style.width = "100%";
        if (progressPct) progressPct.innerText = "100%";

        setTimeout(() => {
          this.close();
          if (this.currentOptions.onComplete) {
            this.currentOptions.onComplete(downloadUrl, {
              name: this.selectedFile.name,
              size: this.selectedFile.size,
              type: this.selectedFile.type
            });
          }
        }, 500);

      } catch (err) {
        alert("Erro no upload para a Nuvem: " + err.message);
        if (progressStatus) progressStatus.innerText = "❌ Falha no upload";
        if (uploadBtn) {
          uploadBtn.disabled = false;
          uploadBtn.innerHTML = `<span>Tentar Novamente</span><span>🚀</span>`;
        }
      } finally {
        this.isUploading = false;
      }
    }
  }

  // Global Singleton
  window.AEFFilePicker = new AEFFilePickerManager();
})();
