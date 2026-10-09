import re

with open('blog/post-template.html', 'r') as f:
    template = f.read()

# Replace the static placeholders with dynamic JS injection logic
# 1. We keep the layout, but strip out the {{}} and replace with IDs so JS can fill them

# Remove the static head meta tags that we can't easily replace without SSR, but we will leave them empty or with JS fillers
template = template.replace('{{POST_META_TITLE}}', 'AgoraEuFalo')
template = template.replace('{{POST_META_DESCRIPTION}}', 'O podcast oficial e blog do AgoraEuFalo.')
template = template.replace('{{POST_SLUG}}', '')
template = template.replace('{{POST_TITLE}}', 'AgoraEuFalo')
template = template.replace('{{POST_IMAGE_URL}}', 'assets/images/og-magic-stories.jpg')
template = template.replace('{{POST_PUBLISHED_DATE}}', '')
template = template.replace('{{POST_MODIFIED_DATE}}', '')

# Body injections
template = template.replace('{{POST_TITLE}}', '<span id="dyn-title">Carregando...</span>')

# For the podcast block
audio_block = """
      <!-- Podcast Audio Player (Se houver) -->
      <div id="dyn-podcast-block" class="mb-10 p-5 sm:p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-6 hidden">
        <div class="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-2xl overflow-hidden bg-slate-800 shadow-md border border-slate-700">
          <img id="dyn-podcast-cover" src="" alt="Podcast Cover" class="w-full h-full object-cover">
        </div>
        <div class="flex-1 w-full space-y-3">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">🎧 Ouça o Episódio</span>
            <span class="text-xs text-slate-400 font-medium">AgoraEuFalo Podcasts</span>
          </div>
          <h3 id="dyn-podcast-title" class="text-lg sm:text-xl font-bold text-white leading-snug">...</h3>
          <audio id="dyn-podcast-audio" controls controlsList="nodownload" class="w-full h-10 mt-2 custom-audio-player">
            <source src="" type="audio/mpeg">
            Seu navegador não suporta o elemento de áudio.
          </audio>
          <div class="flex items-center gap-4 text-[10px] text-slate-500 font-medium pt-1">
            <a id="dyn-podcast-download" href="#" target="_blank" download class="hover:text-emerald-400 transition-colors flex items-center gap-1"><i data-lucide="download" class="w-3 h-3"></i> Baixar MP3</a>
            <a href="https://podcasts.apple.com" target="_blank" class="hover:text-white transition-colors flex items-center gap-1"><i data-lucide="headphones" class="w-3 h-3"></i> Apple Podcasts</a>
            <a href="https://spotify.com" target="_blank" class="hover:text-emerald-400 transition-colors flex items-center gap-1"><i data-lucide="music" class="w-3 h-3"></i> Spotify</a>
          </div>
        </div>
      </div>
"""
# Replace the previously injected block in post-template with the dynamic block
template = re.sub(r'<!-- Podcast Audio Player \(Se houver\) -->.*?{{END_IF_PODCAST}}', audio_block, template, flags=re.DOTALL)

# Add dynamic content container
template = template.replace('<!-- Post Body Content -->', '<!-- Post Body Content -->\n      <div id="dyn-body-content" class="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-a:text-amber-600"></div>')
template = template.replace('{{POST_READ_TIME}}', '<span id="dyn-read-time"></span>')
template = template.replace('{{POST_DATE}}', '<span id="dyn-date"></span>')
template = template.replace('{{POST_CATEGORY}}', '<span id="dyn-category"></span>')

# Add the script at the bottom
script = """
  <script src="../assets/js/aef-portal-auth.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const slug = urlParams.get('slug');
      if (!slug) {
         window.location.href = 'index.html';
         return;
      }
      
      try {
         await window.aefPortalAuth.ready();
         const db = window.aefPortalAuth.db;
         const snapshot = await db.collection('blog_posts').where('slug', '==', slug).get();
         if (snapshot.empty) {
            document.getElementById('dyn-title').innerText = "Artigo não encontrado";
            return;
         }
         
         const post = snapshot.docs[0].data();
         
         // Update UI
         document.title = post.title + " | AgoraEuFalo";
         document.getElementById('dyn-title').innerText = post.title;
         
         if (document.getElementById('dyn-category')) document.getElementById('dyn-category').innerText = post.category || 'Artigo';
         if (document.getElementById('dyn-read-time')) document.getElementById('dyn-read-time').innerText = post.readTime || '5 min';
         if (document.getElementById('dyn-date')) document.getElementById('dyn-date').innerText = post.date || '';
         
         document.getElementById('dyn-body-content').innerHTML = post.bodyHtml || post.subtitle || '';
         
         // Podcast UI
         if (post.podcastAudioUrl) {
            document.getElementById('dyn-podcast-block').classList.remove('hidden');
            document.getElementById('dyn-podcast-cover').src = post.podcastCoverUrl || post.imageUrl || '../assets/images/og-magic-stories.jpg';
            document.getElementById('dyn-podcast-title').innerText = post.title;
            document.getElementById('dyn-podcast-audio').src = post.podcastAudioUrl;
            document.getElementById('dyn-podcast-download').href = post.podcastAudioUrl;
         }
         
         // Highlight.js or Icons
         if (window.lucide) window.lucide.createIcons();
         
      } catch (err) {
         console.error(err);
      }
    });
  </script>
"""
template = template.replace('</body>', script + '\n</body>')

with open('blog/post.html', 'w') as f:
    f.write(template)
print("Created blog/post.html")
