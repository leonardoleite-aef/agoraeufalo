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

import edgeApiWorker from '../cloudflare-worker/worker.js';

// ============================================================================
// PODCAST EDGE SECURITY - NATIVE JWT VALIDATION & HANDSHAKE
// ============================================================================

// Cache global em memória no Isolate do Cloudflare Worker
let cachedJwks = null;
let jwksExpirationTime = 0;

async function verifyFirebaseJWT(token, projectId) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Função Blindada para Base64Url (Suporta UTF-8 e resolve problemas de padding)
    const base64UrlDecode = (str) => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      if (pad) {
        base64 += '='.repeat(4 - pad);
      }
      const raw = atob(base64);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) {
        bytes[i] = raw.charCodeAt(i);
      }
      return JSON.parse(new TextDecoder('utf-8').decode(bytes));
    };

    const header = base64UrlDecode(parts[0]);
    const payload = base64UrlDecode(parts[1]);

    // 1. Validações Críticas de Segurança (Firebase Specs)
    const now = Math.floor(Date.now() / 1000);
    if (header.alg !== 'RS256') return null; // Prevenção contra Algorithm Confusion
    const validProjects = [projectId, 'agoraeufalo-3463a', 'agoraeufalo'];
    const validIssuers = validProjects.map((p) => `https://securetoken.google.com/${p}`);
    if (!validIssuers.includes(payload.iss)) return null; 
    if (!validProjects.includes(payload.aud)) return null;
    if (!payload.sub || typeof payload.sub !== 'string') return null; // UID deve existir
    if (payload.auth_time && payload.auth_time > now) return null; // Emitido no futuro
    if (typeof payload.exp !== 'number' || payload.exp <= now) return null; // Token expirado (ou sem exp)

    // 2. Fetch das Chaves com Cache de Borda (In-Memory)
    if (!cachedJwks || now > jwksExpirationTime) {
      const jwkResponse = await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
      if (!jwkResponse.ok) return null;
      
      cachedJwks = await jwkResponse.json();
      
      // O Google envia o header cache-control, por segurança colocamos TTL de 1 hora
      jwksExpirationTime = now + 3600; 
    }

    const jwk = cachedJwks.keys.find((key) => key.kid === header.kid);
    if (!jwk) {
      // Se não achar a chave, forçamos a limpeza do cache para a próxima requisição
      cachedJwks = null; 
      return null;
    }

    // 3. Importação da Chave Pública
    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // 4. Tratamento Correto do Padding da Assinatura antes da Web Crypto API
    const encoder = new TextEncoder();
    const dataToVerify = encoder.encode(parts[0] + '.' + parts[1]);
    
    let signatureStr = parts[2].replace(/-/g, '+').replace(/_/g, '/');
    const sigPad = signatureStr.length % 4;
    if (sigPad) signatureStr += '='.repeat(4 - sigPad);
    
    const signatureBytes = Uint8Array.from(atob(signatureStr), c => c.charCodeAt(0));

    // 5. Verificação Criptográfica de Assinatura
    const isValid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      signatureBytes,
      dataToVerify
    );

    return isValid ? payload : null;

  } catch (error) {
    console.error("Erro interno ao verificar JWT:", error);
    return null;
  }
}

async function generateSignedUrl(url, expiresAt, secretKey) {
  const urlObj = new URL(url);
  urlObj.searchParams.set('Expires', expiresAt.toString());
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(urlObj.toString());

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

  urlObj.searchParams.set('X-Amz-Signature', signatureHex);
  return urlObj.toString();
}



// ============================================================================
// ENVIO DE E-MAIL TRANSACIONAL (Brevo) — endpoint protegido para o painel admin
// A chave fica APENAS como segredo do Worker: `wrangler secret put BREVO_API_KEY`
// ============================================================================
const MAIL_BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const MAIL_SENDER = { name: 'Leonardo Leite • AgoraEuFalo', email: 'contato@agoraeufalo.com.br' };
const MAIL_REPLY_TO = { name: 'Leonardo Leite • AgoraEuFalo', email: 'selexenglish@gmail.com' };
const MAIL_ALLOWED_ORIGINS = [
  'https://admin.agoraeufalo.com.br',
  'https://agoraeufalo.com.br',
  'https://app.agoraeufalo.com.br',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://localhost:8787',
  'null'
];
const MAIL_MAX_HTML_BYTES = 200 * 1024;

function mailAdminEmails(env) {
  const raw = (env && env.ADMIN_EMAILS) || 'selexenglish@gmail.com';
  return String(raw).split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
}

