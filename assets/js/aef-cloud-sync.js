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

      for (const studentId of studentIds) {
        const payload = {
          id: trackData.id || `track_${Date.now()}`,
          title: trackData.title || "Treino de Reflexo Oral",
          duration: trackData.duration || "00:30",
          coverImage: trackData.coverImage || "assets/images/cover-default-aef.jpg",
          audioUrl: trackData.audioUrl || "",
          videoUrl: trackData.videoUrl || "",
          summary: trackData.summary || "",
          goldenTip: trackData.goldenTip || "",
          status: trackData.status || "active",
          assignedTo: [studentId],
          sentences: (trackData.sentences || []).map((s) => ({
            id: s.id || 1,
            start: parseFloat(s.start) || 0.0,
            end: parseFloat(s.end) || 0.0,
            text: s.text || "",
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
                  updatedAt: { stringValue: timestamp }
                }
              })
            });
          }
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
  }

  // Global Singleton
  window.aefCloudSync = new AEFCloudSync();
})();
