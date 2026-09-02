const fs = require('fs');

// 1. Carrega os dados reais do sala-de-aula.html
const salaHtml = fs.readFileSync('sala-de-aula.html', 'utf8');
const match = salaHtml.match(/const COURSE_SEEDS = (\{[\s\S]*?\n\s*\});/);
if (!match) {
  console.error("Não encontrou COURSE_SEEDS no sala-de-aula.html");
  process.exit(1);
}

const realCourses = eval('(' + match[1] + ')');

// 2. Monta o novo DEFAULT_SEED_COURSES para o admin-cursos.html
const adminSeed = {};

for (const [courseId, course] of Object.entries(realCourses)) {
  adminSeed[courseId] = {
    id: course.id,
    title: course.title,
    slug: course.id,
    badge: course.id === 'english-quickstart' ? 'FOUNDATION' : 'LEGACY CLUB',
    tierRequired: course.id === 'english-quickstart' ? 'free' : 'legacy_member',
    coverImageUrl: course.coverImageUrl || (course.id === 'english-quickstart' ? 'assets/images/cover-english-quickstart.jpg' : 'assets/images/cover-andre-graziela.jpg'),
    description: course.description || '',
    published: true,
    modules: (course.modules || []).map((mod, mIdx) => ({
      id: mod.id,
      title: mod.title,
      order: mIdx + 1,
      description: mod.description || '',
      published: true,
      lessons: (mod.lessons || []).map((les, lIdx) => ({
        id: les.id,
        moduleId: mod.id,
        courseId: course.id,
        title: les.title,
        order: les.order || (lIdx + 1),
        duration: les.duration || "05:00",
        description: les.description || "",
        videoUrl: les.videoUrl || "",
        audioUrl: les.audioUrl || "",
        thumbnailUrl: les.thumbnailUrl || "assets/images/leonardo-leite.png",
        artworkUrl: les.artworkUrl || "assets/images/cover-default-aef.jpg",
        pdfUrl: les.pdfUrl || "",
        goldenTip: les.goldenTip || "",
        rawScript: les.rawScript || "",
        processedContentHtml: les.processedContentHtml || "",
        aiStatus: les.aiStatus || "published",
        hasTrainingTrack: les.hasTrainingTrack !== false,
        trainingTrackId: les.trainingTrackId || "",
        published: true
      }))
    }))
  };
}

// 3. Atualiza o assets/js/aef-courses-registry.js
const registryContent = `/**
 * AgoraEuFalo - Master Canonical Courses Registry (Single Source of Truth)
 * Professor Leonardo Leite
 * Fully structured hierarchy: Courses > Modules > Lessons
 */
const AEF_COURSES_DATA = ${JSON.stringify(adminSeed, null, 2)};

if (typeof window !== "undefined") {
  window.AEF_COURSES_REGISTRY = AEF_COURSES_DATA;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = AEF_COURSES_DATA;
}
`;

fs.writeFileSync('assets/js/aef-courses-registry.js', registryContent, 'utf8');
console.log("✅ assets/js/aef-courses-registry.js sincronizado com sucesso a partir de sala-de-aula.html!");
