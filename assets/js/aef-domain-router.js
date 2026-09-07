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

  class AEFDomainRouter {
    constructor() {
      this.hostname = window.location.hostname || '';
      this.pathname = window.location.pathname || '';
      this.search = window.location.search || '';
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
      return this.hostname === 'agoraeufalo.com.br' || this.hostname === 'www.agoraeufalo.com.br';
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

      const page = this.pathname.split('/').pop() || 'index.html';

      // 1. Regras do Subdomínio ADMIN (admin.agoraeufalo.com.br)
      if (this.isAdminDomain()) {
        // Se acessar a raiz do subdomínio admin -> redireciona para admin.html
        if (page === '' || page === 'index.html') {
          window.location.replace('admin.html' + this.search);
          return;
        }
      }

      // 2. Regras do Subdomínio APP (app.agoraeufalo.com.br)
      if (this.isAppDomain()) {
        // Se acessar a raiz do subdomínio do aluno -> redireciona para portal.html
        if (page === '' || page === 'index.html') {
          window.location.replace('portal.html' + this.search);
          return;
        }
      }
    }
  }

  window.AEFDomainRouter = new AEFDomainRouter();
})(window);
