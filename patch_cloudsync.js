const fs = require('fs');
let content = fs.readFileSync('assets/js/aef-cloud-sync.js', 'utf8');

const oldPayload = `      const payload = {
        id: cid,
        title: courseData.title || cid,
        slug: courseData.slug || cid,
        badge: courseData.badge || "CURSO LIBERADO",
        tierRequired: courseData.tierRequired || "vip",
        themeColor: courseData.themeColor || "amber",
        coverImageUrl: courseData.coverImageUrl || "assets/images/cover-default-aef.jpg",
        description: courseData.description || "",
        published: courseData.published !== false,
        updatedAt: new Date().toISOString()
      };`;

const newPayload = `      const payload = { ...courseData };
      payload.updatedAt = new Date().toISOString();
      
      // Limpeza de campos legados caso existam
      if (payload.tierRequired !== undefined) {
         // O SDK não precisa forçar "vip". Deixa como undef se não tiver.
         if (!payload.tierRequired) delete payload.tierRequired;
      }
      `;

content = content.replace(oldPayload, newPayload);
fs.writeFileSync('assets/js/aef-cloud-sync.js', content);
console.log("Patched saveCourse in aef-cloud-sync.js");
