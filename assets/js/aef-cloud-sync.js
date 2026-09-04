/**
 * AgoraEuFalo - Global Cloud Synchronization Engine
 * Professor Leonardo Leite
 * Real-time Firebase Firestore & Google Cloud Storage Integration
 */

(function () {
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk",
    authDomain: "agoraeufalo-3463a.firebaseapp.com",
    projectId: "agoraeufalo-3463a",
    storageBucket: "agoraeufalo-3463a.firebasestorage.app",
    messagingSenderId: "973862553705",
    appId: "1:973862553705:web:959ea81c80c28cc1dc7af8"
  };

  class AEFCloudSync {
    constructor() {
      this.isInitialized = false;
      this.app = null;
      this.db = null;
      this.storage = null;
      this.initPromise = null;
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
     * Courses & Modules Studio: Gets complete dynamic hierarchy (Courses > Modules > Lessons)
    /**
     * Helper to format JavaScript objects to Firestore REST format
     */
    _toFirestoreRestFields(obj) {
      const fields = {};
      for (const [k, v] of Object.entries(obj)) {
        if (v === undefined || typeof v === 'function' || k === 'modules' || k === 'lessons') continue;
        if (k === 'sentences' && Array.isArray(v)) {
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
        } else if (typeof v === 'string') {
          fields[k] = { stringValue: v };
        } else if (typeof v === 'number') {
          fields[k] = Number.isInteger(v) ? { integerValue: v.toString() } : { doubleValue: v };
        } else if (typeof v === 'boolean') {
          fields[k] = { booleanValue: v };
        } else if (Array.isArray(v)) {
          fields[k] = { arrayValue: { values: v.map(item => ({ stringValue: String(item) })) } };
        }
      }
      return fields;
    }

    /**
     * Saves a Course document to Firestore (SDK + REST Fallback)
     */
    async saveCourse(courseData) {
      if (!courseData || !courseData.id) throw new Error("ID do curso obrigatório.");
      await this.init();
      const cid = courseData.id;
      const payload = {
        id: cid,
        title: courseData.title || cid,
        slug: courseData.slug || cid,
        badge: courseData.badge || "CURSO LIBERADO",
        tierRequired: courseData.tierRequired || "vip",
        themeColor: courseData.themeColor || "amber",
        coverImageUrl: courseData.coverImageUrl || "assets/images/cover-default-aef.jpg",
        description: courseData.description || "",
        published: courseData.published !== false,
        updatedAt: new Date().toISOString()
      };

      let saved = false;
      if (this.db) {
        try {
          await this.db.collection("courses").doc(cid).set(payload, { merge: true });
          saved = true;
        } catch (e) {
          console.warn("Firestore SDK saveCourse error, trying REST:", e);
        }
      }

      if (!saved) {
        const restUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses/${cid}`;
        const res = await fetch(restUrl, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: this._toFirestoreRestFields(payload) })
        });
        if (!res.ok) throw new Error(`REST Error: ${res.statusText}`);
      }

      console.log(`☁️ [AEFCloudSync] Curso "${payload.title}" salvo com sucesso no Firestore!`);
      return payload;
    }

    /**
     * Saves a Module document to Firestore (SDK + REST Fallback)
     */
    async saveModule(courseId, moduleData) {
      if (!courseId || !moduleData || !moduleData.id) throw new Error("CourseId e ModuleId obrigatórios.");
      await this.init();
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
      if (this.db) {
        try {
          await this.db.collection("courses").doc(courseId).collection("modules").doc(mid).set(payload, { merge: true });
          saved = true;
        } catch (e) {
          console.warn("Firestore SDK saveModule error, trying REST:", e);
        }
      }

      if (!saved) {
        const restUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses/${courseId}/modules/${mid}`;
        const res = await fetch(restUrl, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: this._toFirestoreRestFields(payload) })
        });
        if (!res.ok) throw new Error(`REST Error: ${res.statusText}`);
      }

      console.log(`☁️ [AEFCloudSync] Módulo "${payload.title}" salvo com sucesso em courses/${courseId}/modules/${mid}`);
      return payload;
    }

    /**
     * Saves a Lesson document to Firestore (SDK + REST Fallback)
     */
    async saveLesson(courseId, moduleId, lessonData) {
      if (!courseId || !moduleId || !lessonData || !lessonData.id) throw new Error("CourseId, ModuleId e LessonId obrigatórios.");
      await this.init();
      const lid = lessonData.id;
      const payload = {
        id: lid,
        courseId: courseId,
        moduleId: moduleId,
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

      let saved = false;
      if (this.db) {
        try {
          await this.db.collection("courses").doc(courseId).collection("modules").doc(moduleId).collection("lessons").doc(lid).set(payload, { merge: true });
          saved = true;
        } catch (e) {
          console.warn("Firestore SDK saveLesson error, trying REST:", e);
        }
      }

      if (!saved) {
        const restUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses/${courseId}/modules/${moduleId}/lessons/${lid}`;
        const res = await fetch(restUrl, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: this._toFirestoreRestFields(payload) })
        });
        if (!res.ok) throw new Error(`REST Error: ${res.statusText}`);
      }

      console.log(`☁️ [AEFCloudSync] Aula "${payload.title}" salva com sucesso em courses/${courseId}/modules/${moduleId}/lessons/${lid}`);
      return payload;
    }

    /**
     * Courses & Modules Studio: Gets complete dynamic hierarchy (Courses > Modules > Lessons)
     * Merges Base Canonical Registry with Google Cloud Firestore Subcollections in parallel
     */
    async getCoursesHierarchy(baseRegistry = null) {
      await this.init();
      const courses = JSON.parse(JSON.stringify(baseRegistry || (window.AEF_COURSES_REGISTRY || {})));

      // 1. Try SDK Fetch
      let sdkSuccess = false;
      try {
        if (this.db) {
          const coursesSnap = await this.db.collection("courses").get();
          if (!coursesSnap.empty) {
            const coursePromises = coursesSnap.docs.map(async (cDoc) => {
              const cid = cDoc.id;
              const cData = cDoc.data();
              if (!courses[cid]) {
                courses[cid] = { id: cid, title: cData.title || cid, modules: [] };
              }
              if (cData.title) courses[cid].title = cData.title;
              if (cData.description !== undefined) courses[cid].description = cData.description;
              if (cData.coverImageUrl) courses[cid].coverImageUrl = cData.coverImageUrl;
              if (cData.tierRequired) courses[cid].tierRequired = cData.tierRequired;
              if (cData.themeColor) courses[cid].themeColor = cData.themeColor;
              if (cData.badge) courses[cid].badge = cData.badge;
              if (cData.published !== undefined) courses[cid].published = cData.published;
              if (cData.slug) courses[cid].slug = cData.slug;
              courses[cid].modules = courses[cid].modules || [];

              // Fetch Modules Subcollection in parallel
              try {
                const modulesSnap = await this.db.collection("courses").doc(cid).collection("modules").get();
                if (!modulesSnap.empty) {
                  const modulePromises = modulesSnap.docs.map(async (mDoc) => {
                    const mid = mDoc.id;
                    const mData = mDoc.data();
                    let mObj = courses[cid].modules.find(m => m.id === mid);
                    if (!mObj) {
                      mObj = { id: mid, title: mData.title || mid, order: mData.order || (courses[cid].modules.length + 1), lessons: [] };
                      courses[cid].modules.push(mObj);
                    }
                    if (mData.title) mObj.title = mData.title;
                    if (mData.order !== undefined) mObj.order = mData.order;
                    if (mData.description !== undefined) mObj.description = mData.description;
                    if (mData.published !== undefined) mObj.published = mData.published;
                    if (mData.badge) mObj.badge = mData.badge;
                    if (mData.stats) mObj.stats = mData.stats;
                    mObj.lessons = mObj.lessons || [];

                    // Fetch Lessons Subcollection in parallel (Firestore is Single Source of Truth)
                    try {
                      const lessonsSnap = await this.db.collection("courses").doc(cid).collection("modules").doc(mid).collection("lessons").get();
                      if (!lessonsSnap.empty) {
                        const existingMap = new Map();
                        (mObj.lessons || []).forEach(l => {
                          if (l && l.id && !existingMap.has(l.id)) existingMap.set(l.id, l);
                        });

                        const reconciledLessons = [];
                        const seenIds = new Set();

                        for (const lDoc of lessonsSnap.docs) {
                          const lid = lDoc.id;
                          if (seenIds.has(lid)) continue;
                          seenIds.add(lid);
                          const lData = lDoc.data();
                          const baseObj = existingMap.get(lid) || {};
                          const mergedObj = Object.assign({}, baseObj, lData, { id: lid });
                          mergedObj.order = parseInt(mergedObj.order) || (reconciledLessons.length + 1);
                          reconciledLessons.push(mergedObj);
                        }
                        reconciledLessons.sort((a, b) => (a.order || 0) - (b.order || 0));
                        mObj.lessons = reconciledLessons;
                      }
                    } catch (le) {
                      console.warn(`Firestore lessons subcollection fetch (${cid}/${mid}):`, le);
                    }
                  });
                  await Promise.all(modulePromises);
                  courses[cid].modules.sort((a, b) => (a.order || 0) - (b.order || 0));
                }
              } catch (me) {
                console.warn(`Firestore modules subcollection fetch (${cid}):`, me);
              }
            });
            await Promise.all(coursePromises);
            sdkSuccess = true;
          }
        }
      } catch (err) {
        console.warn("⚠️ [AEFCloudSync] Erro no SDK Firestore, executando REST fallback:", err);
      }

      // 2. REST Fallback (executes if SDK fetch didn't run or returned nothing)
      if (!sdkSuccess) {
        try {
          const res = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.documents) {
              for (const doc of data.documents) {
                const cid = doc.name.split("/").pop();
                const f = doc.fields || {};
                if (!courses[cid]) {
                  courses[cid] = { id: cid, title: f.title?.stringValue || cid, modules: [] };
                }
                if (f.title?.stringValue) courses[cid].title = f.title.stringValue;
                if (f.description?.stringValue !== undefined) courses[cid].description = f.description.stringValue;
                if (f.coverImageUrl?.stringValue) courses[cid].coverImageUrl = f.coverImageUrl.stringValue;
                if (f.tierRequired?.stringValue) courses[cid].tierRequired = f.tierRequired.stringValue;
                if (f.themeColor?.stringValue) courses[cid].themeColor = f.themeColor.stringValue;
                if (f.badge?.stringValue) courses[cid].badge = f.badge.stringValue;
                if (f.published?.booleanValue !== undefined) courses[cid].published = f.published.booleanValue;
                if (f.slug?.stringValue) courses[cid].slug = f.slug.stringValue;
                courses[cid].modules = courses[cid].modules || [];

                // REST fetch modules
                try {
                  const mRes = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses/${cid}/modules`);
                  if (mRes.ok) {
                    const mData = await mRes.json();
                    if (mData && mData.documents) {
                      for (const mDoc of mData.documents) {
                        const mid = mDoc.name.split("/").pop();
                        const mf = mDoc.fields || {};
                        let mObj = courses[cid].modules.find(m => m.id === mid);
                        if (!mObj) {
                          mObj = { id: mid, title: mf.title?.stringValue || mid, order: parseInt(mf.order?.integerValue) || (courses[cid].modules.length + 1), lessons: [] };
                          courses[cid].modules.push(mObj);
                        }
                        if (mf.title?.stringValue) mObj.title = mf.title.stringValue;
                        if (mf.description?.stringValue) mObj.description = mf.description.stringValue;
                        if (mf.published?.booleanValue !== undefined) mObj.published = mf.published.booleanValue;
                        mObj.lessons = mObj.lessons || [];

                        // REST fetch lessons (Firestore is Single Source of Truth)
                        try {
                          const lRes = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses/${cid}/modules/${mid}/lessons`);
                          if (lRes.ok) {
                            const lData = await lRes.json();
                            if (lData && Array.isArray(lData.documents) && lData.documents.length > 0) {
                              const existingMap = new Map();
                              (mObj.lessons || []).forEach(l => {
                                if (l && l.id && !existingMap.has(l.id)) existingMap.set(l.id, l);
                              });

                              const reconciledLessons = [];
                              const seenIds = new Set();

                              for (const lDoc of lData.documents) {
                                const lid = lDoc.name.split("/").pop();
                                if (seenIds.has(lid)) continue;
                                seenIds.add(lid);
                                const lf = lDoc.fields || {};
                                const baseObj = existingMap.get(lid) || {};
                                const restObj = {
                                  id: lid,
                                  title: lf.title?.stringValue || baseObj.title || lid,
                                  order: parseInt(lf.order?.integerValue) || baseObj.order || (reconciledLessons.length + 1),
                                  videoUrl: lf.videoUrl?.stringValue !== undefined ? lf.videoUrl.stringValue : (baseObj.videoUrl || ""),
                                  audioUrl: lf.audioUrl?.stringValue !== undefined ? lf.audioUrl.stringValue : (baseObj.audioUrl || ""),
                                  pdfUrl: lf.pdfUrl?.stringValue !== undefined ? lf.pdfUrl.stringValue : (baseObj.pdfUrl || ""),
                                  goldenTip: lf.goldenTip?.stringValue !== undefined ? lf.goldenTip.stringValue : (baseObj.goldenTip || ""),
                                  artworkUrl: lf.artworkUrl?.stringValue !== undefined ? lf.artworkUrl.stringValue : (baseObj.artworkUrl || ""),
                                  thumbnailUrl: lf.thumbnailUrl?.stringValue !== undefined ? lf.thumbnailUrl.stringValue : (baseObj.thumbnailUrl || ""),
                                  published: lf.published?.booleanValue !== undefined ? lf.published.booleanValue : (baseObj.published !== false),
                                  hasTrainingTrack: lf.hasTrainingTrack?.booleanValue !== undefined ? lf.hasTrainingTrack.booleanValue : (baseObj.hasTrainingTrack !== false),
                                  trainingTrackId: lf.trainingTrackId?.stringValue !== undefined ? lf.trainingTrackId.stringValue : (baseObj.trainingTrackId || lid),
                                  rawScript: lf.rawScript?.stringValue !== undefined ? lf.rawScript.stringValue : (baseObj.rawScript || ""),
                                  processedContentHtml: lf.processedContentHtml?.stringValue !== undefined ? lf.processedContentHtml.stringValue : (baseObj.processedContentHtml || ""),
                                  duration: lf.duration?.stringValue !== undefined ? lf.duration.stringValue : (baseObj.duration || "05:00"),
                                  activity: lf.activity?.stringValue !== undefined ? lf.activity.stringValue : (baseObj.activity || ""),
                                  description: lf.description?.stringValue !== undefined ? lf.description.stringValue : (baseObj.description || ""),
                                  sentences: (lf.sentences?.arrayValue?.values || []).length > 0 ? (lf.sentences.arrayValue.values.map(sv => {
                                    const sf = sv.mapValue?.fields || {};
                                    return {
                                      id: parseInt(sf.id?.integerValue || sf.id?.stringValue || "1"),
                                      start: parseFloat(sf.start?.doubleValue || sf.start?.stringValue || "0"),
                                      end: parseFloat(sf.end?.doubleValue || sf.end?.stringValue || "0"),
                                      text: sf.text?.stringValue || "",
                                      spokenTranslation: sf.spokenTranslation?.stringValue || sf.translation?.stringValue || "",
                                      notes: sf.notes?.stringValue || ""
                                    };
                                  })) : (baseObj.sentences || [])
                                };
                                const mergedObj = Object.assign({}, baseObj, restObj);
                                reconciledLessons.push(mergedObj);
                              }
                              reconciledLessons.sort((a, b) => (a.order || 0) - (b.order || 0));
                              mObj.lessons = reconciledLessons;
                            }
                          }
                        } catch (le) {
                          console.warn(`REST lessons error (${cid}/${mid}):`, le);
                        }
                      }
                      courses[cid].modules.sort((a, b) => (a.order || 0) - (b.order || 0));
                    }
                  }
                } catch (me) {
                  console.warn(`REST modules error (${cid}):`, me);
                }
              }
            }
          }
        } catch (re) {
          console.warn("REST hierarchy error:", re);
        }
      }

      return courses;
    }

    /**
     * Deletes a module and its nested lessons from Firestore
     */
    async deleteModuleFromCloud(courseId, moduleId) {
      if (!courseId || !moduleId) return false;
      await this.init();
      if (!this.db) return false;
      try {
        const lessonsSnap = await this.db.collection("courses").doc(courseId).collection("modules").doc(moduleId).collection("lessons").get();
        const batch = this.db.batch();
        lessonsSnap.forEach(doc => batch.delete(doc.ref));
        batch.delete(this.db.collection("courses").doc(courseId).collection("modules").doc(moduleId));
        await batch.commit();
        return true;
      } catch (e) {
        console.warn("Error deleting module from cloud via SDK, trying REST fallback:", e);
      }

      // REST Fallback for module delete
      try {
        const restUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses/${courseId}/modules/${moduleId}`;
        const res = await fetch(restUrl, { method: "DELETE" });
        return res.ok;
      } catch (re) {
        console.warn("Error deleting module from cloud via REST:", re);
        return false;
      }
    }

    /**
     * Deletes a single lesson from Firestore (SDK + REST fallback)
     */
    async deleteLessonFromCloud(courseId, moduleId, lessonId) {
      if (!courseId || !moduleId || !lessonId) return false;
      await this.init();
      
      let deleted = false;
      if (this.db) {
        try {
          await this.db.collection("courses").doc(courseId).collection("modules").doc(moduleId).collection("lessons").doc(lessonId).delete();
          deleted = true;
        } catch (e) {
          console.warn("Error deleting lesson from cloud via SDK, trying REST fallback:", e);
        }
      }

      // REST Fallback for lesson delete
      if (!deleted) {
        try {
          const restUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`;
          const res = await fetch(restUrl, { method: "DELETE" });
          deleted = res.ok;
        } catch (re) {
          console.warn("Error deleting lesson from cloud via REST:", re);
        }
      }

      return deleted;
    }
  }

  // Global Singleton
  window.aefCloudSync = new AEFCloudSync();
})();
