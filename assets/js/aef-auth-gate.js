/**
 * AgoraEuFalo - Legacy Gate Cleaner
 * Professor Leonardo Leite
 */

(function() {
  'use strict';
  // Purge legacy overlays if present in DOM
  try {
    const el = document.getElementById('aef-auth-gate-overlay');
    if (el) el.remove();
    const st = document.getElementById('aef-gate-style');
    if (st) st.remove();
  } catch(e) {}
})();
