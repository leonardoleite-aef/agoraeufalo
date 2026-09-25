import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const salaLabPath = path.join(ROOT_DIR, 'sala-lab.html');
const salaDeAulaPath = path.join(ROOT_DIR, 'sala-de-aula.html');

let content = fs.readFileSync(salaLabPath, 'utf8');

// 1. Atualizar Título
content = content.replace(
  '<title>Sala de Treino Ativo • AgoraEuFalo</title>',
  '<title>Sala de Aula • AgoraEuFalo</title>'
);

// 2. Remover a LAB NOTICE BAR (aside do topo)
const labNoticeRegex = /<!-- =+ -->\s*<!-- 1\. LAB NOTICE BAR[\s\S]*?<\/aside>/;
if (labNoticeRegex.test(content)) {
  content = content.replace(labNoticeRegex, '');
  console.log('✅ LAB NOTICE BAR removida com sucesso');
} else {
  console.warn('⚠️ LAB NOTICE BAR regex não casou exatamente');
}

// 3. Atualizar links de portal-lab.html para portal.html
content = content.replaceAll('portal-lab.html', 'portal.html');
content = content.replaceAll('src=sala_lab_paywall', 'src=sala_paywall');
content = content.replaceAll('Voltar ao Media Hub', 'Voltar ao Portal');

