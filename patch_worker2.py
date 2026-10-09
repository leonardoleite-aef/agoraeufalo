import re

with open('src/worker.js', 'r', encoding='utf-8') as f:
    content = f.read()

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
    // 1. SUBDOMÍNIO ADMIN (admin.agoraeufalo.com.br)
"""

content = content.replace("    // ============================================================\n    // 1. SUBDOMÍNIO ADMIN (admin.agoraeufalo.com.br)", host_code)

with open('src/worker.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch 2 applied.")
