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
          // Load Firebase SDKs if not present
          await this.loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
          await this.loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js");
          await this.loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-storage-compat.js");

          if (!window.firebase.apps.length) {
            this.app = window.firebase.initializeApp(FIREBASE_CONFIG);
          } else {
            this.app = window.firebase.app();
          }

          this.db = window.firebase.firestore();
          this.storage = window.firebase.storage();
          this.isInitialized = true;
          console.log("☁️ [AEFCloudSync] Conectado com sucesso à Nuvem Global Google Cloud / Firebase.");
          resolve(true);
        } catch (err) {
          console.warn("⚠️ [AEFCloudSync] Erro ao inicializar Firebase:", err);
          resolve(false);
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
     * Uploads an audio blob to Cloud Storage and saves track metadata in Firestore.
     */
    async publishTrackToCloud({ studentId, track, audioBlob, onProgress }) {
      const ready = await this.init();
      if (!ready) throw new Error("Não foi possível inicializar a conexão com a Nuvem Google.");

      let finalAudioUrl = track.audioUrl || "";

      // 1. Upload Audio Blob to Firebase Storage if provided
      if (audioBlob) {
        const fileExt = audioBlob.type?.includes("mp4") || audioBlob.type?.includes("m4a") ? "m4a" : "mp3";
        const storageRef = this.storage.ref().child(`audio/${studentId}/${track.id}_${Date.now()}.${fileExt}`);
        
        const uploadTask = storageRef.put(audioBlob, {
          contentType: audioBlob.type || "audio/mp3",
          customMetadata: {
            studentId: studentId,
            title: track.title,
            publishedBy: "Prof. Leo Leite - AgoraEuFalo"
          }
        });

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              if (onProgress) onProgress(progress);
            },
            (error) => reject(error),
            async () => {
              finalAudioUrl = await uploadTask.snapshot.ref.getDownloadURL();
              resolve();
            }
          );
        });
      }

      // 2. Prepare Firestore Document Payload
      const cloudPayload = {
        id: track.id,
        title: track.title,
        duration: track.duration || "00:30",
        coverImage: track.coverImage || "../assets/images/cover-default-aef.jpg",
        audioUrl: finalAudioUrl,
        summary: track.summary || "Treino auditivo personalizado com o Prof. Leonardo Leite.",
        goldenTip: track.goldenTip || "Breathe naturally at pause markers and connect sound chunks smoothly.",
        sentences: track.sentences || [],
        assignedTo: [studentId],
        publishedAt: new Date().toISOString(),
        publishedTimestamp: Date.now()
      };

      // 3. Save in Firestore Collection
      const docRef = this.db.collection("students").doc(studentId).collection("tracks").doc(track.id);
      await docRef.set(cloudPayload, { merge: true });

      console.log(`✅ [AEFCloudSync] Episódio '${track.title}' publicado globalmente para '${studentId}'!`);
      return cloudPayload;
    }

    /**
     * Fetches all cloud tracks for a given student from Firestore.
     */
    async getStudentCloudTracks(studentId) {
      const ready = await this.init();
      if (!ready) return [];

      try {
        const snapshot = await this.db
          .collection("students")
          .doc(studentId)
          .collection("tracks")
          .orderBy("publishedTimestamp", "desc")
          .get();

        const tracks = [];
        snapshot.forEach((doc) => {
          tracks.push(doc.data());
        });
        return tracks;
      } catch (err) {
        console.warn(`⚠️ [AEFCloudSync] Erro ao buscar faixas na nuvem para ${studentId}:`, err);
        return [];
      }
    }

    /**
     * Real-time listener for student tracks
     */
    async subscribeToStudentTracks(studentId, onTracksUpdated) {
      const ready = await this.init();
      if (!ready) return () => {};

      try {
        return this.db
          .collection("students")
          .doc(studentId)
          .collection("tracks")
          .orderBy("publishedTimestamp", "asc")
          .onSnapshot((snapshot) => {
            const tracks = [];
            snapshot.forEach((doc) => {
              tracks.push(doc.data());
            });
            if (onTracksUpdated) onTracksUpdated(tracks);
          });
      } catch (err) {
        console.warn(`⚠️ [AEFCloudSync] Erro ao subscrever em tempo real para ${studentId}:`, err);
        return () => {};
      }
    }
  }

  // Global Singleton
  window.aefCloudSync = new AEFCloudSync();
})();
