# 🚨 HANDOVER URGENTE — Bug: Todos os Alunos Aparecem como "ADMIN MESTRE" no CRM

**Arquivo principal afetado:** `assets/js/aef-access-engine.js`
**Página afetada:** `admin-alunos.html` (CRM em admin.agoraeufalo.com.br/admin-alunos.html)
**Status:** Deploy feito em commit `989899a`, bug persiste em produção.

---

## 1. Contexto: O que foi feito antes do bug

3.869 alunos legados foram importados no Firestore (`users/` collection) com estes campos:
- `role: "student"`, `tier: "free"`, `categories: ["member_free"]`
- `legacyCategoria: "magic_stories_legacy"` OU `"agoraeufalo_primeiro_legado"`
- `enrolledProducts: ["ms-legacy"]` OU `["first-steps"]`
- `source: "bulk_import_legacy_2026"`

---

## 2. O Bug e a Causa Raiz Exata

A função `renderCategoryBadges(user)` em `aef-access-engine.js` chama `isAdmin(user)`.

A minha versão corrigida de `isAdmin` (commit 989899a) é:
```javascript
function isAdmin(user) {
  if (user) {  // ← PROBLEMA ESTÁ AQUI
    return user.role === ROLES.ADMIN || user.role === 'admin' || ...
  }
  // session-level check only when no user passed
}
```

**O problema**: `isAdmin` é exportado para `window.AEFAccessEngine.isAdmin`. O `aef-portal-auth.js` tem uma função `isAdmin()` própria (sem parâmetro) que usa `window.aefPortalAuth.isAdmin`. Esses dois `isAdmin` diferentes coexistem e se o CRM usa `AE.isAdmin` onde `AE = window.AEFAccessEngine`, deveria estar correto.

**A hipótese mais provável do bug em massa**: O `normalizeUserSafe` em `aef-cloud-sync.js` tenta chamar `window.AEFAccessEngine.normalizeUser(user)`, mas pode estar retornando os docs sem normalizar se `AEFAccessEngine` não estiver carregado no momento. Nesse caso o objeto cru do Firestore (sem `legacyEntitlements`) é passado para `renderCategoryBadges`. O `resolveUserCategories` recebe um doc com `categories: ["member_free"]` e `legacyEntitlements: undefined` → merged = `["member_free"]` → não é admin.

**A hipótese alternativa mais provável** (mais simples): O cache de dados do `ALL_STUDENTS_LIST` ainda tem dados velhos da sessão anterior quando o Prof. Leo tinha `role: "admin"` propagando para todos via o merge de `existing.categories`. Limpar o cache via F5 + Shift pode resolver, mas o código precisa ser corrigido para não propagar categorias do usuário anterior.

---

## 3. Diagnóstico Definitivo — O que Fazer Primeiro

Abrir o CRM em admin.agoraeufalo.com.br/admin-alunos.html com DevTools aberto e colar no Console:

```javascript
// Pega o primeiro aluno da lista
const s = ALL_STUDENTS_LIST[0];
console.log("email:", s.email);
console.log("role:", s.role);
console.log("tier:", s.tier);
console.log("categories:", s.categories);
console.log("legacyEntitlements:", s.legacyEntitlements);
console.log("isAdmin result:", window.AEFAccessEngine.isAdmin(s));
```

Se `isAdmin(s)` retornar `true` para um aluno com `role: "student"`, o bug está no `isAdmin`.
Se as `categories` do aluno incluírem `"admin"`, o bug está no merge de categorias no CRM (linhas 992-994 de `admin-alunos.html`).

---

## 4. Fix Cirúrgico — Garantido

### Fix A: `aef-access-engine.js` — `renderCategoryBadges`
Substituir a chamada `isAdmin(user)` por verificação direta no objeto:

```javascript
function renderCategoryBadges(user) {
  const cats = resolveUserCategories(user);
  const badges = [];

  // CORREÇÃO: verificar diretamente no objeto do aluno, NUNCA pela sessão
  const userIsAdmin = !!(
    user?.role === 'admin' ||
    user?.tier === 'admin_master' ||
    (Array.isArray(user?.categories) && user.categories.includes('admin')) ||
    (user?.email || '').toLowerCase().trim() === 'selexenglish@gmail.com'
  );

  if (userIsAdmin) {
    badges.push(makeBadge("purple", "🔐", "ADMIN MESTRE"));
  }
  // ... resto igual
```

