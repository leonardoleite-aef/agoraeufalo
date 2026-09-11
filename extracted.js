(function(window) {
      'use strict';

      // 1. Alias reconciliation
      if (!window.AEFCloudSync && window.aefCloudSync) window.AEFCloudSync = window.aefCloudSync;
      if (!window.AEFPortalAuth && window.aefPortalAuth) window.AEFPortalAuth = window.aefPortalAuth;

      // 2. Global Player State
      const state = {
        user: null,
        courses: {},
        accessibleCourses: [],
        otherCourses: [],
        currentView: 'home', // 'home' | 'library' | 'course'
        selectedCourseId: null,
        activeCourse: null,
        activeModule: null,
        activeLesson: null,
        activeLessonIndex: 0,
        flatLessonsList: [],
        isPlaying: false,
        playbackRate: 1.0,
        isContinuousPlay: true,
        showTranslation: false,
        currentSentenceIndex: -1,
        activeContentTab: 'lyrics',
        isPedagogicalOpen: false,
        mediaType: 'audio', // 'audio' | 'video'
        pendingPlayPromise: null,
        audioElement: null,
        videoElement: null,
        _lastListeningTrackMs: null
      };

      const SPEED_STEPS = [1.0, 1.25, 1.5, 0.75];

      // =======================================================================
      // INITIALIZATION
      // =======================================================================
      async function initApp() {
        console.log('🚀 [AEF Player] Iniciando Modern Spotify SPA Player...');

        state.audioElement = document.getElementById('core-audio');
        state.videoElement = document.getElementById('core-video');

        setupMediaEvents();
        updateGreeting();

        // Check or restore authentication profile
        try {
          if (window.aefPortalAuth) {
            await window.aefPortalAuth.ready();
            state.user = window.aefPortalAuth.currentProfile;
            if (!state.user && window.aefPortalAuth.currentUser) {
              state.user = await window.aefPortalAuth.getProfile(window.aefPortalAuth.currentUser.uid);
            }
          }
        } catch (e) {
          console.warn('[AEF Player] Auth check error, using local session:', e);
        }

        // Fallback profile from localStorage if offline/delayed
        if (!state.user && typeof localStorage !== 'undefined') {
          const cachedEmail = localStorage.getItem('aef_user_email');
          if (cachedEmail) {
            state.user = {
              uid: localStorage.getItem('aef_user_uid') || 'local-user',
              name: localStorage.getItem('aef_user_name') || 'Aluno AgoraEuFalo',
              email: cachedEmail,
              tier: localStorage.getItem('aef_user_tier') || 'free',
              role: localStorage.getItem('aef_user_role') || 'student',
              enrolledProducts: JSON.parse(localStorage.getItem('aef_enrolled_products') || '[]')
            };
          }
        }

        renderUserProfileUI();

        // Fetch dynamic courses hierarchy
        await loadCoursesData();

        // Handle URL Deep-Linking (e.g. ?curso=dtc_curso ou ?aula=...)
        handleUrlParams();

        // Render Resume Activity card if exists
        loadResumeCard();

        // Render Lucide Icons
        lucide.createIcons();
      }

      function updateGreeting() {
        const hour = new Date().getHours();
        let greeting = "BOM DIA";
        if (hour >= 12 && hour < 18) greeting = "BOA TARDE";
        else if (hour >= 18 || hour < 5) greeting = "BOA NOITE";

        const greetingEl = document.getElementById('home-greeting-time');
        if (greetingEl) greetingEl.innerText = greeting;
      }

      function renderUserProfileUI() {
        const name = state.user?.name || localStorage.getItem('aef_user_name') || 'Aluno';
        const nameEl = document.getElementById('home-greeting-name');
        if (nameEl) nameEl.innerText = `Olá, ${name.split(' ')[0]}!`;

        const initialsEl = document.getElementById('user-initials');
        const avatarImg = document.getElementById('user-avatar-img');
        const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'AEF';

        if (state.user?.avatarUrl && avatarImg) {
          avatarImg.src = state.user.avatarUrl;
          avatarImg.classList.remove('hidden');
          if (initialsEl) initialsEl.classList.add('hidden');
        } else if (initialsEl) {
          initialsEl.innerText = initials;
          initialsEl.classList.remove('hidden');
          if (avatarImg) avatarImg.classList.add('hidden');
        }
      }

      // =======================================================================
      // DYNAMIC DATA FETCHING (CloudSync + AccessEngine)
      // =======================================================================
      async function loadCoursesData() {
        const syncEngine = window.AEFCloudSync || window.aefCloudSync;
        let hierarchy = {};

        try {
          if (syncEngine && typeof syncEngine.getCoursesHierarchy === 'function') {
            hierarchy = await syncEngine.getCoursesHierarchy(window.AEF_COURSES_REGISTRY || null);
          } else if (window.AEF_COURSES_REGISTRY) {
            hierarchy = JSON.parse(JSON.stringify(window.AEF_COURSES_REGISTRY));
          }
        } catch (err) {
          console.warn('⚠️ [AEF Player] Falha no getCoursesHierarchy, usando registry base:', err);
          hierarchy = window.AEF_COURSES_REGISTRY || {};
        }

        state.courses = hierarchy || {};

        // Filter courses with AEFAccessEngine
        const allList = Object.values(state.courses).filter(c => c && c.id);
        
        state.accessibleCourses = allList.filter(c => {
          if (!window.AEFAccessEngine) return true;
          return window.AEFAccessEngine.hasAccess(state.user, c);
        });

        state.otherCourses = allList.filter(c => {
          if (!window.AEFAccessEngine) return false;
          return !window.AEFAccessEngine.hasAccess(state.user, c);
        });

        // Update home counter
        const counterEl = document.getElementById('home-courses-count');
        if (counterEl) {
          counterEl.innerText = `${state.accessibleCourses.length} ${state.accessibleCourses.length === 1 ? 'curso' : 'cursos'}`;
        }

        renderHomeCourses();
        renderLibraryCourses();
      }

      // =======================================================================
      // VIEW RENDERING: HOME
      // =======================================================================
      function renderHomeCourses() {
        const grid = document.getElementById('home-courses-grid');
        if (!grid) return;

        if (state.accessibleCourses.length === 0) {
          grid.innerHTML = `
            <div class="col-span-2 sm:col-span-3 py-10 px-4 text-center rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <i data-lucide="book-open" class="w-8 h-8 text-amber-400 mx-auto"></i>
              <p class="text-sm font-bold text-white">Nenhum curso liberado ainda</p>
              <p class="text-xs text-slate-400 max-w-xs mx-auto">Acesse o portal do aluno para verificar sua assinatura ou liberação de cursos.</p>
              <a href="portal.html" class="inline-block mt-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">Ir para o Portal</a>
            </div>
          `;
          lucide.createIcons();
          return;
        }

        grid.innerHTML = state.accessibleCourses.map(course => {
          const cover = course.coverImageUrl || 'assets/images/cover-default-aef.jpg';
          const modulesCount = (course.modules || []).length;
          let totalLessons = 0;
          (course.modules || []).forEach(m => totalLessons += (m.lessons || []).length);
          const badge = course.badge || 'TREINO DIÁRIO';

          return `
            <div onclick="window.openCourse('${course.id}')" class="group relative flex flex-col p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 transition-all duration-200 cursor-pointer text-left shadow-lg active:scale-95">
              <!-- Square 1:1 Cover Art -->
              <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-900 mb-2.5 shadow-md border border-white/5">
                <img src="${cover}" alt="${course.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                <div class="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-[9px] font-mono font-bold text-amber-300">
                  ${badge}
                </div>
                <!-- Play Hover Overlay -->
                <div class="absolute right-2 bottom-2 w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all shadow-lg shadow-amber-500/40">
                  <i data-lucide="play" class="w-4 h-4 fill-current ml-0.5"></i>
                </div>
              </div>

              <!-- Title & Meta -->
              <h4 class="font-bold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-amber-300 transition-colors">${course.title}</h4>
              <p class="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">${course.description || 'Treinamento prático de fala e escuta ativa.'}</p>
              
              <div class="flex items-center gap-1 text-[10px] font-mono text-amber-400/80 mt-2 pt-1 border-t border-white/5">
                <span>${modulesCount} mod</span>
                <span>•</span>
                <span>${totalLessons} aulas</span>
              </div>
            </div>
          `;
        }).join('');

        // Outros Cursos (Bloqueados / Upgrade)
        const otherSection = document.getElementById('home-other-courses-section');
        const otherGrid = document.getElementById('home-other-courses-grid');
        if (otherSection && otherGrid) {
          if (state.otherCourses.length > 0) {
            otherSection.classList.remove('hidden');
            otherGrid.innerHTML = state.otherCourses.map(course => {
              const cover = course.coverImageUrl || 'assets/images/cover-default-aef.jpg';
              return `
                <div onclick="window.showPaywall('${course.id}')" class="group relative flex flex-col p-3 rounded-2xl bg-white/5 border border-white/5 opacity-75 hover:opacity-100 transition-all duration-200 cursor-pointer text-left">
                  <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-900 mb-2.5">
                    <img src="${cover}" alt="${course.title}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-300">
                    <div class="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-950/80 border border-white/20 text-amber-400 flex items-center justify-center">
                      <i data-lucide="lock" class="w-3 h-3"></i>
                    </div>
                  </div>
                  <h4 class="font-bold text-xs text-slate-200 line-clamp-1">${course.title}</h4>
                  <span class="text-[10px] font-mono text-amber-400 mt-1">Exclusivo do Clube</span>
                </div>
              `;
            }).join('');
          } else {
            otherSection.classList.add('hidden');
          }
        }

        lucide.createIcons();
      }

      // =======================================================================
      // VIEW RENDERING: LIBRARY
      // =======================================================================
      function renderLibraryCourses(filterType = 'all', searchQuery = '') {
        const container = document.getElementById('library-list-container');
        if (!container) return;

        let list = [...state.accessibleCourses];

        if (filterType === 'ms') {
          list = list.filter(c => c.id.includes('magic') || c.id.includes('ms'));
        } else if (filterType === 'quickstart') {
          list = list.filter(c => c.id.includes('quickstart') || c.id.includes('dtc'));
        }

        if (searchQuery) {
          const q = searchQuery.toLowerCase().trim();
          list = list.filter(c => (c.title || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q));
        }

        if (list.length === 0) {
          container.innerHTML = `
            <div class="p-8 text-center text-slate-400 text-xs">
              <p>Nenhum curso encontrado para este filtro.</p>
            </div>
          `;
          return;
        }

        container.innerHTML = list.map(course => {
          const cover = course.coverImageUrl || 'assets/images/cover-default-aef.jpg';
          const modules = course.modules || [];
          let totalLessons = 0;
          modules.forEach(m => totalLessons += (m.lessons || []).length);

          return `
            <div onclick="window.openCourse('${course.id}')" class="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer active:scale-95">
              <div class="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-white/10">
                <img src="${cover}" alt="${course.title}" class="w-full h-full object-cover">
              </div>
              <div class="min-w-0 flex-1">
                <span class="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">${course.badge || 'CURSO'}</span>
                <h4 class="font-bold text-sm text-white truncate">${course.title}</h4>
                <p class="text-xs text-slate-400 truncate mt-0.5">${course.description || 'Treino prático de escuta'}</p>
                <div class="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-1">
                  <span>${modules.length} módulos</span>
                  <span>•</span>
                  <span>${totalLessons} aulas</span>
                </div>
              </div>
              <button class="p-2.5 rounded-full bg-white/5 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition shrink-0">
                <i data-lucide="chevron-right" class="w-4 h-4"></i>
              </button>
            </div>
          `;
        }).join('');

        lucide.createIcons();
      }

      window.setLibraryFilter = (filterType) => {
        ['chip-all', 'chip-active', 'chip-ms', 'chip-quickstart'].forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.className = "px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 font-semibold transition shrink-0";
          }
        });
        const activeChip = document.getElementById(`chip-${filterType}`);
        if (activeChip) {
          activeChip.className = "px-3.5 py-1.5 rounded-full bg-amber-500 text-slate-950 font-bold transition shrink-0 shadow-xs";
        }
        const searchVal = document.getElementById('library-search-input')?.value || '';
        renderLibraryCourses(filterType, searchVal);
      };

      window.filterLibrary = (query) => {
        renderLibraryCourses('all', query);
      };

      // =======================================================================
      // VIEW RENDERING: COURSE VIEW (SPOTIFY ALBUM STYLE)
      // =======================================================================
      window.openCourse = (courseId) => {
        const course = state.courses[courseId];
        if (!course) return;

        state.selectedCourseId = courseId;
        state.activeCourse = course;

        // Build flat lessons list for prev/next traversal
        state.flatLessonsList = [];
        (course.modules || []).forEach(mod => {
          (mod.lessons || []).forEach(lesson => {
            state.flatLessonsList.push({
              ...lesson,
              moduleId: mod.id,
              moduleTitle: mod.title,
              courseId: course.id,
              courseTitle: course.title,
              courseCover: course.coverImageUrl
            });
          });
        });

        // Update Hero Details
        const heroCover = document.getElementById('course-hero-cover');
        const heroTitle = document.getElementById('course-hero-title');
        const heroDesc = document.getElementById('course-hero-desc');
        const heroBadge = document.getElementById('course-view-badge');
        const heroKicker = document.getElementById('course-hero-kicker');
        const heroMods = document.getElementById('course-hero-modules-count');
        const heroLessons = document.getElementById('course-hero-lessons-count');

        if (heroCover) heroCover.src = course.coverImageUrl || 'assets/images/cover-default-aef.jpg';
        if (heroTitle) heroTitle.innerText = course.title;
        if (heroDesc) heroDesc.innerText = course.description || 'Acesse o conteúdo completo desta playlist.';
        if (heroBadge) heroBadge.innerText = course.badge || 'CURSO';
        if (heroKicker) heroKicker.innerText = course.badge || 'TREINO OFICIAL';
        if (heroMods) heroMods.innerText = `${(course.modules || []).length} módulos`;
        if (heroLessons) heroLessons.innerText = `${state.flatLessonsList.length} aulas`;

        // Render Modules & Lessons
        renderCourseModules(course);

        window.navigateTo('course');
      };

      function renderCourseModules(course) {
        const container = document.getElementById('course-modules-container');
        if (!container) return;

        const modules = course.modules || [];
        if (modules.length === 0) {
          container.innerHTML = `
            <div class="p-8 text-center text-slate-400 text-xs bg-white/5 rounded-2xl">
              <p>Nenhuma aula disponível neste módulo ainda.</p>
            </div>
          `;
          return;
        }

        container.innerHTML = modules.map((mod, modIdx) => {
          const lessons = mod.lessons || [];

          return `
            <div class="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
              <!-- Module Header -->
              <div class="p-3.5 sm:p-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-mono text-amber-400 font-bold uppercase">MÓDULO ${mod.order || (modIdx + 1)}</span>
                  <h3 class="font-bold text-sm text-white">${mod.title}</h3>
                  ${mod.description ? `<p class="text-[11px] text-slate-400 mt-0.5 line-clamp-1">${mod.description}</p>` : ''}
                </div>
                <span class="text-[10px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                  ${lessons.length} aulas
                </span>
              </div>

              <!-- Module Lessons List -->
              <div class="divide-y divide-white/5">
                ${lessons.map((lesson, lesIdx) => {
                  const isCurrent = state.activeLesson && state.activeLesson.id === lesson.id;
                  const isPlayingCurrent = isCurrent && state.isPlaying;
                  const duration = lesson.duration || '03:00';
                  const hasVideo = Boolean(lesson.videoUrl || (lesson.media && lesson.media.some(m => m.type && m.type.includes('video'))));
                  const formatIcon = hasVideo ? 'video' : 'headphones';

                  return `
                    <div onclick="window.playLessonById('${course.id}', '${mod.id}', '${lesson.id}')" class="flex items-center justify-between p-3 sm:p-3.5 hover:bg-white/5 transition-colors cursor-pointer group ${isCurrent ? 'bg-amber-500/10' : ''}">
                      <div class="flex items-center gap-3 min-w-0 flex-1">
                        <!-- Index or Playing Equalizer -->
                        <div class="w-7 h-7 flex items-center justify-center shrink-0">
                          ${isPlayingCurrent ? `
                            <div class="flex items-end gap-0.5 h-4">
                              <span class="w-1 bg-amber-400 rounded-full eq-bar-1"></span>
                              <span class="w-1 bg-amber-400 rounded-full eq-bar-2"></span>
                              <span class="w-1 bg-amber-400 rounded-full eq-bar-3"></span>
                            </div>
                          ` : `
                            <span class="text-xs font-mono font-bold text-slate-400 group-hover:hidden">${lesIdx + 1}</span>
                            <i data-lucide="play" class="w-4 h-4 text-amber-400 hidden group-hover:block fill-current"></i>
                          `}
                        </div>

                        <!-- Lesson Title & Badges -->
                        <div class="min-w-0 flex-1">
                          <h4 class="text-xs sm:text-sm font-semibold text-white truncate ${isCurrent ? 'text-amber-400 font-bold' : 'group-hover:text-amber-300'}">
                            ${lesson.title}
                          </h4>
                          <div class="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                            <span class="flex items-center gap-1">
                              <i data-lucide="${formatIcon}" class="w-3 h-3 text-slate-500"></i>
                              ${hasVideo ? 'Vídeo' : 'Áudio'}
                            </span>
                            <span>•</span>
                            <span>${duration}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Action Button -->
                      <button class="p-2 rounded-full text-slate-400 group-hover:text-amber-400 transition">
                        <i data-lucide="${isPlayingCurrent ? 'pause' : 'play'}" class="w-4 h-4 ${isPlayingCurrent ? 'fill-current text-amber-400' : ''}"></i>
                      </button>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('');

        lucide.createIcons();
      }

      window.playCourseFromBeginning = () => {
        if (state.flatLessonsList.length > 0) {
          const first = state.flatLessonsList[0];
          window.playLessonById(first.courseId, first.moduleId, first.id);
        }
      };

      window.toggleShuffleCourse = () => {
        if (state.flatLessonsList.length > 0) {
          const randomIdx = Math.floor(Math.random() * state.flatLessonsList.length);
          const randLesson = state.flatLessonsList[randomIdx];
          window.playLessonById(randLesson.courseId, randLesson.moduleId, randLesson.id);
          showToast('Modo Aleatório ativado!');
        }
      };

      // =======================================================================
      // VIEW SWITCHING (SPA NAVIGATION)
      // =======================================================================
      window.navigateTo = (viewName) => {
        state.currentView = viewName;

        const homeView = document.getElementById('view-home');
        const libView = document.getElementById('view-library');
        const courseView = document.getElementById('view-course');

        if (homeView) homeView.classList.toggle('hidden', viewName !== 'home');
        if (libView) libView.classList.toggle('hidden', viewName !== 'library');
        if (courseView) courseView.classList.toggle('hidden', viewName !== 'course');

        // Update Bottom Nav Bar
        const btnHome = document.getElementById('nav-btn-home');
        const btnLib = document.getElementById('nav-btn-library');

        if (btnHome) {
          btnHome.className = viewName === 'home' 
            ? "flex flex-col items-center gap-1 text-amber-400 transition active:scale-95 group" 
            : "flex flex-col items-center gap-1 text-slate-400 hover:text-white transition active:scale-95 group";
        }
        if (btnLib) {
          btnLib.className = viewName === 'library' 
            ? "flex flex-col items-center gap-1 text-amber-400 transition active:scale-95 group" 
            : "flex flex-col items-center gap-1 text-slate-400 hover:text-white transition active:scale-95 group";
        }

        // Scroll back to top
        const viewport = document.getElementById('views-viewport');
        if (viewport) viewport.scrollTo({ top: 0, behavior: 'smooth' });

        lucide.createIcons();
      };

      // =======================================================================
      // AUDIO & VIDEO PLAYBACK ENGINE
      // =======================================================================
      window.playLessonById = async (courseId, moduleId, lessonId) => {
        const course = state.courses[courseId];
        if (!course) return;

        // Check access
        if (window.AEFAccessEngine && !window.AEFAccessEngine.hasAccess(state.user, course)) {
          window.showPaywall(courseId);
          return;
        }

        // Ensure flat list is loaded
        if (state.selectedCourseId !== courseId || state.flatLessonsList.length === 0) {
          state.flatLessonsList = [];
          (course.modules || []).forEach(mod => {
            (mod.lessons || []).forEach(lesson => {
              state.flatLessonsList.push({
                ...lesson,
                moduleId: mod.id,
                moduleTitle: mod.title,
                courseId: course.id,
                courseTitle: course.title,
                courseCover: course.coverImageUrl
              });
            });
          });
        }

        const idx = state.flatLessonsList.findIndex(l => l.id === lessonId);
        if (idx === -1) return;

        state.activeLessonIndex = idx;
        const item = state.flatLessonsList[idx];

        state.activeCourse = course;
        state.activeModule = (course.modules || []).find(m => m.id === moduleId) || { id: moduleId, title: item.moduleTitle || 'Módulo' };
        state.activeLesson = item;

        // Setup Media Source: Video or Audio
        const videoStage = document.getElementById('video-stage');
        const audioStage = document.getElementById('audio-stage');

        const hasVideo = Boolean(item.videoUrl);

        if (hasVideo) {
          state.mediaType = 'video';
          state.audioElement.pause();
          state.audioElement.removeAttribute('src');

          state.videoElement.src = item.videoUrl;
          state.videoElement.currentTime = 0;
          state.videoElement.playbackRate = state.playbackRate;

          videoStage?.classList.remove('hidden');
          audioStage?.classList.add('hidden');
        } else {
          state.mediaType = 'audio';
          state.videoElement.pause();
          state.videoElement.removeAttribute('src');

          const audioSrc = item.audioUrl || '';
          state.audioElement.src = audioSrc;
          state.audioElement.currentTime = 0;
          state.audioElement.playbackRate = state.playbackRate;

          audioStage?.classList.remove('hidden');
          videoStage?.classList.add('hidden');
        }

        // Update Fullscreen & Mini Player UI
        updateNowPlayingUI(item, course);
        updateMiniPlayerUI(item, course);

        // Render Pedagogical Tabs (Lyrics, Golden Tip, Notes)
        renderPedagogicalContent(item);

        // Open Fullscreen Now Playing Modal
        window.expandNowPlaying();

        // Start playback
        await window.playMedia();

        // Save activity in learning tracker
        saveActivityToTracker(item, course);

        // Re-render course modules if course view is open
        if (state.currentView === 'course') {
          renderCourseModules(course);
        }
      };

      function updateNowPlayingUI(lesson, course) {
        const cover = lesson.thumbnailUrl || lesson.artworkUrl || course.coverImageUrl || 'assets/images/cover-default-aef.jpg';
        
        document.getElementById('np-course-header-title').innerText = course.title;
        document.getElementById('np-cover-img').src = cover;
        document.getElementById('np-track-title').innerText = lesson.title;
        document.getElementById('np-track-subhead').innerText = `${lesson.moduleTitle || 'Módulo'} • ${course.title}`;
        document.getElementById('np-badge-text').innerText = lesson.activity || 'LISTEN & READ';
      }

      function updateMiniPlayerUI(lesson, course) {
        const bar = document.getElementById('mini-player-bar');
        if (!bar) return;

        const cover = lesson.thumbnailUrl || lesson.artworkUrl || course.coverImageUrl || 'assets/images/cover-default-aef.jpg';
        document.getElementById('mini-thumb-img').src = cover;
        document.getElementById('mini-track-title').innerText = lesson.title;
        document.getElementById('mini-track-sub').innerText = course.title;

        bar.classList.remove('hidden');
      }

      function getActiveMediaElement() {
        return state.mediaType === 'video' ? state.videoElement : state.audioElement;
      }

      window.playMedia = async () => {
        const el = getActiveMediaElement();
        if (!el || !el.src) return;

        if (state.pendingPlayPromise !== null) {
          try { await state.pendingPlayPromise; } catch (_e) {}
          state.pendingPlayPromise = null;
        }

        el.playbackRate = state.playbackRate;
        state.pendingPlayPromise = el.play();

        state.pendingPlayPromise
          .then(() => {
            state.isPlaying = true;
            state.pendingPlayPromise = null;
            updatePlayButtonsUI(true);
          })
          .catch(err => {
            if (err.name !== 'AbortError') console.warn('[AEF Player] Play error:', err);
            state.isPlaying = false;
            state.pendingPlayPromise = null;
            updatePlayButtonsUI(false);
          });
      };

      window.pauseMedia = () => {
        const el = getActiveMediaElement();
        if (el) {
          el.pause();
          state.isPlaying = false;
          updatePlayButtonsUI(false);
        }
      };

      window.togglePlayPause = () => {
        if (state.isPlaying) {
          window.pauseMedia();
        } else {
          window.playMedia();
        }
      };

      function updatePlayButtonsUI(isPlaying) {
        const npIcon = document.getElementById('np-icon-play');
        const miniIcon = document.getElementById('mini-play-icon');
        const pulse = document.getElementById('np-pulse-indicator');

        const iconName = isPlaying ? 'pause' : 'play';

        if (npIcon) npIcon.setAttribute('data-lucide', iconName);
        if (miniIcon) miniIcon.setAttribute('data-lucide', iconName);

        if (pulse) {
          pulse.classList.toggle('hidden', !isPlaying);
        }

        lucide.createIcons();
      }

      window.seekOffset = (sec) => {
        const el = getActiveMediaElement();
        if (el) {
          el.currentTime = Math.max(0, el.currentTime + sec);
        }
      };

      window.handleSeek = (pct) => {
        const el = getActiveMediaElement();
        if (el && el.duration > 0) {
          el.currentTime = (pct / 100) * el.duration;
        }
      };

      window.cyclePlaybackRate = () => {
        const currentIdx = SPEED_STEPS.indexOf(state.playbackRate);
        const nextIdx = (currentIdx + 1) % SPEED_STEPS.length;
        state.playbackRate = SPEED_STEPS[nextIdx];

        if (state.audioElement) state.audioElement.playbackRate = state.playbackRate;
        if (state.videoElement) state.videoElement.playbackRate = state.playbackRate;

        const text = document.getElementById('text-speed');
        if (text) text.innerText = `${state.playbackRate}x`;
        showToast(`Velocidade: ${state.playbackRate}x`);
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

      window.playNextLesson = () => {
        if (state.flatLessonsList.length === 0) return;
        if (state.activeLessonIndex < state.flatLessonsList.length - 1) {
          const nextItem = state.flatLessonsList[state.activeLessonIndex + 1];
          window.playLessonById(nextItem.courseId, nextItem.moduleId, nextItem.id);
        } else {
          showToast('Fim da playlist do curso!');
        }
      };

      window.playPrevLesson = () => {
        if (state.flatLessonsList.length === 0) return;
        if (state.activeLessonIndex > 0) {
          const prevItem = state.flatLessonsList[state.activeLessonIndex - 1];
          window.playLessonById(prevItem.courseId, prevItem.moduleId, prevItem.id);
        } else {
          const el = getActiveMediaElement();
          if (el) el.currentTime = 0;
          showToast('Início do curso');
        }
      };

      // =======================================================================
      // AUDIO / VIDEO EVENT LISTENERS
      // =======================================================================
      function setupMediaEvents() {
        ['timeupdate', 'play', 'pause', 'ended'].forEach(ev => {
          state.audioElement.addEventListener(ev, handleMediaEvent);
          state.videoElement.addEventListener(ev, handleMediaEvent);
        });
      }

      function handleMediaEvent(e) {
        const el = e.target;
        // Ignore inactive media element
        if (state.mediaType === 'video' && el === state.audioElement) return;
        if (state.mediaType === 'audio' && el === state.videoElement) return;

        if (e.type === 'play') {
          state.isPlaying = true;
          updatePlayButtonsUI(true);
        } else if (e.type === 'pause') {
          state.isPlaying = false;
          updatePlayButtonsUI(false);
        } else if (e.type === 'timeupdate') {
          handleTimeUpdate(el);
        } else if (e.type === 'ended') {
          handleTrackEnded();
        }
      }

      function handleTimeUpdate(el) {
        const cur = el.currentTime || 0;
        const dur = el.duration || 0;

        const curEl = document.getElementById('time-current');
        const totEl = document.getElementById('time-total');
        const seekBar = document.getElementById('audio-seek-bar');
        const miniProgress = document.getElementById('mini-player-progress-bar');

        if (curEl) curEl.innerText = formatTime(cur);
        if (totEl) totEl.innerText = formatTime(dur);

        if (dur > 0) {
          const pct = (cur / dur) * 100;
          if (seekBar) {
            seekBar.value = pct;
            seekBar.style.background = `linear-gradient(to right, #F59E0B 0%, #F59E0B ${pct}%, rgba(255,255,255,0.15) ${pct}%, rgba(255,255,255,0.15) 100%)`;
          }
          if (miniProgress) {
            miniProgress.style.width = `${pct}%`;
          }
        }

        // Karaoke Lyrics Synchronization
        const sentences = state.activeLesson?.sentences || [];
        if (sentences.length > 0) {
          let foundIdx = -1;
          for (let i = 0; i < sentences.length; i++) {
            const s = sentences[i];
            if (s.start !== undefined && s.end !== undefined) {
              const nextStart = (i + 1 < sentences.length && sentences[i+1].start !== undefined) ? sentences[i+1].start : (s.end + 0.8);
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

        // Listening tracker continuous pulse
        if (state.isPlaying && window.aefLearningTracker) {
          const nowMs = Date.now();
          if (!state._lastListeningTrackMs) state._lastListeningTrackMs = nowMs;
          const delta = (nowMs - state._lastListeningTrackMs) / 1000;
          if (delta >= 5) {
            window.aefLearningTracker.recordListeningTime('player_user', Math.round(delta));
            state._lastListeningTrackMs = nowMs;
          }
        }
      }

      function handleTrackEnded() {
        state.isPlaying = false;
        updatePlayButtonsUI(false);

        if (state.activeLesson && window.aefLearningTracker) {
          window.aefLearningTracker.markLessonCompleted?.(state.activeCourse?.id, state.activeLesson.id);
        }

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

      // =======================================================================
      // PEDAGOGICAL CONTENT (KARAOKE, GOLDEN TIP, STUDY NOTES)
      // =======================================================================
      function renderPedagogicalContent(lesson) {
        // 1. Lyrics / Karaoke
        const container = document.getElementById('lyrics-sentences-container');
        const sentences = lesson.sentences || [];

        if (container) {
          if (sentences.length > 0) {
            container.innerHTML = sentences.map((s, idx) => `
              <div id="lyric-line-${idx}" onclick="window.seekToSentence(${idx})" class="lyrics-line transition-all duration-300 cursor-pointer p-3 rounded-2xl hover:bg-white/5 ${idx === state.currentSentenceIndex ? 'lyrics-active' : 'lyrics-inactive'}">
                <p class="text-base sm:text-lg leading-relaxed">${s.text}</p>
                ${state.showTranslation && s.spokenTranslation ? `
                  <p class="text-xs sm:text-sm text-amber-200/90 font-medium mt-1 font-serif italic">${s.spokenTranslation}</p>
                ` : ''}
              </div>
            `).join('');
          } else {
            container.innerHTML = `
              <div class="text-center text-slate-400 text-xs py-8 space-y-1">
                <p>Nenhuma transcrição sincronizada disponível.</p>
                <p class="text-[11px] text-slate-500">Acesse a aba "Notas & PDF" para ver o roteiro de estudo.</p>
              </div>
            `;
          }
        }

        // 2. Golden Tip
        const tipEl = document.getElementById('golden-tip-text');
        if (tipEl) {
          tipEl.innerText = lesson.goldenTip || "Treine a repetição rítmica até as conexões fonéticas soarem com naturalidade e reflexo imediato.";
        }

        // 3. Notes & PDF
        const pdfBox = document.getElementById('lesson-pdf-box');
        const pdfLink = document.getElementById('lesson-pdf-link');
        const processedHtmlBox = document.getElementById('lesson-processed-html');

        if (lesson.pdfUrl && pdfBox && pdfLink) {
          pdfBox.classList.remove('hidden');
          pdfLink.href = lesson.pdfUrl;
        } else if (pdfBox) {
          pdfBox.classList.add('hidden');
        }

        if (processedHtmlBox) {
          if (lesson.processedContentHtml) {
            processedHtmlBox.innerHTML = lesson.processedContentHtml;
          } else if (lesson.rawScript) {
            processedHtmlBox.innerHTML = `<pre class="whitespace-pre-wrap font-sans text-xs text-slate-300">${lesson.rawScript}</pre>`;
          } else {
            processedHtmlBox.innerHTML = `<p class="text-slate-400 italic">Sem anotações complementares para esta aula.</p>`;
          }
        }
      }

      window.seekToSentence = (idx) => {
        const sentences = state.activeLesson?.sentences || [];
        const sentence = sentences[idx];
        if (!sentence) return;

        const el = getActiveMediaElement();
        if (el && sentence.start !== undefined) {
          el.currentTime = sentence.start;
          if (!state.isPlaying) {
            window.playMedia();
          }
          state.currentSentenceIndex = idx;
          updateLyricsHighlight();
        }
      };

      function updateLyricsHighlight() {
        const sentences = state.activeLesson?.sentences || [];
        sentences.forEach((_, idx) => {
          const line = document.getElementById(`lyric-line-${idx}`);
          if (!line) return;
          if (idx === state.currentSentenceIndex) {
            line.className = "lyrics-line transition-all duration-300 cursor-pointer p-3 rounded-2xl hover:bg-white/5 lyrics-active";
          } else {
            line.className = "lyrics-line transition-all duration-300 cursor-pointer p-3 rounded-2xl hover:bg-white/5 lyrics-inactive";
          }
        });
        scrollActiveLyricIntoView();
      }

      function scrollActiveLyricIntoView() {
        if (!state.isPedagogicalOpen || state.activeContentTab !== 'lyrics') return;
        const activeLine = document.getElementById(`lyric-line-${state.currentSentenceIndex}`);
        const container = document.getElementById('content-tab-lyrics');
        if (activeLine && container) {
          const offset = activeLine.offsetTop - container.offsetTop - (container.clientHeight / 2) + 50;
          container.scrollTo({ top: offset, behavior: 'smooth' });
        }
      }

      window.toggleTranslation = () => {
        state.showTranslation = !state.showTranslation;
        const toggleState = document.getElementById('trans-toggle-state');
        if (toggleState) toggleState.innerText = state.showTranslation ? 'ON' : 'OFF';
        if (state.activeLesson) renderPedagogicalContent(state.activeLesson);
        showToast(state.showTranslation ? 'Tradução falada ativada' : 'Tradução falada oculta');
      };

      window.togglePedagogicalContent = () => {
        state.isPedagogicalOpen = !state.isPedagogicalOpen;
        const sheet = document.getElementById('pedagogical-sheet');
        const btnLabel = document.getElementById('btn-drawer-notes-label');

        if (state.isPedagogicalOpen) {
          sheet?.classList.remove('translate-y-full');
          if (btnLabel) btnLabel.innerText = "Fechar";
          scrollActiveLyricIntoView();
        } else {
          sheet?.classList.add('translate-y-full');
          if (btnLabel) btnLabel.innerText = "Letra & Dicas";
        }
      };

      window.switchContentTab = (tabName) => {
        state.activeContentTab = tabName;

        ['lyrics', 'goldentip', 'notes'].forEach(t => {
          const btn = document.getElementById(`tab-btn-${t}`);
          const section = document.getElementById(`content-tab-${t}`);

          if (btn) {
            btn.className = t === tabName 
              ? "flex-1 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold transition text-center shadow-xs"
              : "flex-1 py-1.5 rounded-xl bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition text-center";
          }
          if (section) {
            section.classList.toggle('hidden', t !== tabName);
          }
        });

        if (tabName === 'lyrics') {
          scrollActiveLyricIntoView();
        }
      };

      // =======================================================================
      // FULLSCREEN / MINI PLAYER TOGGLING
      // =======================================================================
      window.expandNowPlaying = () => {
        const modal = document.getElementById('now-playing-modal');
        modal?.classList.remove('translate-y-full');
      };

      window.minimizeNowPlaying = () => {
        const modal = document.getElementById('now-playing-modal');
        modal?.classList.add('translate-y-full');

        // Close pedagogical sheet if open
        if (state.isPedagogicalOpen) {
          window.togglePedagogicalContent();
        }
      };

      window.closeMiniPlayer = () => {
        window.pauseMedia();
        document.getElementById('mini-player-bar')?.classList.add('hidden');
      };

      // =======================================================================
      // LEARNING TRACKER INTEGRATION & RESUME WORKOUT
      // =======================================================================
      function saveActivityToTracker(lesson, course) {
        if (!window.aefLearningTracker) return;

        window.aefLearningTracker.saveLastActivity({
          courseId: course.id,
          courseTitle: course.title,
          moduleId: lesson.moduleId,
          moduleTitle: lesson.moduleTitle,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          lessonDuration: lesson.duration || '03:00',
          thumbnailUrl: lesson.thumbnailUrl || course.coverImageUrl || 'assets/images/cover-default-aef.jpg',
          source: 'player'
        });

        loadResumeCard();
      }

      function loadResumeCard() {
        if (!window.aefLearningTracker) return;

        const last = window.aefLearningTracker.getGlobalLastActivity();
        const card = document.getElementById('resume-workout-card');
        if (!last || !card) return;

        document.getElementById('resume-thumb-img').src = last.thumbnailUrl || 'assets/images/cover-default-aef.jpg';
        document.getElementById('resume-course-title').innerText = last.courseTitle || 'AgoraEuFalo';
        document.getElementById('resume-lesson-title').innerText = last.lessonTitle || 'Continuar Treino';
        document.getElementById('resume-module-title').innerText = last.moduleTitle ? `${last.moduleTitle} • Toque para continuar` : 'Toque para continuar';

        card.classList.remove('hidden');

        document.getElementById('btn-resume-play').onclick = () => {
          window.playLessonById(last.courseId, last.moduleId, last.lessonId);
        };
        card.onclick = () => {
          window.playLessonById(last.courseId, last.moduleId, last.lessonId);
        };
      }

      // =======================================================================
      // DEEP-LINKING URL PARAMETERS
      // =======================================================================
      function handleUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const courseParam = params.get('curso') || params.get('course') || params.get('courseId');
        const lessonParam = params.get('aula') || params.get('lesson') || params.get('lessonId');

        if (courseParam && state.courses[courseParam]) {
          window.openCourse(courseParam);
          if (lessonParam && state.flatLessonsList.some(l => l.id === lessonParam)) {
            const match = state.flatLessonsList.find(l => l.id === lessonParam);
            if (match) {
              window.playLessonById(courseParam, match.moduleId, match.id);
            }
          }
        }
      }

      // =======================================================================
      // PAYWALL / ACCESS MODAL
      // =======================================================================
      window.showPaywall = (courseId) => {
        const course = state.courses[courseId];
        const modal = document.getElementById('lock-modal');
        if (!modal) return;

        if (course) {
          document.getElementById('lock-modal-title').innerText = course.title || 'Conteúdo Exclusivo';
          document.getElementById('lock-modal-desc').innerText = `O curso "${course.title}" faz parte do ecossistema avançado do AgoraEuFalo English Club ou Mentoria VIP.`;
        }

        modal.classList.remove('hidden');
        lucide.createIcons();
      };

      window.closeLockModal = () => {
        document.getElementById('lock-modal')?.classList.add('hidden');
      };

      // Toast notification helper
      function showToast(msg) {
        const toast = document.getElementById('toast-container');
        const text = document.getElementById('toast-message');
        if (!toast || !text) return;

        text.innerText = msg;
        toast.classList.remove('-translate-y-10', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');

        setTimeout(() => {
          toast.classList.add('-translate-y-10', 'opacity-0');
          toast.classList.remove('translate-y-0', 'opacity-100');
        }, 2200);
      }

      // Boot application when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
      } else {
        initApp();
      }

    })(window);