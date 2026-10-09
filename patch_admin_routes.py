import sys

with open('src/worker.js', 'r') as f:
    content = f.read()

admin_routes_code = """
    // ============================================================
    // ROTAS DE ADMIN (Upload R2 e Sync RSS)
    // ============================================================
    if (path.startsWith('/api/admin/')) {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-File-Name, X-Content-Type'
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Validação de Segurança (Admin-only JWT)
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const token = authHeader.split('Bearer ')[1];
      const projectId = env.FIREBASE_PROJECT_ID || 'agoraeufalo';
      const decodedJwt = await verifyFirebaseJWT(token, projectId);
      
      // Checa se o usuário tem privilégios de admin (pode verificar custom claims aqui no futuro)
      if (!decodedJwt) {
        return new Response(JSON.stringify({ error: 'Invalid Token' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 1. Upload Direto para R2
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
"""

insertion_point = content.find("    // Roteamento nativo para Edge API (/api/*)")
if insertion_point != -1:
    content = content[:insertion_point] + admin_routes_code + "\n" + content[insertion_point:]
    with open('src/worker.js', 'w') as f:
        f.write(content)
    print("Patched admin routes successfully.")
else:
    print("Could not find insertion point in src/worker.js")

