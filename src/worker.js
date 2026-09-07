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

    // Se for arquivo estático com extensão (.css, .js, .png, .jpg, .svg, .ico, .mp3, .pdf, .json, etc)
    if (path.includes('.') && !path.endsWith('.html')) {
      return env.ASSETS.fetch(request);
    }

    let targetFile = null;

    // 1. SUBDOMÍNIO ADMIN (admin.agoraeufalo.com.br)
    if (host === 'admin.agoraeufalo.com.br') {
      const adminMap = {
        '/': '/admin.html',
        '/admin': '/admin.html',
        '/login': '/admin-login.html',
        '/admin-login': '/admin-login.html',
        '/alunos': '/admin-alunos.html',
        '/admin-alunos': '/admin-alunos.html',
        '/cursos': '/admin-cursos.html',
        '/admin-cursos': '/admin-cursos.html',
        '/vendas': '/admin-vendas.html',
        '/admin-vendas': '/admin-vendas.html',
        '/webhooks': '/admin-webhooks.html',
        '/admin-webhooks': '/admin-webhooks.html',
        '/marketing': '/admin-marketing.html',
        '/admin-marketing': '/admin-marketing.html',
        '/ofertas': '/admin-ofertas.html',
        '/admin-ofertas': '/admin-ofertas.html',
        '/pdf-factory': '/admin-pdf-factory.html',
        '/admin-pdf-factory': '/admin-pdf-factory.html',
        '/tts': '/tts-studio.html',
        '/tts-studio': '/tts-studio.html',
        '/blog': '/blog-panel.html',
        '/blog-panel': '/blog-panel.html',
        '/seo': '/seo-manager.html',
        '/seo-manager': '/seo-manager.html'
      };
      targetFile = adminMap[path] || (path.endsWith('.html') ? path : `${path}.html`);
    }

    // 2. SUBDOMÍNIO DO ALUNO (app.agoraeufalo.com.br)
    else if (host === 'app.agoraeufalo.com.br') {
      const appMap = {
        '/': '/portal.html',
        '/portal': '/portal.html',
        '/login': '/login.html',
        '/cadastro': '/cadastro.html',
        '/sala': '/sala-de-aula.html',
        '/sala-de-aula': '/sala-de-aula.html',
        '/curso': '/curso.html',
        '/player': '/treino/player.html',
        '/treino/player': '/treino/player.html',
        '/migracao': '/migracao/index.html'
      };
      targetFile = appMap[path] || (path.endsWith('.html') ? path : `${path}.html`);
    }

    // 3. DOMÍNIO PÚBLICO (agoraeufalo.com.br / www)
    else {
      const publicMap = {
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
      targetFile = publicMap[path] || (path.endsWith('.html') ? path : `${path}.html`);
    }

    if (targetFile) {
      url.pathname = targetFile;
      const modifiedRequest = new Request(url.toString(), request);
      return env.ASSETS.fetch(modifiedRequest);
    }

    return env.ASSETS.fetch(request);
  }
};
