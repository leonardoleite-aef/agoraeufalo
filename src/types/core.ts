/**
 * AgoraEuFalo Ecosystem - Core Data Contracts (V2)
 * Professor Leonardo Leite
 * 
 * Este arquivo define o Blueprint oficial da Versão 2 do contrato de dados,
 * suportando múltiplas assinaturas ativas (subscriptions[]), taxonomia de cursos
 * desacoplada de acesso (AccessGrant), idempotência de eventos de webhook
 * e funções puras de verificação de permissões e vigência.
 */

// ============================================================================
// 1. PAPEIS E IDENTIDADE
// ============================================================================

export type Role = "student" | "moderator" | "admin";

export type EntitlementCategory =
  | "member_free"
  | "member_pago"
  | "member_mentoria"
  | "legado_1"
  | "legado_2"
  | "venda_avulsa";

// Alias de retrocompatibilidade para o schema V1
export type UserCategory = EntitlementCategory;

// ============================================================================
// 2. CICLO DE VIDA FINANCEIRO E GATEWAYS
// ============================================================================

export type BillingPeriod = "monthly" | "annual" | "lifetime";

export type AccessStatus =
  | "active"
  | "overdue_grace_period"
  | "canceled_grace"
  | "canceled_immediate"
  | "revoked";

export type Gateway = "hotmart" | "stripe" | "manual";

export interface Subscription {
  id: string;
  entitlement: EntitlementCategory;
  productId: string;
  billingPeriod: BillingPeriod;
  status: AccessStatus;
  expiresAt?: string | null;
  graceUntil?: string | null;
  gateway: Gateway;
  lastEventId: string;
  updatedAt: string;
}

// Alias de retrocompatibilidade
export type SubscriptionData = Subscription;

export interface PurchasedProduct {
  productId: string;
  courseId: string;
  purchasedAt: string;
  gateway: Gateway;
  transactionId: string;
}

// ============================================================================
// 3. MODELO DE USUÁRIO (AEFUser V2)
// ============================================================================

export interface AEFUser {
  schemaVersion: 2;
  id: string;
  uid: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  subscriptions: Subscription[];
  purchasedProducts: PurchasedProduct[];
  legacyEntitlements: EntitlementCategory[];
  createdAt: string;
  updatedAt: string;
  legacy?: {
    tier?: string;
    enrolledProducts?: string[];
    categories?: EntitlementCategory[] | string[];
    subscription?: Subscription | null;
    role?: Role;
  };
}

// ============================================================================
// 4. TAXONOMIA E MODELO DE CURSOS
// ============================================================================

export type CourseCategory = "magic_stories" | "foundations" | "survival" | "real_english";
export type CourseAccessTier = "all_access" | "standalone" | "free";

export interface AccessGrant {
  entitlements?: EntitlementCategory[];
  requiresProductId?: string[];
  legacyGrantIds?: string[];
}

export type MediaType = "video_youtube" | "video_vimeo" | "video_mp4" | "audio_mp3";
export interface AEFMedia {
  type: MediaType;
  url: string;
  title: string;
  durationStr?: string;
  thumbnailUrl?: string;
}

export type DownloadType = "pdf" | "mp3" | "zip";
export interface AEFDownload {
  type: DownloadType;
  url: string;
  title: string;
}

export interface AEFLesson {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  artworkUrl?: string;
  media?: AEFMedia[];
  downloads?: AEFDownload[];
  videoUrl?: string;
  pdfUrl?: string;
  audioUrl?: string;
}

export interface AEFModule {
  id: string;
  title: string;
  isFreeTier?: boolean;
  lessons?: AEFLesson[];
}

export interface AEFCourse {
  schemaVersion: 2;
  id: string;
  title: string;
  slug?: string;
  categories: CourseCategory[];
  accessTier: CourseAccessTier;
  access: AccessGrant;
  priceInCents?: number;
  isPublished: boolean;
  sortOrder?: number;
  modules?: AEFModule[];
}

// ============================================================================
// 5. EVENTOS DE WEBHOOK & MAPEAMENTO DE PRODUTOS
// ============================================================================

export interface WebhookEvent {
  id: string;
  provider: Gateway;
  type: string;
  productId: string;
  buyerEmail: string;
  occurredAt: string;
  receivedAt: string;
  raw: Record<string, unknown>;
  processedAt?: string | null;
  processingError?: string | null;
}

export interface ProductEntitlementMapping {
  productId: string;
  entitlement: EntitlementCategory;
  grantsCourseIds?: string[];
  billingPeriod?: BillingPeriod;
}

// ============================================================================
// 6. FUNÇÕES PURAS DE VERIFICAÇÃO DE ACESSO E ASSINATURA
// ============================================================================

