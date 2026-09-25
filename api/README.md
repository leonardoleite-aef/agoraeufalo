# API Endpoints (Descomissionado)

O endpoint legado `api/webhook-hotmart.js` foi arquivado com sucesso durante a Fase 3 da consolidação arquitetural.

A **única fonte da verdade** (Single Source of Truth) para webhooks da Hotmart em produção é o Cloudflare Worker de borda:
- Código fonte: `cloudflare-worker/worker.js`
- Endpoint ativo: `https://agoraeufalo-webhook-hotmart.selexenglish.workers.dev`
