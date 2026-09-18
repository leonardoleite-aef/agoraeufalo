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

    // Merge categories[] + legacyEntitlements[] — always use the full set
    const baseCats = Array.isArray(user.categories) ? user.categories : [];
    const legacyEnt = Array.isArray(user.legacyEntitlements) ? user.legacyEntitlements : [];
    const merged = Array.from(new Set([...baseCats, ...legacyEnt]));

    if (merged.length > 0) {
      // Garante member_free como base universal
      if (!merged.includes(MEMBER_CATEGORIES.FREE)) {
        merged.push(MEMBER_CATEGORIES.FREE);
      }
      return merged;
    }

    // Formato legado puro: mapear tier string → categories[]
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
  function hasAccess(user, course, now = new Date()) {
    if (!course) return false;

    // 1. Admin tem tudo
    if (isAdmin(user)) return true;

    // 2. Curso não publicado
    if (course.published === false || course.isPublished === false) return false;

    // Regra Estrita: Mentoria VIP é 100% individual e privada
    const isMentoria = (course.id && course.id.startsWith('mentoria-')) ||
                       course.accessTier === 'mentoria_vip' ||
                       course.tierRequired === 'vip' ||
                       (course.badge && course.badge.toUpperCase().includes('MENTORIA'));

    if (isMentoria) {
      if (isAdmin(user)) return true;
      const cleanEmail = (user?.email || '').toLowerCase().trim();
      const courseEmail = (course.studentEmail || '').toLowerCase().trim();
      const studentId = (user?.studentId || user?.id || user?.uid || user?.menteeSlug || '').toLowerCase().trim();
      const targetStudentId = (course.studentId || '').toLowerCase().trim();

      const enrolled = user?.enrolledProducts || [];
      const purchased = user?.purchasedProducts || [];
      const ownsMentoria = (Array.isArray(enrolled) && enrolled.includes(course.id)) ||
        (Array.isArray(purchased) && purchased.some(p => (typeof p === 'string' ? p === course.id : (p.courseId === course.id || p.productId === course.id))));
      if (ownsMentoria) return true;
      if (targetStudentId && studentId && (studentId === targetStudentId || studentId.includes(targetStudentId) || targetStudentId.includes(studentId))) return true;
      if (courseEmail && cleanEmail && cleanEmail === courseEmail) return true;

      return false;
    }

    // 3. Compra avulsa ou matrícula direta (V1 string ou V2 PurchasedProduct object)
    const purchased = user?.purchasedProducts || [];
    const enrolled = user?.enrolledProducts || [];
    const ownsProduct = (Array.isArray(enrolled) && (enrolled.includes(course.id) || enrolled.includes('all_access_master'))) ||
      (Array.isArray(purchased) && purchased.some(p => {
        if (typeof p === 'string') {
          return p === course.id || p === 'all_access_master' || (course.access && Array.isArray(course.access.requiresProductId) && course.access.requiresProductId.includes(p));
        }
        if (p && typeof p === 'object') {
          const cId = p.courseId || p.productId;
          const pId = p.productId;
          return cId === course.id ||
                 (course.access && Array.isArray(course.access.requiresProductId) && course.access.requiresProductId.includes(pId)) ||
                 (course.productId && (pId === course.productId || cId === course.productId));
        }
        return false;
      }));
    if (ownsProduct) return true;

    // 4. Resolve e filtra categorias ativas do aluno
    let userCats = resolveUserCategories(user);

    // Suporte a subscriptions V2 e legacyEntitlements
    if (Array.isArray(user?.subscriptions)) {
      user.subscriptions.forEach(s => {
        if (s && isSingleSubscriptionActive(s, now) && s.entitlement) {
          if (!userCats.includes(s.entitlement)) userCats.push(s.entitlement);
        }
      });
    }
    if (Array.isArray(user?.legacyEntitlements)) {
      user.legacyEntitlements.forEach(e => {
        if (!userCats.includes(e)) userCats.push(e);
      });
    }

    // Se não tiver assinatura ativa nem direito legado permanente, remove 'member_pago' e 'member_mentoria'
    if (userCats.includes(MEMBER_CATEGORIES.PAGO) || userCats.includes(MEMBER_CATEGORIES.MENTORIA)) {
      const hasActiveSub = isSubscriptionActive(user, now);
      const hasLegacyPago = Array.isArray(user?.legacyEntitlements) && user.legacyEntitlements.includes(MEMBER_CATEGORIES.PAGO);
      const hasLegacyMentoria = Array.isArray(user?.legacyEntitlements) && user.legacyEntitlements.includes(MEMBER_CATEGORIES.MENTORIA);

      if (!hasActiveSub) {
        if (!hasLegacyPago) userCats = userCats.filter(c => c !== MEMBER_CATEGORIES.PAGO);
        if (!hasLegacyMentoria) userCats = userCats.filter(c => c !== MEMBER_CATEGORIES.MENTORIA);
      }
    }

    // 5. Verifica o Modelo de Acesso do Curso (Nova Taxonomia)
    if (course.accessTier) {
      if (course.accessTier === 'free') return true;
      if (course.accessTier === 'all_access') {
        let allowedCats = [MEMBER_CATEGORIES.PAGO, MEMBER_CATEGORIES.MENTORIA];
        if (course.access && Array.isArray(course.access.entitlements) && course.access.entitlements.length > 0) {
          allowedCats = course.access.entitlements;
        } else if (course.legacyGrants) {
          allowedCats = allowedCats.concat(course.legacyGrants);
        } else {
          // Fallback para manter o acesso até o curso ser salvo novamente no painel
          allowedCats.push(MEMBER_CATEGORIES.LEGADO_1, MEMBER_CATEGORIES.LEGADO_2);
        }
        return userCats.some(cat => allowedCats.includes(cat));
      }
      if (course.accessTier === 'standalone') {
        // Se for standalone, checa se tem exceção de legado ou access.entitlements
        if (course.access && Array.isArray(course.access.entitlements) && course.access.entitlements.length > 0) {
          if (userCats.some(cat => course.access.entitlements.includes(cat))) return true;
        }
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
    // When checking a specific user object, evaluate only that user's own data
    if (user) {
      const userEmail = (user.email || '').toLowerCase().trim();
      return user.role === ROLES.ADMIN ||
             user.role === 'admin' ||
             user.tier === 'admin_master' ||
             (Array.isArray(user.categories) && user.categories.includes('admin')) ||
             userEmail === 'selexenglish@gmail.com';
    }

    // No user passed = check if current session user is admin
    if (typeof window !== 'undefined' && window.aefPortalAuth && typeof window.aefPortalAuth.isAdmin === 'function') {
      if (window.aefPortalAuth.isAdmin()) return true;
    }
    if (typeof localStorage !== 'undefined') {
      const cachedRole = localStorage.getItem('aef_user_role');
      const cachedTier = localStorage.getItem('aef_user_tier');
      const cachedEmail = (localStorage.getItem('aef_user_email') || '').toLowerCase().trim();
      if (cachedRole === 'admin' || cachedTier === 'admin_master' || cachedEmail === 'selexenglish@gmail.com') {
        return true;
      }
    }
    return false;
  }

  /**
   * Verifica se uma assinatura individual está ativa na data de referência
   */
  function isSingleSubscriptionActive(sub, now = new Date()) {
    if (!sub || typeof sub !== 'object') return false;
    if (sub.billingPeriod === BILLING_PERIODS.LIFETIME) return true;
    switch (sub.status) {
      case 'revoked':
      case 'canceled_immediate':
        return false;
      case 'active':
        return !sub.expiresAt || new Date(sub.expiresAt) > now;
      case 'overdue_grace_period':
      case 'canceled_grace':
      case 'grace': {
        const validUntil = sub.graceUntil || sub.expiresAt;
        return !!validUntil && new Date(validUntil) > now;
      }
      default:
        return false;
    }
  }

  /**
   * Verifica se a assinatura do aluno está ativa
   */
  function isSubscriptionActive(user, now = new Date()) {
    if (!user) return false;

    // Formato V2 (subscriptions array)
    if (Array.isArray(user.subscriptions)) {
      if (user.subscriptions.length === 0) return false;
      return user.subscriptions.some(s => isSingleSubscriptionActive(s, now));
    }

    // Formato V1 (subscription objeto único)
    if (user.subscription) {
      return isSingleSubscriptionActive(user.subscription, now);
    }

    // Formato legado
    const sub = user.subscriptionState;
    if (!sub) return true; // sem info de assinatura = ativo por default
    return isSingleSubscriptionActive(sub, now);
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
  // isUserAdmin: verifica APENAS o objeto do aluno — nunca a sessão atual.
  // Usar em renderizações de lista para evitar session-bleed.
  function isUserAdmin(u) {
    if (!u) return false;
    const email = (u.email || '').toLowerCase().trim();
    return u.role === 'admin' || u.tier === 'admin_master' ||
           (Array.isArray(u.categories) && u.categories.includes('admin')) ||
           email === 'selexenglish@gmail.com';
  }

  function renderCategoryBadges(user) {
    const cats = resolveUserCategories(user);
    const badges = [];

    if (isUserAdmin(user)) {
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
    if (isUserAdmin(user)) return "👑 Administrador";
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

      if (isUserAdmin(s)) counts.admin++;
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
  // 4.1. ADAPTADORES DE DADOS V2 (FASE 2)
  // =========================================================================

  function normalizeCourse(raw) {
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

    const id = String(raw.id || raw.slug || "course_" + Date.now());
    const title = String(raw.title || id);
    const slug = raw.slug ? String(raw.slug) : id;
    const isPublished = raw.published !== false && raw.isPublished !== false;

    let accessTier = "all_access";
    if (raw.accessTier === "free" || raw.tierRequired === "free" || (raw.badge && raw.badge.toUpperCase().includes("GRÁTIS"))) {
      accessTier = "free";
    } else if (raw.accessTier === "standalone" || raw.accessTier === "venda_avulsa") {
      accessTier = "standalone";
    } else if (raw.accessTier === "all_access" || raw.accessTier === "club") {
      accessTier = "all_access";
    } else if (raw.accessTier === "mentoria_vip" || id.startsWith("mentoria-")) {
      accessTier = "standalone";
    }

    let access = {
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
      if (accessTier === "free") {
        access.entitlements = ["member_free", "member_pago"];
      } else if (accessTier === "all_access") {
        access.entitlements = ["member_pago"];
        if (Array.isArray(raw.legacyGrants)) {
          raw.legacyGrants.forEach(lg => {
            if (!access.entitlements.includes(lg)) access.entitlements.push(lg);
            access.legacyGrantIds.push(lg);
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
        raw.accessCategories.forEach(cat => {
          if (!access.entitlements.includes(cat)) access.entitlements.push(cat);
        });
      }
    }

    access.entitlements = Array.from(new Set(access.entitlements));
    access.requiresProductId = Array.from(new Set(access.requiresProductId));
    access.legacyGrantIds = Array.from(new Set(access.legacyGrantIds));

    return {
      ...raw,
      schemaVersion: 2,
      id,
      title,
      slug,
      accessTier,
      access,
      isPublished
    };
  }

  function normalizeUser(raw) {
    if (!raw) {
      return {
        schemaVersion: 2,
        id: "anonymous",
        uid: "anonymous",
        email: "",
        name: "Aluno AgoraEuFalo",
        role: "student",
        tier: "free",
        categories: ["member_free"],
        subscriptions: [],
        purchasedProducts: [],
        legacyEntitlements: ["member_free"],
        enrolledProducts: []
      };
    }

    const email = (raw.email || "").toLowerCase().trim();
    const uid = String(raw.uid || raw.id || (email ? email.replace(/[^a-zA-Z0-9]/g, "_") : "user"));
    const id = String(raw.id || uid);
    const name = String(raw.name || raw.displayName || (email ? email.split("@")[0] : "Aluno AgoraEuFalo"));

    let role = "student";
    if (raw.role === "admin" || raw.tier === "admin_master" || (Array.isArray(raw.categories) && raw.categories.includes("admin")) || email === "selexenglish@gmail.com") {
      role = "admin";
    } else if (raw.role === "moderator") {
      role = "moderator";
    }

    const legacyEntitlementsSet = new Set(["member_free"]);
    if (Array.isArray(raw.legacyEntitlements)) {
      raw.legacyEntitlements.forEach(e => legacyEntitlementsSet.add(e));
    }
    if (Array.isArray(raw.categories)) {
      raw.categories.forEach(cat => {
        if (cat === "legado_1" || cat === "legado_2" || cat === "member_free") {
          legacyEntitlementsSet.add(cat);
        }
      });
    }
    if (
      raw.tier === "ms_legacy" ||
      raw.category === "magic_stories_legacy" ||
      raw.legacyCategoria === "magic_stories_legacy" ||
      (Array.isArray(raw.enrolledProducts) && raw.enrolledProducts.includes("ms-legacy") &&
        !raw.enrolledProducts.some(p => ["mentoria-andre", "mentoria-estevaopin", "mentoria_vip"].includes(p)))
    ) {
      legacyEntitlementsSet.add("legado_1");
    } else if (
      raw.tier === "primeiro_legado" ||
      raw.category === "primeiro_legado_agoraeufalo" ||
      raw.legacyCategoria === "agoraeufalo_primeiro_legado" ||
      (Array.isArray(raw.enrolledProducts) && raw.enrolledProducts.includes("first-steps") &&
        !raw.enrolledProducts.some(p => ["mentoria-andre", "mentoria-estevaopin", "mentoria_vip"].includes(p)))
    ) {
      legacyEntitlementsSet.add("legado_2");
    }

    const subscriptions = [];
    if (Array.isArray(raw.subscriptions) && raw.subscriptions.length > 0) {
      raw.subscriptions.forEach((s, idx) => {
        if (s && typeof s === "object") {
          subscriptions.push({
            id: String(s.id || `sub_${uid}_${idx}`),
            entitlement: s.entitlement || (s.productId === "PROJETO_AEF_2026" || s.productId === "MENTORIA_VIP" ? "member_mentoria" : "member_pago"),
            productId: String(s.productId || "8460579"),
            billingPeriod: s.billingPeriod || "annual",
            status: s.status || "active",
            expiresAt: s.expiresAt || null,
            graceUntil: s.graceUntil || null,
            gateway: s.gateway || "hotmart",
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
        entitlement: s.entitlement || (isMentoria ? "member_mentoria" : "member_pago"),
        productId: String(s.productId || (isMentoria ? "PROJETO_AEF_2026" : "8460579")),
        billingPeriod: s.billingPeriod || "annual",
        status: s.status || "active",
        expiresAt: s.expiresAt || null,
        graceUntil: s.graceUntil || null,
        gateway: s.gateway || "hotmart",
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

    const purchasedProducts = [];
    if (Array.isArray(raw.purchasedProducts)) {
      raw.purchasedProducts.forEach((p, idx) => {
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
            gateway: p.gateway || "hotmart",
            transactionId: String(p.transactionId || `tx_${idx}`)
          });
        }
      });
    }

    if (Array.isArray(raw.enrolledProducts)) {
      raw.enrolledProducts.forEach((ep, idx) => {
        const alreadyPurchased = purchasedProducts.some(p => p.courseId === ep || p.productId === ep);
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
      ...raw,
      schemaVersion: 2,
      id,
      uid,
      email,
      name,
      role,
      tier: raw.tier || "free",
      categories: Array.from(new Set([
        ...(Array.isArray(raw.categories) ? raw.categories : []),
        ...legacyEntitlementsSet
      ])),
      subscriptions,
      purchasedProducts,
      legacyEntitlements: Array.from(legacyEntitlementsSet),
      enrolledProducts: Array.isArray(raw.enrolledProducts) ? raw.enrolledProducts : [],
      legacy: {
        tier: raw.tier,
        enrolledProducts: raw.enrolledProducts,
        categories: raw.categories,
        subscription: raw.subscription,
        role: raw.role
      }
    };
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

    // Adaptadores V2 (Fase 2)
    normalizeCourse,
    normalizeUser,
    normalizeCourseToV2: normalizeCourse,
    normalizeUserToV2: normalizeUser,

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

  // Direct global bindings to ensure global availability without local shadowing
  root.resolveCourseCategories = resolveCourseCategories;
  root.resolveUserCategories = resolveUserCategories;
  root.hasAccess = hasAccess;
  root.hasModuleAccess = hasModuleAccess;
  root.isAdmin = isAdmin;
  root.isSubscriptionActive = isSubscriptionActive;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = AEFAccessEngine;
  }

})(typeof window !== "undefined" ? window : globalThis);

