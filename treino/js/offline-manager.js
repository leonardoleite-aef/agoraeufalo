/**
 * AgoraEuFalo - In-Flight Offline Cache Manager
 * Professor Leonardo Leite
 * Enables 100% offline audio training during flights and disconnected commutes.
 */

class AEFOfflineManager {
  constructor() {
    this.cacheName = 'aef-flight-cache-v1';
    this.isSupported = 'caches' in window || 'indexedDB' in window;
    this.init();
  }

  async init() {
    // Register Service Worker if supported and running on HTTP/HTTPS
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      try {
        await navigator.serviceWorker.register('sw.js');
        console.log('✅ In-Flight Service Worker registered successfully.');
      } catch (err) {
        console.log('SW registration note:', err);
      }
    }
  }

  /**
   * Check if a specific audio track is cached locally
   */
  async isTrackCached(audioUrl) {
    if (!('caches' in window)) return false;
    try {
      const cache = await caches.open(this.cacheName);
      const matched = await cache.match(audioUrl);
      return !!matched;
    } catch (e) {
      return false;
    }
  }

  /**
   * Download and cache the entire workout (audio, data, covers, scripts)
   */
  async cacheWorkout(track, onProgress = () => {}) {
    if (!('caches' in window)) {
      throw new Error('Cache Storage not supported in this browser environment.');
    }

    const cache = await caches.open(this.cacheName);
    let audioUrl = track.audioUrl;
    if (window.location.protocol === 'file:' && audioUrl.startsWith('/')) {
      audioUrl = '..' + audioUrl;
    }

    const assetsToCache = [
      window.location.href,
      'player.html',
      '../assets/images/AEF-Logo_2026_fundo_escuro-800x300.png',
      '../assets/images/favicon.svg',
      track.coverImage || '../assets/images/cover-office-logistics.jpg',
      'data/registry.js',
      'data/estevao.js',
      'data/marcos.js',
      'data/patricia.js',
      'data/carlos.js',
      'js/player-engine.js',
      'js/ui-controller.js',
      'js/offline-manager.js'
    ];

    onProgress(10, 'Saving interface & study materials...');
    for (const asset of assetsToCache) {
      try {
        await cache.add(asset);
      } catch (e) {
        console.log('Optional asset cache skip:', asset);
      }
    }

    onProgress(40, 'Downloading full audio session for Flight Mode...');
    
    // Fetch and cache the audio file
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.statusText}`);
    }

    // Put into Cache Storage
    await cache.put(audioUrl, response.clone());
    
    // Also save in IndexedDB as a resilient fallback blob
    try {
      const blob = await response.blob();
      await this._saveBlobToIndexedDB(track.id, blob);
    } catch (e) {
      console.log('IndexedDB storage note:', e);
    }

    onProgress(100, 'Flight Mode Ready!');
    return true;
  }

  /**
   * Retrieve cached audio as an offline Blob URL
   */
  async getOfflineAudioUrl(audioUrl, trackId) {
    // 1. Try Cache Storage
    if ('caches' in window) {
      try {
        const cache = await caches.open(this.cacheName);
        const match = await cache.match(audioUrl);
        if (match) {
          const blob = await match.blob();
          return URL.createObjectURL(blob);
        }
      } catch (e) {
        console.log('Cache match error:', e);
      }
    }

    // 2. Try IndexedDB Fallback
    try {
      const blob = await this._getBlobFromIndexedDB(trackId);
      if (blob) {
        return URL.createObjectURL(blob);
      }
    } catch (e) {
      console.log('IndexedDB match error:', e);
    }

    return null;
  }

  _getDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AEFFlightDB', 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('audios')) {
          db.createObjectStore('audios');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async _saveBlobToIndexedDB(key, blob) {
    const db = await this._getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('audios', 'readwrite');
      const store = tx.objectStore('audios');
      store.put(blob, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  async _getBlobFromIndexedDB(key) {
    const db = await this._getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('audios', 'readonly');
      const store = tx.objectStore('audios');
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

window.aefOfflineManager = new AEFOfflineManager();
