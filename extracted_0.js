
    // ESTADO GLOBAL DO PLAYER
    const state = {
      courseId: "",
      activeModuleId: "",
      activeLessonIndex: 0,
      isPlaying: false,
      isLocked: false,
      isContinuousPlay: true,
      isLyricsOpen: false,
      showTranslation: false,
      playbackRate: 1.0,
      currentSentenceIndex: 0,
      audio: document.getElementById('core-audio'),
      pendingPlayPromise: null
    };

    // MOTOR DE CONTROLE DE ACESSO & PERFIS DO PLAYER (TIER GUARD VIA AEF ACCESS ENGINE)
    function getPlayerAccessProfile() {
      const auth = window.aefPortalAuth;
      const profile = (auth && auth.currentProfile) || {};
      const isRealAdmin = (auth && typeof auth.isAdmin === 'function')
        ? auth.isAdmin()
        : (localStorage.getItem('aef_user_role') === 'admin');

      if (isRealAdmin) {
        return {
          isAdmin: true,
          role: 'admin',
          tier: 'admin_master',
          categories: profile.categories || ['admin'],
          studentId: null,
          studentName: profile.name || localStorage.getItem('aef_user_name') || 'Professor Leonardo Leite',
          enrolledProducts: ['all_access_master', 'mentoria_vip', 'magic_stories_club', 'ms-legacy', 'english-quickstart', 'frases-prontas', 'first-steps', 'dtc_curso'],
          purchasedProducts: ['all_access_master', 'mentoria_vip', 'magic_stories_club', 'ms-legacy', 'english-quickstart', 'frases-prontas', 'first-steps', 'dtc_curso']
        };
      }

      const realTier = (auth && typeof auth.getActiveTier === 'function')
        ? auth.getActiveTier()
        : 'free';

      const realEnrolled = (auth && typeof auth.getEnrolledProducts === 'function')
        ? auth.getEnrolledProducts()
        : JSON.parse(localStorage.getItem('aef_enrolled_products') || '[]');

      return {
        isAdmin: false,
        role: profile.role || localStorage.getItem('aef_user_role') || 'student',
        tier: realTier,
        categories: profile.categories,
        subscription: profile.subscription,
        studentId: profile.id || profile.studentId || localStorage.getItem('aef_student_id') || null,
        studentName: profile.name || localStorage.getItem('aef_user_name') || 'Aluno',
        enrolledProducts: realEnrolled,
        purchasedProducts: realEnrolled
      };
    }

    function isCourseAllowedForUser(courseId, profile) {
      if (!courseId) return true;
      const cId = courseId.toLowerCase();

      // Master Admin Leo tem passe livre irrestrito
      if (profile.isAdmin) return true;

      // Categorias especiais sempre abertas (navegação, lab pessoal)
      if (cId === 'public' || cId === 'custom' || cId === 'quizzes') return true;

      // Checa se é curso VIP do próprio aluno
      if (cId.startsWith('mentoria-')) {
        const menteeSlug = cId.replace('mentoria-', '');
        if (profile.studentId && profile.studentId.toLowerCase() === menteeSlug.toLowerCase()) return true;
      }

      // Regra centralizada via AEFAccessEngine
      const AE = window.AEFAccessEngine;
      const regCourse = window.AEF_COURSES_REGISTRY ? window.AEF_COURSES_REGISTRY[courseId] : { id: courseId };
      const userObj = { ...profile, purchasedProducts: window.aefPortalAuth?.getEnrolledProducts() || profile.enrolledProducts || [] };

      if (AE && typeof AE.hasAccess === 'function') {
        return AE.hasAccess(userObj, regCourse);
      }

      return false;
    }


    window.showLockedPaywall = async (courseId = null) => {
      const modal = document.getElementById('player-lock-modal');
      if (!modal) return;

      const targetCourse = courseId || state.courseId;
      const profile = getPlayerAccessProfile();
      const badgeEl = document.getElementById('lock-modal-badge');
      const titleEl = document.getElementById('lock-modal-title');
      const descEl = document.getElementById('lock-modal-desc');
      const ctaPrimary = document.getElementById('lock-modal-cta-primary');
      const ctaText = document.getElementById('lock-modal-cta-text');

      // Tenta carregar bloco de marketing dinâmico configurado no Admin
      let dynamicBlock = null;
      if (window.aefBlockEngine) {
        try {
          dynamicBlock = await window.aefBlockEngine.findBestBlockForSlot('player_restricted_modal', profile.tier);
        } catch(e) {}
      }

      if (dynamicBlock && dynamicBlock.content && targetCourse !== 'vip') {
        let offer = null;
        if (dynamicBlock.attachedOfferId && window.aefOffersRegistry) {
          offer = await window.aefOffersRegistry.getOfferById(dynamicBlock.attachedOfferId);
        }
        const ctaUrl = offer ? window.aefOffersRegistry.generateTrackingUrl(offer, 'player_modal', dynamicBlock.id) : 'https://wa.me/5511996160910';

        if (badgeEl) badgeEl.innerText = dynamicBlock.content.badgeText || 'CONTEÚDO EXCLUSIVO DO CLUB';
        if (titleEl) titleEl.innerText = dynamicBlock.content.headline || 'Destrave o AgoraEuFalo English Club';
        if (descEl) descEl.innerHTML = dynamicBlock.content.subhead || dynamicBlock.content.bodyHtml || '';
        if (ctaPrimary) ctaPrimary.href = ctaUrl;
        if (ctaText) ctaText.innerText = dynamicBlock.content.ctaText || 'Destravar Agora';
      } else if (targetCourse === 'vip') {
        if (badgeEl) badgeEl.innerText = 'PRESCRIÇÃO VIP INDIVIDUAL';
        if (titleEl) titleEl.innerText = 'Mentoria VIP Exclusiva 1 a 1';
        if (descEl) descEl.innerHTML = 'Estes treinos são prescrições personalizadas gravadas individualmente pelo Professor Leo para mentorados VIP. Entre em contato para conhecer as vagas da mentoria individual.';
        if (ctaPrimary) ctaPrimary.href = 'https://wa.me/5511996160910?text=Ol%C3%A1%20Professor%20Leo!%20Gostaria%20de%20saber%20sobre%20as%20vagas%20da%20Mentoria%20VIP';
        if (ctaText) ctaText.innerText = 'Saber Mais Sobre a Mentoria VIP';
      } else {
        // Busca o primeiro curso free do catálogo dinamicamente para citar no texto do paywall
        const reg = window.AEF_COURSES_REGISTRY || {};
        const AE = window.AEFAccessEngine;
        const firstFreeId = Object.keys(reg).find(k => {
          const c = reg[k];
          if (!c || c.published === false || k.startsWith('mentoria-')) return false;
          if (AE && typeof AE.resolveCourseCategories === 'function') {
            return AE.resolveCourseCategories(c).includes('member_free');
          }
          return false;
        });
        const firstFreeTitle = (firstFreeId && reg[firstFreeId]?.title?.split('•')[0]?.trim()) || 'Dates & Times';

        const courseTierLabel = 'AgoraEuFalo Club';

        if (badgeEl) badgeEl.innerText = `EXCLUSIVO ${courseTierLabel.toUpperCase()}`;
        if (titleEl) titleEl.innerText = 'Conteúdo Exclusivo do Club';
        if (descEl) descEl.innerHTML = `Este áudio faz parte do acervo fechado dos alunos do <b>${courseTierLabel}</b>. No plano gratuito, você tem acesso liberado ao <b>${firstFreeTitle}</b> e ao laboratório de treino!`;
        if (ctaPrimary) ctaPrimary.href = 'https://wa.me/5511996160910?text=Ol%C3%A1%20Professor%20Leo!%20Quero%20destravar%20o%20AgoraEuFalo%20Club';
        if (ctaText) ctaText.innerText = 'Destravar Acesso no WhatsApp';

        // Atualizar também o botão de fallback com o nome do curso free
        const freeBtnText = document.getElementById('lock-modal-free-btn-text');
        if (freeBtnText && firstFreeTitle) freeBtnText.innerText = `Ouvir ${firstFreeTitle} Grátis`;
      }


      modal.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
    };

    window.closeLockModal = () => {
      const modal = document.getElementById('player-lock-modal');
      if (modal) modal.classList.add('hidden');
    };

    window.switchToFreeAllowedCourse = () => {
      window.closeLockModal();
      // Busca dinamicamente o primeiro curso free disponível no registry (sem hardcode)
      const reg = window.AEF_COURSES_REGISTRY || {};
      const AE = window.AEFAccessEngine;
      const firstFreeCourse = Object.keys(reg).find(k => {
        const c = reg[k];
        if (!c || c.published === false || k.startsWith('mentoria-')) return false;
        if (AE && typeof AE.resolveCourseCategories === 'function') {
          return AE.resolveCourseCategories(c).includes('member_free');
        }
        return false;
      }) || 'dtc_curso';
      window.selectCourse(firstFreeCourse);
    };


    // INICIALIZAÇÃO
    document.addEventListener('DOMContentLoaded', async () => {
      lucide.createIcons();

      if (window.aefPortalAuth) {
        try {
          const authed = await window.aefPortalAuth.requireAuth({ redirectUrl: '/login' });
          if (!authed) return;
        } catch (authErr) {
          console.warn("Auth check error in Player:", authErr);
        }
      }

      const profile = getPlayerAccessProfile();

      parseUrlParams(profile);
      populateCourseSelect();
      populateModuleSelect();
      loadCurrentContent(state.activeLessonIndex);
      setupAudioEvents();

      // Sincronização Dinâmica com Cloud Firestore em segundo plano
      syncPlayerWithCloud();

      // Cross-tab auto-sync: se Course Studio ou Admin salvar/deletar em outra aba, atualiza instantaneamente
      window.addEventListener('storage', (e) => {
        if (e.key === 'aef_last_course_update') {
          console.log('🔄 [AEFPlayer] Mudança remota detectada no Course Studio! Re-sincronizando...');
          syncPlayerWithCloud();
        }
      });
    });

    function parseUrlParams(profile) {
      if (!profile) profile = getPlayerAccessProfile();
      const params = new URLSearchParams(window.location.search);
      let curso = params.get('curso') || params.get('course') || params.get('category');
      let mod = params.get('modulo') || params.get('module') || params.get('aluno');
      const aula = params.get('aula') || params.get('lesson') || params.get('track') || params.get('trackId');

      if (curso === 'magic-stories') curso = 'ms-legacy';
      if (curso === 'eqs') curso = 'english-quickstart';

      if (!curso && mod && ['estevao', 'thomas', 'andre', 'matheus'].includes(mod.toLowerCase())) {
        curso = 'vip';
      }

      // Se nenhum curso foi passado na URL, define o curso padrão permitido para o perfil (dinâmico)
      if (!curso) {
        const reg = window.AEF_COURSES_REGISTRY || {};
        const AE = window.AEFAccessEngine;
        const userObj = { ...profile, purchasedProducts: window.aefPortalAuth?.getEnrolledProducts() || profile.enrolledProducts || [] };
        
        const userCats = AE ? AE.resolveUserCategories(userObj) : [];
        const isFreeOnly = AE ? (userCats.length === 1 && userCats[0] === 'member_free') : false;
        const isMentorship = AE ? AE.hasCategory(userObj, 'member_mentoria') : false;

        if (isFreeOnly) {
          // Primeiro curso free publicado do catálogo (zero hardcode)
          curso = Object.keys(reg).find(k => {
            const c = reg[k];
            if (!c || c.published === false || k.startsWith('mentoria-')) return false;
            if (AE && typeof AE.resolveCourseCategories === 'function') {
              return AE.resolveCourseCategories(c).includes('member_free');
            }
            return false;
          }) || 'dtc_curso';
        } else if (isMentorship) {
          curso = 'vip';
          if (!mod) mod = profile.studentId || 'andre';
        } else {
          // Club / Pro: primeiro curso club publicado do catálogo
          curso = Object.keys(reg).find(k => {
            const c = reg[k];
            if (!c || c.published === false || k.startsWith('mentoria-')) return false;
            if (AE && typeof AE.resolveCourseCategories === 'function') {
              const cats = AE.resolveCourseCategories(c);
              return cats.includes('member_pago') && !cats.includes('member_free');
            }
            return false;
          }) || 'ms-legacy';
        }
      }


      state.courseId = curso;

      // Verificação de permissão de acesso
      if (!isCourseAllowedForUser(curso, profile)) {
        state.isLocked = true;
        state.activeModuleId = mod || '';
        return;
      }

      state.isLocked = false;

      if (mod) {
        state.activeModuleId = mod;
      } else if (aula) {
        // Encontra o módulo correspondente à aula informada
        const allMods = getAllModulesForCurrentCourse();
        const foundMod = allMods.find(m => m.id === aula || m.id.includes(aula) || (m.tracks || []).some(t => t.id === aula || t.id.includes(aula) || aula.includes(t.id)));
        if (foundMod) {
          state.activeModuleId = foundMod.id;
        }
      }

      // Garante módulo válido para o curso atual
      const allMods = getAllModulesForCurrentCourse();
      if (!allMods.some(m => m.id === state.activeModuleId)) {
        state.activeModuleId = allMods[0]?.id || "";
      }

      const tracks = getCurrentTracklist();
      if (aula && tracks.length > 0) {
        const foundIdx = tracks.findIndex(t => t.id === aula || aula.includes(t.id) || t.id.includes(aula));
        if (foundIdx !== -1) state.activeLessonIndex = foundIdx;
        else state.activeLessonIndex = 0;
      } else {
        state.activeLessonIndex = 0;
      }
    }

    function getAllModulesForCurrentCourse() {
      const profile = getPlayerAccessProfile();
      if (!isCourseAllowedForUser(state.courseId, profile)) {
        return [];
      }

      if (state.courseId === 'ms-legacy' || state.courseId === 'magic-stories') {
        if (window.AEF_MAGIC_STORIES?.modules && window.AEF_MAGIC_STORIES.modules.length > 0) {
          return window.AEF_MAGIC_STORIES.modules;
        }
      } else if (state.courseId === 'english-quickstart' || state.courseId === 'eqs') {
        if (window.AEF_QUICKSTART?.modules && window.AEF_QUICKSTART.modules.length > 0) {
          return window.AEF_QUICKSTART.modules;
        }
      } else if (state.courseId === 'vip') {
        const allVips = [
          { id: 'estevao', title: 'Estêvão (Executivo)', shortTitle: 'Estêvão', tracks: window.AEF_STUDENT_ESTEVAO?.tracks || [] },
          { id: 'thomas', title: 'Thomas (Tech Lead)', shortTitle: 'Thomas', tracks: window.AEF_STUDENT_THOMAS?.tracks || [] },
          { id: 'andre', title: 'André (Entrevistas)', shortTitle: 'André', tracks: window.AEF_STUDENT_ANDRE?.tracks || [] },
          { id: 'matheus', title: 'Matheus (Fluência)', shortTitle: 'Matheus', tracks: window.AEF_STUDENT_MATHEUS?.tracks || [] }
        ];
        const AE = window.AEFAccessEngine;
        const userObj = { ...profile, purchasedProducts: window.aefPortalAuth?.getEnrolledProducts() || profile.enrolledProducts || [] };
        if (AE && AE.hasCategory(userObj, 'member_mentoria') && profile.studentId) {
          const onlyThisStudent = allVips.filter(v => v.id === profile.studentId);
          return onlyThisStudent.length > 0 ? onlyThisStudent : allVips;
        }
        return allVips;
      } else if (state.courseId === 'public') {
        return [
          { id: 'public-demo', title: 'Novidades Free', shortTitle: 'Novidades', tracks: window.AEF_STUDENT_PUBLIC?.tracks || [] }
        ];
      } else if (state.courseId === 'custom') {
        const userCustoms = JSON.parse(localStorage.getItem('aef_custom_tracks') || '[]');
        return [
          { id: 'custom-lab', title: 'Laboratório Pessoal', shortTitle: 'Minhas Coisas', tracks: userCustoms }
        ];
      }

      // Consulta no Cadastro Canônico Geral de Cursos (Single Source of Truth)
      const registry = window.AEF_COURSES_REGISTRY || {};
      const regCourse = registry[state.courseId] || (state.courseId === 'magic-stories' ? registry['ms-legacy'] : (state.courseId === 'eqs' ? registry['english-quickstart'] : null));
      if (regCourse && Array.isArray(regCourse.modules)) {
        return regCourse.modules.map(mod => {
          const tracks = (mod.lessons || []).map(les => ({
            id: les.id,
            moduleId: mod.id,
            title: les.title,
            activity: les.activity || (les.id.includes('voc') ? 'vocab' : (les.id.includes('la') ? 'listen_answer' : (les.id.includes('lrt') ? 'look_retell' : (les.id.includes('lask') ? 'listen_ask' : (les.id.includes('pro') ? 'pronunciation' : 'listen_read'))))),
            duration: les.duration || '05:00',
            audioUrl: les.audioUrl || les.videoUrl || '',
            videoUrl: les.videoUrl || '',
            coverImage: les.artworkUrl || les.thumbnailUrl || mod.coverImage || regCourse.coverImageUrl || '/assets/images/logo-fundo-escuro.png',
            goldenTip: les.goldenTip || '',
            processedContentHtml: les.processedContentHtml || '',
            rawScript: les.rawScript || '',
            sentences: les.sentences || []
          }));

          return {
            id: mod.id,
            title: mod.title,
            shortTitle: mod.shortTitle || mod.title,
            badge: mod.badge || `MÓDULO ${mod.id.toUpperCase()}`,
            coverImage: mod.coverImage || regCourse.coverImageUrl || '/assets/images/logo-fundo-escuro.png',
            summary: mod.description || '',
            goldenTip: mod.goldenTip || '',
            tracks: tracks
          };
        });
      }

      if (state.courseId === 'quizzes') {
        const reg = window.AEF_QUIZZES_REGISTRY || {};
        return Object.keys(reg).map(k => {
          const q = reg[k];
          const tracks = (q.questions || []).map((quest, qIdx) => ({
            id: `${q.id}-${quest.id}`,
            title: `Questão ${qIdx + 1} • ${quest.questionText.slice(0, 32)}...`,
            activity: 'listen_read',
            duration: '01:00',
            audioUrl: quest.audioUrl,
            coverImage: '/assets/images/cover-default-aef.jpg',
            goldenTip: quest.goldenTip,
            sentences: quest.audioScript ? quest.audioScript.split('\n').map((l, sIdx) => ({
              start: sIdx * 3,
              end: (sIdx + 1) * 3,
              speaker: l.includes(':') ? l.split(':')[0].trim() : 'Leo',
              text: l.includes(':') ? l.split(':')[1].trim() : l,
              spokenTranslation: ''
            })) : []
          }));
          return {
            id: q.id,
            title: q.title,
            shortTitle: q.title.split('•')[1]?.trim() || q.title,
            badge: q.badge || 'QUIZ',
            coverImage: '/assets/images/cover-default-aef.jpg',
            summary: q.description || '',
            goldenTip: q.questions?.[0]?.goldenTip || '',
            tracks: tracks
          };
        });
      }

      return [];
    }

    function populateCourseSelect() {
      const select = document.getElementById('course-select');
      if (!select) return;

      const profile = getPlayerAccessProfile();
      const registry = window.AEF_COURSES_REGISTRY || {};
      const AE = window.AEFAccessEngine;
      const userObj = { ...profile, purchasedProducts: window.aefPortalAuth?.getEnrolledProducts() || profile.enrolledProducts || [] };
      
      const isFreeUser = !profile.isAdmin && AE && !AE.hasCategory(userObj, 'member_pago');

      let optionsHtml = '';

      // Lista ordenada de cursos do catálogo
      const knownCourseIds = ['ms-legacy', 'english-quickstart', 'dtc_curso'];
      const extraCourseIds = Object.keys(registry).filter(k => !knownCourseIds.includes(k) && !k.startsWith('mentoria-'));
      const allCourseIds = [...knownCourseIds, ...extraCourseIds];

      allCourseIds.forEach(cKey => {
        const course = registry[cKey];
        if (!course) return;
        const isAllowed = isCourseAllowedForUser(cKey, profile);

        // Para alunos free: ocultar cursos que não têm acesso (sem cadeado, sem confusão)
        if (!isAllowed && isFreeUser) return;

        const lockIcon = isAllowed ? '' : '🔒 ';
        const iconPrefix = cKey === 'ms-legacy' ? '📖 ' : (cKey === 'english-quickstart' ? '⚡ ' : (cKey === 'dtc_curso' ? '📅 ' : '🎓 '));
        const badgeText = isAllowed ? '' : ' (Club)';
        const title = (course.title || cKey).split('•')[0].trim();
        optionsHtml += `<option value="${cKey}" class="bg-slate-900 ${isAllowed ? 'text-slate-100' : 'text-amber-500/80'}">${lockIcon}${iconPrefix}${title}${badgeText}</option>`;
      });

      optionsHtml += `<option value="quizzes" class="bg-slate-900 text-amber-300 font-bold">🎯 Quizzes de Escuta</option>`;

      // Categoria Especial Mentoria VIP
      const isMentoria = AE ? AE.hasCategory(userObj, 'member_mentoria') : false;
      if (isMentoria) {
        const sName = profile.studentName || profile.studentId || 'VIP';
        optionsHtml += `<option value="vip" class="bg-slate-900 text-amber-300 font-bold">👑 Minha Mentoria (${sName})</option>`;
      } else if (profile.isAdmin) {
        // Admin vê VIP com acesso
        optionsHtml += `<option value="vip" class="bg-slate-900 text-slate-100">👑 Mentoria VIP</option>`;
      }
      // Alunos free e club sem VIP não veem a opção de Mentoria

      optionsHtml += `<option value="public" class="bg-slate-900 text-slate-100">💡 Novidades Free</option>`;
      optionsHtml += `<option value="custom" class="bg-slate-900 text-slate-100">🧪 Minhas Coisas</option>`;

      select.innerHTML = optionsHtml;
      select.value = state.courseId;
    }


    window.selectCourse = (courseId) => {
      const profile = getPlayerAccessProfile();
      
      if (!isCourseAllowedForUser(courseId, profile)) {
        if (state.isPlaying) {
          state.audio.pause();
          state.isPlaying = false;
          updatePlayButtonUI();
        }
        state.isLocked = true;
        showLockedPaywall(courseId);
        const select = document.getElementById('course-select');
        if (select) select.value = state.courseId;
        return;
      }

      state.isLocked = false;
      state.courseId = courseId;
      state.activeLessonIndex = 0;
      
      const allMods = getAllModulesForCurrentCourse();
      state.activeModuleId = allMods[0]?.id || "";

      populateCourseSelect();
      populateModuleSelect();
      loadCurrentContent(0);
      syncPlayerWithCloud();
    };

    function populateModuleSelect() {
      const select = document.getElementById('module-select');
      if (!select) return;

      const allMods = getAllModulesForCurrentCourse();
      select.innerHTML = allMods.map(m => `
        <option value="${m.id}" ${m.id === state.activeModuleId ? 'selected' : ''} class="bg-slate-900 text-slate-100">
          ${m.shortTitle || m.title}
        </option>
      `).join('');
      select.value = state.activeModuleId;
    }

    window.selectModule = (modId) => {
      state.activeModuleId = modId;
      state.activeLessonIndex = 0;
      loadCurrentContent(0);
      syncPlayerWithCloud();
    };

    function getCurrentTracklist() {
      const allMods = getAllModulesForCurrentCourse();
      const mod = allMods.find(m => m.id === state.activeModuleId) || allMods[0];
      return mod?.tracks || [];
    }

    function getCurrentActiveTrack() {
      const tracks = getCurrentTracklist();
      return tracks[state.activeLessonIndex] || tracks[0];
    }

    function getCurrentModuleTitle() {
      const allMods = getAllModulesForCurrentCourse();
      const mod = allMods.find(m => m.id === state.activeModuleId) || allMods[0];
      return mod?.title || 'Treinamento AgoraEuFalo';
    }

    async function syncPlayerWithCloud() {
      if (!window.aefCloudSync) return;
      try {
        const profile = getPlayerAccessProfile();

        if (state.courseId && state.courseId !== 'vip' && state.courseId !== 'public' && state.courseId !== 'custom') {
          const hierarchy = await window.aefCloudSync.getCoursesHierarchy();
          if (!hierarchy) return;

          if (window.AEF_COURSES_REGISTRY) {
            Object.assign(window.AEF_COURSES_REGISTRY, hierarchy);
          }

          const courseData = hierarchy[state.courseId];
          if (!courseData || !courseData.modules) return;

          const targetModules = (state.courseId === 'ms-legacy')
            ? window.AEF_MAGIC_STORIES?.modules
            : (state.courseId === 'english-quickstart' ? window.AEF_QUICKSTART?.modules : null);

          if (targetModules) {
            let updatedAny = false;
            courseData.modules.forEach(cloudMod => {
              let localMod = targetModules.find(m => m.id === cloudMod.id);
              if (!localMod) {
                localMod = {
                  id: cloudMod.id,
                  title: cloudMod.title || cloudMod.id,
                  shortTitle: cloudMod.shortTitle || cloudMod.title,
                  badge: cloudMod.badge || `MÓDULO ${cloudMod.id.toUpperCase()}`,
                  coverImage: cloudMod.coverImage || '/assets/images/logo-fundo-escuro.png',
                  tracks: []
                };
                targetModules.push(localMod);
                updatedAny = true;
              }

              const cloudLessons = cloudMod.lessons || [];
              if (cloudLessons.length === 0) return;

              const existingTracksMap = new Map();
              (localMod.tracks || []).forEach(t => {
                if (t && t.id) existingTracksMap.set(t.id, t);
              });

              const reconciledTracks = [];
              cloudLessons.forEach(cLes => {
                if (cLes.published === false) return;
                const localTrack = existingTracksMap.get(cLes.id) || {};

                const sentences = (cLes.sentences && Array.isArray(cLes.sentences) && cLes.sentences.length > 0)
                  ? cLes.sentences
                  : (localTrack.sentences || []);

                reconciledTracks.push({
                  id: cLes.id,
                  moduleId: cloudMod.id,
                  title: cLes.title || localTrack.title || 'Treino',
                  activity: cLes.activity || localTrack.activity || 'listen_read',
                  duration: cLes.duration || localTrack.duration || '02:00',
                  audioUrl: cLes.audioUrl || localTrack.audioUrl || '',
                  videoUrl: cLes.videoUrl || localTrack.videoUrl || '',
                  coverImage: cLes.artworkUrl || cLes.thumbnailUrl || localTrack.coverImage || '/assets/images/logo-fundo-escuro.png',
                  goldenTip: cLes.goldenTip || localTrack.goldenTip || '',
                  processedContentHtml: cLes.processedContentHtml || localTrack.processedContentHtml || '',
                  rawScript: cLes.rawScript || localTrack.rawScript || '',
                  sentences: sentences
                });

              });

              localMod.tracks = reconciledTracks;
              updatedAny = true;
            });

            if (updatedAny) {
              refreshPlayerActiveView();
            }
          } else {
            refreshPlayerActiveView();
          }
        } else if (state.courseId === 'vip') {
          const sId = profile.studentId || state.activeModuleId || 'andre';
          const cloudTracks = await window.aefCloudSync.getStudentCloudTracks(sId);
          if (cloudTracks && cloudTracks.length > 0) {
            const allVips = getAllModulesForCurrentCourse();
            const vipMod = allVips.find(m => m.id === sId);
            if (vipMod) {
              vipMod.tracks = cloudTracks;
              refreshPlayerActiveView();
            }
          }
        } else if (state.courseId === 'public') {
          const cloudTracks = await window.aefCloudSync.getStudentCloudTracks('public');
          if (cloudTracks && cloudTracks.length > 0) {
            if (window.AEF_STUDENT_PUBLIC) {
              window.AEF_STUDENT_PUBLIC.tracks = cloudTracks;
              refreshPlayerActiveView();
            }
          }
        }
      } catch (err) {
        console.warn("⚠️ [AEFPlayer] Aviso de sincronização com nuvem:", err);
      }
    }



    function refreshPlayerActiveView() {
      const tracks = getCurrentTracklist();
      if (tracks.length === 0) return;
      if (state.activeLessonIndex >= tracks.length) {
        state.activeLessonIndex = 0;
      }
      populateModuleSelect();
      renderPlaylistDrawer();

      const track = getCurrentActiveTrack();
      if (track) {
        const titleEl = document.getElementById('lesson-title');
        if (titleEl) titleEl.innerText = track.title || `Faixa ${state.activeLessonIndex + 1}`;

        const subheadEl = document.getElementById('module-subhead');
        if (subheadEl) subheadEl.innerText = getCurrentModuleTitle();

        const coverImg = document.getElementById('track-cover-img');
        if (coverImg && track.coverImage) coverImg.src = track.coverImage;

        if (!state.isPlaying) {
          const newSrc = track.audioUrl || track.videoUrl || '';
          if (newSrc && state.audio.src !== newSrc) {
            state.audio.src = newSrc;
            state.audio.load();
          }
        }
        renderLyrics();
        updateMediaSession();
      }
    }

    function loadCurrentContent(lessonIdx) {
      const profile = getPlayerAccessProfile();
      if (!isCourseAllowedForUser(state.courseId, profile)) {
        state.isLocked = true;
        state.audio.pause();
        state.audio.src = '';
        state.isPlaying = false;
        updatePlayButtonUI();

        const titleEl = document.getElementById('lesson-title');
        if (titleEl) titleEl.innerText = '🔒 Conteúdo Bloqueado';

        const subheadEl = document.getElementById('module-subhead');
        if (subheadEl) subheadEl.innerText = 'Exclusivo para membros Club / VIP';

        const badgeEl = document.getElementById('track-badge-text');
        if (badgeEl) badgeEl.innerText = 'BLOQUEADO';

        const coverImg = document.getElementById('track-cover-img');
        if (coverImg) coverImg.src = '/assets/images/logo-fundo-escuro.png';

        renderLyrics();
        renderPlaylistDrawer();
        showLockedPaywall(state.courseId);
        return;
      }

      state.isLocked = false;
      state.activeLessonIndex = lessonIdx;
      const track = getCurrentActiveTrack();
      const moduleTitle = getCurrentModuleTitle();

      // 1. Atualiza Título, Subtítulo e Capa
      const titleEl = document.getElementById('lesson-title');
      if (titleEl) titleEl.innerText = track?.title || (track ? `Faixa ${state.activeLessonIndex + 1}` : 'Nenhum treino selecionado');

      const subheadEl = document.getElementById('module-subhead');
      if (subheadEl) subheadEl.innerText = moduleTitle;

      const badgeEl = document.getElementById('track-badge-text');
      if (badgeEl) {
        if (state.courseId === 'ms-legacy') {
          badgeEl.innerText = (track?.activity || `AULA ${state.activeLessonIndex + 1}`).replace('_', ' ').toUpperCase();
        } else if (state.courseId === 'vip') {
          badgeEl.innerText = 'PRESCRIÇÃO VIP 1 A 1';
        } else if (state.courseId === 'public') {
          badgeEl.innerText = 'NOVIDADES FREE';
        } else {
          badgeEl.innerText = 'LABORATÓRIO';
        }
      }

      const coverImg = document.getElementById('track-cover-img');
      if (coverImg) coverImg.src = track?.coverImage || '/assets/images/logo-fundo-escuro.png';

      // 2. Configura Áudio Puro MP3 (com fallback para videoUrl se necessário)
      const audioSrc = track?.audioUrl || track?.videoUrl || '';
      state.audio.src = audioSrc;
      state.audio.playbackRate = state.playbackRate;
      state.audio.load();

      // 3. Renderiza Componentes e MediaSession
      renderLyrics();
      renderPlaylistDrawer();
      updateMediaSession();
      lucide.createIcons();

      // 4. Salva no aefLearningTracker a atividade do aluno
      if (window.aefLearningTracker && track) {
        window.aefLearningTracker.saveLastActivity({
          courseId: state.courseId,
          courseTitle: state.courseId === 'ms-legacy' ? 'Magic Stories Legacy' : (state.courseId === 'english-quickstart' ? 'English QuickStart' : moduleTitle),
          moduleId: state.activeModuleId,
          moduleTitle: moduleTitle,
          lessonId: track.id,
          lessonTitle: track.title,
          lessonDuration: track.duration || '02:00',
          thumbnailUrl: track.coverImage || 'assets/images/cover-default-aef.jpg',
          source: 'player'
        });
      }
    }

    function renderLyrics() {
      const container = document.getElementById('lyrics-scroll-container');
      if (!container) return;

      if (state.isLocked) {
        container.innerHTML = `
          <div class="text-center text-slate-300 py-12 px-4 space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <i data-lucide="lock" class="w-6 h-6"></i>
            </div>
            <p class="font-bold text-sm text-white">Transcrição Bloqueada</p>
            <p class="text-xs text-slate-400 max-w-xs mx-auto">Este treinamento é exclusivo para membros do AgoraEuFalo English Club ou Mentoria VIP.</p>
            <button onclick="window.switchToFreeAllowedCourse()" class="mt-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">Ouvir QuickStart Grátis</button>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      const track = getCurrentActiveTrack();
      const sentences = track?.sentences || [];
      if (sentences.length === 0) {
        // Fallback: se a aula tem conteúdo didático HTML (ex: cursos de masterclass como DTC),
        // exibe o HTML formatado no painel de letras em vez da mensagem de erro.
        const contentHtml = track?.processedContentHtml || '';
        if (contentHtml) {
          container.innerHTML = `
            <div class="pb-4">
              <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider mb-4">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Notas da Aula</span>
              </div>
              <div class="rounded-2xl bg-amber-50/95 border border-amber-200 text-slate-900 overflow-auto p-4 text-xs leading-relaxed">
                ${contentHtml}
              </div>
            </div>
          `;
          return;
        }
        container.innerHTML = `
          <div class="text-center text-slate-400 text-sm py-12">
            <p>Nenhuma transcrição cadastrada para esta aula.</p>
          </div>
        `;
        return;
      }


      container.innerHTML = sentences.map((s, idx) => `
        <div id="lyric-line-${idx}" onclick="window.seekToSentence(${idx})" class="lyrics-line transition-all duration-300 cursor-pointer p-2 rounded-xl hover:bg-white/5 ${idx === state.currentSentenceIndex ? 'lyrics-active' : 'lyrics-inactive'}">
          <p class="text-base sm:text-lg leading-relaxed">${s.text}</p>
          ${state.showTranslation && s.spokenTranslation ? `
            <p class="text-xs sm:text-sm text-amber-200/80 font-medium mt-1 font-serif-title italic">${s.spokenTranslation}</p>
          ` : ''}
        </div>
      `).join('');
    }

    window.toggleLyrics = () => {
      state.isLyricsOpen = !state.isLyricsOpen;
      const sheet = document.getElementById('lyrics-sheet');
      const topBtnText = document.getElementById('btn-lyrics-top-text');
      const bottomBtn = document.getElementById('btn-lyrics-bottom');

      if (state.isLyricsOpen) {
        sheet?.classList.remove('translate-y-full');
        if (topBtnText) topBtnText.innerText = "Ocultar";
        bottomBtn?.classList.add('bg-amber-500', 'text-slate-950');
        bottomBtn?.classList.remove('bg-white/10', 'text-slate-300');
        scrollActiveLyricIntoView();
      } else {
        sheet?.classList.add('translate-y-full');
        if (topBtnText) topBtnText.innerText = "Ver Letra";
        bottomBtn?.classList.remove('bg-amber-500', 'text-slate-950');
        bottomBtn?.classList.add('bg-white/10', 'text-slate-300');
      }
    };

    window.toggleTranslation = () => {
      state.showTranslation = !state.showTranslation;
      const statusText = document.getElementById('text-trans-status');
      if (statusText) statusText.innerText = state.showTranslation ? "ON" : "OFF";
      renderLyrics();
      showToast(state.showTranslation ? "Tradução Ativada" : "Tradução Ocultada");
    };

    window.seekToSentence = (idx) => {
      const profile = getPlayerAccessProfile();
      if (state.isLocked || !isCourseAllowedForUser(state.courseId, profile)) {
        showLockedPaywall(state.courseId);
        return;
      }

      const track = getCurrentActiveTrack();
      const sentence = track?.sentences?.[idx];
      if (!sentence) return;

      if (sentence.start !== undefined) {
        state.audio.currentTime = sentence.start;
      }
      if (!state.isPlaying) {
        window.playAudio();
      }
      state.currentSentenceIndex = idx;
      updateLyricsHighlight();
    };

    function updateLyricsHighlight() {
      const track = getCurrentActiveTrack();
      const sentences = track?.sentences || [];
      sentences.forEach((_, idx) => {
        const line = document.getElementById(`lyric-line-${idx}`);
        if (!line) return;
        if (idx === state.currentSentenceIndex) {
          line.className = "lyrics-line transition-all duration-300 cursor-pointer p-2 rounded-xl hover:bg-white/5 lyrics-active";
        } else {
          line.className = "lyrics-line transition-all duration-300 cursor-pointer p-2 rounded-xl hover:bg-white/5 lyrics-inactive";
        }
      });
      scrollActiveLyricIntoView();
    }

    function scrollActiveLyricIntoView() {
      if (!state.isLyricsOpen) return;
      const activeLine = document.getElementById(`lyric-line-${state.currentSentenceIndex}`);
      const container = document.getElementById('lyrics-scroll-container');
      if (activeLine && container) {
        const offset = activeLine.offsetTop - container.offsetTop - (container.clientHeight / 2) + 40;
        container.scrollTo({ top: offset, behavior: 'smooth' });
      }
    }

    // CONTROLES DE ÁUDIO & PLAY/PAUSE IMEDIATO
    window.playAudio = async () => {
      const profile = getPlayerAccessProfile();
      if (state.isLocked || !isCourseAllowedForUser(state.courseId, profile)) {
        state.isLocked = true;
        state.isPlaying = false;
        updatePlayButtonUI();
        showLockedPaywall(state.courseId);
        return;
      }

      if (state.pendingPlayPromise !== null) {
        try { await state.pendingPlayPromise; } catch (_e) {}
        state.pendingPlayPromise = null;
      }
      state.audio.playbackRate = state.playbackRate;
      state.pendingPlayPromise = state.audio.play();
      state.pendingPlayPromise
        .then(() => {
          state.isPlaying = true;
          state.pendingPlayPromise = null;
          updatePlayButtonUI();
        })
        .catch(err => {
          if (err.name !== 'AbortError') console.warn('[AEF] play error:', err);
          state.isPlaying = false;
          state.pendingPlayPromise = null;
          updatePlayButtonUI();
        });
      updatePlayButtonUI();
    };

    window.togglePlayPause = async () => {
      if (state.isPlaying) {
        if (state.pendingPlayPromise !== null) {
          try { await state.pendingPlayPromise; } catch (_e) {}
          state.pendingPlayPromise = null;
        }
        state.audio.pause();
        state.isPlaying = false;
        updatePlayButtonUI();
      } else {
        window.playAudio();
      }
    };

    function updatePlayButtonUI() {
      const icon = document.getElementById('icon-main-play');
      const pulse = document.getElementById('playing-pulse-indicator');
      if (icon) {
        icon.setAttribute('data-lucide', state.isPlaying ? 'pause' : 'play');
        lucide.createIcons();
      }
      if (pulse) {
        if (state.isPlaying) {
          pulse.classList.remove('hidden');
        } else {
          pulse.classList.add('hidden');
        }
      }
    }

    window.seekOffset = (sec) => {
      state.audio.currentTime = Math.max(0, state.audio.currentTime + sec);
    };

    window.handleSeek = (pct) => {
      const dur = state.audio.duration;
      if (dur > 0) {
        state.audio.currentTime = (pct / 100) * dur;
      }
    };

    // CONTROLE DE VELOCIDADE
    const SPEED_STEPS = [1.0, 1.25, 1.5, 0.75];
    window.cyclePlaybackRate = () => {
      const currentIdx = SPEED_STEPS.indexOf(state.playbackRate);
      const nextIdx = (currentIdx + 1) % SPEED_STEPS.length;
      state.playbackRate = SPEED_STEPS[nextIdx];
      state.audio.playbackRate = state.playbackRate;

      const text = document.getElementById('text-speed');
      if (text) text.innerText = `${state.playbackRate}x`;
      showToast(`Velocidade: ${state.playbackRate}x`);
    };

    window.playNextLesson = () => {
      const profile = getPlayerAccessProfile();
      if (state.isLocked || !isCourseAllowedForUser(state.courseId, profile)) {
        showLockedPaywall(state.courseId);
        return;
      }

      const tracks = getCurrentTracklist();
      if (state.activeLessonIndex < tracks.length - 1) {
        loadCurrentContent(state.activeLessonIndex + 1);
        window.playAudio();
        return;
      }

      // Avança para o próximo módulo do curso
      const allMods = getAllModulesForCurrentCourse();
      const curModIdx = allMods.findIndex(m => m.id === state.activeModuleId);
      if (curModIdx !== -1 && curModIdx < allMods.length - 1) {
        const nextMod = allMods[curModIdx + 1];
        state.activeModuleId = nextMod.id;
        populateModuleSelect();
        loadCurrentContent(0);
        window.playAudio();
        showToast(`Avançando para ${nextMod.shortTitle || nextMod.title}`);
        return;
      }
      showToast('Fim do curso!');
    };

    window.playPrevLesson = () => {
      const profile = getPlayerAccessProfile();
      if (state.isLocked || !isCourseAllowedForUser(state.courseId, profile)) {
        showLockedPaywall(state.courseId);
        return;
      }

      if (state.activeLessonIndex > 0) {
        loadCurrentContent(state.activeLessonIndex - 1);
        window.playAudio();
        return;
      }

      // Retrocede para a última aula do módulo anterior
      const allMods = getAllModulesForCurrentCourse();
      const curModIdx = allMods.findIndex(m => m.id === state.activeModuleId);
      if (curModIdx > 0) {
        const prevMod = allMods[curModIdx - 1];
        state.activeModuleId = prevMod.id;
        populateModuleSelect();
        const prevTracks = prevMod.tracks || [];
        const targetIdx = Math.max(0, prevTracks.length - 1);
        loadCurrentContent(targetIdx);
        window.playAudio();
        showToast(`Voltando para ${prevMod.shortTitle || prevMod.title}`);
        return;
      }

      state.audio.currentTime = 0;
      showToast('Início do curso');
    };

    window.toggleContinuousPlay = () => {
      state.isContinuousPlay = !state.isContinuousPlay;
      const text = document.getElementById('text-continuous-play');
      const btn = document.getElementById('btn-continuous-play');
      if (state.isContinuousPlay) {
        if (text) text.innerText = 'Contínuo: ON';
        btn?.classList.add('text-amber-400');
        btn?.classList.remove('text-slate-400');
        showToast('Reprodução Contínua ON');
      } else {
        if (text) text.innerText = 'Contínuo: OFF';
        btn?.classList.remove('text-amber-400');
        btn?.classList.add('text-slate-400');
        showToast('Reprodução Contínua OFF');
      }
    };

    function setupAudioEvents() {
      state.audio.addEventListener('timeupdate', handleTimeUpdate);
      state.audio.addEventListener('ended', handleTrackEnded);
      state.audio.addEventListener('play', () => { state.isPlaying = true; updatePlayButtonUI(); });
      state.audio.addEventListener('pause', () => { state.isPlaying = false; updatePlayButtonUI(); });
    }

    function handleTimeUpdate() {
      const cur = state.audio.currentTime;
      const dur = state.audio.duration || 0;

      // Atualiza Scrubber e Timers
      const curTimeEl = document.getElementById('time-current');
      const totTimeEl = document.getElementById('time-total');
      const seekBar = document.getElementById('audio-seek-bar');

      if (curTimeEl) curTimeEl.innerText = formatTime(cur);
      if (totTimeEl) totTimeEl.innerText = formatTime(dur);

      if (seekBar && dur > 0) {
        const pct = (cur / dur) * 100;
        seekBar.value = pct;
        seekBar.style.background = `linear-gradient(to right, #F59E0B 0%, #F59E0B ${pct}%, rgba(255,255,255,0.15) ${pct}%, rgba(255,255,255,0.15) 100%)`;
      }

      // Rastreamento Contínuo de Tempo de Escuta (Listening Time)
      if (state.isPlaying && window.aefLearningTracker) {
        const nowMs = Date.now();
        if (!state._lastListeningTrackMs) state._lastListeningTrackMs = nowMs;
        const deltaSec = (nowMs - state._lastListeningTrackMs) / 1000;
        if (deltaSec >= 5) {
          const studentId = state.courseId === 'vip' ? (state.activeModuleId || 'public') : 'public';
          window.aefLearningTracker.recordListeningTime(studentId, Math.round(deltaSec));
          state._lastListeningTrackMs = nowMs;
        }
      }

      // Sincroniza Linha Ativa da Letra
      const track = getCurrentActiveTrack();
      const sentences = track?.sentences || [];
      let foundIdx = -1;
      for (let i = 0; i < sentences.length; i++) {
        const s = sentences[i];
        if (s.start !== undefined && s.end !== undefined) {
          const nextStart = (i + 1 < sentences.length && sentences[i+1].start !== undefined) ? sentences[i+1].start : (s.end + 1.0);
          if (cur >= (s.start - 0.05) && cur < nextStart) {
            foundIdx = i;
            break;
          }
        }
      }

      if (foundIdx !== -1 && foundIdx !== state.currentSentenceIndex) {
        state.currentSentenceIndex = foundIdx;
        updateLyricsHighlight();
      }
    }

    function handleTrackEnded() {
      state.isPlaying = false;
      updatePlayButtonUI();
      if (state.isContinuousPlay) {
        window.playNextLesson();
      }
    }

    function formatTime(sec) {
      if (isNaN(sec) || sec < 0) return "00:00";
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    // PLAYLIST DRAWER
    window.togglePlaylistDrawer = () => {
      const overlay = document.getElementById('playlist-drawer-overlay');
      const drawer = document.getElementById('playlist-drawer');
      if (!overlay || !drawer) return;

      const isClosed = overlay.classList.contains('hidden');
      if (isClosed) {
        overlay.classList.remove('hidden');
        drawer.classList.remove('translate-y-full');
      } else {
        overlay.classList.add('hidden');
        drawer.classList.add('translate-y-full');
      }
    };

    function renderPlaylistDrawer() {
      const container = document.getElementById('playlist-items-container');
      const badge = document.getElementById('playlist-count-badge');
      const sub = document.getElementById('drawer-module-subtitle');

      if (state.isLocked) {
        if (sub) sub.innerText = 'Conteúdo Bloqueado';
        if (badge) badge.innerText = '0';
        if (container) {
          container.innerHTML = (() => {
            const reg = window.AEF_COURSES_REGISTRY || {};
            const AE = window.AEFAccessEngine;
            const firstFreeId = Object.keys(reg).find(k => {
              const c = reg[k];
              if (!c || c.published === false || k.startsWith('mentoria-')) return false;
              if (AE && typeof AE.resolveCourseCategories === 'function') {
                return AE.resolveCourseCategories(c).includes('member_free');
              }
              return false;
            });
            const freeTitle = (firstFreeId && reg[firstFreeId]?.title?.split('•')[0]?.trim()) || 'Treino Gratuito';
            return `
              <div class="text-center text-slate-300 py-8 px-4 space-y-3">
                <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                  <i data-lucide="lock" class="w-6 h-6"></i>
                </div>
                <p class="font-bold text-xs text-white">Faixas restritas para o seu plano</p>
                <p class="text-[11px] text-slate-400 max-w-xs mx-auto">Faça upgrade da sua conta ou acesse o conteúdo gratuito disponível no catálogo.</p>
                <button onclick="window.switchToFreeAllowedCourse()" class="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">Ir para ${freeTitle}</button>
              </div>
            `;
          })();
          lucide.createIcons();

        }
        return;
      }

      const tracks = getCurrentTracklist();
      const moduleTitle = getCurrentModuleTitle();

      if (sub) sub.innerText = moduleTitle;
      if (badge) badge.innerText = tracks.length;
      if (!container) return;

      if (tracks.length === 0) {
        container.innerHTML = `
          <div class="text-center text-slate-400 text-xs py-8">
            <p>Nenhuma faixa disponível nesta categoria.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = tracks.map((t, idx) => `
        <div onclick="window.selectLessonFromDrawer(${idx})" class="p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition ${
          idx === state.activeLessonIndex ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'bg-white/5 hover:bg-white/10 text-slate-200'
        }">
          <div class="flex items-center gap-3 min-w-0">
            <span class="text-xs font-mono opacity-60">${String(idx + 1).padStart(2, '0')}</span>
            <div class="truncate">
              <p class="text-xs font-bold truncate">${t.title}</p>
              <p class="text-[10px] font-mono opacity-80">${t.duration || ''}</p>
            </div>
          </div>
          <div class="shrink-0">
            <i data-lucide="${idx === state.activeLessonIndex ? 'volume-2' : 'play'}" class="w-4 h-4"></i>
          </div>
        </div>
      `).join('');
      lucide.createIcons();
    }

    window.selectLessonFromDrawer = (idx) => {
      const profile = getPlayerAccessProfile();
      if (state.isLocked || !isCourseAllowedForUser(state.courseId, profile)) {
        showLockedPaywall(state.courseId);
        return;
      }
      loadCurrentContent(idx);
      window.togglePlaylistDrawer();
      window.togglePlayPause();
    };

    // MEDIASESSION (LOCKSCREEN CONTROLS)
    function updateMediaSession() {
      if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
      const track = getCurrentActiveTrack();
      const moduleTitle = getCurrentModuleTitle();
      const coverUrl = new URL(track?.coverImage || '/assets/images/logo-fundo-escuro.png', window.location.href).href;

      navigator.mediaSession.metadata = new MediaMetadata({
        title: track?.title || 'AgoraEuFalo',
        artist: 'Prof. Leonardo Leite • AgoraEuFalo',
        album: moduleTitle,
        artwork: [
          { src: coverUrl, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => window.togglePlayPause());
      navigator.mediaSession.setActionHandler('pause', () => window.togglePlayPause());
      navigator.mediaSession.setActionHandler('nexttrack', () => window.playNextLesson());
      navigator.mediaSession.setActionHandler('previoustrack', () => window.playPrevLesson());
      navigator.mediaSession.setActionHandler('seekbackward', () => window.seekOffset(-10));
      navigator.mediaSession.setActionHandler('seekforward', () => window.seekOffset(10));
    }

    function showToast(msg) {
      const toast = document.getElementById('aef-toast');
      if (!toast) return;
      toast.innerText = msg;
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 2800);
    }
  