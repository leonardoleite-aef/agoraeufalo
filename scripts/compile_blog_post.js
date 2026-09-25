const fs = require('fs');
const path = require('path');

async function compilePost(slug) {
  const projectId = 'agoraeufalo-3463a';
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/blog_posts`);
  const data = await res.json();
  
  let post = null;
  if (data.documents) {
     for (const doc of data.documents) {
         if (doc.fields && doc.fields.slug && doc.fields.slug.stringValue === slug) {
             post = doc.fields;
             break;
         }
     }
  }
  
  if (!post) {
      console.error("Post not found:", slug);
      return;
  }

  const title = post.title ? post.title.stringValue : '';
  const mediaUrl = post.mediaUrl ? post.mediaUrl.stringValue : '';
  const goldenTip = post.goldenTip ? post.goldenTip.stringValue : 'Sem sacada.';
  
  let blocksHtml = '';
  if (post.blocks && post.blocks.arrayValue && post.blocks.arrayValue.values) {
     for (const blockWrapper of post.blocks.arrayValue.values) {
         const block = blockWrapper.mapValue.fields;
         const type = block.type.stringValue;
         const dataFields = block.data.mapValue.fields;
         
         if (type === 'paragraph') {
             const text = dataFields.text.stringValue;
             blocksHtml += `<p class="text-lg leading-relaxed text-slate-700 mb-6">${text.replace(/\n/g, '<br>')}</p>\n`;
         } else if (type === 'audio-reveal') {
             const audioUrl = dataFields.audioUrl ? dataFields.audioUrl.stringValue : '';
             const question = dataFields.question ? dataFields.question.stringValue : '';
             const answer = dataFields.answer ? dataFields.answer.stringValue : '';
             
             blocksHtml += `
             <div class="my-8 bg-amber-50 border-2 border-amber-200 rounded-xl p-6 relative overflow-hidden shadow-sm">
                <div class="absolute top-0 right-0 bg-amber-200 text-amber-900 text-xs font-bold px-3 py-1 rounded-bl-lg">LISTEN & ANSWER</div>
                <h4 class="text-xl font-bold text-slate-900 mb-4 pr-12">${question}</h4>
                
                <div class="flex items-center gap-4 bg-white border border-amber-200 rounded-lg p-3 mb-6 shadow-sm">
                   <button onclick="this.nextElementSibling.play()" class="w-10 h-10 flex-shrink-0 bg-amber-600 hover:bg-amber-700 text-white rounded-full flex items-center justify-center transition-colors">
                       <i data-lucide="play" class="w-5 h-5 ml-1"></i>
                   </button>
                   <audio src="${audioUrl}" class="hidden"></audio>
                   <div class="flex-grow">
                       <div class="text-sm font-medium text-slate-900">Training Audio</div>
                       <div class="text-xs text-slate-500">Listen carefully</div>
                   </div>
                </div>
                
                <div x-data="{ revealed: false }" class="mt-4">
                    <button @click="revealed = !revealed" x-show="!revealed" class="w-full py-3 border-2 border-dashed border-amber-300 text-amber-700 font-medium rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-2">
                        <i data-lucide="eye"></i> Revelar Resposta Oculta
                    </button>
                    <div x-show="revealed" style="display: none;" class="p-4 bg-white rounded-lg border border-amber-200">
                        <p class="text-slate-800 font-medium">${answer}</p>
                    </div>
                </div>
             </div>\n`;
         }
     }
  }
  
  let videoHtml = '';
  if (mediaUrl) {
      if (mediaUrl.includes('youtube') || mediaUrl.includes('youtu.be')) {
          videoHtml = `
          <div class="aspect-w-16 aspect-h-9 mb-12 rounded-xl overflow-hidden shadow-lg border border-slate-200">
              <iframe src="${mediaUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>`;
      } else {
          videoHtml = `
          <div class="aspect-w-16 aspect-h-9 mb-12 rounded-xl overflow-hidden shadow-lg border border-slate-200">
              <video controls class="w-full h-full object-cover">
                  <source src="${mediaUrl}" type="video/mp4">
                  Seu navegador não suporta o elemento de vídeo.
              </video>
          </div>`;
      }
  }

  let template = fs.readFileSync('/Users/macbookpro/Desktop/agoraeufalo_site/blog/post-template.html', 'utf8');
  
  // Replace Template Variables
  template = template.replace(/<title>.*?<\/title>/, `<title>${title} | AgoraEuFalo</title>`);
  template = template.replace('{{POST_SUBTITLE}}', `<h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">${title}</h1>`);
  template = template.replace('{{POST_MEDIA_SECTION}}', videoHtml);
  template = template.replace('{{POST_BODY_CONTENT}}', blocksHtml);
  template = template.replace('{{POST_GOLDEN_TIP}}', goldenTip);
  template = template.replace(/\{\{.*?\}\}/g, ''); // Clear any remaining vars
  
  const dest = path.join('/Users/macbookpro/Desktop/agoraeufalo_site/blog', slug + '.html');
  fs.writeFileSync(dest, template);
  console.log("SUCCESS:", dest);
}

compilePost('eu-consegui-publicar-no-blog-do-leo');
