/**
 * AgoraEuFalo Ecosystem - Differential Access Test Suite
 * Professor Leonardo Leite
 * 
 * Bateria de testes diferenciais comparando rigorosamente:
 * 1. hasAccess(user, course, now) de src/types/core.ts (motor TypeScript canônico V2)
 * 2. AEFAccessEngine.hasAccess(user, course, now) de assets/js/aef-access-engine.js (motor client-side)
 *
 * Garante ZERO divergência booleana entre os dois motores de autorização.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  hasAccess as hasAccessCore,
  type AEFUser,
  type AEFCourse,
  type Subscription,
  type PurchasedProduct
} from '../../src/types/core.ts';
// @ts-expect-error importação de módulo CJS no runner ESM/TS
import AEFAccessEngine from '../../assets/js/aef-access-engine.js';

describe('Bateria de Testes Diferenciais de Acesso (src/types/core.ts vs assets/js/aef-access-engine.js)', () => {
  const referenceDate = new Date('2026-09-18T12:00:00Z');
  const futureDate = new Date('2026-10-18T12:00:00Z').toISOString();
  const pastDate = new Date('2026-08-18T12:00:00Z').toISOString();

  // Helper para criar usuário mock padrão
  function createTestUser(overrides: Partial<AEFUser> = {}): AEFUser {
    return {
      schemaVersion: 2,
      id: 'usr_differential_test',
      uid: 'uid_diff_123',
      email: 'aluno@agoraeufalo.com.br',
      name: 'Aluno Teste Diferencial',
      role: 'student',
      subscriptions: [],
      purchasedProducts: [],
      legacyEntitlements: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      ...overrides
    };
  }

  // Helper para criar curso mock padrão
  function createTestCourse(overrides: Partial<AEFCourse> = {}): AEFCourse {
    return {
      schemaVersion: 2,
      id: 'magic-stories-vol-1',
      title: 'Magic Stories Vol. 1',
      categories: ['magic_stories'],
      accessTier: 'all_access',
      access: {
        entitlements: ['member_pago']
      },
      isPublished: true,
      published: true,
      ...overrides
    };
  }

  /**
   * Helper que executa ambos os motores e valida:
   * 1. Que o resultado de core é igual ao esperado.
   * 2. Que o resultado do AEFAccessEngine é igual ao esperado.
   * 3. Que não existe divergência entre os dois (core === engine).
   */
  function assertDifferentialParity(
    user: AEFUser,
    course: AEFCourse,
    expected: boolean,
    now: Date = referenceDate,
    contextMessage: string = ''
  ) {
    const resCore = hasAccessCore(user, course, now);
    const resEngine = AEFAccessEngine.hasAccess(user, course, now);

    assert.strictEqual(
      resCore,
      expected,
      `[CORE TS ENGINE FALHOU] ${contextMessage} - esperado: ${expected}, recebido: ${resCore}`
    );
    assert.strictEqual(
      resEngine,
      expected,
      `[CLIENT JS ENGINE FALHOU] ${contextMessage} - esperado: ${expected}, recebido: ${resEngine}`
    );
    assert.strictEqual(
      resCore,
      resEngine,
      `[DIVERGÊNCIA BOOLEANA DETECTADA] ${contextMessage} - Core TS: ${resCore}, Engine JS: ${resEngine}`
    );
  }

  // =========================================================================
  // 1. PERSONA: MEMBER_FREE
  // =========================================================================
  describe('Persona 1: Aluno Gratuito (member_free)', () => {
    const freeUser = createTestUser({
      role: 'student',
      tier: 'free',
      categories: ['member_free'],
      legacyEntitlements: ['member_free'],
      subscriptions: []
    });

    const freeCourse = createTestCourse({
      id: 'dates-and-times-free',
      title: 'Dates & Times (Degustação)',
      accessTier: 'free',
      access: { entitlements: ['member_free', 'member_pago'] }
    });

    const allAccessCourse = createTestCourse({
      id: 'magic-stories-vol-1',
      title: 'Magic Stories Vol. 1',
      accessTier: 'all_access',
      access: { entitlements: ['member_pago'] }
    });

    const standaloneCourse = createTestCourse({
      id: 'masterclass-avulsa',
      title: 'Masterclass Pronúncia Definitiva',
      accessTier: 'standalone',
      access: { entitlements: [], requiresProductId: ['PROD_AVULSO_1'] }
    });

    it('deve autorizar member_free em cursos do tipo free (True em ambos)', () => {
      assertDifferentialParity(freeUser, freeCourse, true, referenceDate, 'member_free vs curso free');
    });

    it('deve negar member_free em cursos all_access do Club (False em ambos)', () => {
      assertDifferentialParity(freeUser, allAccessCourse, false, referenceDate, 'member_free vs curso all_access');
    });

    it('deve negar member_free em cursos standalone não adquiridos (False em ambos)', () => {
      assertDifferentialParity(freeUser, standaloneCourse, false, referenceDate, 'member_free vs curso standalone');
    });
  });

  // =========================================================================
  // 2. PERSONA: MEMBER_PAGO ATIVO
  // =========================================================================
  describe('Persona 2: Aluno Assinante Ativo (member_pago)', () => {
    const activeSub: Subscription = {
      id: 'sub_paid_active',
      productId: '8460579',
      billingPeriod: 'annual',
      status: 'active',
      expiresAt: futureDate,
      graceUntil: null,
      gateway: 'hotmart',
      lastEventId: 'evt_act_01',
      updatedAt: '2026-09-01T00:00:00Z',
      entitlement: 'member_pago'
    };

    const paidUser = createTestUser({
      role: 'student',
      tier: 'club_annual',
      categories: ['member_free', 'member_pago'],
      subscriptions: [activeSub]
    });

    const freeCourse = createTestCourse({
      id: 'dates-and-times-free',
      accessTier: 'free',
      access: { entitlements: ['member_free', 'member_pago'] }
    });

    const allAccessCourse = createTestCourse({
      id: 'magic-stories-vol-1',
      accessTier: 'all_access',
      access: { entitlements: ['member_pago'] }
    });

    const standaloneCourse = createTestCourse({
      id: 'masterclass-avulsa',
      accessTier: 'standalone',
      access: { entitlements: [], requiresProductId: ['PROD_AVULSO_1'] }
    });

    it('deve autorizar member_pago ativo em cursos free (True em ambos)', () => {
      assertDifferentialParity(paidUser, freeCourse, true, referenceDate, 'member_pago ativo vs curso free');
    });

    it('deve autorizar member_pago ativo em cursos all_access (True em ambos)', () => {
      assertDifferentialParity(paidUser, allAccessCourse, true, referenceDate, 'member_pago ativo vs curso all_access');
    });

    it('deve negar member_pago ativo em cursos standalone não comprados (False em ambos)', () => {
      assertDifferentialParity(paidUser, standaloneCourse, false, referenceDate, 'member_pago ativo vs curso standalone sem compra');
    });
  });

  // =========================================================================
  // 3. PERSONA: ASSINATURA EXPIRADA VS PERÍODO DE TOLERÂNCIA (GRACE PERIOD)
  // =========================================================================
  describe('Persona 3: Assinatura Expirada vs Período de Tolerância (Grace Period)', () => {
    const allAccessCourse = createTestCourse({
      id: 'magic-stories-vol-1',
      accessTier: 'all_access',
      access: { entitlements: ['member_pago'] }
    });

    it('deve negar acesso em all_access quando a assinatura estiver expirada no passado (False em ambos)', () => {
      const expiredSub: Subscription = {
        id: 'sub_expired',
        productId: '8460579',
        billingPeriod: 'annual',
        status: 'active',
        expiresAt: pastDate, // Expirou no mês anterior
        graceUntil: null,
        gateway: 'hotmart',
        lastEventId: 'evt_exp_01',
        updatedAt: '2026-08-18T00:00:00Z',
        entitlement: 'member_pago'
      };

      const expiredUser = createTestUser({
        role: 'student',
        categories: ['member_free', 'member_pago'],
        subscriptions: [expiredSub]
      });

      assertDifferentialParity(expiredUser, allAccessCourse, false, referenceDate, 'assinatura expirada vs all_access');
    });

    it('deve autorizar acesso quando a assinatura estiver em período de tolerância (overdue_grace_period) no futuro (True em ambos)', () => {
      const graceSub: Subscription = {
        id: 'sub_in_grace',
        productId: '8460579',
        billingPeriod: 'annual',
        status: 'overdue_grace_period',
        expiresAt: pastDate,
        graceUntil: futureDate, // Tolerância válida até o mês que vem
        gateway: 'hotmart',
        lastEventId: 'evt_grace_01',
        updatedAt: '2026-09-15T00:00:00Z',
        entitlement: 'member_pago'
      };

      const graceUser = createTestUser({
        role: 'student',
        categories: ['member_free', 'member_pago'],
        subscriptions: [graceSub]
      });

      assertDifferentialParity(graceUser, allAccessCourse, true, referenceDate, 'overdue_grace_period vs all_access');
    });

    it('deve autorizar acesso quando a assinatura foi cancelada mas ainda está em período pago (canceled_grace) no futuro (True em ambos)', () => {
      const canceledGraceSub: Subscription = {
        id: 'sub_canceled_grace',
        productId: '8460579',
        billingPeriod: 'annual',
        status: 'canceled_grace',
        expiresAt: futureDate,
        graceUntil: futureDate,
        gateway: 'hotmart',
        lastEventId: 'evt_canc_grace_01',
        updatedAt: '2026-09-10T00:00:00Z',
        entitlement: 'member_pago'
      };

      const user = createTestUser({
        role: 'student',
        categories: ['member_free', 'member_pago'],
        subscriptions: [canceledGraceSub]
      });

      assertDifferentialParity(user, allAccessCourse, true, referenceDate, 'canceled_grace vs all_access');
    });

    it('deve revogar imediatamente acesso com status revoked ou canceled_immediate (False em ambos)', () => {
      const revokedSub: Subscription = {
        id: 'sub_revoked',
        productId: '8460579',
        billingPeriod: 'annual',
        status: 'revoked',
        expiresAt: futureDate,
        graceUntil: futureDate,
        gateway: 'hotmart',
        lastEventId: 'evt_revoked_01',
        updatedAt: '2026-09-18T00:00:00Z',
        entitlement: 'member_pago'
      };

      const user = createTestUser({
        role: 'student',
        categories: ['member_free', 'member_pago'],
        subscriptions: [revokedSub]
      });

      assertDifferentialParity(user, allAccessCourse, false, referenceDate, 'revoked status vs all_access');
    });
  });

  // =========================================================================
  // 4. PERSONA: MEMBER_MENTORIA & ISOLAMENTO PRIVADO VIP
  // =========================================================================
  describe('Persona 4: Aluno de Mentoria VIP e Regra Estrita de Isolamento Individual', () => {
    // Curso VIP do André
    const mentoriaAndreCourse = createTestCourse({
      id: 'mentoria-andre',
      title: 'Mentoria VIP • André',
      accessTier: 'standalone',
      studentId: 'andre',
      studentEmail: 'andre@exemplo.com',
      badge: '👑 MENTORIA VIP',
      access: { entitlements: ['member_mentoria'], requiresProductId: ['MENTORIA_VIP'] }
    });

    // Aluno André (legítimo dono)
    const andreUser = createTestUser({
      id: 'usr_andre',
      studentId: 'andre',
      email: 'andre@exemplo.com',
      role: 'student',
      categories: ['member_free', 'member_mentoria'],
      enrolledProducts: ['mentoria-andre'],
      subscriptions: [{
        id: 'sub_andre_vip',
        productId: 'PROJETO_AEF_2026',
        billingPeriod: 'annual',
        status: 'active',
        expiresAt: futureDate,
        graceUntil: null,
        gateway: 'hotmart',
        lastEventId: 'evt_andre',
        updatedAt: '2026-09-01T00:00:00Z',
        entitlement: 'member_mentoria'
      }]
    });

    // Aluno Estêvão (outro aluno VIP)
    const estevaoUser = createTestUser({
      id: 'usr_estevao',
      studentId: 'estevao',
      email: 'estevao@exemplo.com',
      role: 'student',
      categories: ['member_free', 'member_mentoria'],
      enrolledProducts: ['mentoria-estevaopin'],
      subscriptions: [{
        id: 'sub_estevao_vip',
        productId: 'PROJETO_AEF_2026',
        billingPeriod: 'annual',
        status: 'active',
        expiresAt: futureDate,
        graceUntil: null,
        gateway: 'hotmart',
        lastEventId: 'evt_estevao',
        updatedAt: '2026-09-01T00:00:00Z',
        entitlement: 'member_mentoria'
      }]
    });

    // Aluno comum Free
    const freeUser = createTestUser({
      email: 'free@exemplo.com',
      role: 'student',
      categories: ['member_free']
    });

    it('deve autorizar o aluno VIP ao seu próprio curso de mentoria (True em ambos)', () => {
      assertDifferentialParity(andreUser, mentoriaAndreCourse, true, referenceDate, 'André acessando mentoria-andre');
    });

    it('DEVE NEGAR categoricamente outro aluno VIP tentando acessar mentoria de terceiro (False em ambos)', () => {
      assertDifferentialParity(
        estevaoUser,
        mentoriaAndreCourse,
        false,
        referenceDate,
        'Estêvão (member_mentoria) tentando acessar mentoria-andre'
      );
    });

    it('deve negar aluno gratuito tentando acessar mentoria VIP (False em ambos)', () => {
      assertDifferentialParity(
        freeUser,
        mentoriaAndreCourse,
        false,
        referenceDate,
        'Aluno free tentando acessar mentoria-andre'
      );
    });
  });

  // =========================================================================
  // 5. PERSONA: COMPRADOR AVULSO (STANDALONE PURCHASER)
  // =========================================================================
  describe('Persona 5: Comprador Avulso de Produto (purchasedProducts[])', () => {
    const standaloneCourseA = createTestCourse({
      id: 'standalone-dates-masterclass',
      title: 'Masterclass Dates & Numbers',
      accessTier: 'standalone',
      productId: 'PROD_DATES_01',
      access: { entitlements: [], requiresProductId: ['PROD_DATES_01'] }
    });

    const standaloneCourseB = createTestCourse({
      id: 'standalone-interviews',
      title: 'Masterclass Job Interviews',
      accessTier: 'standalone',
      productId: 'PROD_INTERVIEWS_02',
      access: { entitlements: [], requiresProductId: ['PROD_INTERVIEWS_02'] }
    });

    const purchaserUser = createTestUser({
      role: 'student',
      categories: ['member_free'],
      purchasedProducts: [
        {
          productId: 'PROD_DATES_01',
          courseId: 'standalone-dates-masterclass',
          purchasedAt: '2026-09-01T00:00:00Z',
          gateway: 'hotmart',
          transactionId: 'tx_dates_999'
        }
      ]
    });

    it('deve autorizar o comprador no curso standalone correspondente adquirido (True em ambos)', () => {
      assertDifferentialParity(purchaserUser, standaloneCourseA, true, referenceDate, 'Comprador no curso standalone adquirido');
    });

    it('deve negar o comprador em outro curso standalone não adquirido (False em ambos)', () => {
      assertDifferentialParity(purchaserUser, standaloneCourseB, false, referenceDate, 'Comprador em outro curso standalone não comprado');
    });
  });

  // =========================================================================
  // 6. PERSONA: ADMINISTRADOR IRRESTRITO
  // =========================================================================
  describe('Persona 6: Administrador Irrestrito (Role Admin / E-mail do Leo)', () => {
    const adminUser = createTestUser({
      role: 'admin',
      email: 'selexenglish@gmail.com',
      name: 'Professor Leonardo Leite'
    });

    const freeCourse = createTestCourse({ id: 'free-c', accessTier: 'free' });
    const allAccessCourse = createTestCourse({ id: 'club-c', accessTier: 'all_access' });
    const standaloneCourse = createTestCourse({ id: 'stand-c', accessTier: 'standalone' });
    const mentoriaPrivateCourse = createTestCourse({
      id: 'mentoria-andre',
      accessTier: 'standalone',
      studentId: 'andre',
      studentEmail: 'andre@exemplo.com'
    });
    const unpublishedCourse = createTestCourse({
      id: 'curso-rascunho',
      isPublished: false,
      published: false
    });

    it('deve conceder acesso irrestrito ao Admin em qualquer curso (True em ambos)', () => {
      assertDifferentialParity(adminUser, freeCourse, true, referenceDate, 'Admin vs Free Course');
      assertDifferentialParity(adminUser, allAccessCourse, true, referenceDate, 'Admin vs All Access Course');
      assertDifferentialParity(adminUser, standaloneCourse, true, referenceDate, 'Admin vs Standalone Course');
      assertDifferentialParity(adminUser, mentoriaPrivateCourse, true, referenceDate, 'Admin vs Mentoria VIP de Aluno');
      assertDifferentialParity(adminUser, unpublishedCourse, true, referenceDate, 'Admin vs Curso Não Publicado');
    });

    it('deve negar usuário não-admin em cursos não publicados (False em ambos)', () => {
      const activePaidUser = createTestUser({
        role: 'student',
        categories: ['member_free', 'member_pago'],
        subscriptions: [{
          id: 'sub_paid',
          productId: '8460579',
          billingPeriod: 'annual',
          status: 'active',
          expiresAt: futureDate,
          graceUntil: null,
          gateway: 'hotmart',
          lastEventId: 'evt_act',
          updatedAt: '2026-09-01T00:00:00Z',
          entitlement: 'member_pago'
        }]
      });

      assertDifferentialParity(activePaidUser, unpublishedCourse, false, referenceDate, 'Aluno Ativo vs Curso Não Publicado');
    });
  });
});