// 4. Substituir a inicialização do DOMContentLoaded (linhas de mock de laboratório)
// pelo fluxo de autenticação e autorização real de produção
const domReadyLabMockRegex = /document\.addEventListener\("DOMContentLoaded", async \(\) => {[\s\S]*?let baseCourses = \(typeof window\.AEF_COURSES_REGISTRY !== 'undefined' \? window\.AEF_COURSES_REGISTRY : COURSE_SEEDS\);/;

const productionDomReadyReplacement = `document.addEventListener("DOMContentLoaded", async () => {
      // 1. Mostrar loading spinner no padrão dark elegante
      const workspace = document.getElementById("classroomMainWorkspace");
      if (workspace) workspace.style.display = 'none';
      
      const spinner = document.createElement('div');
      spinner.id = 'classroom-loading';
      spinner.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-[#071224] text-white';
      spinner.innerHTML = \`
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-amber-500/30 border-t-amber-400 rounded-full animate-spin"></div>
          <p class="font-bold text-amber-300 animate-pulse text-sm">Carregando Sala de Aula...</p>
        </div>
      \`;
      document.body.appendChild(spinner);

      const isLocalOrFile = window.location.protocol === 'file:' || 
                            window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1' ||
                            !window.location.hostname;

      // 2. Validação assíncrona de autenticação
      let userProfile = null;
      if (!isLocalOrFile && window.aefPortalAuth) {
        try {
          const authed = await window.aefPortalAuth.requireAuth({ redirectUrl: '/login' });
          if (!authed) return;
          userProfile = window.aefPortalAuth.getCurrentProfile ? window.aefPortalAuth.getCurrentProfile() : (window.aefPortalAuth.currentProfile || {});
          if (userProfile) {
            userProfile.role = window.aefPortalAuth.isAdmin() ? 'admin' : (userProfile.role || 'student');
            userProfile.purchasedProducts = window.aefPortalAuth.getEnrolledProducts() || userProfile.enrolledProducts || [];
          }
          window.currentUserProfile = userProfile;
        } catch (authErr) {
          console.warn("⚠️ Auth Check in Classroom:", authErr);
          return;
        }
      } else {
        // Fallback para desenvolvimento local
        userProfile = {
          role: 'admin',
          tier: 'admin_master',
          enrolledProducts: ['all_access_master', 'mentoria_vip', 'magic_stories_club', 'ms-legacy', 'english-quickstart', 'frases-prontas', 'first-steps', 'dtc_curso']
        };
        window.currentUserProfile = userProfile;
      }

      // 3. Inicializa bases
      let baseCourses = (typeof window.AEF_COURSES_REGISTRY !== 'undefined' ? window.AEF_COURSES_REGISTRY : COURSE_SEEDS);

      // 4. Resolve o Course ID com suporte a Mentoria VIP
      const urlParams = new URLSearchParams(window.location.search);
      let rawParam = urlParams.get("curso") || urlParams.get("id") || urlParams.get("aluno");
      let targetModuleId = urlParams.get("modulo");
      let targetLessonId = urlParams.get("aula");

      const lastActivity = window.aefLearningTracker ? window.aefLearningTracker.getGlobalLastActivity() : null;
      let courseId = rawParam;

      const VIP_MENTORIA_SLUGS = {
        'andre': 'mentoria-andre',
        'mentoria-andre': 'mentoria-andre',
        'estevao': 'mentoria-estevaopin',
        'mentoria-estevao': 'mentoria-estevaopin',
        'estevaopin': 'mentoria-estevaopin',
        'mentoria-estevaopin': 'mentoria-estevaopin',
        'thomas': 'mentoria-thomasskt21',
        'mentoria-thomas': 'mentoria-thomasskt21',
        'thomasskt21': 'mentoria-thomasskt21',
        'mentoria-thomasskt21': 'mentoria-thomasskt21',
        'mateus': 'mentoria-mateus.s.gomes.novo',
        'mentoria-mateus': 'mentoria-mateus.s.gomes.novo',
        'matheus': 'mentoria-mateus.s.gomes.novo',
        'mentoria-matheus': 'mentoria-mateus.s.gomes.novo',
        'mateus.s.gomes.novo': 'mentoria-mateus.s.gomes.novo',
        'mentoria-mateus.s.gomes.novo': 'mentoria-mateus.s.gomes.novo'
      };
      if (VIP_MENTORIA_SLUGS[courseId]) {
        courseId = VIP_MENTORIA_SLUGS[courseId];
      }

      if (!courseId && lastActivity && lastActivity.courseId) {
        courseId = lastActivity.courseId;
        if (!targetLessonId) targetLessonId = lastActivity.lessonId;
        if (!targetModuleId) targetModuleId = lastActivity.moduleId;
      }

      if (courseId && !baseCourses[courseId] && baseCourses[\`mentoria-\${courseId}\`]) {
        courseId = \`mentoria-\${courseId}\`;
      } else if (urlParams.get("curso") === "mentoria" && urlParams.get("aluno")) {
        const menteeSlug = urlParams.get("aluno");
        if (baseCourses[\`mentoria-\${menteeSlug}\`]) {
          courseId = \`mentoria-\${menteeSlug}\`;
        }
      }

      if (!courseId || !baseCourses[courseId]) {
        courseId = Object.keys(baseCourses)[0] || 'ms-legacy';
      }

      // 5. Verifica Permissão de Acesso (AEFAccessEngine)
      let hasAccess = false;
      if (courseId && baseCourses[courseId]) {
        hasAccess = window.AEFAccessEngine ? window.AEFAccessEngine.hasAccess(userProfile, baseCourses[courseId]) : true;
      }

      if (courseId && !hasAccess && !isLocalOrFile) {
        spinner.innerHTML = \`
          <div class="flex flex-col items-center gap-4 max-w-md text-center p-8 bg-[#0D1E36] rounded-3xl shadow-2xl border border-rose-500/30 text-white">
            <div class="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mb-2 border border-rose-500/40">
              <i data-lucide="lock" class="w-8 h-8"></i>
            </div>
            <h2 class="text-2xl font-black text-white font-serif">Acesso Restrito</h2>
            <p class="text-sm text-slate-300 mb-4">Você ainda não tem acesso a este curso ou sua assinatura expirou.</p>
            <a href="portal.html" class="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl hover:from-amber-400 transition shadow-lg text-xs uppercase tracking-wider">Voltar ao Portal</a>
          </div>
        \`;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      // 6. Montagem Instantânea do Cockpit (SWR <50ms)
      const hasLocalCourse = Boolean(courseId && baseCourses[courseId]);
      activeCourse = baseCourses[courseId] || Object.values(baseCourses)[0];
      window.activeCourse = activeCourse;

      if (activeCourse) {
        initClassroom(targetModuleId, targetLessonId);
        updateIcons();
      }

      // Remove spinner e revela workspace
      if (spinner && spinner.parentNode) {
        spinner.parentNode.removeChild(spinner);
      }
      if (workspace) workspace.style.display = 'block';

      // 7. SWR Firestore Loading em segundo plano
      if (window.aefCloudSync) {
        const syncPromise = window.aefCloudSync.init().then(async () => {
          if (window.aefCloudSync.getCourseHierarchy) {
            let liveCourse = await window.aefCloudSync.getCourseHierarchy(courseId, baseCourses);
            if ((!liveCourse || !liveCourse.title || liveCourse.title === courseId) && rawParam && !courseId.startsWith("mentoria-")) {
              const mentoriaCourse = await window.aefCloudSync.getCourseHierarchy(\`mentoria-\${rawParam}\`, baseCourses);
              if (mentoriaCourse && mentoriaCourse.title && mentoriaCourse.title !== \`mentoria-\${rawParam}\`) {
                liveCourse = mentoriaCourse;
              }
            }
            if (liveCourse) {
              baseCourses[courseId] = liveCourse;
              activeCourse = liveCourse;
              window.activeCourse = activeCourse;
              renderCourseSyllabus();
              updateIcons();
            }
          }
        }).catch(e => console.log("Firestore sync fallback in classroom:", e));

        if (!hasLocalCourse) {
          try {
            await syncPromise;
          } catch(e) {}
          activeCourse = baseCourses[courseId] || Object.values(baseCourses)[0];
          window.activeCourse = activeCourse;
          initClassroom(targetModuleId, targetLessonId);
          updateIcons();
        }
      }
      return;`;

if (domReadyLabMockRegex.test(content)) {
  content = content.replace(domReadyLabMockRegex, productionDomReadyReplacement);
  console.log('✅ DOMContentLoaded de produção conectado com sucesso');
} else {
  console.warn('⚠️ Regex DOMContentLoaded não casou');
}

fs.writeFileSync(salaDeAulaPath, content, 'utf8');
console.log('🚀 sala-de-aula.html atualizado com sucesso!');
