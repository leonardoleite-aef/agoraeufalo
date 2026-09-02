const fs = require('fs');

let html = fs.readFileSync('admin-cursos.html', 'utf8');

// Find the index of <script> after Toast Notification
const marker = '<!-- JAVASCRIPT CONTROLLER                      -->';
const idx = html.indexOf(marker);
if (idx === -1) {
  console.error('Marker not found!');
  process.exit(1);
}

const headAndBody = html.substring(0, idx + marker.length) + '\n  <!-- ========================================== -->\n';

const scriptBody = `  <script>
    // In-memory Course Hierarchy Store
    let ALL_COURSES = {};
    let activeCourseId = "ms-legacy";
    let activeModuleId = null;
    let activeLessonId = null;
    let currentAiTab = "raw";

    document.addEventListener("DOMContentLoaded", async () => {
      if (window.aefPortalAuth) {
        const authed = await window.aefPortalAuth.requireAuth({ requireAdmin: true, redirectUrl: 'login.html' });
        if (!authed) return;
      }
      if (window.lucide) lucide.createIcons();
      await initializeStudioData();
    });

    async function initializeStudioData() {
      const container = document.getElementById("hierarchyTreeContainer");
      if (container) {
        container.innerHTML = \`
          <div class="flex flex-col items-center justify-center p-8 text-slate-400 space-y-2">
            <div class="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs font-bold text-slate-300">Carregando cursos & módulos...</p>
          </div>
        \`;
      }

      // Carrega hierarquia dinâmica do Firestore mesclando com AEF_COURSES_REGISTRY
      try {
        if (window.aefCloudSync) {
          ALL_COURSES = await window.aefCloudSync.getCoursesHierarchy(window.AEF_COURSES_REGISTRY);
        } else {
          ALL_COURSES = JSON.parse(JSON.stringify(window.AEF_COURSES_REGISTRY || {}));
        }
      } catch (err) {
        console.warn("⚠️ Erro ao carregar hierarquia, usando registro base:", err);
        ALL_COURSES = JSON.parse(JSON.stringify(window.AEF_COURSES_REGISTRY || {}));
      }

      const keys = Object.keys(ALL_COURSES);
      if (!keys.includes(activeCourseId) && keys.length > 0) {
        activeCourseId = keys[0];
      }

      renderCourseSwitcher();
      renderHierarchyTree();
    }

    function renderCourseSwitcher() {
      const select = document.getElementById("headerCourseSelect");
      if (!select) return;
      const keys = Object.keys(ALL_COURSES);
      if (!keys.includes(activeCourseId) && keys.length > 0) activeCourseId = keys[0];

      select.innerHTML = keys.map(k => {
        const c = ALL_COURSES[k];
        return \`<option value="\${c.id}" \${c.id === activeCourseId ? 'selected' : ''}>\${c.title}</option>\`;
      }).join("");
    }

    function handleSelectCourse(cid) {
      activeCourseId = cid;
      activeModuleId = null;
      activeLessonId = null;
      renderHierarchyTree();
    }

    function renderHierarchyTree() {
      const course = ALL_COURSES[activeCourseId];
      if (!course) return;

      // Update Summary Card
      document.getElementById("treeCourseTitle").innerText = course.title;
      document.getElementById("treeCourseBadge").innerText = (course.tierRequired || 'vip').toUpperCase();

      const container = document.getElementById("hierarchyTreeContainer");
      const modules = course.modules || [];

      if (modules.length === 0) {
        container.innerHTML = \`
          <div class="text-center p-6 border border-dashed border-white/10 rounded-2xl text-slate-400 space-y-2">
            <p class="text-xs">Nenhum módulo criado neste curso.</p>
            <button onclick="openModuleModal()" class="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-black uppercase">
              + Criar 1º Módulo
            </button>
          </div>
        \`;
        return;
      }

      container.innerHTML = modules.map((mod, mIdx) => {
        const lessons = mod.lessons || [];
        return \`
          <div class="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
            <!-- Module Header -->
            <div class="p-2.5 bg-white/5 flex items-center justify-between gap-2 border-b border-white/5">
              <div class="flex items-center gap-2 truncate">
                <span class="w-5 h-5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                  \${mIdx + 1}
                </span>
                <h4 class="font-bold text-xs text-amber-300 truncate">\${mod.title}</h4>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <button onclick="openNewLessonForModule('\${mod.id}')" class="p-1 rounded bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition text-[10px] font-bold" title="Adicionar Aula neste Módulo">
                  + Aula
                </button>
                <button onclick="editModule('\${mod.id}')" class="p-1 text-slate-400 hover:text-white" title="Editar Módulo">
                  <i data-lucide="settings" class="w-3 h-3"></i>
                </button>
              </div>
            </div>

            <!-- Lessons List -->
            <div class="p-1.5 space-y-1">
              \${lessons.map(les => {
                const isSelected = les.id === activeLessonId;
                const aiBadge = les.aiStatus === 'published' ? '🟢' : (les.aiStatus === 'ai_reviewed' ? '🔵' : '🟡');
                return \`
                  <div onclick="selectLessonForEdit('\${les.id}', '\${mod.id}')" class="p-2 rounded-lg \${isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-white/10 text-slate-200'} transition cursor-pointer flex items-center justify-between gap-2 text-xs">
                    <div class="truncate flex items-center gap-1.5">
                      <span class="text-[10px]">\${aiBadge}</span>
                      <span class="truncate text-[11px]">\${les.title}</span>
                    </div>
                    <div class="flex items-center gap-1 shrink-0 text-[10px]">
                      \${les.videoUrl ? '<i data-lucide="video" class="w-3 h-3"></i>' : ''}
                      \${les.audioUrl ? '<i data-lucide="volume-2" class="w-3 h-3"></i>' : ''}
                    </div>
                  </div>
                \`;
              }).join("")}
              \${lessons.length === 0 ? '<p class="text-[10px] text-slate-500 p-2 italic">Nenhuma aula neste módulo.</p>' : ''}
            </div>
          </div>
        \`;
      }).join("");

      if (window.lucide) lucide.createIcons();

      // Auto-select first lesson if none selected
      if (!activeLessonId && modules.length > 0 && modules[0].lessons?.length > 0) {
        selectLessonForEdit(modules[0].lessons[0].id, modules[0].id);
      }
    }

    function selectLessonForEdit(lessonId, moduleId) {
      activeLessonId = lessonId;
      activeModuleId = moduleId;
      const course = ALL_COURSES[activeCourseId];
      if (!course) return;

      let foundLesson = null;
      for (const m of (course.modules || [])) {
        const l = (m.lessons || []).find(x => x.id === lessonId);
        if (l) { foundLesson = l; break; }
      }
      if (!foundLesson) return;

      // Populate Form Fields
      document.getElementById("editorTitle").innerText = foundLesson.title;
      document.getElementById("lessonIdInput").value = foundLesson.id;
      document.getElementById("lessonModuleIdInput").value = moduleId;
      document.getElementById("lessonCourseIdInput").value = activeCourseId;
      document.getElementById("lessonTitleInput").value = foundLesson.title || "";
      document.getElementById("lessonOrderInput").value = foundLesson.order || 1;
      document.getElementById("lessonVideoUrlInput").value = foundLesson.videoUrl || "";
      document.getElementById("lessonAudioUrlInput").value = foundLesson.audioUrl || "";
      document.getElementById("lessonPdfUrlInput").value = foundLesson.pdfUrl || "";
      document.getElementById("lessonArtworkUrlInput").value = foundLesson.artworkUrl || "";
      document.getElementById("lessonThumbnailUrlInput").value = foundLesson.thumbnailUrl || "";
      document.getElementById("lessonGoldenTipInput").value = foundLesson.goldenTip || "";
      document.getElementById("lessonHasTrainingTrackInput").checked = foundLesson.hasTrainingTrack !== false;
      document.getElementById("lessonPublishedInput").checked = foundLesson.published !== false;

      // AI Fields
      document.getElementById("lessonRawScriptInput").value = foundLesson.rawScript || "";
      document.getElementById("lessonProcessedHtmlInput").value = foundLesson.processedContentHtml || "";
      document.getElementById("lessonAiStatusSelect").value = foundLesson.aiStatus || "draft_pending";

      updateRawCounter();
      updatePreviewHtml();
      renderHierarchyTree();
    }

    function openNewLessonForModule(moduleId) {
      activeModuleId = moduleId;
      activeLessonId = \`aula-\${Date.now()}\`;
      const course = ALL_COURSES[activeCourseId];
      const mod = (course.modules || []).find(m => m.id === moduleId);
      const nextOrder = ((mod?.lessons || []).length) + 1;

      const newLesson = {
        id: activeLessonId,
        moduleId: moduleId,
        courseId: activeCourseId,
        title: \`Nova Aula \${nextOrder}\`,
        order: nextOrder,
        videoUrl: "",
        audioUrl: "",
        thumbnailUrl: "assets/images/leonardo-leite.png",
        artworkUrl: "assets/images/cover-default-aef.jpg",
        pdfUrl: "",
        goldenTip: "",
        rawScript: "",
        processedContentHtml: "",
        aiStatus: "draft_pending",
        hasTrainingTrack: true,
        published: true
      };

      if (mod) {
        mod.lessons = mod.lessons || [];
        mod.lessons.push(newLesson);
      }

      selectLessonForEdit(activeLessonId, moduleId);
      showToast("Nova aula adicionada. Preencha os campos e salve!");
    }

    async function handleSaveLesson(e) {
      if (e) e.preventDefault();
      const course = ALL_COURSES[activeCourseId];
      if (!course) return;

      const lessonId = document.getElementById("lessonIdInput").value;
      const moduleId = document.getElementById("lessonModuleIdInput").value;

      let foundLesson = null;
      for (const m of (course.modules || [])) {
        if (m.id === moduleId) {
          const l = (m.lessons || []).find(x => x.id === lessonId);
          if (l) foundLesson = l;
        }
      }

      if (!foundLesson) return;

      // Update in memory
      foundLesson.title = document.getElementById("lessonTitleInput").value.trim();
      foundLesson.order = parseInt(document.getElementById("lessonOrderInput").value) || 1;
      foundLesson.videoUrl = document.getElementById("lessonVideoUrlInput").value.trim();
      foundLesson.audioUrl = document.getElementById("lessonAudioUrlInput").value.trim();
      foundLesson.pdfUrl = document.getElementById("lessonPdfUrlInput").value.trim();
      foundLesson.artworkUrl = document.getElementById("lessonArtworkUrlInput").value.trim();
      foundLesson.thumbnailUrl = document.getElementById("lessonThumbnailUrlInput").value.trim();
      foundLesson.goldenTip = document.getElementById("lessonGoldenTipInput").value.trim();
      foundLesson.hasTrainingTrack = document.getElementById("lessonHasTrainingTrackInput").checked;
      foundLesson.published = document.getElementById("lessonPublishedInput").checked;
      foundLesson.rawScript = document.getElementById("lessonRawScriptInput").value;
      foundLesson.processedContentHtml = document.getElementById("lessonProcessedHtmlInput").value;
      foundLesson.aiStatus = document.getElementById("lessonAiStatusSelect").value;
      foundLesson.updatedAt = new Date().toISOString();

      // Persist to Cloud Firestore
      try {
        if (window.aefCloudSync && window.aefCloudSync.db) {
          await window.aefCloudSync.db
            .collection("courses").doc(activeCourseId)
            .collection("modules").doc(moduleId)
            .collection("lessons").doc(lessonId)
            .set(foundLesson, { merge: true });
        }
      } catch (err) {
        console.warn("Firestore sync lesson:", err);
      }

      renderHierarchyTree();
      updatePreviewHtml();
      showToast("🚀 Aula salva com sucesso no Cloud Storage & Firestore!");
    }

    async function handleDeleteCurrentLesson() {
      if (!confirm("Tem certeza que deseja excluir esta aula?")) return;
      const course = ALL_COURSES[activeCourseId];
      if (!course) return;

      const mod = (course.modules || []).find(m => m.id === activeModuleId);
      if (mod) {
        mod.lessons = (mod.lessons || []).filter(l => l.id !== activeLessonId);
        try {
          if (window.aefCloudSync) {
            await window.aefCloudSync.deleteLessonFromCloud(activeCourseId, activeModuleId, activeLessonId);
          }
        } catch (e) {
          console.warn("Firestore delete lesson error:", e);
        }
      }

      activeLessonId = null;
      renderHierarchyTree();
      showToast("Aula excluída com sucesso.");
    }

    function switchAiTab(tab) {
      currentAiTab = tab;
      document.getElementById("aiTabRaw").classList.toggle("hidden", tab !== "raw");
      document.getElementById("aiTabProcessed").classList.toggle("hidden", tab !== "processed");
      document.getElementById("aiTabPreview").classList.toggle("hidden", tab !== "preview");

      document.getElementById("tabBtnRaw").className = tab === "raw" ? "px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-black transition" : "px-3 py-1 rounded-lg text-slate-400 hover:text-white font-bold transition";
      document.getElementById("tabBtnProcessed").className = tab === "processed" ? "px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-black transition" : "px-3 py-1 rounded-lg text-slate-400 hover:text-white font-bold transition";
      document.getElementById("tabBtnPreview").className = tab === "preview" ? "px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-black transition" : "px-3 py-1 rounded-lg text-slate-400 hover:text-white font-bold transition";

      if (tab === "preview") updatePreviewHtml();
    }

    function updateRawCounter() {
      const text = document.getElementById("lessonRawScriptInput").value || "";
      document.getElementById("rawCharCounter").innerText = \`\${text.length} caracteres • \${text.trim().split(/\\s+/).filter(Boolean).length} palavras\`;
    }

    function handleAiStatusChange(val) {
      showToast(\`Status do Agente de IA alterado para: \${val}\`);
    }

    function updatePreviewHtml() {
      const preview = document.getElementById("previewContainer");
      const title = document.getElementById("lessonTitleInput")?.value || "Título da Aula";
      const golden = document.getElementById("lessonGoldenTipInput")?.value || "Sacada de ouro do Leo.";
      const processed = document.getElementById("lessonProcessedHtmlInput")?.value || "";

      preview.innerHTML = \`
        <div class="border-b border-amber-300 pb-2">
          <span class="text-[10px] font-black uppercase text-amber-800 tracking-wider">Visualização Pedagógica</span>
          <h3 class="font-bold text-base text-amber-950 font-serif">\${title}</h3>
        </div>
        <div class="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
          <p class="font-bold text-amber-900 text-xs">💡 Sacada de Ouro do Professor Leo:</p>
          <p class="text-xs text-slate-800 italic leading-relaxed">"\${golden}"</p>
        </div>
        <div class="prose prose-sm text-slate-900 leading-relaxed">
          \${processed || '<p class="text-slate-500 italic text-[11px]">Nenhum conteúdo HTML processado pelo Agente de IA ainda. O aluno verá o roteiro ou masterclass.</p>'}
        </div>
      \`;
    }

    // Modal Helpers (Course & Module)
    function openCourseModal() {
      document.getElementById("courseModalTitle").innerText = "Novo Curso (Nível 1)";
      document.getElementById("courseModalId").value = "";
      document.getElementById("courseModalTitleInput").value = "";
      document.getElementById("courseModalSlugInput").value = "";
      document.getElementById("courseModalDescInput").value = "";
      document.getElementById("courseModal").classList.remove("hidden");
    }

    function closeCourseModal() {
      document.getElementById("courseModal").classList.add("hidden");
    }

    function editCurrentCourse() {
      const course = ALL_COURSES[activeCourseId];
      if (!course) return;
      document.getElementById("courseModalTitle").innerText = "Editar Metadados do Curso";
      document.getElementById("courseModalId").value = course.id;
      document.getElementById("courseModalTitleInput").value = course.title;
      document.getElementById("courseModalSlugInput").value = course.slug || course.id;
      document.getElementById("courseModalDescInput").value = course.description || "";
      document.getElementById("courseModalCoverInput").value = course.coverImageUrl || "";
      document.getElementById("courseModalTierInput").value = course.tierRequired || "vip";
      document.getElementById("courseModalPublishedInput").checked = course.published !== false;
      document.getElementById("courseModal").classList.remove("hidden");
    }

    async function handleSaveCourse(e) {
      e.preventDefault();
      const id = document.getElementById("courseModalId").value || document.getElementById("courseModalSlugInput").value.trim();
      const title = document.getElementById("courseModalTitleInput").value.trim();
      const slug = document.getElementById("courseModalSlugInput").value.trim();
      const tier = document.getElementById("courseModalTierInput").value;
      const cover = document.getElementById("courseModalCoverInput").value.trim() || "assets/images/cover-default-aef.jpg";
      const desc = document.getElementById("courseModalDescInput").value.trim();
      const published = document.getElementById("courseModalPublishedInput").checked;

      const courseObj = ALL_COURSES[id] || { modules: [] };
      courseObj.id = id;
      courseObj.title = title;
      courseObj.slug = slug;
      courseObj.tierRequired = tier;
      courseObj.badge = tier === "vip" ? "MENTORIA VIP" : "CURSO LIBERADO";
      courseObj.coverImageUrl = cover;
      courseObj.description = desc;
      courseObj.published = published;

      ALL_COURSES[id] = courseObj;
      activeCourseId = id;

      try {
        if (window.aefCloudSync && window.aefCloudSync.db) {
          await window.aefCloudSync.db.collection("courses").doc(id).set(courseObj, { merge: true });
        }
      } catch (err) {
        console.warn("Firestore sync course:", err);
      }

      closeCourseModal();
      renderCourseSwitcher();
      renderHierarchyTree();
      showToast("Curso salvo com sucesso!");
    }

    function openModuleModal() {
      document.getElementById("moduleModalTitle").innerText = "Novo Módulo / Ciclo";
      document.getElementById("moduleModalId").value = "";
      document.getElementById("moduleModalTitleInput").value = "";
      document.getElementById("moduleModalIdInput").value = \`ciclo-0\${(ALL_COURSES[activeCourseId]?.modules || []).length + 1}\`;
      document.getElementById("moduleModalOrderInput").value = (ALL_COURSES[activeCourseId]?.modules || []).length + 1;
      document.getElementById("moduleModalDescInput").value = "";
      const btnDel = document.getElementById("btnDeleteModule");
      if (btnDel) btnDel.classList.add("hidden");
      document.getElementById("moduleModal").classList.remove("hidden");
    }

    function closeModuleModal() {
      document.getElementById("moduleModal").classList.add("hidden");
    }

    function editModule(moduleId) {
      const course = ALL_COURSES[activeCourseId];
      const mod = (course?.modules || []).find(m => m.id === moduleId);
      if (!mod) return;

      document.getElementById("moduleModalTitle").innerText = "Editar Módulo";
      document.getElementById("moduleModalId").value = mod.id;
      document.getElementById("moduleModalTitleInput").value = mod.title;
      document.getElementById("moduleModalIdInput").value = mod.id;
      document.getElementById("moduleModalOrderInput").value = mod.order || 1;
      document.getElementById("moduleModalDescInput").value = mod.description || "";
      document.getElementById("moduleModalPublishedInput").checked = mod.published !== false;
      const btnDel = document.getElementById("btnDeleteModule");
      if (btnDel) btnDel.classList.remove("hidden");
      document.getElementById("moduleModal").classList.remove("hidden");
    }

    async function handleSaveModule(e) {
      e.preventDefault();
      const course = ALL_COURSES[activeCourseId];
      if (!course) return;

      const modId = document.getElementById("moduleModalId").value || document.getElementById("moduleModalIdInput").value.trim();
      const title = document.getElementById("moduleModalTitleInput").value.trim();
      const order = parseInt(document.getElementById("moduleModalOrderInput").value) || 1;
      const desc = document.getElementById("moduleModalDescInput").value.trim();
      const published = document.getElementById("moduleModalPublishedInput").checked;

      course.modules = course.modules || [];
      let existingMod = course.modules.find(m => m.id === modId);

      if (!existingMod) {
        existingMod = { id: modId, courseId: activeCourseId, title, order, description: desc, published, lessons: [] };
        course.modules.push(existingMod);
      } else {
        existingMod.title = title;
        existingMod.order = order;
        existingMod.description = desc;
        existingMod.published = published;
      }

      course.modules.sort((a, b) => (a.order || 0) - (b.order || 0));

      try {
        if (window.aefCloudSync && window.aefCloudSync.db) {
          await window.aefCloudSync.db
            .collection("courses").doc(activeCourseId)
            .collection("modules").doc(modId)
            .set(existingMod, { merge: true });
        }
      } catch (err) {
        console.warn("Firestore sync module:", err);
      }

      closeModuleModal();
      renderHierarchyTree();
      showToast("Módulo salvo com sucesso!");
    }

    async function handleDeleteCurrentModule() {
      const modId = document.getElementById("moduleModalId").value;
      if (!modId) return;
      if (!confirm(\`Tem certeza que deseja excluir o módulo "\${modId}" e todas as suas aulas?\`)) return;

      const course = ALL_COURSES[activeCourseId];
      if (course) {
        course.modules = (course.modules || []).filter(m => m.id !== modId);
      }

      try {
        if (window.aefCloudSync) {
          await window.aefCloudSync.deleteModuleFromCloud(activeCourseId, modId);
        }
      } catch (err) {
        console.warn("Error deleting module from cloud:", err);
      }

      closeModuleModal();
      activeLessonId = null;
      activeModuleId = null;
      renderHierarchyTree();
      showToast("Módulo excluído com sucesso.");
    }

    async function handleSyncAllToFirestore() {
      const btn = document.getElementById("btnSyncCloud");
      if (btn) btn.innerHTML = \`<span class="animate-spin">⏳</span> Sincronizando...\`;
      showToast("Iniciando sincronização completa de cursos, módulos e aulas com o Firestore...");

      try {
        if (!window.aefCloudSync) throw new Error("CloudSync não disponível");
        await window.aefCloudSync.init();

        const coursesKeys = Object.keys(ALL_COURSES);
        let totalMods = 0;
        let totalLessons = 0;

        for (const cid of coursesKeys) {
          const course = ALL_COURSES[cid];
          const coursePayload = {
            id: course.id || cid,
            title: course.title || cid,
            slug: course.slug || course.id || cid,
            badge: course.badge || "CURSO LIBERADO",
            tierRequired: course.tierRequired || "vip",
            coverImageUrl: course.coverImageUrl || "assets/images/cover-default-aef.jpg",
            description: course.description || "",
            published: course.published !== false,
            updatedAt: new Date().toISOString()
          };

          if (window.aefCloudSync.db) {
            await window.aefCloudSync.db.collection("courses").doc(cid).set(coursePayload, { merge: true });

            for (const mod of (course.modules || [])) {
              totalMods++;
              const modPayload = {
                id: mod.id,
                courseId: cid,
                title: mod.title || mod.id,
                order: mod.order || 1,
                description: mod.description || "",
                published: mod.published !== false,
                badge: mod.badge || "",
                stats: mod.stats || "",
                updatedAt: new Date().toISOString()
              };
              await window.aefCloudSync.db.collection("courses").doc(cid).collection("modules").doc(mod.id).set(modPayload, { merge: true });

              for (const les of (mod.lessons || [])) {
                totalLessons++;
                const lesPayload = {
                  ...les,
                  courseId: cid,
                  moduleId: mod.id,
                  updatedAt: new Date().toISOString()
                };
                await window.aefCloudSync.db.collection("courses").doc(cid).collection("modules").doc(mod.id).collection("lessons").doc(les.id).set(lesPayload, { merge: true });
              }
            }
          }
        }

        showToast(\`✅ Sincronização concluída: \${coursesKeys.length} cursos, \${totalMods} módulos e \${totalLessons} aulas no Firestore!\`);
      } catch (e) {
        console.error("Erro na sincronização:", e);
        showToast("❌ Erro na sincronização: " + e.message);
      } finally {
        if (btn) btn.innerHTML = \`<i data-lucide="cloud" class="w-3.5 h-3.5"></i><span class="hidden sm:inline">Sincronizar Cloud</span>\`;
        if (window.lucide) lucide.createIcons();
      }
    }

    // File Picker helper
    function openFilePickerForEntity(targetInputId, acceptTypes) {
      if (window.aefFilePicker) {
        window.aefFilePicker.open({
          accept: acceptTypes,
          onSelect: (url) => {
            document.getElementById(targetInputId).value = url;
            showToast("Mídia vinculada com sucesso!");
          }
        });
      } else {
        const customUrl = prompt("Insira a URL direta da mídia no Google Cloud Storage:", document.getElementById(targetInputId).value);
        if (customUrl) document.getElementById(targetInputId).value = customUrl;
      }
    }

    function showToast(msg) {
      const toast = document.getElementById("studioToast");
      const text = document.getElementById("studioToastText");
      if (!toast || !text) return;
      text.innerText = msg;
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("hidden"), 4000);
    }
  </script>
</body>
</html>
`;

fs.writeFileSync('admin-cursos.html', headAndBody + scriptBody, 'utf8');
console.log('admin-cursos.html written cleanly! Total lines:', (headAndBody + scriptBody).split('\n').length);
