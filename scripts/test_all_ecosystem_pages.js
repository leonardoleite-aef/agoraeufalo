/**
 * AgoraEuFalo - Comprehensive Ecosystem Test Suite
 * Validates DOM rendering, JavaScript execution, function binding, and routing across all pages.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to load core scripts
const AEF_COURSES_DATA = require(path.join(ROOT_DIR, 'assets/js/aef-courses-registry.js'));
const authJs = fs.readFileSync(path.join(ROOT_DIR, 'assets/js/aef-portal-auth.js'), 'utf8');
const domainRouterJs = fs.readFileSync(path.join(ROOT_DIR, 'assets/js/aef-domain-router.js'), 'utf8');

const testResults = [];

async function testPage(pageConfig) {
  const { name, file, url, expectedElements, actions } = pageConfig;
  const filePath = path.join(ROOT_DIR, file);

  if (!fs.existsSync(filePath)) {
    testResults.push({ name, file, url, status: 'FAILED', error: `File not found: ${filePath}` });
    return;
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const errors = [];

  const dom = new JSDOM(html, {
    url: url || 'https://app.agoraeufalo.com.br/',
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(win) {
      win.localStorage.setItem('aef_user_role', 'admin');
      win.localStorage.setItem('aef_user_tier', 'admin_master');
      win.localStorage.setItem('aef_user_name', 'Professor Leonardo Leite');
      win.localStorage.setItem('aef_user_email', 'selexenglish@gmail.com');

      win.AEF_COURSES_REGISTRY = AEF_COURSES_DATA;
      win.COURSES_REGISTRY = AEF_COURSES_DATA;
      win.COURSE_SEEDS = AEF_COURSES_DATA;

      if (!win.fetch) {
        win.fetch = async () => ({
          ok: true,
          json: async () => ({})
        });
      }
    }
  });

  dom.window.addEventListener('error', (e) => {
    // Ignore external CDN network load errors in JSDOM
    const msg = e.message || (e.error && e.error.message) || String(e);
    if (
      msg.includes('cdn.tailwindcss.com') ||
      msg.includes('fonts.googleapis.com') ||
      msg.includes('unpkg.com') ||
      msg.includes('gstatic.com') ||
      msg.includes('Not implemented: navigation')
    ) {
      return;
    }
    errors.push(msg);
  });

  // Inject required core runtime scripts into DOM context once head exists
  try {
    dom.window.eval(domainRouterJs);
    dom.window.eval(authJs);
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  } catch (evalErr) {
    errors.push(`Script injection error: ${evalErr.message}`);
  }

  // Allow DOM scripts to execute
  await new Promise((res) => setTimeout(res, 400));

  // Verify expected elements
  const missingElements = [];
  if (Array.isArray(expectedElements)) {
    expectedElements.forEach((selector) => {
      const el = dom.window.document.querySelector(selector);
      if (!el) {
        missingElements.push(selector);
      }
    });
  }

  // Execute custom actions/functions
  let actionsResult = 'OK';
  if (typeof actions === 'function') {
    try {
      await actions(dom.window, dom.window.document);
    } catch (actErr) {
      actionsResult = actErr.message;
      errors.push(`Action execution error: ${actErr.message}`);
    }
  }

  const passed = errors.length === 0 && missingElements.length === 0;

  testResults.push({
    name,
    file,
    url,
    status: passed ? 'PASSED' : 'FAILED',
    missingElements,
    errors,
    actionsResult
  });
}

async function runAllTests() {
  console.log('🧪 Starting Full AgoraEuFalo Ecosystem Test Suite...\n');

  const pagesToTest = [
    // APP DOMAIN
    {
      name: 'App - Portal / Dashboard',
      file: 'portal.html',
      url: 'https://app.agoraeufalo.com.br/',
      expectedElements: ['#top-user-greeting', '#stat-streak-days', '#stat-listening-minutes', '#enrolledCoursesGrid'],
      actions: async (win, doc) => {
        const greeting = doc.getElementById('top-user-greeting');
        if (!greeting) throw new Error('Greeting element missing');
        const grid = doc.getElementById('enrolledCoursesGrid');
        if (!grid) throw new Error('Enrolled courses grid missing');
      }
    },
    {
      name: 'App - Visão Geral do Curso (DTC)',
      file: 'curso.html',
      url: 'https://app.agoraeufalo.com.br/curso?curso=dtc_curso',
      expectedElements: ['#courseHeroTitle', '#courseModulesAccordion', '#btnContinueWatching'],
      actions: async (win, doc) => {
        const title = doc.getElementById('courseHeroTitle');
        if (!title || !title.textContent.includes('Dates')) throw new Error(`Expected DTC title, got: ${title?.textContent}`);
        const accordion = doc.getElementById('courseModulesAccordion');
        if (!accordion || accordion.children.length === 0) throw new Error('Modules accordion is empty');
      }
    },
    {
      name: 'App - Visão Geral do Curso (MS Legacy)',
      file: 'curso.html',
      url: 'https://app.agoraeufalo.com.br/curso?curso=ms-legacy',
      expectedElements: ['#courseHeroTitle', '#courseModulesAccordion'],
      actions: async (win, doc) => {
        const title = doc.getElementById('courseHeroTitle');
        if (!title) throw new Error('Hero title missing');
        const accordion = doc.getElementById('courseModulesAccordion');
        if (!accordion || accordion.children.length === 0) throw new Error('Modules accordion is empty');
      }
    },
    {
      name: 'App - Sala de Aula (DTC)',
      file: 'sala-de-aula.html',
      url: 'https://app.agoraeufalo.com.br/sala?curso=dtc_curso&modulo=ciclo-02&aula=aula-1788736026295',
      expectedElements: ['#currentLessonTitle', '#desktopCourseSyllabus', '#desktopCourseProgressSummary', '#videoStage'],
      actions: async (win, doc) => {
        const title = doc.getElementById('currentLessonTitle');
        if (!title || !title.textContent.includes('HORAS')) throw new Error(`Expected lesson HORAS, got: ${title?.textContent}`);
        const summary = doc.getElementById('desktopCourseProgressSummary');
        if (!summary || summary.textContent.includes('Carregando')) throw new Error(`Syllabus summary stuck: ${summary?.textContent}`);
        const syllabus = doc.getElementById('desktopCourseSyllabus');
        if (!syllabus || syllabus.children.length === 0) throw new Error('Syllabus is empty');
      }
    },
    {
      name: 'App - Sala de Aula (MS Legacy)',
      file: 'sala-de-aula.html',
      url: 'https://app.agoraeufalo.com.br/sala?curso=ms-legacy&modulo=ms001-grazi&aula=ms001-lr',
      expectedElements: ['#currentLessonTitle', '#desktopCourseSyllabus', '#videoStage'],
      actions: async (win, doc) => {
        const title = doc.getElementById('currentLessonTitle');
        if (!title) throw new Error('Lesson title missing');
        const syllabus = doc.getElementById('desktopCourseSyllabus');
        if (!syllabus || syllabus.children.length === 0) throw new Error('Syllabus is empty');
      }
    },
    {
      name: 'App - Training Player',
      file: 'treino/player.html',
      url: 'https://app.agoraeufalo.com.br/player?curso=dtc_curso&modulo=ciclo-02&aula=aula-1788736026295',
      expectedElements: ['#core-audio', '#course-select', '#module-select', '#stage-artwork-card', '#btn-main-play'],
      actions: async (win, doc) => {
        const audio = doc.getElementById('core-audio');
        if (!audio) throw new Error('Core audio element missing');
      }
    },
    {
      name: 'App - Login',
      file: 'login.html',
      url: 'https://app.agoraeufalo.com.br/login',
      expectedElements: ['#userEmailInput', '#userPasswordInput', '#authForm', '#submitAuthBtn'],
      actions: async (win, doc) => {
        const form = doc.getElementById('authForm');
        if (!form) throw new Error('Auth form missing');
      }
    },
    {
      name: 'App - Cadastro',
      file: 'cadastro.html',
      url: 'https://app.agoraeufalo.com.br/cadastro',
      expectedElements: ['#signup-name-input', '#signup-email-input', '#signupForm', '#btn-signup-submit'],
      actions: async (win, doc) => {
        const nameInput = doc.getElementById('signup-name-input');
        if (!nameInput) throw new Error('Name input missing');
      }
    },

    // ADMIN DOMAIN
    {
      name: 'Admin - Hub Central',
      file: 'admin.html',
      url: 'https://admin.agoraeufalo.com.br/',
      expectedElements: ['body'],
      actions: async (win, doc) => {
        const links = doc.querySelectorAll('a');
        if (links.length === 0) throw new Error('No links rendered in admin hub');
      }
    },
    {
      name: 'Admin - Course Studio',
      file: 'admin-cursos.html',
      url: 'https://admin.agoraeufalo.com.br/cursos',
      expectedElements: ['#headerCourseSelect', '#hierarchyTreeContainer', '#lessonEditorForm'],
      actions: async (win, doc) => {
        const select = doc.getElementById('headerCourseSelect');
        if (!select) throw new Error('Course select missing');
        const tree = doc.getElementById('hierarchyTreeContainer');
        if (!tree) throw new Error('Hierarchy tree missing');
      }
    },
    {
      name: 'Admin - CRM Alunos',
      file: 'admin-alunos.html',
      url: 'https://admin.agoraeufalo.com.br/alunos',
      expectedElements: ['#search-input', '#students-table-body', '#stat-total-students'],
      actions: async (win, doc) => {
        const search = doc.getElementById('search-input');
        if (!search) throw new Error('Student search input missing');
        const tbody = doc.getElementById('students-table-body');
        if (!tbody) throw new Error('Students table body missing');
      }
    },
    {
      name: 'Admin - Vendas & Checkouts',
      file: 'admin-vendas.html',
      url: 'https://admin.agoraeufalo.com.br/vendas',
      expectedElements: ['#offersContainer', '#offerSearchInput', '#stat-total'],
      actions: async (win, doc) => {
        const grid = doc.getElementById('offersContainer');
        if (!grid) throw new Error('Offers container missing');
      }
    },
    {
      name: 'Admin - Webhooks Monitor',
      file: 'admin-webhooks.html',
      url: 'https://admin.agoraeufalo.com.br/webhooks',
      expectedElements: ['#webhook-simulator-card', '#sim-buyer-name', '#sim-json-editor'],
      actions: async (win, doc) => {
        const card = doc.getElementById('webhook-simulator-card');
        if (!card) throw new Error('Webhooks simulator card missing');
      }
    },
    {
      name: 'Admin - Marketing Block Engine',
      file: 'admin-marketing.html',
      url: 'https://admin.agoraeufalo.com.br/marketing',
      expectedElements: ['#blocksContainer', '#blockSearchInput', '#stat-total-blocks'],
      actions: async (win, doc) => {
        const container = doc.getElementById('blocksContainer');
        if (!container) throw new Error('Blocks container missing');
      }
    },
    {
      name: 'Admin - PDF Factory',
      file: 'admin-pdf-factory.html',
      url: 'https://admin.agoraeufalo.com.br/pdf-factory',
      expectedElements: ['#importCourseSelect', '#pdfCanvasIframe'],
      actions: async (win, doc) => {
        const select = doc.getElementById('importCourseSelect');
        if (!select) throw new Error('PDF course select missing');
      }
    },
    {
      name: 'Admin - Gemini TTS Studio',
      file: 'tts-studio.html',
      url: 'https://admin.agoraeufalo.com.br/tts',
      expectedElements: ['#scriptInput', '#generateAudioBtn', '#audioTitleInput'],
      actions: async (win, doc) => {
        const input = doc.getElementById('scriptInput');
        if (!input) throw new Error('TTS script input missing');
      }
    },
    {
      name: 'Admin - CMS Blog Panel',
      file: 'blog-panel.html',
      url: 'https://admin.agoraeufalo.com.br/blog',
      expectedElements: ['#posts-grid', '#search-input', '#stat-total'],
      actions: async (win, doc) => {
        const container = doc.getElementById('posts-grid');
        if (!container) throw new Error('Posts grid missing');
      }
    },
    {
      name: 'Admin - SEO Manager',
      file: 'seo-manager.html',
      url: 'https://admin.agoraeufalo.com.br/seo',
      expectedElements: ['#pages-list', '#page-search', '#total-pages-count'],
      actions: async (win, doc) => {
        const list = doc.getElementById('pages-list');
        if (!list) throw new Error('SEO pages list missing');
      }
    },

    // PUBLIC DOMAIN
    {
      name: 'Public - Homepage',
      file: 'index.html',
      url: 'https://agoraeufalo.com.br/',
      expectedElements: ['header', 'footer', '#metodo', '#seis-etapas', '#comparativo', '#professor'],
      actions: async (win, doc) => {
        const metodo = doc.getElementById('metodo');
        if (!metodo) throw new Error('Metodo section missing');
      }
    },
    {
      name: 'Public - Projeto AEF 2026',
      file: 'projeto-aef.html',
      url: 'https://agoraeufalo.com.br/projeto-aef',
      expectedElements: ['#hero', '#o-metodo', '#inscricao', '#depoimentos'],
      actions: async (win, doc) => {
        const hero = doc.getElementById('hero');
        if (!hero) throw new Error('Hero section missing');
      }
    },
    {
      name: 'Public - Preços',
      file: 'precos.html',
      url: 'https://agoraeufalo.com.br/precos',
      expectedElements: ['header', '#mobile-menu-toggle'],
      actions: async (win, doc) => {
        const menu = doc.getElementById('mobile-menu-toggle');
        if (!menu) throw new Error('Menu toggle missing');
      }
    }
  ];

  for (const page of pagesToTest) {
    process.stdout.write(`Testing ${page.name.padEnd(38)} ... `);
    await testPage(page);
    const res = testResults[testResults.length - 1];
    if (res.status === 'PASSED') {
      console.log('✅ PASSED');
    } else {
      console.log('❌ FAILED');
      if (res.missingElements.length) console.log(`   Missing Elements: ${res.missingElements.join(', ')}`);
      if (res.errors.length) console.log(`   Errors: ${res.errors.join(' | ')}`);
    }
  }

  console.log('\n========================================');
  const passedCount = testResults.filter((r) => r.status === 'PASSED').length;
  const failedCount = testResults.filter((r) => r.status === 'FAILED').length;
  console.log(`Total: ${testResults.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
  console.log('========================================\n');

  // Save report to JSON file
  fs.writeFileSync(path.join(ROOT_DIR, 'test_report.json'), JSON.stringify(testResults, null, 2));

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
