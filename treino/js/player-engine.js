/**
 * AgoraEuFalo - Player Engine & Karaoke Sincronizado
 * Professor Leonardo Leite
 */
class AEFPlayerEngine {
  constructor(options = {}) {
    this.audio = new Audio();
    this.audio.preload = "auto";
    
    // Configurações
    this.currentStudent = null;
    this.currentTrackIndex = 0;
    this.currentTrack = null;
    this.sentences = [];
    this.activeSentenceIndex = -1;
    
    // Modos
    this.isKaraokeEnabled = true;
    this.isLoopSentenceEnabled = false;
    this.loopSentenceIndex = -1;
    this.autoScrollEnabled = true;
    
    // Callbacks de Eventos para UI
    this.onTrackLoaded = options.onTrackLoaded || (() => {});
    this.onPlayStateChange = options.onPlayStateChange || (() => {});
    this.onTimeUpdate = options.onTimeUpdate || (() => {});
    this.onSentenceChange = options.onSentenceChange || (() => {});
    this.onSpeedChange = options.onSpeedChange || (() => {});
    this.onTrackEnded = options.onTrackEnded || (() => {});

    this._rafId = null;
    this._bindAudioEvents();
    this._setupMediaSession();
  }

  _bindAudioEvents() {
    const tick = () => {
      if (!this.audio.paused && !this.audio.ended) {
        const curTime = this.audio.currentTime;
        const duration = this.audio.duration || 0;
        this.onTimeUpdate(curTime, duration);
        this._checkSentenceSync(curTime);
        this._rafId = requestAnimationFrame(tick);
      }
    };

    this.audio.addEventListener("play", () => {
      this.onPlayStateChange(true);
      this._updateMediaSessionPlaybackState("playing");
      this._updateMediaSessionMetadata();
      cancelAnimationFrame(this._rafId);
      this._rafId = requestAnimationFrame(tick);
    });

    this.audio.addEventListener("pause", () => {
      this.onPlayStateChange(false);
      this._updateMediaSessionPlaybackState("paused");
      cancelAnimationFrame(this._rafId);
    });

    this.audio.addEventListener("seeked", () => {
      const curTime = this.audio.currentTime;
      const duration = this.audio.duration || 0;
      this.onTimeUpdate(curTime, duration);
      this._checkSentenceSync(curTime);
      this._updateMediaSessionPosition();
    });

    this.audio.addEventListener("timeupdate", () => {
      // Fallback update for background/inactive tabs
      const curTime = this.audio.currentTime;
      const duration = this.audio.duration || 0;
      this.onTimeUpdate(curTime, duration);
      this._checkSentenceSync(curTime);
      this._updateMediaSessionPosition();
    });

    this.audio.addEventListener("ended", () => {
      this.onPlayStateChange(false);
      cancelAnimationFrame(this._rafId);
      this.onTrackEnded();
    });

    this.audio.addEventListener("ratechange", () => {
      this.onSpeedChange(this.audio.playbackRate);
    });
  }

  loadStudentData(student, trackIndex = 0) {
    this.currentStudent = student;
    this.currentTrackIndex = trackIndex;
    
    if (!student.tracks || student.tracks.length === 0) {
      console.warn("Nenhuma faixa encontrada para o aluno", student.name);
      return;
    }

    this.currentTrack = student.tracks[trackIndex];
    this.sentences = this.currentTrack.sentences || [];
    this.activeSentenceIndex = -1;
    this.loopSentenceIndex = -1;
    this.isLoopSentenceEnabled = false;

    let audioSrc = this.currentTrack.audioUrl;
    if (window.location.protocol === "file:" && audioSrc.startsWith("/")) {
      audioSrc = ".." + audioSrc;
    }

    // Check if offline cached audio is available
    if (window.aefOfflineManager) {
      window.aefOfflineManager.getOfflineAudioUrl(audioSrc, this.currentTrack.id).then(offlineUrl => {
        if (offlineUrl) {
          console.log("✈️ In-Flight Offline Audio loaded from local storage!");
          this.audio.src = offlineUrl;
        } else {
          this.audio.src = audioSrc;
        }
        this.audio.load();
      }).catch(() => {
        this.audio.src = audioSrc;
        this.audio.load();
      });
    } else {
      this.audio.src = audioSrc;
      this.audio.load();
    }

    this._updateMediaSessionMetadata();
    this.onTrackLoaded(this.currentTrack, this.currentTrackIndex, this.sentences);
  }

  play() {
    return this.audio.play().catch(err => {
      console.log("Autoplay bloqueado pelo navegador ou aguardando interação do usuário:", err);
    });
  }

  pause() {
    this.audio.pause();
  }

