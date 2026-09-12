/**
 * AgoraEuFalo - Subdomain & Ecosystem Cross-Domain Router
 * Professor Leonardo Leite
 * 
 * Manages domain entrypoints and cross-domain links:
 * 1. agoraeufalo.com.br       -> Public Site, Blog, Landing Pages, Courses
 * 2. app.agoraeufalo.com.br   -> Student Member Area (Portal, Classroom, Player)
 * 3. admin.agoraeufalo.com.br -> Backoffice Master (Course Studio, CRM, PDF Factory)
 */

(function (window) {
  'use strict';

  class AEFDomainRouter {
    constructor() {
      this.hostname = window.location.hostname || '';
      this.pathname = window.location.pathname || '';
      this.search = window.location.search || '';
      this.hash = window.location.hash || '';
      this.page = this.pathname.split('/').pop() || 'index.html';
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
      const clean = path ? (path.startsWith('/') ? path : `/${path}`) : '/';
      return this.isLocal() ? clean : `https://agoraeufalo.com.br${clean}`;
    }

    getAppUrl(path = '') {
      const clean = path ? (path.startsWith('/') ? path : `/${path}`) : '/';
      return this.isLocal() ? clean : `https://app.agoraeufalo.com.br${clean}`;
    }

    getAdminUrl(path = '') {
      const clean = path ? (path.startsWith('/') ? path : `/${path}`) : '/';
      return this.isLocal() ? clean : `https://admin.agoraeufalo.com.br${clean}`;
    }

    enforceSegregation() {
      if (this.isLocal()) return;
      
      const adminPages = ['admin', 'admin-cursos', 'admin-usuarios', 'admin-vendas', 'admin-marketing', 'admin-quiz', 'admin-webhooks', 'admin-alunos', 'admin-pdf-factory', 'tts-studio', 'blog-panel', 'seo-manager'];
      const appPages = ['portal', 'curso', 'sala-de-aula', 'player'];

      const pageBase = this.page.split('.')[0] || '';
      const isPublic = this.isPublicDomain();
      const isAdmin = this.isAdminDomain();
      const isApp = this.isAppDomain();
      
      if (adminPages.includes(pageBase)) {
        if (!isAdmin) {
          window.location.replace(this.getAdminUrl(this.pathname + this.search + this.hash));
        }
      } else if (appPages.includes(pageBase)) {
        if (!isApp) {
          window.location.replace(this.getAppUrl(this.pathname + this.search + this.hash));
        }
      }
    }
  }

  window.AEFDomainRouter = new AEFDomainRouter();
  window.AEFDomainRouter.enforceSegregation();
})(window);
