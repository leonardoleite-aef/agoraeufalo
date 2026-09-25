const https = require('https');

const PROJECT_ID = "agoraeufalo-3463a";

const post = {
  slug: "eu-consegui-publicar-no-blog-do-leo",
  data: {
    fields: {
      title: { stringValue: "Eu consegui publicar no Blog do Leo" },
      slug: { stringValue: "eu-consegui-publicar-no-blog-do-leo" },
      status: { stringValue: "published" },
      distBlog: { booleanValue: true },
      distRss: { booleanValue: true },
      distPlayer: { booleanValue: true },
      mediaUrl: { stringValue: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      blocks: {
        arrayValue: {
          values: [
            {
              mapValue: {
                fields: {
                  type: { stringValue: "paragraph" },
                  data: {
                    mapValue: {
                      fields: {
                        text: { stringValue: "este é um teste feito pelo programador e desenvolvedor do AgoraEuFalo para provar que o que eu desenvolvi e codei, funciona. Now, let's see if this thing really works:" }
                      }
                    }
                  }
                }
              }
            },
            {
              mapValue: {
                fields: {
                  type: { stringValue: "audio-reveal" },
                  data: {
                    mapValue: {
                      fields: {
                        question: { stringValue: "Wow! It's been working so far! I'm really glad Leo created this!" },
                        answer: { stringValue: "Wow! Tem funcionado até agora! Estou muito feliz que o Leo criou isso!" },
                        audioUrl: { stringValue: "https://mock.storage/audio/blog_media/test.mp3" }
                      }
                    }
                  }
                }
              }
            }
          ]
        }
      },
      updatedAt: { stringValue: new Date().toISOString() },
      createdAt: { stringValue: new Date().toISOString() }
    }
  }
};

async function seedPost() {
  console.log("📡 Gravando post de teste no Google Cloud Firestore...");
  const payload = JSON.stringify(post.data);
  const options = {
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/blog_posts/${post.slug}`,
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
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Post '${post.slug}' publicado! URL oficial: https://agoraeufalo.com.br/blog/${post.slug}`);
        } else {
          console.log(`❌ Erro ${res.statusCode}: ${body}`);
        }
        resolve();
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

seedPost();
