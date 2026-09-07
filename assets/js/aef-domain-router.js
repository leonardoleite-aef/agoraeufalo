/**
 * AgoraEuFalo - Subdomain & Ecosystem Cross-Domain Router
 * Professor Leonardo Leite
 * 
 * Manages domain-specific entrypoints, cross-domain link routing, and authentication handshakes:
 * 1. agoraeufalo.com.br       -> Public Site, Blog, Landing Pages, SEO
 * 2. app.agoraeufalo.com.br   -> Student Member Area (Portal, Classroom, Player, Courses)
 * 3. admin.agoraeufalo.com.br -> Backoffice Master (Course Studio, CRM, PDF Factory, Vendas)
 */

(function (window) {
  'use strict';

  const ADMIN_PAGES = [
    'admin.html',
    'admin-login.html',
    'admin-alunos.html',
    'admin-cursos.html',
    'admin-vendas.html',
    'admin-webhooks.html',
    'admin-marketing.html',
    'admin-ofertas.html',
    'admin-pdf-factory.html',
    'tts-studio.html',
    'blog-panel.html',
    'seo-manager.html'
  ];

  const APP_PAGES = [
    'portal.html',
    'sala-de-aula.html',
    'curso.html',
    'player.html',
    'login.html',
    'cadastro.html',
    'recuperar-senha.html',
    'meu-perfil.html',
    'quick-start.html',
    'mentoria.html'
  ];

  class AEFDomainRouter {
    constructor() {
      this.hostname = window.location.hostname || '';
      this.pathname = window.location.pathname || '';
      this.search = window.location.search || '';
      this.hash = window.location.hash || '';
      this.page = this.pathname.split('/').pop() || 'index.html';
      this.init();
    }

    isLocal() {
      return (
        this.hostname === 'localhost' ||
        this.hostname === '127.0.0.1' ||
        this.hostname.startsWith('192.168.') ||
        this.hostname.startsWith('10.') ||
        window.location.protocol === 'file:'
      );
    }

    isAdminDomain() {
      return this.hostname === 'admin.agoraeufalo.com.br';
    }

    isAppDomain() {
      return this.hostname === 'app.agoraeufalo.com.br';
    }

    isPublicDomain() {
      return (
        this.hostname === 'agoraeufalo.com.br' ||
        this.hostname === 'www.agoraeufalo.com.br' ||
        this.hostname.endsWith('github.io')
      );
    }

    getPublicUrl(path = '') {
      const clean = path.startsWith('/') ? path : `/${path}`;
      return this.isLocal() ? clean : `https://agoraeufalo.com.br${clean}`;
    }

    getAppUrl(path = 'portal.html') {
      const clean = path.startsWith('/') ? path : `/${path}`;
      return this.isLocal() ? clean : `https://app.agoraeufalo.com.br${clean}`;
    }

    getAdminUrl(path = 'admin.html') {
      const clean = path.startsWith('/') ? path : `/${path}`;
      return this.isLocal() ? clean : `https://admin.agoraeufalo.com.br${clean}`;
    }

    isAdminPage(pageName = this.page) {
      return ADMIN_PAGES.includes(pageName);
    }

    isAppPage(pageName = this.page) {
      return APP_PAGES.includes(pageName) || this.pathname.startsWith('/treino/') || this.pathname.startsWith('/portal/');
    }

    init() {
      if (this.isLocal()) return;

      const fullSuffix = this.search + this.hash;

      // 1. Regras do Subdomínio ADMIN (admin.agoraeufalo.com.br)
      if (this.isAdminDomain()) {
        if (this.page === '' || this.page === 'index.html') {
          window.location.replace('admin.html' + fullSuffix);
          return;
        }
        // Se estiver no admin e tentar abrir uma página do aluno -> manda para o app
        if (this.isAppPage()) {
          window.location.replace(`https://app.agoraeufalo.com.br${this.pathname}${fullSuffix}`);
          return;
        }
      }

      // 2. Regras do Subdomínio APP (app.agoraeufalo.com.br)
      if (this.isAppDomain()) {
        if (this.page === '' || this.page === 'index.html') {
          window.location.replace('portal.html' + fullSuffix);
          return;
        }
        // Se estiver no app e tentar abrir página de admin -> manda para o admin
        if (this.isAdminPage()) {
          window.location.replace(`https://admin.agoraeufalo.com.br${this.pathname}${fullSuffix}`);
          return;
        }
      }

      // 3. Regras do Domínio PÚBLICO (agoraeufalo.com.br / www)
      if (this.isPublicDomain() && this.hostname !== 'leonardoleite-aef.github.io') {
        if (this.isAdminPage()) {
          window.location.replace(`https://admin.agoraeufalo.com.br${this.pathname}${fullSuffix}`);
          return;
        }
        if (this.isAppPage()) {
          window.location.replace(`https://app.agoraeufalo.com.br${this.pathname}${fullSuffix}`);
          return;
        }
      }
    }
  }

  window.AEFDomainRouter = new AEFDomainRouter();
})(window);
