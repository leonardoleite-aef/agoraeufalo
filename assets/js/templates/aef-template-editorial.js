/**
 * AGORAEUFALO TEMPLATE MODULE: EDITORIAL PRESTIGE
 * Encapsula a moldura e os componentes do layout Editorial Prestige
 * Usado por: portal.html, sala-de-aula.html e paginas do ecossistema
 */

window.AEFEditorialTemplate = {
  renderHeaderNav: function(activeTab = 'dashboard') {
    return `
      <nav class="flex items-center gap-6 sm:gap-8 text-xs font-bold">
        <a href="portal.html" class="${activeTab === 'dashboard' ? 'text-[#0A192F] border-b-2 border-[#0A192F] pb-1.5 font-black' : 'text-[#7A7369] hover:text-[#0A192F] pb-1.5 transition'}">Dashboard</a>
        <a href="sala-de-aula.html?curso=projeto-aef-2026" class="${activeTab === 'courses' ? 'text-[#0A192F] border-b-2 border-[#0A192F] pb-1.5 font-black' : 'text-[#7A7369] hover:text-[#0A192F] pb-1.5 transition'}">Courses</a>
        <a href="https://wa.me/5531999817975" target="_blank" class="${activeTab === 'community' ? 'text-[#0A192F] border-b-2 border-[#0A192F] pb-1.5 font-black' : 'text-[#7A7369] hover:text-[#0A192F] pb-1.5 transition'}">Community</a>
        <a href="treino/player.html" class="${activeTab === 'progress' ? 'text-[#0A192F] border-b-2 border-[#0A192F] pb-1.5 font-black' : 'text-[#7A7369] hover:text-[#0A192F] pb-1.5 transition'}">Progress</a>
      </nav>
    `;
  },

  renderSidebarNav: function(activeItem = 'courses') {
    return `
      <nav class="space-y-1.5 text-xs font-bold">
        <a href="portal.html" class="flex items-center gap-3 px-3.5 py-3 rounded-2xl ${activeItem === 'courses' ? 'bg-[#F5EFE6] text-[#2C2416] border border-[#E8E0D2] shadow-xs' : 'text-[#6E675F] hover:text-[#2C2416] hover:bg-[#F9F6F0]'} transition">
          <i data-lucide="book-open" class="w-4 h-4 text-[#C68A36]"></i>
          <span>My Courses</span>
        </a>
        <a href="repertorio.html" class="flex items-center gap-3 px-3.5 py-3 rounded-2xl ${activeItem === 'flashcards' ? 'bg-[#F5EFE6] text-[#2C2416] border border-[#E8E0D2] shadow-xs' : 'text-[#6E675F] hover:text-[#2C2416] hover:bg-[#F9F6F0]'} transition">
          <i data-lucide="layers" class="w-4 h-4 text-[#8C8275]"></i>
          <span>Flashcards</span>
        </a>
        <a href="treino/player.html" class="flex items-center gap-3 px-3.5 py-3 rounded-2xl ${activeItem === 'pronunciation' ? 'bg-[#F5EFE6] text-[#2C2416] border border-[#E8E0D2] shadow-xs' : 'text-[#6E675F] hover:text-[#2C2416] hover:bg-[#F9F6F0]'} transition">
          <i data-lucide="volume-2" class="w-4 h-4 text-[#8C8275]"></i>
          <span>Pronunciation Guide</span>
        </a>
        <a href="https://meet.google.com/kvu-upgw-osv" target="_blank" class="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-[#6E675F] hover:text-[#2C2416] hover:bg-[#F9F6F0] transition">
          <i data-lucide="video" class="w-4 h-4 text-[#8C8275]"></i>
          <span>Live Classes</span>
        </a>
        <button onclick="window.openMemberProfileModal && window.openMemberProfileModal()" class="w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-2xl text-[#6E675F] hover:text-[#2C2416] hover:bg-[#F9F6F0] transition cursor-pointer">
          <i data-lucide="settings" class="w-4 h-4 text-[#8C8275]"></i>
          <span>Settings</span>
        </button>
      </nav>
    `;
  }
};
