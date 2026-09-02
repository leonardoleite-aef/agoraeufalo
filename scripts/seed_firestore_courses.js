const fs = require('fs');

const courses = require('../assets/js/aef-courses-registry.js');
const projectId = 'agoraeufalo-3463a';

function jsonToFirestoreFields(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        fields[key] = { integerValue: value.toString() };
      } else {
        fields[key] = { doubleValue: value };
      }
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map(item => {
            if (typeof item === 'string') return { stringValue: item };
            if (typeof item === 'number') return Number.isInteger(item) ? { integerValue: item.toString() } : { doubleValue: item };
            if (typeof item === 'boolean') return { booleanValue: item };
            if (typeof item === 'object') return { mapValue: { fields: jsonToFirestoreFields(item) } };
            return { stringValue: String(item) };
          })
        }
      };
    } else if (typeof value === 'object') {
      fields[key] = {
        mapValue: {
          fields: jsonToFirestoreFields(value)
        }
      };
    }
  }
  return fields;
}

async function patchDoc(path, data) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: jsonToFirestoreFields(data) })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to patch ${path} (${res.status}): ${txt}`);
  }
  return await res.json();
}

async function run() {
  console.log('=== SEEDING FIRESTORE WITH COMPLETE COURSES HIERARCHY ===');
  
  for (const cid of Object.keys(courses)) {
    const c = courses[cid];
    console.log(`\n📚 Curso: ${c.title} (${cid})`);
    
    // 1. Course Doc
    const coursePayload = {
      id: cid,
      courseId: cid,
      title: c.title || cid,
      slug: c.slug || cid,
      badge: c.badge || "CURSO LIBERADO",
      tierRequired: c.tierRequired || (cid === 'english-quickstart' ? 'free' : 'vip'),
      coverImageUrl: c.coverImageUrl || "assets/images/cover-default-aef.jpg",
      description: c.description || "",
      published: c.published !== false,
      updatedAt: new Date().toISOString()
    };
    
    try {
      await patchDoc(`courses/${cid}`, coursePayload);
      console.log(` ✅ courses/${cid}`);
    } catch (e) {
      console.error(` ❌ courses/${cid}:`, e.message);
    }

    // 2. Modules & Lessons Subcollections
    for (const mod of (c.modules || [])) {
      const modPayload = {
        id: mod.id,
        courseId: cid,
        title: mod.title || mod.id,
        shortTitle: mod.shortTitle || mod.title,
        order: mod.order || 1,
        description: mod.description || "",
        published: mod.published !== false,
        badge: mod.badge || "",
        stats: mod.stats || "",
        updatedAt: new Date().toISOString()
      };

      try {
        await patchDoc(`courses/${cid}/modules/${mod.id}`, modPayload);
        process.stdout.write(`   📁 Módulo ${mod.id} (${(mod.lessons||[]).length} aulas)... `);
      } catch (e) {
        console.error(`\n   ❌ courses/${cid}/modules/${mod.id}:`, e.message);
      }

      for (const les of (mod.lessons || [])) {
        const lesPayload = {
          id: les.id,
          moduleId: mod.id,
          courseId: cid,
          title: les.title || les.id,
          order: les.order || 1,
          duration: les.duration || "00:00",
          description: les.description || "",
          videoUrl: les.videoUrl || "",
          audioUrl: les.audioUrl || "",
          thumbnailUrl: les.thumbnailUrl || "",
          artworkUrl: les.artworkUrl || "assets/images/cover-default-aef.jpg",
          pdfUrl: les.pdfUrl || "",
          goldenTip: les.goldenTip || "",
          rawScript: les.rawScript || "",
          processedContentHtml: les.processedContentHtml || "",
          aiStatus: les.aiStatus || "published",
          hasTrainingTrack: les.hasTrainingTrack !== false,
          trainingTrackId: les.trainingTrackId || les.id,
          published: les.published !== false,
          updatedAt: new Date().toISOString()
        };

        try {
          await patchDoc(`courses/${cid}/modules/${mod.id}/lessons/${les.id}`, lesPayload);
        } catch (e) {
          console.error(`\n     ❌ courses/${cid}/modules/${mod.id}/lessons/${les.id}:`, e.message);
        }
      }
      console.log(`OK!`);
    }
  }

  console.log('\n=== FIRESTORE SYNC COMPLETE! ===');
}

run().catch(console.error);
