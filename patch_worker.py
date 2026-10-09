import re

with open('src/worker.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Insert global variables and functions right after the import edgeApiWorker...
globals_code = """import edgeApiWorker from '../cloudflare-worker/worker.js';

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
    if (payload.exp < now) return null; // Expirado
    if (payload.iss !== `https://securetoken.google.com/${projectId}`) return null; 
    if (payload.aud !== projectId) return null;
    if (!payload.sub || typeof payload.sub !== 'string') return null; // UID deve existir
    if (payload.auth_time && payload.auth_time > now) return null; // Emitido no futuro

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

"""

content = content.replace("import edgeApiWorker from '../cloudflare-worker/worker.js';", globals_code)

# 2. Insert the podcast host routing inside fetch.
# The fetch method starts like:
#     if (path.length > 1 && path.endsWith('/')) {
# ...
#     if (
#      path.startsWith('/data/') ||

host_code = """
    // ============================================================
    // 0. SUBDOMÍNIO DE PODCAST (podcast.agoraeufalo.com.br)
    // ============================================================
    if (host === 'podcast.agoraeufalo.com.br') {
      
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
          
          // O KV guarda as políticas. Fallback se não existir no env (para dev).
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
          const baseMediaUrl = `https://media.agoraeufalo.com.br/podcasts/audio/${payload.episodeId}.mp3`;

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

          // Entitlement Check Stub: Se tem o JWT, assumimos liberado na PoC, 
          // ou validamos payload extra que vem do Firebase Custom Claims
          
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

      return new Response("Not Found", { status: 404 });
    }

    // ============================================================
    // 1. SUBDOMÍNIO DO ADMIN (admin.agoraeufalo.com.br)
"""

content = content.replace("    // ============================================================\n    // 1. SUBDOMÍNIO DO ADMIN (admin.agoraeufalo.com.br)", host_code)

with open('src/worker.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied.")