/**
 * Verifica se um usuário possui acesso a determinado curso com base em seu role,
 * status de publicação, modelo de acesso (free, all_access, standalone) e vigência.
 */
export function hasAccess(user: AEFUser, course: AEFCourse, now: Date = new Date()): boolean {
  if (user.role === "admin") return true;
  if (!course.isPublished) return false;
  if (course.accessTier === "free") return true;

  const active = getActiveEntitlements(user, now);

  if (course.accessTier === "all_access") {
    return (course.access.entitlements ?? []).some((e) => active.includes(e));
  }

  if (course.accessTier === "standalone") {
    const ownsProduct = user.purchasedProducts.some(
      (p) => p.courseId === course.id || course.access.requiresProductId?.includes(p.productId)
    );
    if (ownsProduct) return true;
    return (course.access.entitlements ?? []).some((e) => active.includes(e));
  }

  return false;
}

/**
 * Retorna todas as categorias de direito (entitlements) ativas do usuário,
 * combinando assinaturas vigentes e direitos legados consolidados.
 */
export function getActiveEntitlements(user: AEFUser, now: Date): EntitlementCategory[] {
  const fromSubs = user.subscriptions
    .filter((s) => isSubscriptionActive(s, now))
    .map((s) => s.entitlement);
  return [...new Set([...fromSubs, ...user.legacyEntitlements])];
}

/**
 * Verifica se uma assinatura específica está ativa na data de referência,
 * respeitando períodos de tolerância (grace period) e datas de expiração.
 */
export function isSubscriptionActive(sub: Subscription, now: Date): boolean {
  switch (sub.status) {
    case "revoked":
    case "canceled_immediate":
      return false;
    case "active":
      return !sub.expiresAt || new Date(sub.expiresAt) > now;
    case "overdue_grace_period":
    case "canceled_grace": {
      const validUntil = sub.graceUntil || sub.expiresAt;
      return !!validUntil && new Date(validUntil) > now;
    }
    default:
      return false;
  }
}

// ============================================================================
// 7. ADAPTADORES E NORMALIZADORES DE DADOS (FASE 2)
// ============================================================================

/**
 * Converte documentos de curso brutos ou legados para a estrutura canônica AEFCourse (V2),
 * assegurando que access: AccessGrant esteja plenamente populado.
 */
export function normalizeCourseToV2(raw: Record<string, any>): AEFCourse {
  if (!raw) {
    return {
      schemaVersion: 2,
      id: "unknown",
      title: "Sem Título",
      categories: ["foundations"],
      accessTier: "free",
      access: { entitlements: ["member_free"] },
      isPublished: false
    };
  }

  const id = String(raw.id || raw.slug || `course_${Date.now()}`);
  const title = String(raw.title || id);
  const slug = raw.slug ? String(raw.slug) : id;
  const isPublished = raw.published !== false && raw.isPublished !== false;

  // Normalização de CourseCategory
  let categories: CourseCategory[] = [];
  if (Array.isArray(raw.categories)) {
    categories = raw.categories.filter((c: string): c is CourseCategory =>
      ["magic_stories", "foundations", "survival", "real_english"].includes(c)
    );
  }
  if (categories.length === 0) {
    if (id.startsWith("ms") || id.includes("magic")) categories = ["magic_stories"];
    else if (id.includes("quickstart") || id.includes("dtc")) categories = ["foundations"];
    else categories = ["foundations"];
  }

  // Normalização de accessTier
  let accessTier: CourseAccessTier = "all_access";
  if (raw.accessTier === "free" || raw.tierRequired === "free" || raw.badge?.toUpperCase().includes("GRÁTIS") || raw.badge?.toUpperCase().includes("GRATIS")) {
    accessTier = "free";
  } else if (raw.accessTier === "standalone" || raw.accessTier === "venda_avulsa") {
    accessTier = "standalone";
  } else if (raw.accessTier === "all_access" || raw.accessTier === "club") {
    accessTier = "all_access";
  } else if (raw.accessTier === "mentoria_vip" || id.startsWith("mentoria-")) {
    accessTier = "standalone";
  }

  // Preenchimento de access: AccessGrant
  let access: AccessGrant = {
    entitlements: [],
    requiresProductId: [],
    legacyGrantIds: []
  };

  if (raw.access && typeof raw.access === "object") {
    access = {
      entitlements: Array.isArray(raw.access.entitlements) ? [...raw.access.entitlements] : [],
      requiresProductId: Array.isArray(raw.access.requiresProductId) ? [...raw.access.requiresProductId] : [],
      legacyGrantIds: Array.isArray(raw.access.legacyGrantIds) ? [...raw.access.legacyGrantIds] : []
    };
  } else {
    // Derivação a partir do modelo de acesso e regras existentes
    if (accessTier === "free") {
      access.entitlements = ["member_free", "member_pago"];
    } else if (accessTier === "all_access") {
      access.entitlements = ["member_pago"];
      if (Array.isArray(raw.legacyGrants)) {
        raw.legacyGrants.forEach((lg: string) => {
          if (!access.entitlements!.includes(lg as EntitlementCategory)) {
            access.entitlements!.push(lg as EntitlementCategory);
          }
          access.legacyGrantIds!.push(lg);
        });
      }
    } else if (accessTier === "standalone") {
      const prodId = raw.productId || raw.requiresProductId || id;
      access.requiresProductId = Array.isArray(prodId) ? prodId : [String(prodId)];
      if (id.startsWith("mentoria-") || raw.accessTier === "mentoria_vip") {
        access.entitlements = ["member_mentoria"];
      }
    }

    if (Array.isArray(raw.accessCategories)) {
      raw.accessCategories.forEach((cat: string) => {
        if (!access.entitlements!.includes(cat as EntitlementCategory)) {
          access.entitlements!.push(cat as EntitlementCategory);
        }
      });
    }
  }

  access.entitlements = [...new Set(access.entitlements ?? [])];
  access.requiresProductId = [...new Set(access.requiresProductId ?? [])];
  access.legacyGrantIds = [...new Set(access.legacyGrantIds ?? [])];

  return {
    schemaVersion: 2,
    id,
    title,
    slug,
    categories,
    accessTier,
    access,
    priceInCents: typeof raw.priceInCents === "number" ? raw.priceInCents : undefined,
    isPublished,
    sortOrder: typeof raw.sortOrder === "number" ? raw.sortOrder : (typeof raw.order === "number" ? raw.order : undefined),
    modules: Array.isArray(raw.modules) ? raw.modules : undefined
  };
}

