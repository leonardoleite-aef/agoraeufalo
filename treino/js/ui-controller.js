/**
 * AgoraEuFalo - UI Controller & Theme Manager
 * Professor Leonardo Leite
 */
class AEFUIController {
  constructor(engine) {
    this.engine = engine;
    
    // Interface State
    this.theme = localStorage.getItem("aef_theme") || "light"; // light | sepia | dark
    this.fontSize = localStorage.getItem("aef_font_size") || "base"; // sm | base | lg
    this.isDrivingMode = false;
    this.isDrawerOpen = false;

    this._applyTheme(this.theme);
    this._applyFontSize(this.fontSize);
  }

  setTheme(theme) {
    this.theme = theme;
    localStorage.setItem("aef_theme", theme);
    this._applyTheme(theme);
    const dropdown = document.getElementById("theme-dropdown");
    if (dropdown) dropdown.classList.add("hidden");
  }

  _applyTheme(theme) {
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-sepia", "theme-dark", "dark");
    root.classList.add(`theme-${theme}`);

    const body = document.body;
    if (!body) return;

    body.classList.remove(
      "bg-[#fbf9f5]", "text-slate-800",
      "bg-[#f5ede0]", "text-[#382818]",
      "bg-[#090d16]", "text-slate-100"
    );

    if (theme === "dark") {
      root.classList.add("dark");
      body.classList.add("bg-[#090d16]", "text-slate-100");
    } else if (theme === "sepia") {
      body.classList.add("bg-[#f5ede0]", "text-[#382818]");
    } else {
      body.classList.add("bg-[#fbf9f5]", "text-slate-800");
    }
  }

  setFontSize(size) {
    this.fontSize = size;
    localStorage.setItem("aef_font_size", size);
    this._applyFontSize(size);
  }

  _applyFontSize(size) {
    const contentEl = document.getElementById("sentences-container");
    if (!contentEl) return;

    contentEl.classList.remove("text-base", "text-lg", "text-xl");
    if (size === "sm") contentEl.classList.add("text-base");
    else if (size === "base") contentEl.classList.add("text-lg");
    else if (size === "lg") contentEl.classList.add("text-xl");
  }

  toggleDrivingMode() {
    this.isDrivingMode = !this.isDrivingMode;
    const readingView = document.getElementById("reading-view");
    const drivingView = document.getElementById("driving-view");
    const drivingBtn = document.getElementById("btn-toggle-driving");

    if (this.isDrivingMode) {
      readingView.classList.add("hidden");
      drivingView.classList.remove("hidden");
      if (drivingBtn) {
        drivingBtn.classList.add("bg-amber-600", "text-white", "border-amber-600");
      }
    } else {
      readingView.classList.remove("hidden");
      drivingView.classList.add("hidden");
      if (drivingBtn) {
        drivingBtn.classList.remove("bg-amber-600", "text-white", "border-amber-600");
      }
    }
  }

  togglePlaylistDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
    const drawer = document.getElementById("playlist-drawer");
    const backdrop = document.getElementById("drawer-backdrop");
    
    if (drawer && backdrop) {
      if (this.isDrawerOpen) {
        drawer.classList.remove("translate-x-full");
        backdrop.classList.remove("hidden");
      } else {
        drawer.classList.add("translate-x-full");
        backdrop.classList.add("hidden");
      }
    }
  }

  formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
}

window.AEFUIController = AEFUIController;
