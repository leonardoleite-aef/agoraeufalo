import re

with open('blog/index.html', 'r') as f:
    content = f.read()

# Modify the hero post badge
old_hero_badge = """              ${heroPost.youtubeId ? `
                <div class="absolute bottom-4 right-4">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-950/80 text-white backdrop-blur-md flex items-center gap-1.5">
                    <i data-lucide="play-circle" class="w-4 h-4 text-amber-400"></i> Com Vídeo-Aula
                  </span>
                </div>
              ` : ''}"""

new_hero_badge = """              ${heroPost.podcastAudioUrl ? `
                <div class="absolute bottom-4 right-4">
                  <span class="px-3 py-1.5 rounded-xl text-xs font-black bg-slate-950 text-white shadow-lg shadow-amber-900/20 flex items-center gap-2 border border-slate-800">
                    <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    🎧 Episódio de Podcast
                  </span>
                </div>
              ` : heroPost.youtubeId ? `
                <div class="absolute bottom-4 right-4">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-950/80 text-white backdrop-blur-md flex items-center gap-1.5">
                    <i data-lucide="play-circle" class="w-4 h-4 text-amber-400"></i> Com Vídeo-Aula
                  </span>
                </div>
              ` : ''}"""

content = content.replace(old_hero_badge, new_hero_badge)

# Modify the grid post badge
old_grid_badge = """                  <div class="aspect-video bg-slate-900 overflow-hidden relative">
                    <img src="${imgUrl}" alt="${p.title}" onerror="this.onerror=null; this.src='https://img.youtube.com/vi/${p.youtubeId || '8DbXCHwZTL0'}/hqdefault.jpg';" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900">
                      ${p.category}
                    </span>
                  </div>"""

new_grid_badge = """                  <div class="aspect-video bg-slate-900 overflow-hidden relative">
                    <img src="${imgUrl}" alt="${p.title}" onerror="this.onerror=null; this.src='https://img.youtube.com/vi/${p.youtubeId || '8DbXCHwZTL0'}/hqdefault.jpg';" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900">
                      ${p.category}
                    </span>
                    ${p.podcastAudioUrl ? `
                      <span class="absolute bottom-3 right-3 px-2 py-1 rounded-md text-[10px] font-black bg-slate-950/90 text-white backdrop-blur-sm flex items-center gap-1">
                        🎧 Podcast
                      </span>
                    ` : ''}
                  </div>"""

content = content.replace(old_grid_badge, new_grid_badge)

with open('blog/index.html', 'w') as f:
    f.write(content)
print("Patched blog/index.html")
