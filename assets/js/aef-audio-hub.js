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

    // 2. Get all tracks from Central Library assigned to this student or to "public" / "all"
    const libTracks = this.getLibraryTracks().filter(t => {
      const assigned = t.assignedTo || [];
      return assigned.includes(studentId) || assigned.includes("all") || (studentId === "public" && assigned.includes("public"));
    });

    // 3. Resolve audio blobs for custom tracks
    const resolvedCustomTracks = [];
    for (const ct of libTracks) {
      const trackCopy = { ...ct };
      if (ct.hasBlob || !ct.audioUrl) {
        const blob = await this.getAudioBlob(ct.id);
        if (blob) {
          trackCopy.audioUrl = URL.createObjectURL(blob);
        }
      }
      resolvedCustomTracks.push(trackCopy);
    }

    // Return custom tracks first (newest assignments), followed by baseline seed tracks
    return [...resolvedCustomTracks, ...baseTracks];
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

      return {
        id: idx + 1,
        start: start,
        end: end,
        text: cleanText || line,
        notes: notes ? `Speaker: ${notes}` : ""
      };
    });
  }
}

// Global Singleton
window.aefAudioHub = new AEFAudioHub();
