/**
 * AgoraEuFalo - Central Audio Hub & Distribution Matrix Engine
 * Professor Leonardo Leite
 * 
 * Provides unified management of audio tracks, IndexedDB blob caching,
 * and dynamic multi-tenant distribution for VIP Mentees & Public Players.
 */

class AEFAudioHub {
  constructor() {
    this.dbName = 'AEF_Audio_Database';
    this.dbVersion = 1;
    this.dbStoreName = 'audio_blobs';
    this.db = null;
    this._dbPromise = this._initIndexedDB();
  }

  // =========================================================================
  // 1. INDEXEDDB PERSISTENCE FOR HIGH-FIDELITY MP3/WAV BLOBS
  // =========================================================================
  async _initIndexedDB() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn("IndexedDB not supported in this browser.");
        resolve(null);
        return;
      }
      const req = indexedDB.open(this.dbName, this.dbVersion);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.dbStoreName)) {
          db.createObjectStore(this.dbStoreName, { keyPath: 'id' });
        }
      };
      req.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      req.onerror = (e) => {
        console.error("IndexedDB error:", e);
        resolve(null);
      };
    });
  }

  async storeAudioBlob(id, blob) {
    const db = await this._dbPromise;
    if (!db || !blob) return null;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.dbStoreName, 'readwrite');
      const store = tx.objectStore(this.dbStoreName);
      store.put({ id: id, blob: blob, timestamp: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = (err) => {
        console.error("Error storing audio blob:", err);
        resolve(false);
      };
    });
  }

  async getAudioBlob(id) {
    const db = await this._dbPromise;
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(this.dbStoreName, 'readonly');
      const store = tx.objectStore(this.dbStoreName);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result ? req.result.blob : null);
      req.onerror = () => resolve(null);
    });
  }

  async deleteAudioBlob(id) {
    const db = await this._dbPromise;
    if (!db) return;
    return new Promise((resolve) => {
      const tx = db.transaction(this.dbStoreName, 'readwrite');
      const store = tx.objectStore(this.dbStoreName);
      store.delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  }

  // =========================================================================
  // 2. CENTRAL AUDIO LIBRARY METADATA MANAGEMENT (LOCALSTORAGE)
  // =========================================================================
  getLibraryTracks() {
    try {
      const raw = localStorage.getItem('AEF_AUDIO_LIBRARY');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Error parsing AEF_AUDIO_LIBRARY:", e);
      return [];
    }
  }

  saveLibraryTracks(tracks) {
    localStorage.setItem('AEF_AUDIO_LIBRARY', JSON.stringify(tracks));
  }

  async saveTrack(trackData, audioBlob) {
    const tracks = this.getLibraryTracks();
    const existingIndex = tracks.findIndex(t => t.id === trackData.id);

    // Save binary audio in IndexedDB if provided
    if (audioBlob) {
      await this.storeAudioBlob(trackData.id, audioBlob);
      trackData.hasBlob = true;
    }

    if (existingIndex >= 0) {
      tracks[existingIndex] = { ...tracks[existingIndex], ...trackData, updatedAt: new Date().toISOString() };
    } else {
      tracks.unshift({
        ...trackData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    this.saveLibraryTracks(tracks);
    return trackData;
  }

  async deleteTrack(trackId) {
    let tracks = this.getLibraryTracks();
    tracks = tracks.filter(t => t.id !== trackId);
    this.saveLibraryTracks(tracks);
    await this.deleteAudioBlob(trackId);
    return true;
  }

  // =========================================================================
  // 3. DISTRIBUTION MATRIX (ASSIGN / UNASSIGN TO STUDENTS & PUBLIC)
  // =========================================================================
  updateTrackDistribution(trackId, assignedStudents) {
    const tracks = this.getLibraryTracks();
    const track = tracks.find(t => t.id === trackId);
    if (!track) return false;

    track.assignedTo = Array.from(new Set(assignedStudents));
    track.updatedAt = new Date().toISOString();
    this.saveLibraryTracks(tracks);
    return true;
  }

  toggleStudentAssignment(trackId, studentId) {
    const tracks = this.getLibraryTracks();
    const track = tracks.find(t => t.id === trackId);
    if (!track) return false;

    track.assignedTo = track.assignedTo || [];
    const idx = track.assignedTo.indexOf(studentId);
    if (idx >= 0) {
      track.assignedTo.splice(idx, 1);
    } else {
      track.assignedTo.push(studentId);
    }
    track.updatedAt = new Date().toISOString();
    this.saveLibraryTracks(tracks);
    return track.assignedTo;
  }

  // =========================================================================
  // 4. STUDENT PROFILES & MERGED TRACK PLAYLISTS
  // =========================================================================
  sanitizeCoverImage(currentCover, title = "") {
    // If a valid custom cover is already defined, preserve it!
    if (currentCover && 
        !currentCover.includes("app-icon-final") && 
        !currentCover.includes("cover-carlos") && 
        !currentCover.includes("cover-marcos") && 
        !currentCover.includes("cover-patricia")) {
      return currentCover;
    }

    const titleLower = (title || "").toLowerCase();
    if (titleLower.includes("oxford")) {
      return "../assets/images/cover-estevao-oxford-presentation.jpg";
    } else if (titleLower.includes("morning")) {
      return "../assets/images/cover-thomas-morning-person.jpg";
    } else if (titleLower.includes("coffee") || titleLower.includes("tea") || titleLower.includes("cafe")) {
      return "../assets/images/cover-thomas-coffee-shop-decisions.jpg";
    } else if (titleLower.includes("office") || titleLower.includes("logistics") || titleLower.includes("meeting")) {
      return "../assets/images/cover-thomas-office-logistics.jpg";
    } else if (titleLower.includes("keynote") || titleLower.includes("uk")) {
      return "../assets/images/cover-estevao-session01.jpg";
    } else if (titleLower.includes("career") || titleLower.includes("pitch") || titleLower.includes("interview")) {
      return "../assets/images/cover-andre-session01.jpg";
    } else if (titleLower.includes("travel") || titleLower.includes("networking") || titleLower.includes("airport") || titleLower.includes("flight")) {
      return "../assets/images/cover-matheus-session01.jpg";
    }

    return "../assets/images/cover-default-aef.jpg";
  }

  getStudents() {
    const baseStudents = (window.AEF_REGISTRY && window.AEF_REGISTRY.students) ? [...window.AEF_REGISTRY.students] : [
      { id: "estevao", name: "Estevão", badge: "VIP Mentee", subtitle: "Keynote Delivery & International Fluency", avatarEmoji: "👨‍💻", avatarBg: "bg-amber-500/10 text-amber-500 border-amber-500/20", pin: "1234", active: true },
      { id: "thomas", name: "Thomas", badge: "VIP Mentee", subtitle: "Executive Meeting Reflex & Quick Phrasing", avatarEmoji: "👔", avatarBg: "bg-sky-500/10 text-sky-500 border-sky-500/20", pin: "2345", active: true },
      { id: "andre", name: "André", badge: "VIP Mentee", subtitle: "Professional Storytelling & Global Interviews", avatarEmoji: "💼", avatarBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", pin: "3456", active: true },
      { id: "matheus", name: "Matheus", badge: "VIP Mentee", subtitle: "Native Sound Reduction & Connected Speech", avatarEmoji: "🎯", avatarBg: "bg-purple-500/10 text-purple-500 border-purple-500/20", pin: "4567", active: true }
    ];

    // Merge any custom registered students from localStorage
    try {
      const custom = JSON.parse(localStorage.getItem('AEF_CUSTOM_STUDENTS') || '[]');
      custom.forEach(c => {
        if (!baseStudents.find(s => s.id === c.id)) {
          baseStudents.push(c);
        }
      });
    } catch (e) {}

    return baseStudents;
  }

  saveStudent(student) {
    const custom = JSON.parse(localStorage.getItem('AEF_CUSTOM_STUDENTS') || '[]');
    const idx = custom.findIndex(s => s.id === student.id);
    if (idx >= 0) {
      custom[idx] = student;
    } else {
      custom.push(student);
    }
    localStorage.setItem('AEF_CUSTOM_STUDENTS', JSON.stringify(custom));
  }

  async getMergedTracksForStudent(studentId) {
    studentId = (studentId || '').toLowerCase().trim();
    
    // 1. Get seed tracks from window.AEF_STUDENT_[NAME]
    let baseTracks = [];
    if (studentId === "estevao" && window.AEF_STUDENT_ESTEVAO) baseTracks = window.AEF_STUDENT_ESTEVAO.tracks || [];
    else if (studentId === "thomas" && window.AEF_STUDENT_THOMAS) baseTracks = window.AEF_STUDENT_THOMAS.tracks || [];
    else if ((studentId === "andre" || studentId === "andré") && window.AEF_STUDENT_ANDRE) baseTracks = window.AEF_STUDENT_ANDRE.tracks || [];
    else if (studentId === "matheus" && window.AEF_STUDENT_MATHEUS) baseTracks = window.AEF_STUDENT_MATHEUS.tracks || [];

    // 2. Get all tracks from Cloud Firestore (Google Cloud Sync)
    let cloudTracks = [];
    if (window.aefCloudSync) {
      try {
        cloudTracks = await window.aefCloudSync.getStudentCloudTracks(studentId);
      } catch (e) {
        console.warn("⚠️ [AudioHub] Nuvem offline ou em carregamento:", e);
      }
    }

    // 3. Get all tracks from Central Library assigned to this student or to "public" / "all"
    const libTracks = this.getLibraryTracks().filter(t => {
      const assigned = t.assignedTo || [];
      return assigned.includes(studentId) || assigned.includes("all") || (studentId === "public" && assigned.includes("public"));
    });

    // 4. Resolve audio blobs & sanitize covers for all tracks (and filter out archived/drafts for players)
    const resolveAndSanitize = async (trackList) => {
      const result = [];
      for (const t of trackList) {
        if (t.status === 'archived' || t.status === 'draft') continue;
        const trackCopy = { ...t };
        if (t.hasBlob || !t.audioUrl) {
          const blob = await this.getAudioBlob(t.id);
          if (blob) {
            trackCopy.audioUrl = URL.createObjectURL(blob);
          }
        }
        trackCopy.coverImage = this.sanitizeCoverImage(trackCopy.coverImage, trackCopy.title);
        result.push(trackCopy);
      }
      return result;
    };

    // Combine base tracks, cloud tracks and lib tracks, deduplicating by ID or normalized title
    const allTracks = [...baseTracks];
    const incomingTracks = [...cloudTracks, ...libTracks];

    for (const inc of incomingTracks) {
      const existingIdx = allTracks.findIndex(bt => 
        bt.id === inc.id || 
        (bt.title && inc.title && bt.title.toLowerCase().replace(/[^a-z0-9]/g, '') === inc.title.toLowerCase().replace(/[^a-z0-9]/g, ''))
      );
      if (existingIdx >= 0) {
        allTracks[existingIdx] = { ...allTracks[existingIdx], ...inc };
      } else {
        allTracks.push(inc);
      }
    }

    return await resolveAndSanitize(allTracks);
  }

  // =========================================================================
  // 5. HELPER: SCRIPT PARSER TO SOUND-CHUNKS (SENTENCES ARRAY)
  // =========================================================================
  parseScriptToSentences(scriptText, totalDurationSec = 30) {
    if (!scriptText) return [];
    
    // Split lines
    const lines = scriptText.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) return [];

    const totalChars = lines.reduce((acc, l) => acc + l.length, 0);
    let accumulatedTime = 0;

    return lines.map((line, idx) => {
      const charRatio = line.length / (totalChars || 1);
      const segDuration = Math.max(1.8, Math.round((charRatio * totalDurationSec) * 100) / 100);
      const start = Math.round(accumulatedTime * 100) / 100;
      const end = Math.round((accumulatedTime + segDuration) * 100) / 100;
      accumulatedTime += segDuration;

      // Extract speaker if exists
      let cleanText = line;
      let notes = "";
      if (line.includes(':')) {
        const parts = line.split(':');
        notes = parts[0].trim();
        cleanText = parts.slice(1).join(':').trim();
      }

      cleanText = (cleanText || line)
        .replace(/\\?\[\s*break\s+time=[^\]]+\\?\]/gi, "")
        .replace(/\\?\[\s*long\s+pause\s*\\?\]/gi, "")
        .replace(/\\?\[\s*pause\s*\\?\]/gi, "")
        .replace(/\\?\[\s*pausa[^\]]*\\?\]/gi, "")
        .replace(/\\?\[\s*break[^\]]*\\?\]/gi, "")
        .replace(/\\([!?.',"-])/g, "$1")
        .replace(/\s+/g, " ")
        .replace(/\s+([!?,.])/g, "$1")
        .trim();

      return {
        id: idx + 1,
        start: start,
        end: end,
        text: cleanText,
        notes: notes ? `Speaker: ${notes}` : ""
      };
    });
  }

  // =========================================================================
  // 6. MULTIMODAL AUDIO TRANSCRIPTION (GEMINI 2.5 FLASH)
  // =========================================================================
  async transcribeAudioWithGemini(audioBlob, apiKey, mimeType = "audio/mp3") {
    if (!apiKey) throw new Error("Chave da Gemini API não informada.");

    // Convert blob to base64
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    const promptText = `You are an expert English coach and audio transcriber for Professor Leonardo Leite's AgoraEuFalo training program.
Transcribe this spoken English audio recording. Break it down into clear, natural conversational sentences or sound chunks.
For each sentence, identify:
1. start: Approximate start time in seconds (float, e.g. 0.0)
2. end: Approximate end time in seconds (float, e.g. 4.2)
3. text: The exact English spoken words.
4. spokenTranslation: Natural, authentic Brazilian spoken Portuguese translation of the sentence (colloquial, lively, spoken phrasing).

Return ONLY a valid JSON array of objects:
[
  { "id": 1, "start": 0.0, "end": 3.5, "text": "Good morning everyone.", "spokenTranslation": "Bom dia a todos!" }
]`;

    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-1.5-flash",
      "gemini-2.5-flash-preview-tts"
    ];

    let lastError = null;
    let resJson = null;

    for (const model of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType || "audio/mp3",
                    data: base64Data
                  }
                },
                {
                  text: promptText
                }
              ]
            }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json"
            }
          })
        });

        if (response.ok) {
          resJson = await response.json();
          break;
        } else {
          const errJson = await response.json().catch(() => ({}));
          lastError = new Error(errJson.error?.message || `Erro na API Gemini modelo ${model} (${response.status})`);
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (!resJson) {
      throw lastError || new Error("Não foi possível transcrever o áudio com os modelos Gemini disponíveis.");
    }

    const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Parse JSON
    try {
      const cleanJsonStr = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonStr);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => ({
          id: idx + 1,
          start: typeof item.start === 'number' ? item.start : parseFloat(item.start) || 0.0,
          end: typeof item.end === 'number' ? item.end : parseFloat(item.end) || 0.0,
          text: (item.text || "").trim(),
          spokenTranslation: (item.spokenTranslation || item.translation || "").trim(),
          notes: (item.notes || "").trim()
        }));
      }
    } catch (e) {
      console.warn("Could not parse direct JSON from Gemini, falling back to text parsing:", e);
    }

    // Fallback: parse plain lines
    return this.parseScriptToSentences(rawText, 30);
  }
}

// Global Singleton
window.aefAudioHub = new AEFAudioHub();
