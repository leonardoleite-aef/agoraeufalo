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

    init() {
      if (this.isLocal()) return;

      const fullSuffix = this.search + this.hash;

      // 1. Subdomínio ADMIN (admin.agoraeufalo.com.br)
      if (this.isAdminDomain()) {
        if (this.page === '' || this.page === 'index.html') {
          window.location.replace('admin.html' + fullSuffix);
        }
      }

      // 2. Subdomínio APP (app.agoraeufalo.com.br)
      if (this.isAppDomain()) {
        if (this.page === '' || this.page === 'index.html') {
          window.location.replace('portal.html' + fullSuffix);
        }
      }
    }
  }

  window.AEFDomainRouter = new AEFDomainRouter();
})(window);
