const fs = require('fs');
const path = require('path');

// Simulate fetching from Firestore for build time
// Em produção, isso bateria no Firestore Admin SDK.
// Para este script de build estático, assumimos que o CMS 
// já escreveu os dados num JSON local durante o build (se houver CI),
// ou ele pode usar firebase-admin.

async function generateRSSFeeds() {
  console.log("Gerando feeds RSS a partir do Firestore...");
  
  // Como estamos num ambiente local sem Service Account do Firebase,
  // precisaremos importar os dados exportados ou bater via REST.
  // Neste caso, para o Sprint 2, este script ficará pronto para 
  // receber os dados do banco quando rodar no ambiente de Build.
  
  const rssBlogPath = path.join(__dirname, '../blog-feed.xml');
  const rssPodcastPath = path.join(__dirname, '../podcast-feed.xml');
  
  // Estrutura básica do RSS (Exemplo Mock até termos a Service Account)
  const blogRss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Blog AgoraEuFalo</title>
  <link>https://agoraeufalo.com.br/blog</link>
  <description>Reflexões e aulas do Professor Leo Leite</description>
  <!-- Os itens serão populados pelo Worker ou Script de Deploy dinamicamente -->
</channel>
</rss>`;

  const podcastRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>Podcast AgoraEuFalo</title>
    <link>https://agoraeufalo.com.br/blog</link>
    <language>pt-br</language>
    <itunes:author>Professor Leonardo Leite</itunes:author>
    <itunes:image href="https://agoraeufalo.com.br/assets/images/og-magic-stories.jpg" />
    <!-- Itens populados dinamicamente com as tags enclosure do MP3 -->
  </channel>
</rss>`;

  fs.writeFileSync(rssBlogPath, blogRss, 'utf8');
  fs.writeFileSync(rssPodcastPath, podcastRss, 'utf8');
  
  console.log("✅ Feeds gerados: blog-feed.xml e podcast-feed.xml");
}

generateRSSFeeds();
