# YouTube Lab — Especificação de Execução v2 (aprovada pelo Leo)

**Executor:** Gemini (Antigravity)
**Revisão:** parecer arquitetural v2, com todas as premissas conferidas contra o código em 2026-10-08
**Status:** ✅ GO, com as decisões abaixo

| Decisão do Leo | Valor |
|---|---|
| D1. Materiais (PDF/MP3) | **Cadastro gratuito de verdade é obrigatório.** Gate validado no servidor pelo Firestore, não só pela interface. |
| D2. Regras do Firestore | **Bloco `youtube_archive` autorizado** para deploy em produção (curadoria permanente de vídeos). |
| Escopo | Nenhuma página oficial é alterada. Tudo em arquivos `-lab` / novos. Exceção autorizada: `firestore.rules`. |

---

## 0. Leia antes de codar: 4 fatos do código que mudam a implementação

### F1 — O cadastro da home NÃO cria conta. Ele grava só no localStorage.
[index.html#L1777-L1786](file:///Users/macbookpro/Desktop/agoraeufalo_site/index.html#L1777-L1786): `handleOnboardingSubmit()` faz apenas `localStorage.setItem('aef_user_email', ...)`. Não chama Firebase Auth.
**Consequência para D1:** esse "aluno" não tem `request.auth`. A regra `isAuthenticated()` vai **negar** a leitura dos materiais. **O formulário atual não serve para o gate do YouTube Lab.**
**Solução:** usar as APIs reais que já existem em [aef-portal-auth.js](file:///Users/macbookpro/Desktop/agoraeufalo_site/assets/js/aef-portal-auth.js):
- `sendMagicLink(email, customRedirectUrl)` (L435): sem senha e com baixa fricção. **Método primário.**
- `signInWithGoogle()` (L359): 1 clique. **Método secundário.**
- `checkAndCompleteMagicLink()` (L448): chamar no load da página de retorno.

### F2 — `requireAuth()` considera logado quem tem só cache no localStorage
[aef-portal-auth.js#L711-L733](file:///Users/macbookpro/Desktop/agoraeufalo_site/assets/js/aef-portal-auth.js#L711-L733) monta `currentUser` a partir de `localStorage.aef_user_email`, sem sessão Firebase.
**Regra para o YouTube Lab:** a decisão de mostrar ou buscar os materiais usa **somente** `firebase.auth().currentUser`, obtido **depois** do primeiro `onAuthStateChanged`. Nunca usar `aef_user_email`, `requireAuth()` ou `getCurrentProfile()` para isso. Se o cache diz "logado" mas o Firebase diz `null`, o estado é **deslogado** e o gate de cadastro aparece.

### F3 — Em localhost todo mundo é admin
[sala-de-aula.html#L802-L831](file:///Users/macbookpro/Desktop/agoraeufalo_site/sala-de-aula.html#L802-L831) e `requireAuth` (L712) devolvem admin/true em `localhost`/`file:`. **O paywall não pode ser testado localmente.** Os testes de aceite de paywall rodam na **URL publicada** (Cloudflare). Na sala-lab, adicionar um override **só de teste**: `?simulate=free` força `userProfile = { tier:'free', enrolledProducts:[] }`, mesmo em localhost.

### F4 — Os botões de checkout que eu coloquei no `index-lab.html` estão quebrados e os preços são inventados
Erro meu, da sessão anterior:
- Eles chamam `window.aefCheckoutModal?.openCheckoutModal('plan_monthly')`. A instância **não tem** esse método. A API real é `window.aefCheckoutModal.open(url)` ou `window.openCheckoutModal(url)`, e recebe **URL**, não ID ([aef-checkout-modal.js#L145](file:///Users/macbookpro/Desktop/agoraeufalo_site/assets/js/aef-checkout-modal.js#L145), L249-L255). Hoje o clique gera `TypeError`.
- Os IDs `plan_monthly`, `plan_annual`, `plan_lifetime`, `prod_quickstart`, `prod_pronuncia` e `prod_bundle` **não existem**. Os IDs reais estão em [aef-offers-registry.js](file:///Users/macbookpro/Desktop/agoraeufalo_site/assets/js/aef-offers-registry.js): `ms-club-mensal`, `ms-club-anual`, `all-access-lifetime`, `eqs-completo`, `frases-prontas-vitalicio`.
- Os preços (R$ 67, 12x R$ 47, R$ 497, R$ 997, R$ 97, R$ 147, R$ 167) **foram inventados**. Isso viola a regra de Zero Alucinação. Precisam ser lidos de `offer.pricing` no registro.
- O "Masterclass de Pronúncia" e o "Bundle Aceleração" **não existem** como produtos. Remover ou trocar por ofertas reais.
→ Corrigido na **Fase 5**.

---

## 1. Modelo de dados

### 1.1 Documento público: `youtube_archive/{videoId}`
Legível por qualquer pessoa. **Nunca** contém URL de material.
```json
{
  "videoId": "puJ2EskHXj4",
  "title": "Connected Speech: pare de falar palavra por palavra",
  "description": "Texto curado pelo Leo (manual na Fase 1).",
  "thumbnailUrl": "https://i.ytimg.com/vi/puJ2EskHXj4/maxresdefault.jpg",
  "publishedAt": "2026-10-01T12:00:00Z",
  "status": "active",                 // active | draft
  "featuredOnHome": true,
  "homeOrder": 1,                     // ordem na vitrine (1..3)
  "tags": ["pronuncia", "connected-speech"],
  "materialsAvailable": { "pdf": true, "audio": false },   // só flags para a interface (badges)
  "referenceClass": {                 // null quando não há vínculo
    "courseId": "ms-legacy",
    "moduleId": "ms-m1",
    "lessonId": "ms012",
    "ctaLabel": "Treinar a Magic Story 012 completa"   // opcional; default gerado
  },
  "createdAt": "...", "updatedAt": "..."
}
```
**Regras do schema:**
- `referenceClass` guarda **só IDs**. A URL é montada na hora de renderizar (ver §4.3). Nunca gravar URL.
- `thumbnailUrl`: tentar `maxresdefault.jpg`. Se a imagem carregada tiver `naturalWidth <= 120`, cair para `hqdefault.jpg` (vídeos sem maxres devolvem um placeholder de 120×90).

### 1.2 Documento protegido: `youtube_archive/{videoId}/gated/materials`
Legível **só com sessão Firebase válida**.
```json
{
  "pdfUrl": "https://assets.agoraeufalo.com.br/youtube-lab/puJ2EskHXj4/material.pdf",
  "pdfLabel": "Apostila da aula (PDF)",
  "audioUrl": "",
  "audioLabel": "",
  "updatedAt": "..."
}
```

### 1.3 Limitação aceita (Fase 1)
Os arquivos ficam no R2 público (`assets.agoraeufalo.com.br`). O gate protege a **descoberta** da URL, não o arquivo em si. Quem já tem a URL consegue compartilhá-la. Para um lead magnet isso é aceitável. Blindagem total (URL assinada via Worker) fica para a Fase 2 e está fora deste escopo.

---

## 2. Fase 1: Firestore Rules (deploy autorizado)

Inserir **antes** do bloco `7. POLÍTICA PADRÃO ZERO TRUST` em [firestore.rules](file:///Users/macbookpro/Desktop/agoraeufalo_site/firestore.rules#L155):

```javascript
    // ========================================================================
    // 9. YOUTUBE LAB (Curadoria de Vídeos + Materiais com Cadastro)
    // Doc raiz: leitura pública (vitrine, SEO, página de consumo).
    // gated/*: leitura exclusiva de usuários com sessão Firebase válida.
    // Escrita: exclusiva do Administrador Mestre.
    // ========================================================================
    match /youtube_archive/{videoId} {
      allow read: if true;
      allow write: if isAdmin();

      match /gated/{docId} {
        allow read: if isAuthenticated();
        allow write: if isAdmin();
      }
    }
```

**Execução:**
1. `firebase deploy --only firestore:rules` (o [firebase.json](file:///Users/macbookpro/Desktop/agoraeufalo_site/firebase.json) já aponta para `firestore.rules`).
2. **Validar antes do deploy:** usar a ferramenta MCP `firebase_validate_security_rules`.
3. **Teste pós-deploy (obrigatório, colar a saída no relatório):**
   - `GET .../documents/youtube_archive` sem token → `200`
   - `GET .../documents/youtube_archive/{id}/gated/materials` sem token → `403 PERMISSION_DENIED`
4. Nenhuma outra linha de `firestore.rules` pode mudar. Mostrar o `git diff firestore.rules` no relatório: precisa ser puramente aditivo.

---

## 3. Fase 2: Admin `admin-youtube-lab.html` (novo)

**Convenção:** página na raiz com prefixo `admin-` (como `admin-cursos.html`). **Não** criar pasta `admin/`.
**Base:** copiar o `<head>` e a stack de scripts de [admin-cursos.html#L10-L54](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-cursos.html#L10-L54) (Tailwind, `aef-courses-registry.js`, `aef-cloud-sync.js`, `aef-access-engine.js`, `aef-portal-auth.js`, `aef-admin-nav.js`), mantendo o mesmo guard de admin dessa página.

### 3.1 Funções
| # | Função | Implementação |
|---|---|---|
| A1 | Colar a URL do YouTube | Extrair o ID de `youtube.com/watch?v=`, `youtu.be/`, `/shorts/` e `/embed/`. **Respeitar maiúsculas e minúsculas** (regra AGENTS: `O` ≠ `0`). Regex: `/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/` |
| A2 | Buscar o título | `fetch('https://www.youtube.com/oembed?url=' + encodeURIComponent(url) + '&format=json')`. Se der erro de CORS: campo manual + aviso. **Não** criar rota nova no Worker nesta entrega. |
| A3 | Thumbnail | Preview com o fallback maxres→hq do §1.1 |
| A4 | Descrição | **Manual** (o oEmbed não traz descrição; a Data API exigiria chave e está fora do escopo) |
| A5 | Upload de PDF/MP3 | `window.aefCloudSync.uploadFileToStorage(file, 'youtube-lab/' + videoId, onProgress)`, que já existe em [aef-cloud-sync.js#L1808](file:///Users/macbookpro/Desktop/agoraeufalo_site/assets/js/aef-cloud-sync.js#L1808) e envia para o R2 via `/api/admin/upload-asset`. Alternativa: colar uma URL. |
| A6 | Vínculo com aula | **Três dropdowns em cascata, sem texto livre:** Curso → Módulo → Aula, preenchidos por `window.AEF_COURSES_REGISTRY` (`course.modules[].lessons[]`). Ao salvar, validar que o trio existe; se não existir, bloquear o salvamento. Motivo: [sala-de-aula.html#L882](file:///Users/macbookpro/Desktop/agoraeufalo_site/sala-de-aula.html#L882-L884) abre o primeiro curso, sem avisar, quando o ID é inválido. |
| A7 | Vitrine | Toggle `featuredOnHome` + `homeOrder` (1-3). Avisar se houver mais de 3 vídeos em destaque. |
| A8 | Salvar | **Duas escritas:** doc público (`set merge`) + `gated/materials` (`set merge`). `materialsAvailable` é derivado de `!!pdfUrl` / `!!audioUrl`. |
| A9 | Listagem | Tabela: thumb, título, status, ⭐ destaque, 🔗 vínculo (curso/aula), 📄/🎧. Ações: editar, ativar/rascunho, excluir (apaga também `gated/materials`). |

### 3.2 Visual
Admin segue o padrão das outras `admin-*.html`. A regra de "nenhuma caixa escura" vale para conteúdo didático, não para o admin.

---

## 4. Fase 3: Página do aluno `youtube-lab.html` (nova)

### 4.1 Dois modos (pelo parâmetro de URL)
| URL | Modo |
|---|---|
| `youtube-lab.html` | **Biblioteca:** grid de todos os vídeos `status=='active'`, ordenados por `publishedAt desc`, com filtro por tag |
| `youtube-lab.html?v={videoId}` | **Aula:** layout do mockup aprovado |

### 4.2 Layout do modo Aula (mockup aprovado)
- **Palco** (`bg-[#0A192F]`): iframe 16:9 com **fachada leve** (thumbnail + play; o iframe carrega no clique), igual ao padrão `playPostVideo` do blog. Usar `youtube-nocookie.com/embed/{id}?rel=0`.
- **Base** (`bg-[#FAF8F5]`), grid 70/30:
  - Título em `text-slate-900 font-black`, 24-30px.
  - **Box de Materiais** (`bg-amber-50/80 border-2 border-amber-200`), com 3 estados (§4.4).
  - **Botão Ponte** (gradiente âmbar), só se `referenceClass != null` (§4.3).
  - Descrição em **16-17px, `leading-relaxed`** (Conforto 40+).
  - Sidebar "Mais do YouTube Lab": até 6 vídeos ativos, sem o atual.
- **Proibido:** caixa escura em qualquer bloco de conteúdo abaixo do palco.

### 4.3 Botão Ponte (cross-link)
```js
function buildLessonUrl(ref, videoId) {
  const p = new URLSearchParams({ curso: ref.courseId, modulo: ref.moduleId, aula: ref.lessonId,
                                  src: 'youtube-lab', v: videoId });
  return `${SALA_PATH}?${p}`;   // SALA_PATH = 'sala-de-aula-lab.html' no sandbox; 'sala-de-aula.html' no go-live
}
```
- `SALA_PATH` deve ser **uma constante no topo do script**, para o go-live trocar uma linha só.
- Rótulo: `ref.ctaLabel || 'Treinar esta aula completa na plataforma'`.
- **O YouTube Lab não decide acesso.** Nenhuma chamada a `AEFAccessEngine` nesta página. A decisão é 100% da sala.

### 4.4 Box de Materiais: máquina de estados (D1)
```
init → aguardar o 1º firebase.auth().onAuthStateChanged
  ├─ user == null           → ESTADO "BLOQUEADO"
  └─ user != null           → get youtube_archive/{v}/gated/materials
        ├─ ok               → ESTADO "LIBERADO"  (botões de download)
        └─ permission-denied→ ESTADO "BLOQUEADO" (sessão inválida/expirada)
```
- **BLOQUEADO:** mostra os badges (`materialsAvailable`) com cadeado + CTA *"Crie sua conta gratuita para baixar a apostila"* → abre o **Modal de Cadastro (§4.5)**.
- **LIBERADO:** botões `[📄 pdfLabel]` / `[🎧 audioLabel]` com `download` + `target=_blank`.
- Se `materialsAvailable` estiver todo `false`: esconder o box.
- **Proibido** decidir o estado por localStorage (F2).

### 4.5 Modal de Cadastro (gate real)
- **Primário:** campo de e-mail → `aefPortalAuth.sendMagicLink(email, location.origin + '/youtube-lab.html?v=' + videoId)` → tela *"Enviamos um link para {email}. Abra no mesmo aparelho."*
- **Secundário:** `[Continuar com Google]` → `aefPortalAuth.signInWithGoogle()` → ao resolver, reavaliar o §4.4 sem recarregar.
- No load de `youtube-lab.html`: chamar `aefPortalAuth.checkAndCompleteMagicLink()` **antes** do §4.4.
- Copy: tom do Leo, direto, sem promessas. Ex.: *"É grátis e leva 10 segundos. Você ganha acesso a todo o material do YouTube Lab e às aulas abertas da plataforma."*

### 4.6 SEO e higiene
- `<meta name="robots" content="noindex">` **enquanto estiver no sandbox** (remover no go-live).
- Não incluir no `sitemap.xml` nesta entrega.
- No modo Aula, atualizar `document.title` e `og:*` via JS.
- Roadmap (fora do escopo): páginas estáticas por vídeo com `VideoObject` JSON-LD.

---

## 5. Fase 4: Sala de aula sandbox `sala-de-aula-lab.html` (cópia)

`cp sala-de-aula.html sala-de-aula-lab.html`. **O original não é tocado.**

### M1 — Trocar o beco sem saída por paywall de conversão
[L892-L905](file:///Users/macbookpro/Desktop/agoraeufalo_site/sala-de-aula.html#L892-L905): hoje mostra "Acesso Restrito → Voltar ao Portal" e faz `return`.
**Nova lógica:**
1. Se o curso tem conteúdo aberto (`accessTier==='free'`, `freeModuleIds` não vazio, algum `module.isFreeTier`, ou se é a 1ª aula do curso, que é demo segundo a L1479) → **não bloquear o curso**. Seguir para o `initClassroom`; o gate por aula (L1487) decide.
2. Senão → renderizar `renderConversionPaywall(course, src)` no lugar do card "Acesso Restrito".

### M2 — Paywall por aula sem link fixo
[L1506](file:///Users/macbookpro/Desktop/agoraeufalo_site/sala-de-aula.html#L1506): trocar o `href` fixo da Hotmart por `renderConversionPaywall(activeCourse, src)`.

### `renderConversionPaywall(course, src)`, usado por M1 e M2
```js
await window.aefOffersRegistry.init();
const R = window.aefOffersRegistry;
const productOffer = R.getOfferByProductId(course.id);              // ex.: english-quickstart → eqs-completo
const clubOffer    = R.getOfferById('ms-club-anual');               // all_access → Club
const source = src || 'sala_paywall';
// CTA primário: Club (cobre todos os cursos all_access)
// CTA secundário: oferta do produto, SE existir e for diferente do Club
// URL: R.generateTrackingUrl(offer, source, course.id)  → window.aefCheckoutModal.open(url)
```
- Preço exibido = `offer.pricing` (**nunca valor fixo no código**).
- Se `src==='youtube-lab'` e houver `v`: mostrar o link `← Voltar ao vídeo` para `youtube-lab.html?v={v}`.
- Visual: o card de paywall atual (navy) pode ficar, porque é um gate comercial e não conteúdo didático.

> ⚠️ **Conflito a confirmar com o Leo (não bloqueia):** [aef-block-engine.js#L552-L556](file:///Users/macbookpro/Desktop/agoraeufalo_site/assets/js/aef-block-engine.js#L552-L556) tem a regra *"No Free Tier, a ÚNICA oferta autorizada… é a Assinatura do Club"*. O CTA secundário de produto avulso para usuário Free contraria essa regra. **Implementar com a flag `SHOW_STANDALONE_OFFER_TO_FREE = false` (default: respeita a regra)** e relatar ao Leo.

### M3 — Override de teste
No bloco de auth (L808-L831): se `new URLSearchParams(location.search).get('simulate') === 'free'`, então `userProfile = { role:'student', tier:'free', enrolledProducts:[] }` e pular o fallback de admin local. **Só existe no arquivo `-lab`.**

---

## 6. Fase 5: Pontos de entrada

### 6.1 `index-lab.html`
1. **Seção YouTube Lab** (`#youtube-lab`): trocar o mockup estático por um container dinâmico.
   - Query: `youtube_archive where featuredOnHome==true && status=='active' orderBy homeOrder limit 3`.
     → ⚠️ Esse filtro composto exige **índice composto** no Firestore. Criar via MCP `firestore_create_index` (`featuredOnHome ASC, status ASC, homeOrder ASC`) **ou** buscar `featuredOnHome==true` e filtrar/ordenar no cliente (preferível: zero índice).
   - Card: thumb (fallback), título, 2 linhas de descrição, badges 📄/🎧.
   - **Clique:** sempre `youtube-lab.html?v={id}`. O gate de cadastro acontece **lá**, onde está o material (§4.4). **Não** abrir modal na home: um gate num lugar só.
   - Fallback (Firestore vazio ou com erro): esconder a seção inteira. Nada de placeholder falso.
   - CTA da seção: `[Ver todo o YouTube Lab ➔]` → `youtube-lab.html`.
2. **Corrigir F4:**
   - Cursos e planos renderizados a partir de `aefOffersRegistry.getAllOffers({status:'active'})`, filtrando os IDs de vitrine: `ms-club-mensal`, `ms-club-anual`, `all-access-lifetime` (planos) e `eqs-completo`, `frases-prontas-vitalicio` (avulsos).
   - Preço = `offer.pricing`. Clique = `window.aefCheckoutModal.open(R.generateTrackingUrl(offer, 'home_lab', offer.id))`.
   - Oferta inexistente ou pausada → card **não renderiza**.
   - Remover os produtos inventados ("Masterclass de Pronúncia", "Bundle Aceleração").
3. `<meta name="robots" content="noindex">` no `index-lab.html`.

### 6.2 `portal-lab.html` (cópia de `portal.html`)
- Adicionar a entrada **"🎬 YouTube Lab"** na navegação do aluno, ao lado dos pilares existentes (Dashboard / Sala de Aula / Training Player), apontando para `youtube-lab.html`.
- Adicionar no Dashboard um card *"Novo no YouTube Lab"* com o vídeo mais recente (`orderBy publishedAt desc limit 1`).
- `noindex`.

---

## 7. Testes de aceite (o Gemini executa e cola as evidências no relatório)

**Ambiente:** URL publicada (Cloudflare). Paywall **não** é testável em localhost (F3).

| ID | Cenário | Esperado |
|---|---|---|
| T1 | REST sem token em `youtube_archive` | 200 |
| T2 | REST sem token em `.../gated/materials` | **403** |
| T3 | Admin cadastra vídeo com PDF e vínculo `ms012` | 2 docs criados; vínculo validado |
| T4 | Admin tenta salvar com `lessonId` inexistente | Salvamento bloqueado |
| T5 | `youtube-lab.html?v=X` em aba anônima | Vídeo toca; box de materiais **BLOQUEADO**; nenhum `pdfUrl` aparece no DevTools/Network |
| T6 | Mesma aba com localStorage `aef_user_email` forjado, sem sessão Firebase | Continua **BLOQUEADO** (prova de F2) |
| T7 | Cadastro por magic link | Volta para `?v=X` com o box **LIBERADO** |
| T8 | Botão Ponte, com `simulate=free` | `sala-de-aula-lab.html?...&src=youtube-lab&v=X` → paywall com oferta real + preço do registro + "← Voltar ao vídeo" |
| T9 | Botão Ponte com aluno que tem o curso | Aula abre direto |
| T10 | `index-lab.html`: vitrine | Exatamente os vídeos com `featuredOnHome`, na ordem de `homeOrder` |
| T11 | `index-lab.html`: clique em plano | Checkout modal abre com a URL real da oferta; **zero** `TypeError` no console |
| T12 | Teste headless | Script Puppeteer `tests/e2e/youtube-lab.test.js` cobrindo T5, T6, T8 (com `simulate=free`), T10 e T11 |

---

## 8. Entregáveis e critérios de "pronto"

**Arquivos novos:** `admin-youtube-lab.html`, `youtube-lab.html`, `sala-de-aula-lab.html`, `portal-lab.html`, `tests/e2e/youtube-lab.test.js`
**Arquivos alterados:** `index-lab.html` (sandbox), `firestore.rules` (aditivo, autorizado)
**Arquivos que NÃO podem aparecer no diff:** `index.html`, `portal.html`, `sala-de-aula.html`, `assets/js/*` (nenhum JS compartilhado é alterado nesta entrega)

**Documentação viva (GEMINI.md §7):**
- `MANUAL_USUARIO_ADMIN.md`: passo a passo do `admin-youtube-lab.html`
- `MANUAL_DESENVOLVIMENTO_BLUEPRINT.md`: schema §1 e máquina de estados §4.4
- `INTERFACES.md` + `src/worker.js`: rotas `/youtube-lab` e `/admin-youtube-lab` (se o worker exigir mapeamento explícito)

**Relatório final obrigatório (Regra 19):**
1. `git diff --stat` provando que nenhum arquivo oficial foi tocado
2. `git diff firestore.rules` (só adições)
3. Saída de T1 a T12, com status real. Falha é relatada como falha, sem mascarar.
4. Lista de pendências para o go-live (trocar `SALA_PATH`, remover `noindex`, portar M1/M2 para a sala oficial, decidir `SHOW_STANDALONE_OFFER_TO_FREE`)

---

## 9. Fora do escopo desta entrega
- Go-live (transferir os `-lab` para os oficiais): exige aprovação separada do Leo depois de T1-T12
- URL assinada para os materiais (Fase 2)
- YouTube Data API (descrição automática)
- Páginas estáticas por vídeo / `VideoObject` (SEO)
- Trocar o formulário de cadastro em localStorage da `index.html` oficial (F1). **Recomendado como próxima entrega:** hoje esses "cadastros" não são contas reais.