/**
 * Converte documentos de usuário legados (V1/transição) para o formato canônico AEFUser (V2),
 * populando subscriptions[] e legacyEntitlements[] com retrocompatibilidade total.
 */
export function normalizeUserToV2(raw: Record<string, any>): AEFUser {
  if (!raw) {
    return {
      schemaVersion: 2,
      id: "anonymous",
      uid: "anonymous",
      email: "",
      name: "Aluno AgoraEuFalo",
      role: "student",
      subscriptions: [],
      purchasedProducts: [],
      legacyEntitlements: ["member_free"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  const email = (raw.email || "").toLowerCase().trim();
  const uid = String(raw.uid || raw.id || (email ? email.replace(/[^a-zA-Z0-9]/g, "_") : "user"));
  const id = String(raw.id || uid);
  const name = String(raw.name || raw.displayName || (email ? email.split("@")[0] : "Aluno AgoraEuFalo"));
  const phone = raw.phone || raw.whatsapp || undefined;

  // Normalização de Role
  let role: Role = "student";
  if (raw.role === "admin" || raw.tier === "admin_master" || (Array.isArray(raw.categories) && raw.categories.includes("admin"))) {
    role = "admin";
  } else if (raw.role === "moderator") {
    role = "moderator";
  }

  // Normalização de LegacyEntitlements
  const legacyEntitlementsSet = new Set<EntitlementCategory>(["member_free"]);
  if (Array.isArray(raw.legacyEntitlements)) {
    raw.legacyEntitlements.forEach((e: string) => legacyEntitlementsSet.add(e as EntitlementCategory));
  }
  if (Array.isArray(raw.categories)) {
    raw.categories.forEach((cat: string) => {
      if (cat === "legado_1" || cat === "legado_2" || cat === "member_free") {
        legacyEntitlementsSet.add(cat as EntitlementCategory);
      }
    });
  }
  if (raw.tier === "ms_legacy" || raw.category === "magic_stories_legacy") {
    legacyEntitlementsSet.add("legado_1");
  } else if (raw.tier === "primeiro_legado" || raw.category === "primeiro_legado_agoraeufalo") {
    legacyEntitlementsSet.add("legado_2");
  }

  // Normalização de Subscriptions
  const subscriptions: Subscription[] = [];
  if (Array.isArray(raw.subscriptions) && raw.subscriptions.length > 0) {
    raw.subscriptions.forEach((s: any, idx: number) => {
      if (s && typeof s === "object") {
        subscriptions.push({
          id: String(s.id || `sub_${uid}_${idx}`),
          entitlement: (s.entitlement || (s.productId === "PROJETO_AEF_2026" || s.productId === "MENTORIA_VIP" ? "member_mentoria" : "member_pago")) as EntitlementCategory,
          productId: String(s.productId || "8460579"),
          billingPeriod: (s.billingPeriod === "monthly" || s.billingPeriod === "annual" || s.billingPeriod === "lifetime") ? s.billingPeriod : "annual",
          status: (s.status || "active") as AccessStatus,
          expiresAt: s.expiresAt || null,
          graceUntil: s.graceUntil || null,
          gateway: (s.gateway === "stripe" || s.gateway === "manual") ? s.gateway : "hotmart",
          lastEventId: String(s.lastEventId || s.lastEvent || "init"),
          updatedAt: String(s.updatedAt || new Date().toISOString())
        });
      }
    });
  } else if (raw.subscription && typeof raw.subscription === "object") {
    const s = raw.subscription;
    const isMentoria = raw.categories?.includes("member_mentoria") || raw.tier === "vip_mentorship" || s.productId === "PROJETO_AEF_2026";
    subscriptions.push({
      id: String(s.id || `sub_${uid}_hotmart`),
      entitlement: (s.entitlement || (isMentoria ? "member_mentoria" : "member_pago")) as EntitlementCategory,
      productId: String(s.productId || (isMentoria ? "PROJETO_AEF_2026" : "8460579")),
      billingPeriod: (s.billingPeriod === "monthly" || s.billingPeriod === "annual" || s.billingPeriod === "lifetime") ? s.billingPeriod : "annual",
      status: (s.status || "active") as AccessStatus,
      expiresAt: s.expiresAt || null,
      graceUntil: s.graceUntil || null,
      gateway: (s.gateway === "stripe" || s.gateway === "manual") ? s.gateway : "hotmart",
      lastEventId: String(s.lastEventId || s.lastEvent || "webhook_sync"),
      updatedAt: String(s.updatedAt || new Date().toISOString())
    });
  } else {
    const isMentoria = raw.categories?.includes("member_mentoria") || raw.tier === "vip_mentorship";
    const isPago = raw.categories?.includes("member_pago") || raw.tier === "club_annual" || raw.tier === "club_monthly";
    if (isMentoria || isPago) {
      subscriptions.push({
        id: `sub_${uid}_inferred`,
        entitlement: isMentoria ? "member_mentoria" : "member_pago",
        productId: isMentoria ? "PROJETO_AEF_2026" : "8460579",
        billingPeriod: raw.tier === "club_monthly" ? "monthly" : "annual",
        status: "active",
        expiresAt: null,
        graceUntil: null,
        gateway: "hotmart",
        lastEventId: "inferred_legacy",
        updatedAt: new Date().toISOString()
      });
    }
  }

  // Normalização de PurchasedProducts
  const purchasedProducts: PurchasedProduct[] = [];
  if (Array.isArray(raw.purchasedProducts)) {
    raw.purchasedProducts.forEach((p: any, idx: number) => {
      if (typeof p === "string") {
        purchasedProducts.push({
          productId: p,
          courseId: p,
          purchasedAt: String(raw.createdAt || new Date().toISOString()),
          gateway: "hotmart",
          transactionId: `tx_legacy_${p}_${idx}`
        });
      } else if (p && typeof p === "object") {
        purchasedProducts.push({
          productId: String(p.productId || p.courseId || `prod_${idx}`),
          courseId: String(p.courseId || p.productId || `course_${idx}`),
          purchasedAt: String(p.purchasedAt || new Date().toISOString()),
          gateway: (p.gateway === "stripe" || p.gateway === "manual") ? p.gateway : "hotmart",
          transactionId: String(p.transactionId || `tx_${idx}`)
        });
      }
    });
  }

  if (Array.isArray(raw.enrolledProducts)) {
    raw.enrolledProducts.forEach((ep: string, idx: number) => {
      const alreadyPurchased = purchasedProducts.some((p) => p.courseId === ep || p.productId === ep);
      if (!alreadyPurchased && ep !== "ms-legacy" && ep !== "english-quickstart" && ep !== "frases-prontas") {
        purchasedProducts.push({
          productId: ep,
          courseId: ep,
          purchasedAt: String(raw.createdAt || new Date().toISOString()),
          gateway: "manual",
          transactionId: `tx_enrolled_${ep}_${idx}`
        });
      }
    });
  }

  return {
    schemaVersion: 2,
    id,
    uid,
    email,
    name,
    phone,
    role,
    subscriptions,
    purchasedProducts,
    legacyEntitlements: Array.from(legacyEntitlementsSet),
    createdAt: String(raw.createdAt || new Date().toISOString()),
    updatedAt: String(raw.updatedAt || new Date().toISOString()),
    legacy: {
      tier: raw.tier,
      enrolledProducts: Array.isArray(raw.enrolledProducts) ? raw.enrolledProducts : undefined,
      categories: Array.isArray(raw.categories) ? raw.categories : undefined,
      subscription: raw.subscription || undefined,
      role: raw.role
    }
  };
}