async function handleAdminSendEmail(request, env) {
  const origin = request.headers.get('Origin');
  const cors = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin'
  };
  if (origin && MAIL_ALLOWED_ORIGINS.includes(origin)) cors['Access-Control-Allow-Origin'] = origin;
  const reply = (obj, status) => new Response(JSON.stringify(obj), {
    status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors }
  });

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return reply({ error: 'Method Not Allowed' }, 405);
  if (origin && !MAIL_ALLOWED_ORIGINS.includes(origin)) return reply({ error: 'Origin not allowed' }, 403);

  // 1. Autenticação obrigatória (Firebase ID token válido, assinado e não expirado)
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return reply({ error: 'Authentication required' }, 401);
  const projectId = env.FIREBASE_PROJECT_ID || 'agoraeufalo-3463a';
  const jwt = await verifyFirebaseJWT(authHeader.slice(7), projectId);
  if (!jwt) return reply({ error: 'Invalid or expired token' }, 401);

  // 2. Autorização: somente admins (mesmo critério do firestore.rules)
  const email = String(jwt.email || '').toLowerCase();
  const isAdmin = (email && jwt.email_verified !== false && mailAdminEmails(env).includes(email))
    || jwt.admin === true || jwt.role === 'admin';
  if (!isAdmin) return reply({ error: 'Admin only' }, 403);

  // 3. Configuração do segredo
  if (!env.BREVO_API_KEY) return reply({ error: 'BREVO_API_KEY não configurada no Worker' }, 500);

  // 4. Validação do corpo (1 destinatário por chamada; remetente fixo no servidor)
  let body;
  try { body = await request.json(); } catch (e) { return reply({ error: 'Invalid JSON' }, 400); }
  const toEmail = String(body.toEmail || '').trim();
  const toName = String(body.toName || '').trim().slice(0, 120);
  const subject = String(body.subject || '').trim();
  const html = String(body.html || '');
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(toEmail) || toEmail.length > 254) return reply({ error: 'Invalid toEmail' }, 400);
  if (!subject || subject.length > 300) return reply({ error: 'Invalid subject' }, 400);
  if (!html || new TextEncoder().encode(html).length > MAIL_MAX_HTML_BYTES) return reply({ error: 'Invalid html' }, 400);

  // 5. Envio via Brevo
  let res;
  try {
    res = await fetch(MAIL_BREVO_URL, {
      method: 'POST',
      headers: { 'accept': 'application/json', 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: MAIL_SENDER,
        replyTo: MAIL_REPLY_TO,
        to: [{ email: toEmail, name: toName || toEmail.split('@')[0] }],
        subject,
        htmlContent: html
      })
    });
  } catch (e) {
    return reply({ error: 'Falha de rede ao contatar o Brevo' }, 502);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('[send-email] Brevo HTTP', res.status, JSON.stringify(data));
    return reply({ error: 'Brevo rejeitou o envio', brevoStatus: res.status, brevoMessage: data.message || null }, 502);
  }
  return reply({ success: true, messageId: data.messageId || null }, 200);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname;
    let path = url.pathname;

    // Normaliza rota sem trailing slash (exceto raiz)
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    // 0. SUBDOMÍNIO DE PODCAST (podcast.agoraeufalo.com.br)
    // ============================================================
    if (host === 'podcast.agoraeufalo.com.br' || host.endsWith('.workers.dev')) {
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      if (path === '/api/handshake' && request.method === 'POST') {
        try {
          const payload = await request.json();
          
          let policyStr = null;
          if (env.AEF_KV) {
             policyStr = await env.AEF_KV.get(`policy_${payload.courseId}_${payload.episodeId}`);
          }
          
          // Mock Policy if KV not bound yet (Para desenvolvimento)
          if (!policyStr) {
             policyStr = JSON.stringify({
                accessTier: 'free',
                entitlementsRequired: [],
                isPublicPodcastFeed: true
             });
          }

          const policy = JSON.parse(policyStr);
          const baseMediaUrl = `https://media.agoraeufalo.com.br/podcast/audio/${payload.episodeId}.mp3`;

          // BYPASS: Conteúdo Público
          if (policy.accessTier === 'free' || policy.isPublicPodcastFeed) {
            return new Response(JSON.stringify({
              allowed: true,
              mediaUrl: baseMediaUrl,
              byteRangeSupported: true,
              reason: 'TIER_BYPASS'
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // GATED: Requer JWT
          if (!payload.authToken || !payload.userId) {
            return new Response(JSON.stringify({ allowed: false, mediaUrl: '', byteRangeSupported: false, reason: 'ACCESS_DENIED' }), {
              status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const projectId = env.FIREBASE_PROJECT_ID || 'agoraeufalo';
          const decodedJwt = await verifyFirebaseJWT(payload.authToken, projectId);
          
          if (!decodedJwt || decodedJwt.sub !== payload.userId) {
            return new Response(JSON.stringify({ allowed: false, mediaUrl: '', byteRangeSupported: false, reason: 'ACCESS_DENIED' }), {
              status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
          
          const expirationWindow = 60 * 60 * 6; // 6 hours
          const expiresAt = Math.floor(Date.now() / 1000) + expirationWindow;
          const secretKey = env.HMAC_SECRET_KEY || 'default_secret_key_for_dev_only';
          const signedUrl = await generateSignedUrl(baseMediaUrl, expiresAt, secretKey);

          return new Response(JSON.stringify({
            allowed: true,
            mediaUrl: signedUrl,
            expiresAt: expiresAt,
            byteRangeSupported: true,
            reason: 'ENTITLEMENT_GRANTED'
          }), {
            status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });

        } catch (error) {
          return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        }
      }

      if (path === '/feed.xml' && request.method === 'GET') {
        let feedCache = null;
        if (env.AEF_KV) {
          feedCache = await env.AEF_KV.get("podcast_feed_xml");
        }
        if (feedCache) {
          return new Response(feedCache, {
            headers: {
              'Content-Type': 'application/xml; charset=utf-8',
              'Cache-Control': 'public, max-age=3600, s-maxage=86400',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
        return new Response("Feed not found", { status: 404 });
      }

    }



    // ============================================================
    // ROTAS DE ADMIN (Upload R2 e Sync RSS)
    // ============================================================
    if (path === '/api/admin/send-email') {
      return handleAdminSendEmail(request, env);
    }

    if (path.startsWith('/api/admin/')) {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-File-Name, X-Content-Type, X-Folder'
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Validação de Segurança (JWT opcional para ferramentas internas, mas validado se enviado)
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
        const projectId = env.FIREBASE_PROJECT_ID || 'agoraeufalo-3463a';
        const decodedJwt = await verifyFirebaseJWT(token, projectId);
        if (!decodedJwt) {
          return new Response(JSON.stringify({ error: 'Invalid Token' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      // 0. Upload Unificado para Cloudflare R2 (aef-course-content -> assets.agoraeufalo.com.br)
      if (path === '/api/admin/upload-asset' && (request.method === 'PUT' || request.method === 'POST')) {
        try {
          const rawFileName = request.headers.get('X-File-Name');
          const folder = (request.headers.get('X-Folder') || 'uploads').replace(/^\/+|\/+$/g, '');
          const contentType = request.headers.get('X-Content-Type') || request.headers.get('Content-Type') || 'application/octet-stream';

          if (!rawFileName) {
            throw new Error("Missing X-File-Name header");
          }

          let fullKey = rawFileName.replace(/^\/+/, '');
          if (!fullKey.includes('/') && folder) {
            fullKey = `${folder}/${fullKey}`;
          }

          const targetBucket = env.AEF_COURSE_CONTENT || env.AEF_MEDIA;
          if (!targetBucket) {
            throw new Error("Missing R2 binding AEF_COURSE_CONTENT");
          }

          await targetBucket.put(fullKey, request.body, {
            httpMetadata: {
              contentType: contentType,
              cacheControl: 'public, max-age=31536000'
            }
          });

          const publicUrl = `https://assets.agoraeufalo.com.br/${fullKey}`;

          return new Response(JSON.stringify({
            success: true,
            url: publicUrl,
            key: fullKey,
            contentType: contentType
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // 1. Upload Direto para R2 Legado (AEF_MEDIA -> media.agoraeufalo.com.br)
      if (path === '/api/admin/upload' && request.method === 'PUT') {
        try {
          const fileName = request.headers.get('X-File-Name');
          const contentType = request.headers.get('X-Content-Type') || 'application/octet-stream';
          
          if (!fileName || !env.AEF_MEDIA) {
             throw new Error("Missing filename or R2 binding");
          }

          // Salva no R2
          await env.AEF_MEDIA.put(fileName, request.body, {
             httpMetadata: { contentType: contentType }
          });

          const publicUrl = `https://media.agoraeufalo.com.br/${fileName}`;

          return new Response(JSON.stringify({ success: true, url: publicUrl }), {
            status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      // 2. Gravação do arquivo RSS XML no R2
      if (path === '/api/admin/publish-rss' && request.method === 'POST') {
         try {
           const body = await request.text(); // O front envia o XML em texto puro
           if (!env.AEF_MEDIA) throw new Error("R2 Binding not found");

           await env.AEF_MEDIA.put('podcast/feed.xml', body, {
             httpMetadata: { contentType: 'application/rss+xml', cacheControl: 'public, max-age=3600' }
           });

           return new Response(JSON.stringify({ success: true, message: 'RSS Feed atualizado no R2' }), {
              status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
           });
         } catch (err) {
           return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
         }
      }
      
      return new Response("Not Found", { status: 404, headers: corsHeaders });
    }

    // Roteamento nativo para Edge API (/api/*), Storage (/storage/*) e Webhook Hotmart (/webhook)
    if (path.startsWith('/api/') || path.startsWith('/storage/') || path === '/webhook') {
      return edgeApiWorker.fetch(request, env, ctx);
    }

    // Proteção LGPD & Segurança: Bloqueio estrito a /data/, storage_staging/, arquivos .env, .csv ou .deprecated
    if (
      path.startsWith('/data/') ||
      path.startsWith('/storage_staging/') ||
      path.includes('.env') ||
      path.endsWith('.csv') ||
      path.includes('.deprecated')
    ) {
      return new Response('Not Found', { status: 404 });
    }

    // Normalização para favicon.ico (evita 404 em navegadores e ferramentas de auditoria)
    if (path === '/favicon.ico') {
      url.pathname = '/assets/images/favicon.png';
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    // Normalização defensiva para assets estáticos aninhados em subrotas (ex: /alunos/assets/* -> /assets/*)
    if (path.includes('/assets/')) {
      const cleanAssetPath = path.substring(path.indexOf('/assets/'));
      url.pathname = cleanAssetPath;
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    // Se for arquivo estático com extensão (.css, .js, .png, .jpg, .svg, .ico, .mp3, .pdf, .json, etc)
    if (path.includes('.') && !path.endsWith('.html')) {
      return env.ASSETS.fetch(request);
    }


    // ============================================================
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
        '/landing-pages': '/admin-landing-pages.html',
        '/webhooks': '/admin-webhooks.html',
        '/marketing': '/admin-marketing.html',
        '/pdf-factory': '/admin-pdf-factory.html',
        '/pdf-factory-v2': '/v2-factory/index.html',
        '/tts': '/tts-studio.html',
        '/youtube-lab': '/admin-youtube-lab.html',
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
        '/player.html': '/player',
        '/treino/player': '/player',
        '/sala-lab.html': '/sala-lab',
        '/player-lab.html': '/player-lab'
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
        '/player': '/player.html',
        '/portal-lab': '/portal-lab.html',
        '/sala-lab': '/sala-lab.html',
        '/player-lab': '/player-lab.html',
        '/youtube-lab': '/youtube-lab.html',
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
      const isWorkersDev = host.endsWith('.workers.dev');

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
        '/player.html': '/player',
        '/treino/player.html': '/player',
        '/login': '/login',
        '/login.html': '/login',
        '/cadastro': '/cadastro',
        '/cadastro.html': '/cadastro',
        '/portal-lab': '/portal-lab',
        '/portal-lab.html': '/portal-lab',
        '/sala-lab': '/sala-lab',
        '/sala-lab.html': '/sala-lab',
        '/player-lab': '/player-lab',
        '/player-lab.html': '/player-lab',
        '/youtube-lab.html': '/youtube-lab',
        '/migracao': '/migracao',
        '/migracao/index.html': '/migracao'
      };

      if (!isWorkersDev && appCrossDomainMap[path]) {
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
        '/admin-vendas': '/vendas',
        '/admin-vendas.html': '/vendas',
        '/landing-pages': '/landing-pages',
        '/admin-landing-pages': '/landing-pages',
        '/admin-landing-pages.html': '/landing-pages',
        '/webhooks': '/webhooks',
        '/admin-webhooks': '/webhooks',
        '/admin-webhooks.html': '/webhooks',
        '/marketing': '/marketing',
        '/admin-marketing': '/marketing',
        '/admin-marketing.html': '/marketing',
        '/pdf-factory': '/pdf-factory',
        '/pdf-factory-v2': '/pdf-factory-v2',
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

      if (!isWorkersDev && adminCrossDomainMap[path]) {
        const dest = `https://admin.agoraeufalo.com.br${adminCrossDomainMap[path]}${url.search}`;
        return Response.redirect(dest, 302);
      }

      const publicLegacyRedirects = {
        '/index.html': '/',
        '/index': '/',
        '/projeto-aef.html': '/projeto-aef',
        '/precos.html': '/precos',
        '/cursos.html': '/cursos',
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
        '/aefclub': '/aefclub.html',
        '/vendas': '/vendas.html',
        '/vendas.html': '/vendas.html',
        '/oferta': '/oferta.html',
        '/cursos': '/cursos.html',
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
