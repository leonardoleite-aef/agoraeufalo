/**
 * Seed 2 New Blog Posts into Google Cloud Firestore (blog_posts collection)
 */

const https = require('https');

const PROJECT_ID = "agoraeufalo-3463a";

const posts = [
  {
    slug: "como-falar-ingles-com-personalidade",
    data: {
      fields: {
        id: { stringValue: "post-personalidade-01" },
        title: { stringValue: "Como Falar Inglês com Personalidade: Chunks e Expressões que Tiram o Tom Robótico da sua Fala" },
        slug: { stringValue: "como-falar-ingles-com-personalidade" },
        category: { stringValue: "Inspiração Editorial" },
        hasVideoEmbed: { booleanValue: false },
        youtubeId: { stringValue: "LEAt7FoycH4" },
        imageUrl: { stringValue: "https://agoraeufalo.com.br/assets/images/cover-como-falar-ingles-com-personalidade.jpg" },
        subtitle: { stringValue: "Descubra como colocar carisma, humor e espontaneidade na sua fala em inglês. Pare de soar como um tradutor automático e use as expressões dos nativos." },
        pdfUrl: { stringValue: "Material-PDF/como-falar-ingles-com-personalidade.pdf" },
        goldenTip: { stringValue: "A entonação é 70% da sua personalidade em inglês. Abaixe o tom suavemente no final do chunk e faça uma micro-pausa." },
        date: { stringValue: "25 de Agosto, 2026" },
        readTime: { stringValue: "8 min de leitura" },
        status: { stringValue: "published" },
        updatedAt: { stringValue: new Date().toISOString() }
      }
    }
  },
  {
    slug: "expandindo-seu-vocabulario-em-ingles-sem-esquecer",
    data: {
      fields: {
        id: { stringValue: "post-vocabulario-01" },
        title: { stringValue: "Expandindo Seu Vocabulário Em Inglês: O Segredo dos Chunks Para Você Nunca Mais Esquecer" },
        slug: { stringValue: "expandindo-seu-vocabulario-em-ingles-sem-esquecer" },
        category: { stringValue: "Treino Auditivo" },
        hasVideoEmbed: { booleanValue: true },
        youtubeId: { stringValue: "-elDznr0xoU" },
        imageUrl: { stringValue: "https://img.youtube.com/vi/-elDznr0xoU/maxresdefault.jpg" },
        subtitle: { stringValue: "Por que listas de palavras soltas morrem em 48 horas e como a neurociência do aprendizado em blocos sonoros ancora expressões no reflexo oral." },
        pdfUrl: { stringValue: "Material-PDF/expandindo-seu-vocabulario-em-ingles-sem-esquecer.pdf" },
        goldenTip: { stringValue: "Você não fala palavras; você fala blocos acústicos inteiros. Treine o ouvido para capturar a música da frase." },
        date: { stringValue: "25 de Agosto, 2026" },
        readTime: { stringValue: "10 min de aula" },
        status: { stringValue: "published" },
        updatedAt: { stringValue: new Date().toISOString() }
      }
    }
  }
];

async function seedPosts() {
  console.log("📡 Gravando posts no Google Cloud Firestore (blog_posts)...");
  for (const p of posts) {
    const payload = JSON.stringify(p.data);
    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/blog_posts/${p.slug}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    await new Promise((resolve, reject) => {
      const req = https.request(options, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          console.log(`✅ Post '${p.slug}' gravado com status ${res.statusCode}`);
          resolve();
        });
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }
}

seedPosts();
