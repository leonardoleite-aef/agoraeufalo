/**
 * AgoraEuFalo - Edge Server Router (Cloudflare Worker)
 * Professor Leonardo Leite
 * 
 * Clean RESTful domain-scoped rewrites (Zero Redirects / 100% Native Edge Serving):
 * 
 * 1. admin.agoraeufalo.com.br
 *    /             -> admin.html (Hub Central)
 *    /login        -> admin-login.html
 *    /alunos       -> admin-alunos.html
 *    /cursos       -> admin-cursos.html
 *    /vendas       -> admin-vendas.html
 *    /webhooks     -> admin-webhooks.html
 *    /marketing    -> admin-marketing.html
 *    /pdf-factory  -> admin-pdf-factory.html
 *    /tts          -> tts-studio.html
 *    /blog         -> blog-panel.html
 *    /seo          -> seo-manager.html
 * 
 * 2. app.agoraeufalo.com.br
 *    /             -> portal.html (Portal do Aluno)
 *    /login        -> login.html
 *    /cadastro     -> cadastro.html
 *    /sala         -> sala-de-aula.html
 *    /curso        -> curso.html
 *    /player       -> treino/player.html
 *    /migracao     -> migracao/index.html
 * 
 * 3. agoraeufalo.com.br
 *    /             -> index.html
 *    /projeto-aef  -> projeto-aef.html
 *    /precos       -> precos.html
 *    /ebook        -> ebook.html
 *    /guia-magic-stories -> guia-magic-stories.html
 *    /blog         -> blog/index.html
 *    /contato      -> contato.html
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname;
    let path = url.pathname;

    // Normaliza rota sem trailing slash (exceto raiz)
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    // Se for requisição para data/ (legado ou relativo do player), reescreve para /treino/data/
    if (path.startsWith('/data/')) {
      url.pathname = `/treino${path}`;
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    // Se for arquivo estático com extensão (.css, .js, .png, .jpg, .svg, .ico, .mp3, .pdf, .json, etc)
    if (path.includes('.') && !path.endsWith('.html')) {
      return env.ASSETS.fetch(request);
    }

    // ============================================================
    // 1. SUBDOMÍNIO ADMIN (admin.agoraeufalo.com.br)
    // ============================================================
    if (host === 'admin.agoraeufalo.com.br') {
      const adminLegacyRedirects = {
        '/admin.html': '/',
        '/admin': '/',
        '/admin-login.html': '/login',
        '/admin-login': '/login',
        '/admin-alunos.html': '/alunos',
        '/admin-alunos': '/alunos',
        '/admin-cursos.html': '/cursos',
        '/admin-cursos': '/cursos',
        '/admin-vendas.html': '/vendas',
        '/admin-vendas': '/vendas',
        '/admin-webhooks.html': '/webhooks',
        '/admin-webhooks': '/webhooks',
        '/admin-marketing.html': '/marketing',
        '/admin-marketing': '/marketing',
        '/admin-ofertas.html': '/vendas',
        '/admin-ofertas': '/vendas',
        '/admin-pdf-factory.html': '/pdf-factory',
        '/admin-pdf-factory': '/pdf-factory',
        '/admin-quiz.html': '/quiz',
        '/admin-quiz': '/quiz',
        '/tts-studio.html': '/tts',
        '/tts-studio': '/tts',
        '/blog-panel.html': '/blog',
        '/blog-panel': '/blog',
        '/seo-manager.html': '/seo',
        '/seo-manager': '/seo'
      };

      if (adminLegacyRedirects[path]) {
        url.pathname = adminLegacyRedirects[path];
        return Response.redirect(url.toString(), 301);
      }

      const adminFileMap = {
        '/': '/admin.html',
        '/login': '/admin-login.html',
        '/alunos': '/admin-alunos.html',
        '/cursos': '/admin-cursos.html',
        '/quiz': '/admin-quiz.html',
        '/vendas': '/admin-vendas.html',
        '/webhooks': '/admin-webhooks.html',
        '/marketing': '/admin-marketing.html',
        '/pdf-factory': '/admin-pdf-factory.html',
        '/tts': '/tts-studio.html',
        '/blog': '/blog-panel.html',
        '/seo': '/seo-manager.html'
      };

      const targetFile = adminFileMap[path] || (path.endsWith('.html') ? path : `${path}.html`);
      url.pathname = targetFile;
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    // ============================================================
    // 2. SUBDOMÍNIO DO ALUNO (app.agoraeufalo.com.br)
    // ============================================================
    else if (host === 'app.agoraeufalo.com.br') {
      const appLegacyRedirects = {
        '/portal.html': '/',
        '/portal': '/',
        '/login.html': '/login',
        '/cadastro.html': '/cadastro',
        '/sala-de-aula.html': '/sala',
        '/sala-de-aula': '/sala',
        '/curso.html': '/curso',
        '/treino/player.html': '/player',
        '/treino/player': '/player'
      };

      if (appLegacyRedirects[path]) {
        url.pathname = appLegacyRedirects[path];
        return Response.redirect(url.toString(), 301);
      }

      const appFileMap = {
        '/': '/portal.html',
        '/login': '/login.html',
        '/cadastro': '/cadastro.html',
        '/sala': '/sala-de-aula.html',
        '/curso': '/curso.html',
        '/player': '/treino/player.html',
        '/migracao': '/migracao/index.html'
      };

      const targetFile = appFileMap[path] || (path.endsWith('.html') ? path : `${path}.html`);
      url.pathname = targetFile;
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    // ============================================================
    // 3. DOMÍNIO PÚBLICO (agoraeufalo.com.br / www)
    // ============================================================
    else {
      // Cross-domain Redirects de rotas de aluno acessadas no domínio público
      const appCrossDomainMap = {
        '/portal': '/',
        '/portal.html': '/',
        '/sala': '/sala',
        '/sala-de-aula': '/sala',
        '/sala-de-aula.html': '/sala',
        '/curso': '/curso',
        '/curso.html': '/curso',
        '/player': '/player',
        '/treino/player': '/player',
        '/treino/player.html': '/player',
        '/login': '/login',
        '/login.html': '/login',
        '/cadastro': '/cadastro',
        '/cadastro.html': '/cadastro',
        '/migracao': '/migracao',
        '/migracao/index.html': '/migracao'
      };

      if (appCrossDomainMap[path]) {
        const dest = `https://app.agoraeufalo.com.br${appCrossDomainMap[path]}${url.search}`;
        return Response.redirect(dest, 302);
      }

      // Cross-domain Redirects de rotas de admin acessadas no domínio público
      const adminCrossDomainMap = {
        '/admin': '/',
        '/admin.html': '/',
        '/admin-login': '/login',
        '/admin-login.html': '/login',
        '/alunos': '/alunos',
        '/admin-alunos': '/alunos',
        '/admin-alunos.html': '/alunos',
        '/cursos': '/cursos',
        '/admin-cursos': '/cursos',
        '/admin-cursos.html': '/cursos',
        '/quiz': '/quiz',
        '/admin-quiz': '/quiz',
        '/admin-quiz.html': '/quiz',
        '/vendas': '/vendas',
        '/admin-vendas': '/vendas',
        '/admin-vendas.html': '/vendas',
        '/webhooks': '/webhooks',
        '/admin-webhooks': '/webhooks',
        '/admin-webhooks.html': '/webhooks',
        '/marketing': '/marketing',
        '/admin-marketing': '/marketing',
        '/admin-marketing.html': '/marketing',
        '/pdf-factory': '/pdf-factory',
        '/admin-pdf-factory': '/pdf-factory',
        '/admin-pdf-factory.html': '/pdf-factory',
        '/tts': '/tts',
        '/tts-studio': '/tts',
        '/tts-studio.html': '/tts',
        '/blog-panel': '/blog',
        '/blog-panel.html': '/blog',
        '/seo': '/seo',
        '/seo-manager': '/seo',
        '/seo-manager.html': '/seo'
      };

      if (adminCrossDomainMap[path]) {
        const dest = `https://admin.agoraeufalo.com.br${adminCrossDomainMap[path]}${url.search}`;
        return Response.redirect(dest, 302);
      }

      const publicLegacyRedirects = {
        '/index.html': '/',
        '/index': '/',
        '/projeto-aef.html': '/projeto-aef',
        '/precos.html': '/precos',
        '/ebook.html': '/ebook',
        '/guia-magic-stories.html': '/guia-magic-stories',
        '/contato.html': '/contato',
        '/politica-de-privacidade.html': '/politica-de-privacidade',
        '/termos-de-uso.html': '/termos-de-uso',
        '/obrigado.html': '/obrigado'
      };

      if (publicLegacyRedirects[path]) {
        url.pathname = publicLegacyRedirects[path];
        return Response.redirect(url.toString(), 301);
      }

      const publicFileMap = {
        '/': '/index.html',
        '/projeto-aef': '/projeto-aef.html',
        '/precos': '/precos.html',
        '/ebook': '/ebook.html',
        '/guia-magic-stories': '/guia-magic-stories.html',
        '/contato': '/contato.html',
        '/blog': '/blog/index.html',
        '/politica-de-privacidade': '/politica-de-privacidade.html',
        '/termos-de-uso': '/termos-de-uso.html',
        '/obrigado': '/obrigado.html'
      };

      const targetFile = publicFileMap[path] || (path.endsWith('.html') ? path : `${path}.html`);
      url.pathname = targetFile;
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }
  }
};