### Fix B: `aef-access-engine.js` — `computeCategoryCounts`
Mesma correção na linha 607:
```javascript
// ANTES (bugado quando sessão é admin):
if (isAdmin(s)) counts.admin++;

// DEPOIS (correto):
if (s.role === 'admin' || s.tier === 'admin_master' ||
    (Array.isArray(s.categories) && s.categories.includes('admin')) ||
    (s.email || '').toLowerCase() === 'selexenglish@gmail.com') {
  counts.admin++;
}
```

### Fix C: `aef-access-engine.js` — `getPrimaryBadgeLabel`
Mesma correção na linha 579:
```javascript
// ANTES:
if (isAdmin(user)) return "👑 Administrador";

// DEPOIS:
const userIsAdmin = user?.role === 'admin' || user?.tier === 'admin_master' ||
  (user?.email||'').toLowerCase() === 'selexenglish@gmail.com';
if (userIsAdmin) return "👑 Administrador";
```

---

## 5. Fix da contagem de Legado 1 (923) e Legado 2 (2.946)

Os alunos importados têm `categories: ["member_free"]` e `legacyCategoria: "magic_stories_legacy"` mas NÃO têm `legacyEntitlements: ["member_free", "legado_1"]` — esse campo só é calculado pelo `normalizeUser`, não está persistido no Firestore.

O `resolveUserCategories` agora faz merge de `categories + legacyEntitlements`, mas `legacyEntitlements` só existe APÓS a normalização. A normalização em `aef-cloud-sync.js` (linha 985) usa `normalizeUserSafe` que chama `AEFAccessEngine.normalizeUser`. SE a normalização rodar corretamente, o `u.legacyEntitlements` retornado conterá `"legado_1"` ou `"legado_2"` e o merge no CRM (linhas 992-994) os propagará para `mergedCats`.

**Confirmar no Console que o normalizeUser está rodando:**
```javascript
const AE = window.AEFAccessEngine;
const testDoc = { email: "test@example.com", tier: "free", role: "student",
  categories: ["member_free"], legacyCategoria: "magic_stories_legacy",
  enrolledProducts: ["ms-legacy"] };
const normalized = AE.normalizeUser(testDoc);
console.log(normalized.categories); // deve incluir "legado_1"
console.log(normalized.legacyEntitlements); // deve incluir "legado_1"
```

---

## 6. Sequência de Deploy

Após aplicar os fixes:
```bash
cd /Users/macbookpro/Desktop/agoraeufalo_site
npm run build
git add assets/js/aef-access-engine.js
git commit -m "fix(crm): direct per-user admin check in badges/counts, no session bleed"
git push origin main
```

---

## 7. Estado Atual do Sistema

- **Firestore `users/`**: 3.888 docs (19 reais + 3.869 legados importados) ✅
- **Firestore rules**: deploy OK, `isAdmin()` nas rules usa server-side check ✅
- **Worker Cloudflare**: `https://agoraeufalo.selexenglish.workers.dev` — deploy OK ✅
- **Site público**: build OK, `git main` em `989899a` ✅
- **CRM admin-alunos.html**: bug visual de "ADMIN MESTRE" em todos ❌ (fix acima)
- **Contagem Legado 1/2**: provavelmente correto após fix do `isAdmin` (que ocultava outros badges) ❓

---

## 8. Script de Verificação Pós-Deploy

```bash
node scripts/check_pending_webhooks.js
```
Para contar alunos por categoria direto no Firestore:
```bash
ACCESS_TOKEN=$(python3 -c "import json,os; d=json.load(open(os.path.expanduser('~/.config/configstore/firebase-tools.json'))); print(d.get('tokens',{}).get('access_token',''))")
# Count legado_1 (magic_stories_legacy):
curl -s "https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents:runAggregationQuery" \
  -H "Authorization: Bearer $ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"structuredAggregationQuery":{"aggregations":[{"count":{},"alias":"n"}],"structuredQuery":{"from":[{"collectionId":"users"}],"where":{"fieldFilter":{"field":{"fieldPath":"legacyCategoria"},"op":"EQUAL","value":{"stringValue":"magic_stories_legacy"}}}}}}' \
  | python3 -c "import json,sys; print('MS-Legacy:', json.load(sys.stdin)[0]['result']['aggregateFields']['n']['integerValue'])"
```
