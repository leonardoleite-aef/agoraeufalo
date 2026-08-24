/**
 * AgoraEuFalo - Master Access Security Gate & Anti-Intruder Shield
 * Professor Leonardo Leite
 * 
 * Provides SHA-256 cryptographic protection, rate-limiting, and auto-lock
 * for internal administrative workspaces (Admin, TTS Studio, Blog Panel, SEO).
 */

(function() {
  const MASTER_HASH = "73d220bc50935bf1689a00889f5876e6411c506631aacd9b88bddcfd2fd715df";
  const AUTH_KEY = "AEF_MASTER_SESSION_AUTH";
  const ATTEMPTS_KEY = "AEF_AUTH_ATTEMPTS";

  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function isAuthenticated() {
    return sessionStorage.getItem(AUTH_KEY) === "true";
  }

  function getAttemptsData() {
    try {
      const data = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '{"count": 0, "lockUntil": 0}');
      return data;
    } catch (e) {
      return { count: 0, lockUntil: 0 };
    }
  }

  function recordFailedAttempt() {
    const data = getAttemptsData();
    data.count += 1;
    if (data.count >= 5) {
      data.lockUntil = Date.now() + 60000; // 1 minute lockout
    }
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(data));
    return data;
  }

  function resetAttempts() {
    localStorage.removeItem(ATTEMPTS_KEY);
  }

  // Inject Lock Overlay
  function renderLockScreen() {
    // Hide body content immediately
    const style = document.createElement('style');
    style.id = 'aef-gate-style';
    style.innerHTML = `
      #aef-auth-gate-overlay {
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: #060D17;
        color: #F8FAFC;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        padding: 1rem;
      }
      .aef-gate-card {
        background: #0F172A;
        border: 2px solid #D97706;
        border-radius: 1.5rem;
        padding: 2.25rem 2rem;
        max-width: 420px;
        width: 100%;
        text-align: center;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(217, 119, 6, 0.15);
      }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'aef-auth-gate-overlay';
    overlay.innerHTML = `
      <div class="aef-gate-card">
        <div style="width: 56px; height: 56px; background: rgba(245, 158, 11, 0.15); border: 2px solid rgba(245, 158, 11, 0.4); border-radius: 1rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; color: #F59E0B; font-size: 1.5rem;">
          🔒
        </div>
        
        <div style="display: inline-block; padding: 0.25rem 0.75rem; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 9999px; color: #FBBF24; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 0.75rem;">
          Acesso Restrito • Prof. Leonardo Leite
        </div>

        <h2 style="font-size: 1.25rem; font-weight: 800; color: #FFFFFF; margin-bottom: 0.5rem; letter-spacing: -0.02em;">
          Painel Administrativo AgoraEuFalo
        </h2>
        
        <p style="font-size: 0.75rem; color: #94A3B8; margin-bottom: 1.5rem; line-height: 1.4;">
          Esta área é de uso estritamente restrito. Digite a sua senha mestra para desbloquear as ferramentas de produção.
        </p>

        <form id="aef-gate-form" style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div style="position: relative;">
            <input type="password" id="aef-gate-input" placeholder="Digite sua Senha Mestra" autocomplete="current-password" autofocus required style="width: 100%; box-sizing: border-box; background: #060D17; border: 1.5px solid #1E293B; border-radius: 0.875rem; padding: 0.75rem 1rem; color: #FFFFFF; font-size: 0.875rem; font-family: monospace; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#F59E0B'" onblur="this.style.borderColor='#1E293B'">
          </div>
          
          <button type="submit" id="aef-gate-submit-btn" style="background: linear-gradient(to right, #F59E0B, #D97706); color: #020617; font-weight: 800; font-size: 0.8125rem; padding: 0.75rem 1.25rem; border: none; border-radius: 0.875rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);">
            Desbloquear Acesso ↗
          </button>
        </form>

        <p id="aef-gate-error" style="color: #F87171; font-size: 0.75rem; font-weight: 600; margin-top: 0.75rem; display: none;">
          Senha incorreta. Tente novamente.
        </p>

        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #1E293B; display: flex; align-items: center; justify-content: space-between; font-size: 0.7rem; color: #64748B;">
          <span>© 2026 AgoraEuFalo</span>
          <a href="index.html" style="color: #F59E0B; text-decoration: none; font-weight: 600;">← Ir para o Início</a>
        </div>
      </div>
    `;

    document.documentElement.appendChild(overlay);

    const form = document.getElementById('aef-gate-form');
    const input = document.getElementById('aef-gate-input');
    const err = document.getElementById('aef-gate-error');
    const submitBtn = document.getElementById('aef-gate-submit-btn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const attemptsData = getAttemptsData();
      if (attemptsData.lockUntil > Date.now()) {
        const remainingSec = Math.ceil((attemptsData.lockUntil - Date.now()) / 1000);
        err.textContent = `Muitas tentativas. Bloqueado por mais ${remainingSec}s.`;
        err.style.display = 'block';
        return;
      }

      const val = input.value.trim();
      if (!val) return;

      submitBtn.disabled = true;
      submitBtn.textContent = "Verificando...";

      const hashed = await sha256(val);
      if (hashed === MASTER_HASH) {
        resetAttempts();
        sessionStorage.setItem(AUTH_KEY, "true");
        overlay.remove();
        style.remove();
        injectLogoutControl();
      } else {
        const updated = recordFailedAttempt();
        input.value = "";
        submitBtn.disabled = false;
        submitBtn.textContent = "Desbloquear Acesso ↗";
        
        if (updated.count >= 5) {
          err.textContent = "Limite de tentativas atingido. Bloqueado por 60 segundos.";
        } else {
          err.textContent = `Senha incorreta. (${5 - updated.count} tentativas restantes)`;
        }
        err.style.display = 'block';
        input.focus();
      }
    });
  }

  function injectLogoutControl() {
    document.addEventListener('DOMContentLoaded', () => {
      // Find header actions to append lock button
      const header = document.querySelector('header');
      if (!header) return;

      const lockBtn = document.createElement('button');
      lockBtn.className = 'px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold transition flex items-center gap-1';
      lockBtn.title = 'Trancar e Sair do Painel';
      lockBtn.innerHTML = `<span>🔒</span><span class="hidden sm:inline">Trancar</span>`;
      lockBtn.onclick = () => {
        sessionStorage.removeItem(AUTH_KEY);
        window.location.reload();
      };

      const rightControls = header.querySelector('.flex.items-center.gap-2, .flex.items-center.gap-3, .flex.items-center.gap-2\\.5') || header;
      if (rightControls && rightControls !== header) {
        rightControls.appendChild(lockBtn);
      }
    });
  }

  // Self-executing gate logic
  if (!isAuthenticated()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderLockScreen);
    } else {
      renderLockScreen();
    }
  } else {
    injectLogoutControl();
  }
})();
