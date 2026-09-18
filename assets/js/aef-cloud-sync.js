/**
 * AgoraEuFalo - Global Cloud Synchronization Engine
 * Professor Leonardo Leite
 * Real-time Firebase Firestore & Google Cloud Storage Integration
 */

(function (root) {
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk",
    authDomain: "agoraeufalo-3463a.firebaseapp.com",
    projectId: "agoraeufalo-3463a",
    storageBucket: "agoraeufalo-3463a.firebasestorage.app",
    messagingSenderId: "973862553705",
    appId: "1:973862553705:web:959ea81c80c28cc1dc7af8"
  };

  // =========================================================================
  // HELPER DE CONVERSÃO REST FIRESTORE & FORMATADORES
  // =========================================================================
  function parseRestField(field) {
    if (!field) return null;
    if (field.stringValue !== undefined) return field.stringValue;
    if (field.integerValue !== undefined) return parseInt(field.integerValue, 10);
    if (field.doubleValue !== undefined) return parseFloat(field.doubleValue);
    if (field.booleanValue !== undefined) return field.booleanValue;
    if (field.nullValue !== undefined) return null;
    if (field.arrayValue) {
      return (field.arrayValue.values || []).map(parseRestField);
    }
    if (field.mapValue) {
      const res = {};
      for (const [k, v] of Object.entries(field.mapValue.fields || {})) {
        res[k] = parseRestField(v);
      }
      return res;
    }
    return null;
  }

  function parseRestDoc(doc, fallbackId = "") {
    if (!doc) return null;
    const id = doc.name ? doc.name.split("/").pop() : fallbackId;
    const obj = { id };
    const fields = doc.fields || {};
    for (const [k, v] of Object.entries(fields)) {
      obj[k] = parseRestField(v);
    }
    return obj;
  }

  function toFirestoreRestFields(obj) {
    const fields = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined || typeof v === "function" || k === "modules" || k === "lessons") continue;

      if (Array.isArray(v) && k !== "sentences" && k !== "chunks" && k !== "exercises" && k !== "media" && k !== "downloads") {
        fields[k] = {
          arrayValue: {
            values: v.map(str => ({ stringValue: String(str) }))
          }
        };
        continue;
      }

      if (k === "sentences" && Array.isArray(v)) {
        fields[k] = {
          arrayValue: {
            values: v.map(s => ({
              mapValue: {
                fields: {
                  id: { integerValue: String(s.id || 1) },
                  start: { doubleValue: parseFloat(s.start) || 0.0 },
                  end: { doubleValue: parseFloat(s.end) || 0.0 },
                  text: { stringValue: s.text || "" },
                  spokenTranslation: { stringValue: s.spokenTranslation || s.translation || "" },
                  notes: { stringValue: s.notes || "" }
                }
              }
            }))
          }
        };
      } else if (k === "media" && Array.isArray(v)) {
        fields[k] = {
          arrayValue: {
            values: v.map(m => {
              const mf = {
                type: { stringValue: m.type || "video_youtube" },
                url: { stringValue: m.url || "" },
                title: { stringValue: m.title || "" }
              };
              if (m.durationStr) mf.durationStr = { stringValue: m.durationStr };
              if (m.thumbnailUrl) mf.thumbnailUrl = { stringValue: m.thumbnailUrl };
              return { mapValue: { fields: mf } };
            })
          }
        };
      } else if (k === "downloads" && Array.isArray(v)) {
        fields[k] = {
          arrayValue: {
            values: v.map(d => ({
              mapValue: {
                fields: {
                  type: { stringValue: d.type || "pdf" },
                  url: { stringValue: d.url || "" },
                  title: { stringValue: d.title || "" }
                }
              }
            }))
          }
        };
      } else if (typeof v === "string") {
        fields[k] = { stringValue: v };
      } else if (typeof v === "number") {
        fields[k] = Number.isInteger(v) ? { integerValue: v.toString() } : { doubleValue: v };
      } else if (typeof v === "boolean") {
        fields[k] = { booleanValue: v };
      } else if (Array.isArray(v)) {
        fields[k] = { arrayValue: { values: v.map(item => ({ stringValue: String(item) })) } };
      } else if (typeof v === "object" && v !== null) {
        fields[k] = { mapValue: { fields: toFirestoreRestFields(v) } };
      }
    }
    return fields;
  }

  // =========================================================================
  // NORMALIZADORES V2 COM FALLBACK SEGURO
  // =========================================================================
  function normalizeCourseSafe(course) {
    if (!course) return course;
    if (typeof root !== "undefined" && root.AEFAccessEngine && typeof root.AEFAccessEngine.normalizeCourse === "function") {
      return root.AEFAccessEngine.normalizeCourse(course);
    }
    if (typeof window !== "undefined" && window.AEFAccessEngine && typeof window.AEFAccessEngine.normalizeCourse === "function") {
      return window.AEFAccessEngine.normalizeCourse(course);
    }
    try {
      if (typeof require === "function") {
        const engine = require("./aef-access-engine.js");
        if (engine && typeof engine.normalizeCourse === "function") return engine.normalizeCourse(course);
      }
    } catch (e) {}
    const id = String(course.id || "");
    const title = course.title || id;
    const accessTier = course.accessTier || (id.startsWith("ms-") ? "all_access" : (course.tierRequired === "vip" ? "standalone" : "all_access"));
    const access = course.access && typeof course.access === "object" ? {
      entitlements: Array.isArray(course.access.entitlements) ? [...course.access.entitlements] : [],
      requiresProductId: Array.isArray(course.access.requiresProductId) ? [...course.access.requiresProductId] : [],
      legacyGrantIds: Array.isArray(course.access.legacyGrantIds) ? [...course.access.legacyGrantIds] : []
    } : {
      entitlements: accessTier === "free" ? ["member_free", "member_pago"] : ["member_pago"],
      requiresProductId: accessTier === "standalone" ? [id] : [],
      legacyGrantIds: []
    };
    return {
      ...course,
      schemaVersion: 2,
      id,
      title,
      accessTier,
      access,
      isPublished: course.isPublished !== undefined ? Boolean(course.isPublished) : (course.published !== false),
      categories: Array.isArray(course.categories) ? course.categories : ["magic_stories"]
    };
  }

  function normalizeUserSafe(user) {
    if (!user) return user;
    if (typeof root !== "undefined" && root.AEFAccessEngine && typeof root.AEFAccessEngine.normalizeUser === "function") {
      return root.AEFAccessEngine.normalizeUser(user);
    }
    if (typeof window !== "undefined" && window.AEFAccessEngine && typeof window.AEFAccessEngine.normalizeUser === "function") {
      return window.AEFAccessEngine.normalizeUser(user);
    }
    try {
      if (typeof require === "function") {
        const engine = require("./aef-access-engine.js");
        if (engine && typeof engine.normalizeUser === "function") return engine.normalizeUser(user);
      }
    } catch (e) {}
    const email = (user.email || "").toLowerCase().trim();
    const uid = String(user.uid || user.id || (email ? email.replace(/[^a-zA-Z0-9]/g, "_") : "user"));
    const id = String(user.id || uid);
    const name = String(user.name || user.displayName || (email ? email.split("@")[0] : "Aluno AgoraEuFalo"));
    let role = user.role || "student";
    if (user.tier === "admin_master" || (Array.isArray(user.categories) && user.categories.includes("admin")) || email === "selexenglish@gmail.com") {
      role = "admin";
    }
    const categories = Array.isArray(user.categories) && user.categories.length > 0
      ? Array.from(new Set(["member_free", ...user.categories]))
      : (user.tier === "vip_mentorship" ? ["member_free", "member_pago", "member_mentoria"] : ["member_free", "member_pago"]);
    const subscriptions = Array.isArray(user.subscriptions) ? user.subscriptions : [];
    const legacyEntitlements = Array.isArray(user.legacyEntitlements) && user.legacyEntitlements.length > 0
      ? user.legacyEntitlements
      : Array.from(new Set(["member_free", ...categories.filter(c => typeof c === "string" && c.startsWith("legado_"))]));

    return {
      ...user,
      schemaVersion: 2,
      id,
      uid,
      email,
      name,
      role,
      categories,
      subscriptions,
      purchasedProducts: Array.isArray(user.purchasedProducts) ? user.purchasedProducts : [],
      legacyEntitlements,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString()
    };
  }

  // =========================================================================
  // COURSE REPOSITORY (Padrão de Repositório Explícito & Fim do Merge Silencioso)
  // =========================================================================
  class CourseRepository {
    constructor(cloudSync) {
      this.sync = cloudSync;
    }

    /**
     * Obtém a hierarquia completa de um curso específico (Curso > Módulos > Lições).
     * Hierarquia Determinística:
     * - Prioridade 1: Firestore Remoto (SDK com REST fallback).
     * - Fallback 2: Cache local / Registro estático com log explícito.
     * Saída: Sempre normalizada pelo Contrato V2 (normalizeCourseToV2).
     */
    async getCourseHierarchy(courseId, baseRegistry = null) {
      if (!courseId) throw new Error("courseId é obrigatório para getCourseHierarchy");
      await this.sync.init();

      let baseCourses = baseRegistry;
      if (!baseCourses) {
        if (typeof window !== "undefined") {
          baseCourses = window.AEF_COURSES_REGISTRY || {};
        } else {
          try {
            const regModule = require("./aef-courses-registry.js");
            baseCourses = regModule.AEF_COURSES_DATA || regModule;
          } catch (e) {
            baseCourses = {};
          }
        }
      }
      let remoteCourse = null;
      let remoteFound = false;

      // 1. PRIORIDADE 1: Busca Remota no Firestore (SDK)
      if (this.sync.db) {
        try {
          const cDoc = await Promise.race([
            this.sync.db.collection("courses").doc(courseId).get(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout on course.get()")), 5000))
          ]);

          if (cDoc.exists) {
            remoteCourse = { id: cDoc.id, ...cDoc.data(), modules: [] };
            remoteFound = true;

            const modulesSnap = await this.sync.db.collection("courses").doc(courseId).collection("modules").get();
            if (!modulesSnap.empty) {
              const modulePromises = modulesSnap.docs.map(async (mDoc) => {
                const mid = mDoc.id;
                const mObj = { id: mid, ...mDoc.data(), lessons: [] };
                try {
                  const lessonsSnap = await this.sync.db
                    .collection("courses").doc(courseId)
                    .collection("modules").doc(mid)
                    .collection("lessons").get();
                  if (!lessonsSnap.empty) {
                    mObj.lessons = lessonsSnap.docs.map(lDoc => ({ id: lDoc.id, ...lDoc.data() }));
                    mObj.lessons.sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));
                  }
                } catch (le) {
                  console.warn(`[AEF Repository] Aviso ao buscar lições de ${courseId}/${mid}:`, le);
                }
                return mObj;
              });
              remoteCourse.modules = await Promise.all(modulePromises);
              remoteCourse.modules.sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));
            }
          }
        } catch (err) {
          console.warn(`[AEF Repository] SDK Firestore falhou para curso "${courseId}", tentando REST:`, err);
        }
      }

      // 2. PRIORIDADE 1 (continuação): REST Fallback se SDK não obteve sucesso
      if (!remoteFound) {
        try {
          const restUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses/${courseId}`;
          const res = await fetch(restUrl);
          if (res.ok) {
            const data = await res.json();
            if (data && data.fields) {
              remoteCourse = parseRestDoc(data, courseId);
              remoteCourse.modules = [];
              remoteFound = true;

              const mRes = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses/${courseId}/modules`);
              if (mRes.ok) {
                const mData = await mRes.json();
                if (mData && Array.isArray(mData.documents)) {
                  const modulePromises = mData.documents.map(async (mDoc) => {
                    const mid = mDoc.name.split("/").pop();
                    const mObj = parseRestDoc(mDoc, mid);
                    mObj.lessons = [];

                    try {
                      const lRes = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses/${courseId}/modules/${mid}/lessons`);
                      if (lRes.ok) {
                        const lData = await lRes.json();
                        if (lData && Array.isArray(lData.documents)) {
                          mObj.lessons = lData.documents.map(lDoc => parseRestDoc(lDoc, lDoc.name.split("/").pop()));
                          mObj.lessons.sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));
                        }
                      }
                    } catch (le) {
                      console.warn(`[AEF Repository] Falha REST ao buscar lições de ${courseId}/${mid}:`, le);
                    }
                    return mObj;
                  });
                  remoteCourse.modules = await Promise.all(modulePromises);
                  remoteCourse.modules.sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));
                }
              }
            }
          }
        } catch (restErr) {
          // Erro de rede / offline
        }
      }

      // 3. SELEÇÃO DETERMINÍSTICA (Fim do Merge Cego)
      let finalCourse = null;
      if (remoteFound && remoteCourse) {
        finalCourse = remoteCourse;
        try {
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(`aef_course_cache_${courseId}`, JSON.stringify(remoteCourse));
          }
        } catch (e) {}
      } else {
        // FALLBACK 2: Dados locais / estáticos
        console.warn(`[AEF Repository] Usando dados locais de fallback para: curso "${courseId}"`);
        let cached = null;
        try {
          if (typeof localStorage !== "undefined") {
            const raw = localStorage.getItem(`aef_course_cache_${courseId}`);
            if (raw) cached = JSON.parse(raw);
          }
        } catch (e) {}

        const localBase = cached || baseCourses[courseId] || { id: courseId, title: courseId, modules: [] };
        finalCourse = JSON.parse(JSON.stringify(localBase));
      }

      // 4. NORMALIZAÇÃO AUTOMÁTICA NA SAÍDA (V2)
      return normalizeCourseSafe(finalCourse);
    }

    /**
     * Obtém apenas a lista leve de metadados dos cursos (sem carregar módulos e lições).
     * Ideal para renderizar cards, vitrines, menus e dropdowns instantaneamente.
     */
    async getCoursesMetadata(baseRegistry = null) {
      let metaSource = baseRegistry;
      if (!metaSource) {
        if (typeof window !== "undefined") {
          metaSource = window.AEF_COURSES_METADATA || window.AEF_COURSES_REGISTRY || {};
        } else {
          try {
            const regModule = require("./aef-courses-registry.js");
            metaSource = regModule.AEF_COURSES_METADATA || regModule.metadata || regModule.AEF_COURSES_DATA || regModule;
          } catch (e) {
            metaSource = {};
          }
        }
      }

      const result = {};
      let remoteList = [];
      let remoteSuccess = false;

      // 1. Consulta remota leve no Firestore (apenas coleção "courses", sem subcoleções)
      if (this.sync.db) {
        try {
          const coursesCol = this.sync.db.collection("courses");
          const isUserAdmin = typeof window !== "undefined" && window.aefPortalAuth && typeof window.aefPortalAuth.isAdmin === "function" && window.aefPortalAuth.isAdmin();
          const query = (!isUserAdmin && typeof coursesCol.where === "function")
            ? coursesCol.where("isPublished", "==", true)
            : coursesCol;
          const snap = await Promise.race([
            query.get(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
          ]);
          if (!snap.empty) {
            snap.forEach(doc => {
              const d = doc.data();
              const { modules, ...meta } = d;
              remoteList.push({ id: doc.id, ...meta, modules: [] });
            });
            remoteSuccess = true;
          }
        } catch (err) {
          console.warn("[AEF Repository] SDK falhou ao listar metadados de cursos, tentando REST:", err);
        }
      }

      if (!remoteSuccess) {
        try {
          const res = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses`);
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.documents)) {
              remoteList = data.documents.map(doc => {
                const parsed = parseRestDoc(doc, doc.name.split("/").pop());
                const { modules, ...meta } = parsed;
                return { ...meta, modules: [] };
              });
              remoteSuccess = true;
            }
          }
        } catch (e) {}
      }

      if (remoteSuccess && remoteList.length > 0) {
        remoteList.forEach(c => {
          result[c.id] = normalizeCourseSafe({ ...c, modules: [] });
        });

        for (const [cid, baseC] of Object.entries(metaSource)) {
          if (!result[cid]) {
            console.warn(`[AEF Repository] Usando dados locais de fallback para: curso "${cid}"`);
            const { modules, ...meta } = baseC || {};
            result[cid] = normalizeCourseSafe({ ...meta, modules: [] });
          }
        }
      } else {
        console.warn("[AEF Repository] Usando dados locais de fallback para: catálogo de cursos");
        for (const [cid, baseC] of Object.entries(metaSource)) {
          const { modules, ...meta } = baseC || {};
          result[cid] = normalizeCourseSafe({ ...meta, modules: [] });
        }
      }

      return result;
    }

    /**
     * Lista de cursos (sem traversal de módulos/lições).
     * Delega para getCoursesMetadata para garantir carregamento leve de alta performance.
     */
    async getCoursesList(baseRegistry = null) {
      return this.getCoursesMetadata(baseRegistry);
    }

    /**
     * Hidrata a árvore completa de módulos e lições sob demanda para um curso específico.
     * Atua como alias semântico explícito de getCourseHierarchy.
     */
    async hydrateCourse(courseId, baseRegistry = null) {
      return this.getCourseHierarchy(courseId, baseRegistry);
    }

    /**
     * Hidrata uma lição específica sob demanda (vídeo, áudio, roteiro, etc.).
     */
    async hydrateLesson(courseId, moduleId, lessonId) {
      if (!courseId || !moduleId || !lessonId) throw new Error("courseId, moduleId e lessonId são obrigatórios");
      const course = await this.getCourseHierarchy(courseId);
      const mod = (course.modules || []).find(m => m.id === moduleId);
      const lesson = mod ? (mod.lessons || []).find(l => l.id === lessonId) : null;
      return lesson || null;
    }


    /**
     * Hierarquia dinâmica completa de todos os cursos.
     */
    async getCoursesHierarchy(baseRegistry = null) {
      await this.sync.init();
      const baseCourses = baseRegistry || (typeof window !== "undefined" ? window.AEF_COURSES_REGISTRY || {} : {});
      const result = {};
      let remoteCourses = [];
      let remoteSuccess = false;

      if (this.sync.db) {
        try {
          const coursesCol = this.sync.db.collection("courses");
          const isUserAdmin = typeof window !== "undefined" && window.aefPortalAuth && typeof window.aefPortalAuth.isAdmin === "function" && window.aefPortalAuth.isAdmin();
          const query = (!isUserAdmin && typeof coursesCol.where === "function")
            ? coursesCol.where("isPublished", "==", true)
            : coursesCol;
          const snap = await Promise.race([
            query.get(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 6000))
          ]);
          if (!snap.empty) {
            const coursePromises = snap.docs.map(async (cDoc) => {
              const cid = cDoc.id;
              const cObj = { id: cid, ...cDoc.data(), modules: [] };
              try {
                const mSnap = await this.sync.db.collection("courses").doc(cid).collection("modules").get();
                if (!mSnap.empty) {
                  const mPromises = mSnap.docs.map(async (mDoc) => {
                    const mid = mDoc.id;
                    const mObj = { id: mid, ...mDoc.data(), lessons: [] };
                    try {
                      const lSnap = await this.sync.db.collection("courses").doc(cid).collection("modules").doc(mid).collection("lessons").get();
                      if (!lSnap.empty) {
                        mObj.lessons = lSnap.docs.map(lDoc => ({ id: lDoc.id, ...lDoc.data() }));
                        mObj.lessons.sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));
                      }
                    } catch (le) {}
                    return mObj;
                  });
                  cObj.modules = await Promise.all(mPromises);
                  cObj.modules.sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));
                }
              } catch (me) {}
              return cObj;
            });
            remoteCourses = await Promise.all(coursePromises);
            remoteSuccess = true;
          }
        } catch (err) {
          console.warn("[AEF Repository] SDK falhou na hierarquia geral de cursos, tentando REST:", err);
        }
      }

      if (!remoteSuccess) {
        try {
          const res = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses`);
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.documents)) {
              for (const doc of data.documents) {
                const cid = doc.name.split("/").pop();
                const cObj = parseRestDoc(doc, cid);
                cObj.modules = [];

                try {
                  const mRes = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses/${cid}/modules`);
                  if (mRes.ok) {
                    const mData = await mRes.json();
                    if (mData && Array.isArray(mData.documents)) {
                      for (const mDoc of mData.documents) {
                        const mid = mDoc.name.split("/").pop();
                        const mObj = parseRestDoc(mDoc, mid);
                        mObj.lessons = [];

                        try {
                          const lRes = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses/${cid}/modules/${mid}/lessons`);
                          if (lRes.ok) {
                            const lData = await lRes.json();
                            if (lData && Array.isArray(lData.documents)) {
                              mObj.lessons = lData.documents.map(lDoc => parseRestDoc(lDoc, lDoc.name.split("/").pop()));
                              mObj.lessons.sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));
                            }
                          }
                        } catch (le) {}

                        cObj.modules.push(mObj);
                      }
                      cObj.modules.sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));
                    }
                  }
                } catch (me) {}

                remoteCourses.push(cObj);
              }
              remoteSuccess = true;
            }
          }
        } catch (restErr) {}
      }

      if (remoteSuccess && remoteCourses.length > 0) {
        remoteCourses.forEach(c => {
          result[c.id] = normalizeCourseSafe(c);
        });

        for (const [cid, baseC] of Object.entries(baseCourses)) {
          if (!result[cid]) {
            console.warn(`[AEF Repository] Usando dados locais de fallback para: curso "${cid}"`);
            result[cid] = normalizeCourseSafe(JSON.parse(JSON.stringify(baseC)));
          }
        }
      } else {
        console.warn("[AEF Repository] Usando dados locais de fallback para: lista completa de cursos");
        for (const [cid, baseC] of Object.entries(baseCourses)) {
          result[cid] = normalizeCourseSafe(JSON.parse(JSON.stringify(baseC)));
        }
      }

      return result;
    }

    async saveCourse(courseData) {
      if (!courseData || !courseData.id) throw new Error("ID do curso obrigatório.");
      await this.sync.init();
      const cid = courseData.id;
      const payload = normalizeCourseSafe({ ...courseData });
      payload.updatedAt = new Date().toISOString();

      let saved = false;
      if (this.sync.db) {
        try {
          await this.sync.db.collection("courses").doc(cid).set(payload, { merge: true });
          saved = true;
        } catch (e) {
          console.warn("[AEF Repository] SDK saveCourse error, tentando REST:", e);
        }
      }

      if (!saved) {
        const restUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses/${cid}`;
        const res = await fetch(restUrl, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: toFirestoreRestFields(payload) })
        });
        if (!res.ok) throw new Error(`REST Error: ${res.statusText}`);
      }

      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(`aef_course_cache_${cid}`, JSON.stringify(payload));
        }
      } catch (e) {}

      console.log(`☁️ [AEF Repository] Curso "${payload.title}" salvo com sucesso no Firestore!`);
      return payload;
    }

    async saveModule(courseId, moduleData) {
      if (!courseId || !moduleData || !moduleData.id) throw new Error("CourseId e ModuleId obrigatórios.");
      await this.sync.init();
      const mid = moduleData.id;
      const payload = {
        id: mid,
        courseId: courseId,
        title: moduleData.title || mid,
        order: parseInt(moduleData.order) || 1,
        description: moduleData.description || "",
        published: moduleData.published !== false,
        badge: moduleData.badge || "",
        stats: moduleData.stats || "",
        updatedAt: new Date().toISOString()
      };

      let saved = false;
      if (this.sync.db) {
        try {
          await this.sync.db.collection("courses").doc(courseId).collection("modules").doc(mid).set(payload, { merge: true });
          saved = true;
        } catch (e) {
          console.warn("[AEF Repository] SDK saveModule error, tentando REST:", e);
        }
      }

      if (!saved) {
        const restUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses/${courseId}/modules/${mid}`;
        const res = await fetch(restUrl, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: toFirestoreRestFields(payload) })
        });
        if (!res.ok) throw new Error(`REST Error: ${res.statusText}`);
      }

      console.log(`☁️ [AEF Repository] Módulo "${payload.title}" salvo com sucesso em courses/${courseId}/modules/${mid}`);
      return payload;
    }

    async saveLesson(courseId, moduleId, lessonData) {
      if (!courseId || !moduleId || !lessonData || !lessonData.id) throw new Error("CourseId, ModuleId e LessonId obrigatórios.");
      await this.sync.init();
      const lid = lessonData.id;
      const payload = {
        id: lid,
        courseId: courseId,
        moduleId: moduleId,
        type: lessonData.type || (lessonData.quizId ? "quiz" : "lesson"),
        quizId: lessonData.quizId || "",
        title: lessonData.title || "Aula sem título",
        order: parseInt(lessonData.order) || 1,
        videoUrl: lessonData.videoUrl || "",
        audioUrl: lessonData.audioUrl || "",
        pdfUrl: lessonData.pdfUrl || "",
        artworkUrl: lessonData.artworkUrl || "",
        thumbnailUrl: lessonData.thumbnailUrl || "",
        goldenTip: lessonData.goldenTip || "",
        hasTrainingTrack: lessonData.hasTrainingTrack !== false,
        published: lessonData.published !== false,
        rawScript: lessonData.rawScript || "",
        processedContentHtml: lessonData.processedContentHtml || "",
        aiStatus: lessonData.aiStatus || "draft_pending",
        updatedAt: new Date().toISOString()
      };
      if (lessonData.quizData) {
        payload.quizData = typeof lessonData.quizData === "object" ? lessonData.quizData : JSON.parse(lessonData.quizData);
        payload.quizDataJson = JSON.stringify(payload.quizData);
      } else if (lessonData.quizDataJson) {
        payload.quizDataJson = lessonData.quizDataJson;
      }
      if (lessonData.duration) payload.duration = lessonData.duration;
      if (lessonData.activity) payload.activity = lessonData.activity;
      if (lessonData.trainingTrackId) payload.trainingTrackId = lessonData.trainingTrackId;
      if (lessonData.description) payload.description = lessonData.description;
      if (lessonData.sentences && Array.isArray(lessonData.sentences)) {
        payload.sentences = lessonData.sentences.map((s, idx) => ({
          id: s.id || (idx + 1),
          start: parseFloat(s.start) || 0.0,
          end: parseFloat(s.end) || 0.0,
          text: s.text || "",
          spokenTranslation: s.spokenTranslation || s.translation || "",
          notes: s.notes || ""
        }));
      }
      if (lessonData.media && Array.isArray(lessonData.media)) {
        payload.media = lessonData.media;
      }
      if (lessonData.downloads && Array.isArray(lessonData.downloads)) {
        payload.downloads = lessonData.downloads;
      }

      let saved = false;
      if (this.sync.db) {
        try {
          await this.sync.db.collection("courses").doc(courseId).collection("modules").doc(moduleId).collection("lessons").doc(lid).set(payload, { merge: true });
          saved = true;
        } catch (e) {
          console.warn("[AEF Repository] SDK saveLesson error, tentando REST:", e);
        }
      }

      if (!saved) {
        const restUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses/${courseId}/modules/${moduleId}/lessons/${lid}`;
        const res = await fetch(restUrl, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: toFirestoreRestFields(payload) })
        });
        if (!res.ok) throw new Error(`REST Error: ${res.statusText}`);
      }

      console.log(`☁️ [AEF Repository] Lição "${payload.title}" salva com sucesso em courses/${courseId}/modules/${moduleId}/lessons/${lid}`);
      return payload;
    }

    async deleteModule(courseId, moduleId) {
      if (!courseId || !moduleId) return false;
      await this.sync.init();
      let deleted = false;
      if (this.sync.db) {
        try {
          const lessonsSnap = await this.sync.db.collection("courses").doc(courseId).collection("modules").doc(moduleId).collection("lessons").get();
          const batch = this.sync.db.batch();
          lessonsSnap.forEach(doc => batch.delete(doc.ref));
          batch.delete(this.sync.db.collection("courses").doc(courseId).collection("modules").doc(moduleId));
          await batch.commit();
          deleted = true;
        } catch (e) {
          console.warn("[AEF Repository] Erro ao deletar módulo via SDK, tentando REST:", e);
        }
      }
      if (!deleted) {
        try {
          const restUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses/${courseId}/modules/${moduleId}`;
          const res = await fetch(restUrl, { method: "DELETE" });
          deleted = res.ok;
        } catch (re) {
          console.warn("[AEF Repository] Erro ao deletar módulo via REST:", re);
        }
      }
      return deleted;
    }

    async deleteLesson(courseId, moduleId, lessonId) {
      if (!courseId || !moduleId || !lessonId) return false;
      await this.sync.init();
      let deleted = false;
      if (this.sync.db) {
        try {
          await this.sync.db.collection("courses").doc(courseId).collection("modules").doc(moduleId).collection("lessons").doc(lessonId).delete();
          deleted = true;
        } catch (e) {
          console.warn("[AEF Repository] Erro ao deletar lição via SDK, tentando REST:", e);
        }
      }
      if (!deleted) {
        try {
          const restUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`;
          const res = await fetch(restUrl, { method: "DELETE" });
          deleted = res.ok;
        } catch (re) {
          console.warn("[AEF Repository] Erro ao deletar lição via REST:", re);
        }
      }
      return deleted;
    }
  }

  // =========================================================================
  // USER REPOSITORY (Padrão de Repositório Explícito & Fim do Merge Silencioso)
  // =========================================================================
  class UserRepository {
    constructor(cloudSync) {
      this.sync = cloudSync;
    }

    /**
     * Obtém o perfil completo de um usuário.
     * Hierarquia Determinística:
     * - Prioridade 1: Documento remoto no Firestore (SDK + REST).
     * - Fallback 2: Cache local (localStorage) com log explícito.
     * Saída normalizada para AEFUser V2 (normalizeUserToV2).
     */
    async getUser(userId) {
      if (!userId) return null;
      await this.sync.init();

      let remoteUser = null;
      let remoteSuccess = false;

      // 1. PRIORIDADE 1: Firestore Remoto (SDK)
      if (this.sync.db) {
        try {
          const doc = await Promise.race([
            this.sync.db.collection("users").doc(userId).get(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout on user.get()")), 5000))
          ]);
          if (doc.exists) {
            remoteUser = { id: doc.id, uid: doc.id, ...doc.data() };
            remoteSuccess = true;
          }
        } catch (err) {
          console.warn(`[AEF Repository] SDK falhou para usuário "${userId}", tentando REST:`, err);
        }
      }

      // 2. PRIORIDADE 1 (continuação): REST Fallback
      if (!remoteSuccess) {
        try {
          const restUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/users/${userId}`;
          const res = await fetch(restUrl);
          if (res.ok) {
            const data = await res.json();
            if (data && data.fields) {
              remoteUser = parseRestDoc(data, userId);
              remoteSuccess = true;
            }
          }
        } catch (e) {}
      }

      // 3. SELEÇÃO DETERMINÍSTICA
      if (remoteSuccess && remoteUser) {
        try {
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(`aef_user_cache_${userId}`, JSON.stringify(remoteUser));
          }
        } catch (e) {}
        return normalizeUserSafe(remoteUser);
      }

      // 4. FALLBACK 2: Cache Local com advertência explícita
      console.warn(`[AEF Repository] Usando dados locais de fallback para: perfil do usuário "${userId}"`);
      let cached = null;
      try {
        if (typeof localStorage !== "undefined") {
          const raw = localStorage.getItem(`aef_user_cache_${userId}`) || localStorage.getItem("aef_user_profile");
          if (raw) cached = JSON.parse(raw);
        }
      } catch (e) {}

      if (cached) {
        return normalizeUserSafe(cached);
      }

      return null;
    }

    /**
     * Obtém todos os usuários para administração e CRM.
     */
    async getAllUsers() {
      await this.sync.init();
      let users = [];
      let remoteSuccess = false;

      if (this.sync.db) {
        try {
          const snap = await Promise.race([
            this.sync.db.collection("users").get(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 6000))
          ]);
          if (!snap.empty) {
            snap.forEach(doc => {
              users.push({ id: doc.id, uid: doc.id, ...doc.data() });
            });
            remoteSuccess = true;
          }
        } catch (e) {
          console.warn("[AEF Repository] SDK falhou em getAllUsers, tentando REST:", e);
        }
      }

      if (!remoteSuccess) {
        try {
          const res = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/users?pageSize=300`);
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.documents)) {
              users = data.documents.map(d => parseRestDoc(d, d.name.split("/").pop()));
              remoteSuccess = true;
            }
          }
        } catch (e) {}
      }

      if (remoteSuccess && users.length > 0) {
        try {
          if (typeof localStorage !== "undefined") {
            localStorage.setItem("aef_all_users_cache", JSON.stringify(users));
          }
        } catch (e) {}
        return users.map(normalizeUserSafe);
      }

      console.warn("[AEF Repository] Usando dados locais de fallback para: lista de usuários");
      try {
        if (typeof localStorage !== "undefined") {
          const raw = localStorage.getItem("aef_all_users_cache");
          if (raw) {
            const cached = JSON.parse(raw);
            if (Array.isArray(cached)) return cached.map(normalizeUserSafe);
          }
        }
      } catch (e) {}

      return [];
    }

    /**
     * Obtém tanto usuários gerais quanto mentorados VIP (students collection).
     */
    async getAllStudentsAndMentees() {
      await this.sync.init();
      const results = { users: [], vipMentees: [] };
      let remoteSuccess = false;

      const hasAuth = Boolean(window.firebase?.auth()?.currentUser);
      let idToken = null;
      if (window.aefPortalAuth) {
        try {
          idToken = await window.aefPortalAuth.getIdToken();
        } catch (tokErr) {}
      }

      if (this.sync.db && (hasAuth || idToken)) {
        try {
          const [usersSnap, menteesSnap] = await Promise.all([
            this.sync.db.collection("users").get(),
            this.sync.db.collection("students").get()
          ]);
          if (!usersSnap.empty || !menteesSnap.empty) {
            usersSnap.forEach(doc => {
              results.users.push(normalizeUserSafe({ id: doc.id, uid: doc.id, ...doc.data() }));
            });
            menteesSnap.forEach(doc => {
              results.vipMentees.push(normalizeUserSafe({ id: doc.id, uid: doc.id, ...doc.data() }));
            });
            remoteSuccess = true;
          }
        } catch (e) {
          console.warn("[AEF Repository] SDK falhou em getAllStudentsAndMentees, tentando REST:", e);
        }
      }

      if (!remoteSuccess && idToken) {
        try {
          const adminApiRes = await fetch("/api/admin/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${idToken}`
            },
            body: JSON.stringify({ action: "list_users", pageSize: 300 })
          });
          if (adminApiRes.ok) {
            const apiData = await adminApiRes.json();
            if (apiData && Array.isArray(apiData.users)) {
              results.users = apiData.users.map(normalizeUserSafe);
              results.vipMentees = (apiData.vipMentees || []).map(normalizeUserSafe);
              remoteSuccess = true;
            }
          }
        } catch (apiErr) {
          console.warn("[AEF Repository] Falha ao listar via /api/admin/users:", apiErr);
        }
      }

      if (!remoteSuccess && idToken) {
        try {
          const headers = { "Authorization": `Bearer ${idToken}` };
          const keyParam = FIREBASE_CONFIG.apiKey ? `&key=${FIREBASE_CONFIG.apiKey}` : '';
          const [uRes, mRes] = await Promise.all([
            fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/users?pageSize=300${keyParam}`, { headers }),
            fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/students?pageSize=300${keyParam}`, { headers })
          ]);
          if (uRes.ok) {
            const uData = await uRes.json();
            if (uData && Array.isArray(uData.documents)) {
              results.users = uData.documents.map(d => normalizeUserSafe(parseRestDoc(d, d.name.split("/").pop())));
              remoteSuccess = true;
            }
          }
          if (mRes.ok) {
            const mData = await mRes.json();
            if (mData && Array.isArray(mData.documents)) {
              results.vipMentees = mData.documents.map(d => normalizeUserSafe(parseRestDoc(d, d.name.split("/").pop())));
              remoteSuccess = true;
            }
          }
        } catch (e) {}
      }

      if (remoteSuccess) {
        return results;
      }

      console.warn("[AEF Repository] Usando dados locais de fallback para: lista de alunos e mentorados VIP");
      return results;
    }

    /**
     * Salva ou atualiza um usuário no Firestore e sincroniza cache local.
     */
    async saveUser(userData) {
      if (!userData || (!userData.uid && !userData.id)) throw new Error("ID do usuário obrigatório.");
      await this.sync.init();
      const uid = userData.uid || userData.id;
      const normalized = normalizeUserSafe({ ...userData, uid, id: uid });
      normalized.updatedAt = new Date().toISOString();

      let saved = false;

      // 1. Roteamento Server-Side via Cloudflare Worker (/api/admin/users) sob política Zero Trust
      const workerBase = (typeof window !== "undefined" && window.AEF_WORKER_URL)
        || "https://agoraeufalo-webhook-hotmart.selexenglish.workers.dev";

      let idToken = null;
      let requesterEmail = null;
      try {
        if (typeof window !== "undefined" && window.firebase && window.firebase.auth && window.firebase.auth().currentUser) {
          const current = window.firebase.auth().currentUser;
          requesterEmail = current.email;
          if (typeof current.getIdToken === "function") {
            idToken = await current.getIdToken();
          }
        }
      } catch (e) {}

      try {
        const res = await fetch(`${workerBase}/api/admin/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(idToken ? { "Authorization": `Bearer ${idToken}` } : {})
          },
          body: JSON.stringify({
            userId: uid,
            userData: normalized,
            requesterEmail: requesterEmail
          })
        });

        if (res.ok) {
          const json = await res.json();
          if (json && json.user) {
            saved = true;
          }
        } else {
          console.warn("[AEF Repository] [AEF Admin] Resposta não-ok do worker /api/admin/users:", res.status);
        }
      } catch (err) {
        // Falha de rede ou ambiente sem worker
        console.warn("[AEF Repository] [AEF Admin] Erro ao chamar worker /api/admin/users:", err.message || err);
      }

      // 2. Se falhar no worker e houver SDK disponível (ex: testes ou mock de ambiente)
      if (!saved && this.sync.db) {
        try {
          await this.sync.db.collection("users").doc(uid).set(normalized, { merge: true });
          saved = true;
        } catch (e) {
          console.warn("[AEF Repository] SDK saveUser erro:", e.message || e);
        }
      }

      if (!saved) {
        console.warn("[AEF Repository] Usando fallback local para persistência de usuário:", uid);
      }

      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(`aef_user_cache_${uid}`, JSON.stringify(normalized));
        }
      } catch (e) {}

      return normalized;
    }
  }

  class AEFCloudSync {
    constructor() {
      this.isInitialized = false;
      this.app = null;
      this.db = null;
      this.storage = null;
      this.initPromise = null;

      // Camada de Repositórios Explícitos (Fase 4.1)
      this.courseRepository = new CourseRepository(this);
      this.userRepository = new UserRepository(this);
    }

    async init() {
      if (this.isInitialized) return true;
      if (this.initPromise) return this.initPromise;

      this.initPromise = new Promise(async (resolve) => {
        try {
          if (!window.firebase) {
            await this.loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
            await this.loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js");
            await this.loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-storage-compat.js");
          }

          if (window.firebase) {
            if (!window.firebase.apps || !window.firebase.apps.length) {
              this.app = window.firebase.initializeApp(FIREBASE_CONFIG);
            } else {
              this.app = window.firebase.app();
            }

            this.db = window.firebase.firestore();
            if (window.firebase.storage) {
              this.storage = window.firebase.storage();
            }
            this.isInitialized = true;
            console.log("☁️ [AEFCloudSync] Conectado com sucesso ao Firebase / Firestore.");
          }
          resolve(true);
        } catch (err) {
          console.warn("⚠️ [AEFCloudSync] Erro ao inicializar Firebase compat:", err);
          resolve(true); // Always resolve so REST fallbacks work
        }
      });

      return this.initPromise;
    }

    loadScript(src) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
        document.head.appendChild(script);
      });
    }

    /**
     * Publishes a synthesized audio track to Firestore & IndexedDB
     */
    async publishTrackToCloud(trackData, studentIds = ["public"]) {
      await this.init();
      const results = [];
      const timestamp = new Date().toISOString();

      // Normalize arguments (supports both (track, ids) and ({studentId, track}))
      let realTrack = trackData;
      let targetIds = studentIds;

      if (trackData && trackData.track) {
        realTrack = trackData.track;
        targetIds = trackData.studentId ? [trackData.studentId] : (trackData.studentIds || studentIds);
      } else if (typeof studentIds === 'string') {
        targetIds = [studentIds];
      }

      for (const studentId of targetIds) {
        const payload = {
          id: realTrack.id || `track_${Date.now()}`,
          title: realTrack.title || "Treino de Reflexo Oral",
          duration: realTrack.duration || "00:30",
          coverImage: realTrack.coverImage || "assets/images/cover-default-aef.jpg",
          audioUrl: realTrack.audioUrl || "",
          videoUrl: realTrack.videoUrl || "",
          summary: realTrack.summary || "",
          goldenTip: realTrack.goldenTip || "",
          status: realTrack.status || "active",
          assignedTo: [studentId],
          sentences: (realTrack.sentences || []).map((s) => ({
            id: s.id || 1,
            start: parseFloat(s.start) || 0.0,
            end: parseFloat(s.end) || 0.0,
            text: s.text || "",
            spokenTranslation: s.spokenTranslation || "",
            notes: s.notes || ""
          })),
          updatedAt: timestamp,
          publishedTimestamp: Date.now()
        };

        try {
          if (this.db) {
            await this.db
              .collection("students")
              .doc(studentId)
              .collection("tracks")
              .doc(payload.id)
              .set(payload, { merge: true });
          } else {
            // REST Fallback for Firestore
            const restUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/students/${studentId}/tracks/${payload.id}`;
            await fetch(restUrl, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fields: {
                  id: { stringValue: payload.id },
                  title: { stringValue: payload.title },
                  duration: { stringValue: payload.duration },
                  audioUrl: { stringValue: payload.audioUrl },
                  videoUrl: { stringValue: payload.videoUrl },
                  coverImage: { stringValue: payload.coverImage },
                  summary: { stringValue: payload.summary },
                  goldenTip: { stringValue: payload.goldenTip },
                  status: { stringValue: payload.status },
                  assignedTo: { arrayValue: { values: [{ stringValue: studentId }] } },
                  sentences: {
                    arrayValue: {
                      values: (payload.sentences || []).map(s => ({
                        mapValue: {
                          fields: {
                            id: { integerValue: s.id || 1 },
                            start: { doubleValue: parseFloat(s.start) || 0.0 },
                            end: { doubleValue: parseFloat(s.end) || 0.0 },
                            text: { stringValue: s.text || "" },
                            spokenTranslation: { stringValue: s.spokenTranslation || "" },
                            notes: { stringValue: s.notes || "" }
                          }
                        }
                      }))
                    }
                  },
                  updatedAt: { stringValue: timestamp }
                }
              })
            });
          }
          console.log(`☁️ [AEFCloudSync] Faixa "${payload.title}" publicada com sucesso em students/${studentId}/tracks/${payload.id}`);
          results.push({ studentId, success: true, trackId: payload.id });
        } catch (err) {
          console.error(`❌ [AEFCloudSync] Erro ao publicar para ${studentId}:`, err);
          results.push({ studentId, success: false, error: err.message });
        }
      }

      return results;
    }

    /**
     * Gets all published tracks for a student from Firestore (with REST API fallback)
     */
    async getStudentCloudTracks(studentId) {
      studentId = (studentId || "public").toLowerCase().trim();
      await this.init();

      try {
        if (this.db) {
          const snapshot = await this.db.collection("students").doc(studentId).collection("tracks").get();
          if (!snapshot.empty) {
            const tracks = [];
            snapshot.forEach(doc => {
              const data = doc.data();
              if (data && data.status !== 'archived') {
                tracks.push(data);
              }
            });
            return tracks;
          }
        }

        // REST Fallback for Firestore
        const restUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/students/${studentId}/tracks`;
        const res = await fetch(restUrl);
        if (!res.ok) return [];
        const data = await res.json();
        if (!data.documents || data.documents.length === 0) return [];

        return data.documents.map(d => {
          const f = d.fields || {};
          const sentences = (f.sentences?.arrayValue?.values || []).map(sv => {
            const sf = sv.mapValue?.fields || {};
            return {
              id: parseInt(sf.id?.integerValue || sf.id?.stringValue || "1"),
              start: parseFloat(sf.start?.doubleValue || sf.start?.stringValue || "0"),
              end: parseFloat(sf.end?.doubleValue || sf.end?.stringValue || "0"),
              text: sf.text?.stringValue || "",
              spokenTranslation: sf.spokenTranslation?.stringValue || sf.translation?.stringValue || ""
            };
          });

          return {
            id: f.id?.stringValue || d.name.split("/").pop(),
            title: f.title?.stringValue || "Sem Título",
            duration: f.duration?.stringValue || "00:00",
            audioUrl: f.audioUrl?.stringValue || "",
            videoUrl: f.videoUrl?.stringValue || "",
            coverImage: f.coverImage?.stringValue || "../assets/images/cover-default-aef.jpg",
            summary: f.summary?.stringValue || "",
            goldenTip: f.goldenTip?.stringValue || "",
            status: f.status?.stringValue || "active",
            sentences: sentences
          };
        });
      } catch (err) {
        console.warn(`⚠️ [AEFCloudSync] Não foi possível obter faixas da nuvem para ${studentId}:`, err);
        return [];
      }
    }

    /**
     * Tier 3 & Admin: Gets all VIP Mentee Profiles from students collection
     */
    async getAllMentees() {
      await this.init();
      try {
        if (this.db) {
          const snapshot = await this.db.collection("students").get();
          if (!snapshot.empty) {
            const mentees = [];
            for (const doc of snapshot.docs) {
              const data = doc.data();
              if (doc.id !== 'public' && data.status !== 'archived') {
                // Get tracks count
                let tracksCount = 0;
                try {
                  const tracksSnap = await this.db.collection("students").doc(doc.id).collection("tracks").get();
                  tracksCount = tracksSnap.size;
                } catch (te) {}

                mentees.push({
                  id: doc.id,
                  name: data.name || doc.id,
                  email: data.email || `${doc.id}@agoraeufalo.com.br`,
                  badge: data.badge || "VIP Mentee",
                  subtitle: data.subtitle || "Treino Personalizado",
                  tier: data.tier || "vip_mentorship",
                  avatarEmoji: data.avatarEmoji || "👑",
                  avatarBg: data.avatarBg || "bg-amber-500/10 text-amber-500 border-amber-500/20",
                  tracksCount: tracksCount,
                  updatedAt: data.updatedAt || ""
                });
              }
            }
            return mentees;
          }
        }
      } catch (err) {
        console.warn("⚠️ [AEFCloudSync] Erro ao buscar lista de mentorados:", err);
      }
      return [];
    }

    /**
     * Tier 3: Saves a personalized VIP Audio Track for a mentee
     */
    async saveVIPPrescriptionTrack(menteeId, trackData) {
      if (!menteeId) throw new Error("ID do mentorado obrigatório.");
      await this.init();
      const trackId = trackData.id || `track_${Date.now()}`;
      const payload = {
        ...trackData,
        id: trackId,
        assignedTo: [menteeId],
        status: trackData.status || "active",
        updatedAt: new Date().toISOString()
      };
      if (this.db) {
        await this.db.collection("students").doc(menteeId).collection("tracks").doc(trackId).set(payload, { merge: true });
      }
      return payload;
    }

    /**
     * Tier 3: Deletes a VIP prescription track
     */
    async deleteVIPTrack(menteeId, trackId) {
      if (!menteeId || !trackId) return false;
      await this.init();
      if (this.db) {
        await this.db.collection("students").doc(menteeId).collection("tracks").doc(trackId).delete();
        return true;
      }
      return false;
    }


    /**
     * Tier 1: Gets all Leo's Suggestions tracks from suggestions collection
     */
    async getSuggestionsTracks() {
      await this.init();
      try {
        if (this.db) {
          const snapshot = await this.db.collection("suggestions").get();
          if (!snapshot.empty) {
            const tracks = [];
            snapshot.forEach(doc => {
              const data = doc.data();
              if (data && data.status !== 'archived') {
                tracks.push(data);
              }
            });
            return tracks.sort((a, b) => (a.order || 0) - (b.order || 0));
          }
        }

        const restUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/suggestions`;
        const res = await fetch(restUrl);
        if (!res.ok) return [];
        const data = await res.json();
        if (!data.documents || data.documents.length === 0) return [];

        return data.documents.map(d => {
          const f = d.fields || {};
          const sentences = (f.sentences?.arrayValue?.values || []).map(sv => {
            const sf = sv.mapValue?.fields || {};
            return {
              id: parseInt(sf.id?.integerValue || sf.id?.stringValue || "1"),
              start: parseFloat(sf.start?.doubleValue || sf.start?.stringValue || "0"),
              end: parseFloat(sf.end?.doubleValue || sf.end?.stringValue || "0"),
              text: sf.text?.stringValue || "",
              spokenTranslation: sf.spokenTranslation?.stringValue || sf.translation?.stringValue || ""
            };
          });

          return {
            id: f.id?.stringValue || d.name.split("/").pop(),
            title: f.title?.stringValue || "Sugestão do Leo",
            duration: f.duration?.stringValue || "00:00",
            audioUrl: f.audioUrl?.stringValue || "",
            videoUrl: f.videoUrl?.stringValue || "",
            coverImage: f.coverImage?.stringValue || "../assets/images/cover-default-aef.jpg",
            summary: f.summary?.stringValue || "",
            goldenTip: f.goldenTip?.stringValue || "",
            status: f.status?.stringValue || "active",
            order: parseInt(f.order?.integerValue || "0"),
            sentences: sentences
          };
        });
      } catch (err) {
        console.warn("⚠️ [AEFCloudSync] Erro ao carregar Sugestões do Leo:", err);
        return [];
      }
    }

    /**
     * Tier 1: Publishes or updates a track in the suggestions collection
     */
    async publishSuggestionTrack(trackData) {
      await this.init();
      const trackId = trackData.id || `sug_${Date.now()}`;
      const payload = {
        ...trackData,
        id: trackId,
        published: true,
        updatedAt: new Date().toISOString()
      };
      if (this.db) {
        await this.db.collection("suggestions").doc(trackId).set(payload, { merge: true });
      }
      return payload;
    }

    /**
     * Tier 2: Gets course training tracks for an enrolled student
     */
    async getCourseTracks(userId) {
      if (!userId) return [];
      await this.init();
      try {
        if (this.db) {
          const snapshot = await this.db.collection("users").doc(userId).collection("course_tracks").get();
          if (!snapshot.empty) {
            const tracks = [];
            snapshot.forEach(doc => {
              const data = doc.data();
              if (data && data.status !== 'archived') {
                tracks.push(data);
              }
            });
            return tracks;
          }
        }
        return [];
      } catch (err) {
        console.warn("⚠️ [AEFCloudSync] Erro ao carregar faixas de cursos:", err);
        return [];
      }
    }

    /**
     * Tier 2: Publishes a course track to a student's course_tracks collection
     */
    /**
     * Publish a new lesson from TTS Studio directly into the Course Hierarchy
     */
    async publishLessonToCourse(courseId, moduleId, trackData) {
      await this.init();
      if (!courseId || !moduleId) throw new Error("Course ID and Module ID are required");
      const lessonId = trackData.id || `les_${Date.now()}`;
      const payload = {
        ...trackData,
        id: lessonId,
        published: true,
        updatedAt: new Date().toISOString()
      };
      if (this.db) {
        await this.db
          .collection("courses").doc(courseId)
          .collection("modules").doc(moduleId)
          .collection("lessons").doc(lessonId)
          .set(payload, { merge: true });
      } else {
        console.warn("[AEFCloudSync] Fallback REST para salvar lesson...");
        const restUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}?`;
        const fields = {};
        for (const [k, v] of Object.entries(payload)) {
          if (v === undefined) continue;
          if (k === 'media' && Array.isArray(v)) {
            fields[k] = {
              arrayValue: {
                values: v.map(m => {
                  const mf = {
                    type: { stringValue: m.type || 'video_youtube' },
                    url: { stringValue: m.url || '' },
                    title: { stringValue: m.title || '' }
                  };
                  if (m.durationStr) mf.durationStr = { stringValue: m.durationStr };
                  if (m.thumbnailUrl) mf.thumbnailUrl = { stringValue: m.thumbnailUrl };
                  return { mapValue: { fields: mf } };
                })
              }
            };
          } else if (k === 'sentences' && Array.isArray(v)) {
            fields[k] = {
              arrayValue: {
                values: v.map(s => {
                  const sf = {
                    start: { doubleValue: s.start || 0 },
                    text: { stringValue: s.text || '' },
                    speaker: { stringValue: s.speaker || '' }
                  };
                  if (s.spokenTranslation) sf.spokenTranslation = { stringValue: s.spokenTranslation };
                  if (s.notes) sf.notes = { stringValue: s.notes };
                  return { mapValue: { fields: sf } };
                })
              }
            };
          } else if (k === 'assignedTo' && Array.isArray(v)) {
             fields[k] = { arrayValue: { values: v.map(str => ({ stringValue: str })) } };
          } else if (typeof v === 'boolean') {
            fields[k] = { booleanValue: v };
          } else if (typeof v === 'number') {
            fields[k] = { doubleValue: v };
          } else if (typeof v === 'string') {
            fields[k] = { stringValue: v };
          }
        }
        await fetch(restUrl + "updateMask.fieldPaths=" + Object.keys(fields).join("&updateMask.fieldPaths="), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: restUrl.split('?')[0].replace('https://firestore.googleapis.com/v1/', ''), fields: fields })
        });
      }
      return payload;
    }

    async publishCourseTrack(userId, trackData) {
      if (!userId) throw new Error("ID do usuário obrigatório.");
      await this.init();
      const trackId = trackData.id || `course_track_${Date.now()}`;
      const payload = {
        ...trackData,
        id: trackId,
        updatedAt: new Date().toISOString()
      };
      if (this.db) {
        await this.db.collection("users").doc(userId).collection("course_tracks").doc(trackId).set(payload, { merge: true });
      }
      return payload;
    }

    /**
     * Minhas Coisas: Gets custom tracks imported by a student
     */
    async getCustomTracks(userId) {
      if (!userId) return [];
      await this.init();
      try {
        if (this.db) {
          const snapshot = await this.db.collection("users").doc(userId).collection("custom_tracks").get();
          if (!snapshot.empty) {
            const tracks = [];
            snapshot.forEach(doc => {
              const data = doc.data();
              if (data && data.status !== 'archived') {
                tracks.push(data);
              }
            });
            return tracks;
          }
        }
        return [];
      } catch (err) {
        console.warn("⚠️ [AEFCloudSync] Erro ao carregar Minhas Coisas:", err);
        return [];
      }
    }

    /**
     * Minhas Coisas: Publishes a custom track with quota validation (1 for Free, unlimited for Pro/VIP)
     */
    async publishCustomTrack(userId, trackData, userTier = 'free') {
      if (!userId) throw new Error("ID do usuário obrigatório.");
      await this.init();
      
      // Check quota for Free users
      if (userTier === 'free') {
        const existing = await this.getCustomTracks(userId);
        if (existing.length >= 1 && !existing.some(t => t.id === trackData.id)) {
          throw new Error("QUOTA_EXCEEDED: Usuários gratuitos podem manter 1 treino ativo no Minhas Coisas. Assine o Pro para treinos ilimitados!");
        }
      }

      const trackId = trackData.id || `custom_${Date.now()}`;
      const payload = {
        ...trackData,
        id: trackId,
        updatedAt: new Date().toISOString()
      };
      if (this.db) {
        await this.db.collection("users").doc(userId).collection("custom_tracks").doc(trackId).set(payload, { merge: true });
      }
      return payload;
    }

    /**
     * Minhas Coisas: Deletes a custom track
     */
    async deleteCustomTrack(userId, trackId) {
      if (!userId || !trackId) return false;
      await this.init();
      if (this.db) {
        await this.db.collection("users").doc(userId).collection("custom_tracks").doc(trackId).delete();
        return true;
      }
      return false;
    }

    /**
     * Subscribes to real-time track updates for a student
     */
    subscribeToStudentTracks(studentId, callback) {
      studentId = (studentId || "public").toLowerCase().trim();
      this.init().then(() => {
        if (this.db) {
          try {
            return this.db.collection("students").doc(studentId).collection("tracks").onSnapshot(snapshot => {
              const tracks = [];
              snapshot.forEach(doc => {
                const data = doc.data();
                if (data && data.status !== 'archived') {
                  tracks.push(data);
                }
              });
              if (callback) callback(tracks);
            }, err => {
              console.warn("⚠️ Firestore onSnapshot warning:", err);
            });
          } catch (e) {
            console.warn("Could not attach Firestore onSnapshot:", e);
          }
        }
      });
    }

    /**
     * Uploads any generic media file (Video MP4, Audio MP3, Image, PDF) directly to Google Cloud Storage.
     * Uses resilient REST API with XHR progress monitoring.
     * @param {File|Blob} file 
     * @param {string} folder e.g. "videos/public", "audio/students"
     * @param {function} onProgress callback with percentage (0 to 100)
     * @returns {Promise<string>} Download URL from Google Cloud
     */
    async uploadFileToStorage(file, folder = "uploads", onProgress = null) {
      if (!file) throw new Error("Nenhum arquivo selecionado para upload.");

      const filename = `${Date.now()}_${file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, "_") : "media.bin"}`;
      const filePath = `${folder}/${filename}`;
      const encodedName = encodeURIComponent(filePath);
      const bucket = FIREBASE_CONFIG.storageBucket;
      const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodedName}`;

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl, true);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

        if (xhr.upload && onProgress) {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100);
              onProgress(pct);
            }
          };
        }

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 201) {
            if (onProgress) onProgress(100);
            const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedName}?alt=media`;
            console.log("☁️ [AEFCloudSync] Arquivo enviado com sucesso para a Nuvem:", downloadUrl);
            resolve(downloadUrl);
          } else {
            console.error("❌ [AEFCloudSync] Erro HTTP no upload:", xhr.status, xhr.responseText);
            reject(new Error(`Erro HTTP ${xhr.status} no envio para a nuvem.`));
          }
        };

        xhr.onerror = () => {
          console.error("❌ [AEFCloudSync] Erro de rede durante o upload.");
          reject(new Error("Falha de conexão com o Google Cloud Storage."));
        };

        xhr.send(file);
      });
    }

    /**
     * Deletes a file permanently from Google Cloud Storage
     * @param {string} fileUrl Full Firebase Storage URL or relative path
     * @returns {Promise<boolean>}
     */
    async deleteFileFromStorage(fileUrl) {
      if (!fileUrl) return false;
      const bucket = FIREBASE_CONFIG.storageBucket;
      
      let encodedName = "";
      if (fileUrl.includes(`/b/${bucket}/o/`)) {
        const parts = fileUrl.split(`/b/${bucket}/o/`)[1];
        encodedName = parts.split("?")[0];
      } else if (fileUrl.startsWith("http")) {
        const match = fileUrl.match(/\/o\/([^?]+)/);
        if (match) encodedName = match[1];
      } else {
        encodedName = encodeURIComponent(fileUrl);
      }

      if (!encodedName) return false;

      const deleteUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedName}`;
      try {
        const res = await fetch(deleteUrl, { method: "DELETE" });
        if (res.ok || res.status === 404 || res.status === 204) {
          console.log(`☁️ [AEFCloudSync] Arquivo "${decodeURIComponent(encodedName)}" excluído do Google Cloud Storage com sucesso!`);
          return true;
        } else {
          console.warn(`[AEFCloudSync] Delete storage status: ${res.status}`);
          return false;
        }
      } catch (err) {
        console.warn("[AEFCloudSync] Erro ao deletar arquivo do Storage:", err);
        return false;
      }
    }

    /**
     * Records listening time seconds and calculates streaks (Local + Firestore)
     */
    async recordListeningSession(studentId, additionalSeconds) {
      if (!additionalSeconds || additionalSeconds <= 0) return null;
      studentId = (studentId || "public").toLowerCase().trim();
      const storageKey = `aef_listening_stats_${studentId}`;
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];

      let stats = {
        todaySeconds: 0,
        weekSeconds: 0,
        monthSeconds: 0,
        totalSeconds: 0,
        lastTrainedDate: todayStr,
        streakDays: 1,
        updatedAt: now.toISOString()
      };

      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.lastTrainedDate === todayStr) {
            stats.todaySeconds = (parsed.todaySeconds || 0) + additionalSeconds;
            stats.weekSeconds = (parsed.weekSeconds || 0) + additionalSeconds;
            stats.monthSeconds = (parsed.monthSeconds || 0) + additionalSeconds;
            stats.totalSeconds = (parsed.totalSeconds || 0) + additionalSeconds;
            stats.streakDays = parsed.streakDays || 1;
          } else {
            // New day
            const prevDate = new Date(parsed.lastTrainedDate || 0);
            const diffDays = Math.round((now - prevDate) / (1000 * 60 * 60 * 24));
            
            stats.todaySeconds = additionalSeconds;
            stats.weekSeconds = (diffDays <= 7 ? (parsed.weekSeconds || 0) : 0) + additionalSeconds;
            stats.monthSeconds = (diffDays <= 30 ? (parsed.monthSeconds || 0) : 0) + additionalSeconds;
            stats.totalSeconds = (parsed.totalSeconds || 0) + additionalSeconds;
            stats.streakDays = diffDays === 1 ? (parsed.streakDays || 0) + 1 : 1;
          }
        } else {
          stats.todaySeconds = additionalSeconds;
          stats.weekSeconds = additionalSeconds;
          stats.monthSeconds = additionalSeconds;
          stats.totalSeconds = additionalSeconds;
          stats.streakDays = 1;
        }
      } catch (e) {
        console.warn("Error parsing local listening stats:", e);
      }

      stats.lastTrainedDate = todayStr;
      stats.updatedAt = now.toISOString();
      localStorage.setItem(storageKey, JSON.stringify(stats));

      // Sincroniza em background com Firestore
      this.init().then(() => {
        if (this.db) {
          this.db.collection("students").doc(studentId).collection("stats").doc("listening").set(stats, { merge: true }).catch(err => {
            console.warn("Could not sync listening stats to Firestore:", err);
          });
        }
      });

      return stats;
    }

    /**
     * Retrieves listening telemetry stats
     */
    async getListeningStats(studentId) {
      studentId = (studentId || "public").toLowerCase().trim();
      const storageKey = `aef_listening_stats_${studentId}`;
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];

      let localStats = null;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) localStats = JSON.parse(saved);
      } catch (e) {}

      if (!localStats) {
        localStats = {
          todaySeconds: 0,
          weekSeconds: 0,
          monthSeconds: 0,
          totalSeconds: 0,
          lastTrainedDate: todayStr,
          streakDays: 0
        };
      }

      // Check if day changed
      if (localStats.lastTrainedDate !== todayStr) {
        localStats.todaySeconds = 0;
      }

      return localStats;
    }

    /**
     * Records a mastered phrase into the student's active repertoire
     */
    async recordRepertoirePhrase(studentId, phraseData) {
      studentId = (studentId || "public").toLowerCase().trim();
      if (!phraseData || !phraseData.text) return;
      const storageKey = `aef_repertoire_${studentId}`;

      let list = [];
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) list = JSON.parse(saved);
      } catch (e) {}

      const cleanText = phraseData.text.trim();
      const existingIdx = list.findIndex(p => p.text.toLowerCase() === cleanText.toLowerCase());

      const item = {
        id: phraseData.id || `chunk_${Date.now()}`,
        text: cleanText,
        spokenTranslation: phraseData.spokenTranslation || "",
        audioUrl: phraseData.audioUrl || "",
        trackTitle: phraseData.trackTitle || "Treino AgoraEuFalo",
        masteredAt: new Date().toISOString(),
        timesPracticed: existingIdx >= 0 ? (list[existingIdx].timesPracticed || 1) + 1 : 1,
        isFavorite: existingIdx >= 0 ? !!list[existingIdx].isFavorite : false
      };

      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...item };
      } else {
        list.unshift(item);
      }

      localStorage.setItem(storageKey, JSON.stringify(list));

      // Sincroniza com Firestore
      this.init().then(() => {
        if (this.db) {
          const docId = item.text.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 40) || `p_${Date.now()}`;
          this.db.collection("students").doc(studentId).collection("repertoire").doc(docId).set(item, { merge: true }).catch(err => {
            console.warn("Could not sync repertoire to Firestore:", err);
          });
        }
      });

      return list;
    }

    /**
     * Gets all phrases from the student's repertoire
     */
    getRepertoirePhrases(studentId) {
      studentId = (studentId || "public").toLowerCase().trim();
      const storageKey = `aef_repertoire_${studentId}`;
      try {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }

    /**
     * Toggles favorite status on a repertoire phrase
     */
    toggleFavoritePhrase(studentId, phraseText) {
      studentId = (studentId || "public").toLowerCase().trim();
      const storageKey = `aef_repertoire_${studentId}`;
      let list = this.getRepertoirePhrases(studentId);
      const idx = list.findIndex(p => p.text === phraseText);
      if (idx >= 0) {
        list[idx].isFavorite = !list[idx].isFavorite;
        localStorage.setItem(storageKey, JSON.stringify(list));
      }
      return list;
    }

    /**
     * Sends transactional emails via Resend API / Cloud Function Trigger
     * Supports: magic_link, new_vip_track, new_course_module, forum_reply, meet_reminder, streak_milestone, hotmart_welcome
     */
    async sendTransactionalEmail(triggerEvent, payload) {
      console.log(`📨 [AEFCloudSync] Disparando e-mail transacional (${triggerEvent}) para ${payload.email}`);
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer re_aef_live_transacional"
          },
          body: JSON.stringify({
            from: "Professor Leonardo Leite <contato@agoraeufalo.com.br>",
            to: [payload.email],
            subject: payload.subject,
            html: payload.html
          })
        });
        return await response.json();
      } catch (err) {
        console.warn("⚠️ [AEFCloudSync] Simulação de envio de e-mail transacional local:", triggerEvent, payload);
        return { success: true, simulated: true };
      }
    }

    /**
     * Publishes a new topic to the community forum
     */
    async publishCommunityPost(authorData, text, mediaUrl = "") {
      await this.init();
      const post = {
        id: `post_${Date.now()}`,
        authorName: authorData.name || "Aluno AgoraEuFalo",
        authorEmail: authorData.email || "",
        authorRole: authorData.role || "aluno",
        text: text.trim(),
        mediaUrl: mediaUrl || "",
        likes: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString()
      };

      if (this.db) {
        await this.db.collection("community_posts").doc(post.id).set(post);
      }
      return post;
    }

    /**
     * Gets complete dynamic hierarchy for a single course (Avoids N+1 query of the entire DB)
     * Delega para o CourseRepository com prioridade remota determinística e saída normalizada V2.
     */
    async getCourseHierarchy(courseId, baseRegistry = null) {
      return this.courseRepository.getCourseHierarchy(courseId, baseRegistry);
    }

    /**
     * Helper to format JavaScript objects to Firestore REST format
     */
    _toFirestoreRestFields(obj) {
      return toFirestoreRestFields(obj);
    }

    /**
     * Saves a Course document to Firestore (Delega para CourseRepository)
     */
    async saveCourse(courseData) {
      return this.courseRepository.saveCourse(courseData);
    }

    /**
     * Saves a Module document to Firestore (Delega para CourseRepository)
     */
    async saveModule(courseId, moduleData) {
      return this.courseRepository.saveModule(courseId, moduleData);
    }

    /**
     * Saves a Lesson document to Firestore (Delega para CourseRepository)
     */
    async saveLesson(courseId, moduleId, lessonData) {
      return this.courseRepository.saveLesson(courseId, moduleId, lessonData);
    }

    /**
     * Fetches only the list of courses without traversing modules and lessons.
     * Delega para CourseRepository com prioridade remota determinística e saída normalizada V2.
     */
    async getCoursesList(baseRegistry = null) {
      return this.courseRepository.getCoursesList(baseRegistry);
    }

    /**
     * Obtém apenas a lista leve de metadados dos cursos (sem carregar módulos e lições).
     */
    async getCoursesMetadata(baseRegistry = null) {
      return this.courseRepository.getCoursesMetadata(baseRegistry);
    }

    /**
     * Hidrata a árvore completa de módulos e lições sob demanda para um curso específico.
     */
    async hydrateCourse(courseId, baseRegistry = null) {
      return this.courseRepository.hydrateCourse(courseId, baseRegistry);
    }

    /**
     * Hidrata uma lição específica sob demanda.
     */
    async hydrateLesson(courseId, moduleId, lessonId) {
      return this.courseRepository.hydrateLesson(courseId, moduleId, lessonId);
    }

    /**
     * Gets complete dynamic hierarchy (Courses > Modules > Lessons)
     * Delega para CourseRepository com prioridade remota determinística e saída normalizada V2.
     */
    async getCoursesHierarchy(baseRegistry = null) {
      return this.courseRepository.getCoursesHierarchy(baseRegistry);
    }

    /**
     * Deletes a module and its nested lessons from Firestore (Delega para CourseRepository)
     */
    async deleteModuleFromCloud(courseId, moduleId) {
      return this.courseRepository.deleteModule(courseId, moduleId);
    }

    /**
     * Deletes a single lesson from Firestore (Delega para CourseRepository)
     */
    async deleteLessonFromCloud(courseId, moduleId, lessonId) {
      return this.courseRepository.deleteLesson(courseId, moduleId, lessonId);
    }

    // =========================================================================
    // USER REPOSITORY DELEGATIONS (UserRepository)
    // =========================================================================
    async getUser(userId) {
      return this.userRepository.getUser(userId);
    }

    async getUserProfile(userId) {
      return this.userRepository.getUser(userId);
    }

    async getAllUsers() {
      return this.userRepository.getAllUsers();
    }

    async getAllStudentsAndMentees() {
      return this.userRepository.getAllStudentsAndMentees();
    }

    async saveUser(userData) {
      return this.userRepository.saveUser(userData);
    }
  }

  // Global Singletons
  const aefCloudSync = new AEFCloudSync();
  const aefCourseRepository = aefCloudSync.courseRepository;
  const aefUserRepository = aefCloudSync.userRepository;

  if (typeof root !== "undefined") {
    root.aefCloudSync = aefCloudSync;
    root.aefCourseRepository = aefCourseRepository;
    root.aefUserRepository = aefUserRepository;
    root.CourseRepository = CourseRepository;
    root.UserRepository = UserRepository;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      AEFCloudSync,
      CourseRepository,
      UserRepository,
      aefCloudSync,
      aefCourseRepository,
      aefUserRepository
    };
  }
})(typeof window !== "undefined" ? window : globalThis);