  togglePlay() {
    if (this.audio.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  seek(seconds) {
    if (Number.isFinite(seconds)) {
      try {
        const targetTime = Math.max(0, Math.min(seconds, this.audio.duration || 999999));
        this.audio.currentTime = targetTime;
      } catch (e) {
        console.warn("Seek error:", e);
      }
    }
  }

  seekRelative(deltaSeconds) {
    this.seek(this.audio.currentTime + deltaSeconds);
  }

  setPlaybackRate(rate) {
    this.audio.playbackRate = rate;
    if ("preservesPitch" in this.audio) {
      this.audio.preservesPitch = true;
    }
  }

  jumpToSentence(index, autoPlay = true) {
    if (index >= 0 && index < this.sentences.length) {
      const sentence = this.sentences[index];
      this.seek(sentence.start);
      this.activeSentenceIndex = index;
      if (this.isLoopSentenceEnabled) {
        this.loopSentenceIndex = index;
      }
      this.onSentenceChange(index, sentence);
      if (autoPlay) {
        this.play();
      }
    }
  }

  toggleSentenceLoop(index = null) {
    if (this.isLoopSentenceEnabled && (index === null || index === this.loopSentenceIndex)) {
      this.isLoopSentenceEnabled = false;
      this.loopSentenceIndex = -1;
    } else {
      this.isLoopSentenceEnabled = true;
      this.loopSentenceIndex = index !== null ? index : (this.activeSentenceIndex >= 0 ? this.activeSentenceIndex : 0);
      if (this.loopSentenceIndex >= 0 && this.sentences[this.loopSentenceIndex]) {
        this.seek(this.sentences[this.loopSentenceIndex].start);
        this.play();
      }
    }
    return {
      enabled: this.isLoopSentenceEnabled,
      index: this.loopSentenceIndex
    };
  }

  setKaraokeEnabled(enabled) {
    this.isKaraokeEnabled = enabled;
  }

  _checkSentenceSync(curTime) {
    if (!this.sentences || this.sentences.length === 0) return;

    // Se estiver em modo Loop de Frase
    if (this.isLoopSentenceEnabled && this.loopSentenceIndex >= 0 && this.sentences[this.loopSentenceIndex]) {
      const target = this.sentences[this.loopSentenceIndex];
      if (curTime >= target.end || curTime < target.start - 0.2) {
        this.audio.currentTime = target.start;
        return;
      }
    }

    if (!this.isKaraokeEnabled) return;

    // Busca milimétrica da frase correspondente ao tempo atual
    let foundIndex = -1;
    for (let i = 0; i < this.sentences.length; i++) {
      const s = this.sentences[i];
      const next = this.sentences[i + 1];

      // Se está exatamente dentro da frase
      if (curTime >= s.start && curTime <= s.end) {
        foundIndex = i;
        break;
      }

      // Se está na pausa natural antes da próxima frase, sustenta a frase atual até a próxima soar
      if (next && curTime > s.end && curTime < next.start) {
        foundIndex = i;
        break;
      }
    }

    // Fallback inteligente para início/fim
    if (foundIndex === -1 && this.sentences.length > 0) {
      if (curTime < this.sentences[0].start) {
        foundIndex = 0;
      } else if (curTime >= this.sentences[this.sentences.length - 1].end) {
        foundIndex = this.sentences.length - 1;
      }
    }

    if (foundIndex !== -1 && foundIndex !== this.activeSentenceIndex) {
      this.activeSentenceIndex = foundIndex;
      this.onSentenceChange(foundIndex, this.sentences[foundIndex]);
    }
  }

  _setupMediaSession() {
    if (!("mediaSession" in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler("play", () => this.play());
      navigator.mediaSession.setActionHandler("pause", () => this.pause());
      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        const skipTime = details.seekOffset || 10;
        this.seekRelative(-skipTime);
      });
      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        const skipTime = details.seekOffset || 10;
        this.seekRelative(skipTime);
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        if (this.activeSentenceIndex > 0) {
          this.jumpToSentence(this.activeSentenceIndex - 1);
        } else if (this.currentTrackIndex > 0) {
          this.loadStudentData(this.currentStudent, this.currentTrackIndex - 1);
          this.play();
        }
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        if (this.activeSentenceIndex < this.sentences.length - 1) {
          this.jumpToSentence(this.activeSentenceIndex + 1);
        } else if (this.currentStudent && this.currentTrackIndex < this.currentStudent.tracks.length - 1) {
          this.loadStudentData(this.currentStudent, this.currentTrackIndex + 1);
          this.play();
        }
      });
    } catch (e) {
      console.warn("Erro ao registrar MediaSession handlers:", e);
    }
  }

  _updateMediaSessionMetadata() {
    if (!("mediaSession" in navigator) || !this.currentTrack) return;

    const studentName = this.currentStudent ? this.currentStudent.name : "VIP Mentee";
    const coverRaw = this.currentTrack.coverImage || "assets/images/cover-default-aef.jpg";
    
    // Resolve absolute HTTPS URL for lock screen compatibility on iOS / Android
    let coverAbs = "";
    if (coverRaw.startsWith("http://") || coverRaw.startsWith("https://")) {
      coverAbs = coverRaw;
    } else {
      const cleanPath = coverRaw.replace(/^(\.\.\/|\.\/)+/, '').replace(/^\//, '');
      coverAbs = `${window.location.origin}/${cleanPath}`;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: this.currentTrack.title || "Spoken Reflex Training",
      artist: `Prof. Leonardo Leite • AgoraEuFalo (${studentName})`,
      album: "English Personal Training Suite",
      artwork: [
        { src: coverAbs, sizes: "512x512", type: "image/jpeg" },
        { src: coverAbs, sizes: "384x384", type: "image/jpeg" },
        { src: coverAbs, sizes: "256x256", type: "image/jpeg" },
        { src: coverAbs, sizes: "192x192", type: "image/jpeg" },
        { src: coverAbs, sizes: "128x128", type: "image/jpeg" },
        { src: coverAbs, sizes: "96x96", type: "image/jpeg" }
      ]
    });
  }

  _updateMediaSessionPlaybackState(state) {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  }

  _updateMediaSessionPosition() {
    if ("mediaSession" in navigator && "setPositionState" in navigator.mediaSession) {
      try {
        if (this.audio.duration && !isNaN(this.audio.duration)) {
          navigator.mediaSession.setPositionState({
            duration: this.audio.duration,
            playbackRate: this.audio.playbackRate,
            position: this.audio.currentTime
          });
        }
      } catch (e) {
        // Ignora pequenos desvios de sincronização
      }
    }
  }
}

window.AEFPlayerEngine = AEFPlayerEngine;
