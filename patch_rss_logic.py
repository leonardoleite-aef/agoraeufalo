import re

with open('blog-panel.html', 'r') as f:
    content = f.read()

rss_generator_code = """
    // =========================================================================
    // O SINDICATO (Motor RSS Autônomo)
    // =========================================================================
    async function rebuildAndPublishRSS() {
       try {
         // Pega todos os posts da memória local (que acabaram de ser salvos/atualizados)
         // E filtra apenas os publicados que possuem arquivo de podcast
         const podcastEpisodes = _library.filter(p => p.status === 'published' && p.podcastAudioUrl);
         
         if (podcastEpisodes.length === 0) return; // Nada para gerar

         let rssItems = podcastEpisodes.map(ep => {
            const pubDate = new Date(ep.date).toUTCString(); // Simplificação para formato RSS válido
            
            return `
            <item>
              <title><![CDATA[${ep.title}]]></title>
              <link>https://agoraeufalo.com.br/blog/${ep.slug}</link>
              <guid isPermaLink="false">${ep.id}</guid>
              <pubDate>${pubDate}</pubDate>
              <description><![CDATA[${ep.subtitle}]]></description>
              <content:encoded><![CDATA[${ep.bodyHtml}]]></content:encoded>
              <enclosure url="${ep.podcastAudioUrl}" type="audio/mpeg" length="1024" />
              <itunes:image href="${ep.podcastCoverUrl || ep.imageUrl}" />
              <itunes:episodeType>full</itunes:episodeType>
              <itunes:author>Professor Leonardo Leite</itunes:author>
              <itunes:explicit>no</itunes:explicit>
            </item>
            `;
         }).join('\\n');

         const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>AgoraEuFalo Podcasts</title>
    <link>https://agoraeufalo.com.br</link>
    <language>pt-BR</language>
    <itunes:author>Professor Leonardo Leite</itunes:author>
    <description>O podcast oficial do AgoraEuFalo. Fluência e reflexo no inglês real.</description>
    <itunes:image href="https://media.agoraeufalo.com.br/images/cover-podcast-1x1.jpg" />
    <itunes:category text="Education">
       <itunes:category text="Language Learning"/>
    </itunes:category>
    ${rssItems}
  </channel>
</rss>`;

         const token = await _getAuthToken();
         const res = await fetch('https://agoraeufalo.com.br/api/admin/publish-rss', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/xml' },
            body: rssFeed
         });

         if (res.ok) {
            console.log("RSS Feed atualizado no R2 com sucesso!");
         } else {
            console.error("Falha ao atualizar RSS Feed no R2.");
         }
       } catch (err) {
         console.error("Erro interno no Motor RSS:", err);
       }
    }
"""

save_patch = """        await _originalSavePost(post);
        savePost = _originalSavePost; // restaura

        // GATILHO DO MOTOR RSS: Se salvou e tem áudio, recompila o Sindicato!
        if (post.status === 'published' && post.podcastAudioUrl) {
           showToast('Atualizando distribuidores de Podcast...', 'info');
           await rebuildAndPublishRSS();
        }
"""

content = content.replace("        await _originalSavePost(post);\n        savePost = _originalSavePost; // restaura", save_patch)

# Insert rss_generator_code right before handleSaveArticle
insertion = content.find("    async function handleSaveArticle(e) {")
if insertion != -1:
    content = content[:insertion] + rss_generator_code + "\n" + content[insertion:]
    with open('blog-panel.html', 'w') as f:
        f.write(content)
    print("Patched RSS Generator!")
else:
    print("Failed to patch RSS Generator")

