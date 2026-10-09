import re

with open('blog/post-template.html', 'r') as f:
    content = f.read()

audio_player_html = """
      <!-- Podcast Audio Player (Se houver) -->
      {{IF_PODCAST}}
      <div class="mb-10 p-5 sm:p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <div class="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-2xl overflow-hidden bg-slate-800 shadow-md border border-slate-700">
          <img src="https://agoraeufalo.com.br/{{POST_PODCAST_COVER_URL}}" alt="Podcast Cover" class="w-full h-full object-cover">
        </div>
        <div class="flex-1 w-full space-y-3">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">🎧 Ouça o Episódio</span>
            <span class="text-xs text-slate-400 font-medium">AgoraEuFalo Podcasts</span>
          </div>
          <h3 class="text-lg sm:text-xl font-bold text-white leading-snug">{{POST_TITLE}}</h3>
          <audio controls controlsList="nodownload" class="w-full h-10 mt-2 custom-audio-player">
            <source src="{{POST_PODCAST_AUDIO_URL}}" type="audio/mpeg">
            Seu navegador não suporta o elemento de áudio.
          </audio>
          <div class="flex items-center gap-4 text-[10px] text-slate-500 font-medium pt-1">
            <a href="{{POST_PODCAST_AUDIO_URL}}" target="_blank" download class="hover:text-emerald-400 transition-colors flex items-center gap-1"><i data-lucide="download" class="w-3 h-3"></i> Baixar MP3</a>
            <a href="https://podcasts.apple.com" target="_blank" class="hover:text-white transition-colors flex items-center gap-1"><i data-lucide="headphones" class="w-3 h-3"></i> Apple Podcasts</a>
            <a href="https://spotify.com" target="_blank" class="hover:text-emerald-400 transition-colors flex items-center gap-1"><i data-lucide="music" class="w-3 h-3"></i> Spotify</a>
          </div>
        </div>
      </div>
      <style>
        .custom-audio-player::-webkit-media-controls-panel { background-color: #1e293b; color: #fff; }
        .custom-audio-player::-webkit-media-controls-current-time-display,
        .custom-audio-player::-webkit-media-controls-time-remaining-display { color: #cbd5e1; }
      </style>
      {{END_IF_PODCAST}}
"""

insertion_point = content.find("      <!-- YouTube Embed Container (Se houver) -->")
if insertion_point != -1:
    content = content[:insertion_point] + audio_player_html + "\n" + content[insertion_point:]
    with open('blog/post-template.html', 'w') as f:
        f.write(content)
    print("Patched post-template.html")
else:
    print("Failed to patch post-template.html")

