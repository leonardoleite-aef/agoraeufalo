/**
 * AgoraEuFalo — Access Engine (Motor Centralizado de Acesso & Categorias)
 * Professor Leonardo Leite
 *
 * Single Source of Truth para categorias de alunos, categorias de produtos,
 * lógica de acesso e helpers de migração.
 *
 * Este módulo elimina a duplicação de lógica de acesso que existia em
 * sala-de-aula.html, portal.html, curso.html e treino/player.html.
 */

(function (root) {
  "use strict";

  // =========================================================================
  // 1. CONSTANTES DE CATEGORIAS
  // =========================================================================

  /**
   * Categorias de membro (aluno).
   * Um aluno pode pertencer a MÚLTIPLAS categorias simultaneamente.
   */
  const MEMBER_CATEGORIES = {
    FREE:      "member_free",
    PAGO:      "member_pago",
    MENTORIA:  "member_mentoria",
    LEGADO_1:  "legado_1",       // magic_stories_legacy (MS-Legacy) — 926 alunos
    LEGADO_2:  "legado_2"        // agoraeufalo_primeiro_legado (FS) — 2.946 alunos
  };

  /**
   * Períodos de cobrança para member_pago
   */
  const BILLING_PERIODS = {
    MONTHLY:  "monthly",
    ANNUAL:   "annual",
    LIFETIME: "lifetime"
  };

  /**
   * Categorias de acesso de produto/curso.
   * Um produto pode ser marcado com MÚLTIPLAS categorias.
   */
  const PRODUCT_ACCESS_CATEGORIES = {
    FREE:           "member_free",
    PAGO:           "member_pago",
    VENDA_AVULSA:   "venda_avulsa",
    LEGADO_1:       "legado_1",
    LEGADO_2:       "legado_2"
  };

  /**
   * Roles do sistema (permissão administrativa, separado de acesso a conteúdo)
   */
  const ROLES = {
    STUDENT:   "student",
    MODERATOR: "moderator",
    ADMIN:     "admin"
  };

  /**
   * Labels amigáveis para UI
   */
  const CATEGORY_LABELS = {
    member_free:     { emoji: "🌱", label: "Member Free",        color: "slate"   },
    member_pago:     { emoji: "💰", label: "Member Pago",        color: "amber"   },
    member_mentoria: { emoji: "👑", label: "Mentorado VIP",      color: "amber"   },
    legado_1:        { emoji: "📦", label: "Legado 1 (MS)",      color: "amber"   },
    legado_2:        { emoji: "📦", label: "Legado 2 (AEF)",     color: "emerald" },
    admin:           { emoji: "🔐", label: "Admin Mestre",       color: "purple"  }
  };

  const BILLING_LABELS = {
    monthly:  "Mensal",
    annual:   "Anual",
    lifetime: "Vitalício"
  };

  // =========================================================================
  // 2. LÓGICA CENTRAL DE ACESSO
  // =========================================================================

  /**
   * Resolve as categorias efetivas de um aluno.
   * Garante que member_free está sempre presente (base universal).
   * Aceita tanto o formato novo (categories[]) quanto o legado (tier string).
   *
   * @param {Object} user - Documento do aluno (Firestore ou local)
   * @returns {string[]} Array de categorias efetivas
   */
  function resolveUserCategories(user) {
    if (!user) return [MEMBER_CATEGORIES.FREE];

    // Formato novo: categories[] já existe
    if (Array.isArray(user.categories) && user.categories.length > 0) {
      const cats = [...user.categories];
      // Garante member_free como base universal
      if (!cats.includes(MEMBER_CATEGORIES.FREE)) {
        cats.push(MEMBER_CATEGORIES.FREE);
      }
      return cats;
    }

    // Formato legado: mapear tier string → categories[]
    return migrateTierToCategories(user.tier, user.role, user.category);
  }

  /**
   * Resolve as categorias de acesso de um produto/curso.
   * Aceita tanto o formato novo (accessCategories[]) quanto o legado (tierRequired string).
   *
   * @param {Object} course - Documento do curso/produto
   * @returns {string[]} Array de categorias de acesso
   */
  function resolveCourseCategories(course) {
    if (!course) return [];

    const cats = [];
    
    // Support new accessTier from admin-cursos
    if (course.accessTier === 'free') {
      cats.push(PRODUCT_ACCESS_CATEGORIES.FREE, PRODUCT_ACCESS_CATEGORIES.PAGO);
    } else if (course.accessTier === 'all_access') {
      cats.push(PRODUCT_ACCESS_CATEGORIES.PAGO);
    } else if (course.accessTier === 'standalone') {
      // It's a standalone course. Access is granted individually via user.enrolledProducts,
      // handled elsewhere. But we can push a special tag or just leave it empty.
      // Wait, let's just leave it empty so only explicit enrollments grant access.
    }

    // Support legacyGrants array from admin-cursos
    if (Array.isArray(course.legacyGrants)) {
      course.legacyGrants.forEach(lg => cats.push(lg));
    }

    // Support older formats
    if (Array.isArray(course.accessCategories)) {
      course.accessCategories.forEach(c => cats.push(c));
    } else if (course.tierRequired) {
      const legacyCats = migrateTierRequiredToCategories(course.tierRequired);
      legacyCats.forEach(c => cats.push(c));
    }

    return cats;
  }

  function resolveCourseCategories(course) {
    if (!course) return [];

    // Formato novo
    if (Array.isArray(course.accessCategories) && course.accessCategories.length > 0) {
      return course.accessCategories;
    }

    // Formato legado: mapear tierRequired → accessCategories[]
    return migrateTierRequiredToCategories(course.tierRequired);
  }

  /**
   * Verifica se um aluno tem acesso a um produto/curso.
   *
   * Regras:
   * 1. Admin tem acesso total
   * 2. Curso não publicado → ninguém (exceto admin)
   * 3. Compra avulsa → acesso direto
   * 4. Interseção de categorias do aluno com categorias do produto
   *
   * @param {Object} user - Documento do aluno
   * @param {Object} course - Documento do curso/produto
   * @returns {boolean}
   */
  function hasAccess(user, course) {
    if (!course) return false;

    // 1. Admin tem tudo
    if (isAdmin(user)) return true;

    // 2. Curso não publicado
    if (course.published === false) return false;

    // 3. Compra avulsa
    const purchased = user?.purchasedProducts || user?.enrolledProducts || [];
    if (purchased.includes(course.id) || purchased.includes("all_access_master")) {
      return true;
    }

    // 4. Resolve e filtra categorias ativas do aluno
    let userCats = resolveUserCategories(user);
    
    // Se não tiver assinatura ativa, remove 'member_pago' e 'member_mentoria'
    // pois o acesso deve cair de volta para 'member_free'
    if (userCats.includes(MEMBER_CATEGORIES.PAGO) || userCats.includes(MEMBER_CATEGORIES.MENTORIA)) {
      if (!isSubscriptionActive(user)) {
        userCats = userCats.filter(c => c !== MEMBER_CATEGORIES.PAGO && c !== MEMBER_CATEGORIES.MENTORIA);
      }
    }

    // 5. Verifica o Modelo de Acesso do Curso (Nova Taxonomia)
    if (course.accessTier) {
      if (course.accessTier === 'free') return true;
      if (course.accessTier === 'all_access') {
        let allowedCats = [MEMBER_CATEGORIES.PAGO, MEMBER_CATEGORIES.MENTORIA];
        if (course.legacyGrants) {
          allowedCats = allowedCats.concat(course.legacyGrants);
        } else {
          // Fallback para manter o acesso até o curso ser salvo novamente no painel
          allowedCats.push(MEMBER_CATEGORIES.LEGADO_1, MEMBER_CATEGORIES.LEGADO_2);
        }
        return userCats.some(cat => allowedCats.includes(cat));
      }
      if (course.accessTier === 'standalone') {
        // Se for standalone, checa se tem exceção de legado
        if (Array.isArray(course.legacyGrants) && course.legacyGrants.length > 0) {
           if (userCats.some(cat => course.legacyGrants.includes(cat))) return true;
        }
        return false; // Apenas compras diretas dão acesso (já validado no passo 3)
      }
    }

    // Fallback Legado
    const courseCats = resolveCourseCategories(course);
    return userCats.some(cat => courseCats.includes(cat));
  }

  /**
   * Verifica se o aluno tem acesso a um módulo específico (degustação gratuita).
   */
  function hasModuleAccess(user, course, module) {
    // Acesso ao curso inteiro → acesso ao módulo
    if (hasAccess(user, course)) return true;

    // Módulo de degustação gratuita
    if (module && module.isFreeTier === true) return true;
    if (course && Array.isArray(course.freeModuleIds) && module && course.freeModuleIds.includes(module.id)) {
      return true;
    }

    return false;
  }

  /**
   * Verifica se o usuário é admin
   */
  function isAdmin(user) {
    if (!user) return false;
    return user.role === ROLES.ADMIN ||
           user.tier === "admin_master" ||
           (Array.isArray(user.categories) && user.categories.includes("admin"));
  }

  /**
   * Verifica se a assinatura do aluno está ativa
   */
  function isSubscriptionActive(user) {
    if (!user) return false;

    // Formato novo
    if (user.subscription) {
      const s = user.subscription;
      if (s.billingPeriod === BILLING_PERIODS.LIFETIME) return true;
      if (s.status === "active") return true;
      if (s.status === "grace" || s.status === "canceled_grace") {
        if (s.expiresAt) {
          return new Date(s.expiresAt) > new Date();
        }
        return true;
      }
      return false;
    }

    // Formato legado
    const sub = user.subscriptionState;
    if (!sub) return true; // sem info de assinatura = ativo por default
    if (sub.status === "active") return true;
    if (sub.status === "overdue_grace_period" || sub.status === "canceled_grace") {
      if (sub.expiresAt || sub.graceUntil) {
        return new Date(sub.expiresAt || sub.graceUntil) > new Date();
      }
      return true;
    }
    return sub.status !== "revoked" && sub.status !== "canceled_immediate";
  }

  // =========================================================================
  // 3. MIGRAÇÃO / BACKWARD COMPATIBILITY
  // =========================================================================

  /**
   * Converte o tier legado (string) para o novo formato categories[].
   * Usado durante a transição e para ler dados antigos.
   */
  function migrateTierToCategories(tier, role, category) {
    const cats = [MEMBER_CATEGORIES.FREE]; // base universal

    if (role === ROLES.ADMIN || tier === "admin_master") {
      // Admin não precisa de categorias de acesso — role é suficiente
      return cats;
    }

    switch (tier) {
      case "vip_mentorship":
      case "vip":
        cats.push(MEMBER_CATEGORIES.PAGO, MEMBER_CATEGORIES.MENTORIA);
        break;

      case "club_annual":
      case "club_anual":
      case "club_monthly":
      case "pro":
      case "course_member":
      case "lifetime":
        cats.push(MEMBER_CATEGORIES.PAGO);
        break;

      case "ms_legacy":
        cats.push(MEMBER_CATEGORIES.LEGADO_1);
        break;

      case "primeiro_legado":
        cats.push(MEMBER_CATEGORIES.LEGADO_2);
        break;

      case "legacy_member":
        cats.push(MEMBER_CATEGORIES.LEGADO_1, MEMBER_CATEGORIES.LEGADO_2);
        break;

      case "free":
      default:
        // Apenas member_free (já adicionado)
        break;
    }

    // Verificação por category field (legado do import)
    if (category === "magic_stories_legacy" && !cats.includes(MEMBER_CATEGORIES.LEGADO_1)) {
      cats.push(MEMBER_CATEGORIES.LEGADO_1);
    }
    if (category === "primeiro_legado_agoraeufalo" && !cats.includes(MEMBER_CATEGORIES.LEGADO_2)) {
      cats.push(MEMBER_CATEGORIES.LEGADO_2);
    }

    return cats;
  }

  /**
   * Infere o billingPeriod a partir do tier legado.
   */
  function migrateTierToBillingPeriod(tier) {
    switch (tier) {
      case "club_monthly":     return BILLING_PERIODS.MONTHLY;
      case "club_annual":
      case "club_anual":
      case "pro":              return BILLING_PERIODS.ANNUAL;
      case "lifetime":         return BILLING_PERIODS.LIFETIME;
      case "vip_mentorship":
      case "vip":              return BILLING_PERIODS.ANNUAL; // VIP default
      default:                 return null;
    }
  }

  /**
   * Converte tierRequired legado (string) para accessCategories[].
   */
  function migrateTierRequiredToCategories(tierRequired) {
    switch (tierRequired) {
      case "free":
        return [
          PRODUCT_ACCESS_CATEGORIES.FREE,
          PRODUCT_ACCESS_CATEGORIES.PAGO,
          PRODUCT_ACCESS_CATEGORIES.LEGADO_1,
          PRODUCT_ACCESS_CATEGORIES.LEGADO_2
        ];

      case "club_anual":
      case "club_annual":
      case "pro":
        return [PRODUCT_ACCESS_CATEGORIES.PAGO];

      case "vip":
      case "vip_mentorship":
        return [PRODUCT_ACCESS_CATEGORIES.PAGO]; // mentoria content is per-student, not per-course

      case "legacy_member":
        return [
          PRODUCT_ACCESS_CATEGORIES.LEGADO_1,
          PRODUCT_ACCESS_CATEGORIES.LEGADO_2
        ];

      case "enrolled_only":
        return []; // access only via purchasedProducts

      default:
        return [PRODUCT_ACCESS_CATEGORIES.PAGO];
    }
  }

  /**
   * Constroi o documento Firestore do aluno no novo formato a partir do formato antigo.
   * Útil para o script de migração e para gravações novas.
   */
  function buildUserDocument(oldUser) {
    const categories = resolveUserCategories(oldUser);
    const billingPeriod = migrateTierToBillingPeriod(oldUser.tier);
    const hasPago = categories.includes(MEMBER_CATEGORIES.PAGO);

    const doc = {
      uid: oldUser.uid || oldUser.id,
      email: oldUser.email,
      name: oldUser.name,
      phone: oldUser.phone || "",
      categories: categories,
      role: oldUser.role || ROLES.STUDENT,
      purchasedProducts: oldUser.purchasedProducts || [],
      updatedAt: new Date().toISOString(),
      // Backward compat (manter por 30 dias)
      tier: oldUser.tier || "free",
      enrolledProducts: oldUser.enrolledProducts || []
    };

    // Subscription para membros pagos
    if (hasPago && billingPeriod) {
      doc.subscription = {
        billingPeriod: billingPeriod,
        status: oldUser.subscriptionState?.status || "active",
        expiresAt: oldUser.subscriptionState?.expiresAt || null,
        gateway: oldUser.lastTransaction?.gateway || "hotmart",
        lastEvent: oldUser.subscriptionState?.lastEvent || "PURCHASE_APPROVED"
      };
    }

    // Preservar tier original para auditoria
    if (oldUser.tier && oldUser.tier !== "free") {
      doc._legacyTier = oldUser.tier;
    }

    return doc;
  }

  // =========================================================================
  // 4. HELPERS DE UI
  // =========================================================================

  /**
   * Gera os badges HTML para as categorias de um aluno.
   * Retorna múltiplos badges se o aluno pertence a mais de uma categoria.
   */
  function renderCategoryBadges(user) {
    const cats = resolveUserCategories(user);
    const badges = [];

    if (isAdmin(user)) {
      badges.push(makeBadge("purple", "🔐", "ADMIN MESTRE"));
    }

    if (cats.includes(MEMBER_CATEGORIES.MENTORIA)) {
      badges.push(makeBadge("amber", "👑", "MENTORADO VIP"));
    }

    if (cats.includes(MEMBER_CATEGORIES.PAGO) && !cats.includes(MEMBER_CATEGORIES.MENTORIA)) {
      const bp = user.subscription?.billingPeriod || migrateTierToBillingPeriod(user.tier);
      const suffix = bp ? ` (${BILLING_LABELS[bp] || bp})` : "";
      badges.push(makeBadge("amber", "💰", `PAGO${suffix}`));
    }

    if (cats.includes(MEMBER_CATEGORIES.LEGADO_1)) {
      badges.push(makeBadge("amber", "📦", "LEGADO 1"));
    }

    if (cats.includes(MEMBER_CATEGORIES.LEGADO_2)) {
      badges.push(makeBadge("emerald", "📦", "LEGADO 2"));
    }

    // Se só tem member_free (e nenhum outro badge)
    if (badges.length === 0) {
      badges.push(makeBadge("slate", "🌱", "FREE"));
    }

    return badges.join(" ");
  }

  function makeBadge(color, emoji, text) {
    const colorMap = {
      purple:  "bg-purple-100 text-purple-900 border-purple-200",
      amber:   "bg-amber-100 text-amber-900 border-amber-300",
      emerald: "bg-emerald-50 text-emerald-900 border-emerald-300",
      slate:   "bg-slate-100 text-slate-600 border-slate-200",
      sky:     "bg-sky-100 text-sky-900 border-sky-200"
    };
    const classes = colorMap[color] || colorMap.slate;
    return `<span class="px-2 py-0.5 rounded-full ${classes} text-[10px] font-bold inline-flex items-center gap-0.5">${emoji} ${text}</span>`;
  }

  /**
   * Retorna o badge de tier para o portal/header do aluno (resumo de 1 linha)
   */
  function getPrimaryBadgeLabel(user) {
    if (isAdmin(user)) return "👑 Administrador";
    const cats = resolveUserCategories(user);
    if (cats.includes(MEMBER_CATEGORIES.MENTORIA)) return "👑 Mentorado VIP";
    if (cats.includes(MEMBER_CATEGORIES.PAGO)) {
      const bp = user.subscription?.billingPeriod || migrateTierToBillingPeriod(user.tier);
      return `🎓 Membro ${BILLING_LABELS[bp] || "Pago"}`;
    }
    if (cats.includes(MEMBER_CATEGORIES.LEGADO_1)) return "📦 Membro Legado MS";
    if (cats.includes(MEMBER_CATEGORIES.LEGADO_2)) return "📦 Membro Legado AEF";
    return "🌱 Aluno Free";
  }

  /**
   * Computa contagens de alunos por categoria (um aluno pode contar em múltiplas).
   */
  function computeCategoryCounts(students) {
    const counts = {
      total: 0,
      member_free: 0,
      member_pago: 0,
      member_mentoria: 0,
      legado_1: 0,
      legado_2: 0,
      admin: 0,
      pago_monthly: 0,
      pago_annual: 0,
      pago_lifetime: 0
    };

    students.forEach(s => {
      counts.total++;
      const cats = resolveUserCategories(s);

      if (isAdmin(s)) counts.admin++;
      if (cats.includes(MEMBER_CATEGORIES.MENTORIA)) counts.member_mentoria++;
      if (cats.includes(MEMBER_CATEGORIES.PAGO)) {
        counts.member_pago++;
        const bp = s.subscription?.billingPeriod || migrateTierToBillingPeriod(s.tier);
        if (bp === BILLING_PERIODS.MONTHLY) counts.pago_monthly++;
        else if (bp === BILLING_PERIODS.ANNUAL) counts.pago_annual++;
        else if (bp === BILLING_PERIODS.LIFETIME) counts.pago_lifetime++;
      }
      if (cats.includes(MEMBER_CATEGORIES.LEGADO_1)) counts.legado_1++;
      if (cats.includes(MEMBER_CATEGORIES.LEGADO_2)) counts.legado_2++;
      if (cats.includes(MEMBER_CATEGORIES.FREE) && cats.length === 1) counts.member_free++;
    });

    return counts;
  }

  /**
   * Filtra alunos por categoria (um aluno pode aparecer em múltiplos filtros).
   */
  function filterStudentsByCategory(students, categoryFilter) {
    if (categoryFilter === "all") return students;

    return students.filter(s => {
      if (categoryFilter === "admin") return isAdmin(s);
      const cats = resolveUserCategories(s);
      if (categoryFilter === "free_only") {
        // Apenas quem SÓ tem member_free (sem nenhum pago/legado/mentoria)
        return cats.length === 1 && cats[0] === MEMBER_CATEGORIES.FREE;
      }
      return cats.includes(categoryFilter);
    });
  }

  // =========================================================================
  // 5. EXPORT GLOBAL
  // =========================================================================

  const AEFAccessEngine = {
    // Constantes
    MEMBER_CATEGORIES,
    BILLING_PERIODS,
    PRODUCT_ACCESS_CATEGORIES,
    ROLES,
    CATEGORY_LABELS,
    BILLING_LABELS,

    // Core
    resolveUserCategories,
    resolveCourseCategories,
    hasAccess,
    hasModuleAccess,
    isAdmin,
    isSubscriptionActive,

    // Migração
    migrateTierToCategories,
    migrateTierToBillingPeriod,
    migrateTierRequiredToCategories,
    buildUserDocument,

    // UI Helpers
    renderCategoryBadges,
    getPrimaryBadgeLabel,
    computeCategoryCounts,
    filterStudentsByCategory
  };

  root.AEFAccessEngine = AEFAccessEngine;

})(typeof window !== "undefined" ? window : globalThis);
