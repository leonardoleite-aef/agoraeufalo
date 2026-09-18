/**
 * AgoraEuFalo Ecosystem - Firestore V2 Migration & Externalized Config Test Suite
 * Professor Leonardo Leite
 * 
 * Validação rigorosa dos scripts de migração V2, auditoria de usuários e
 * externalização de configurações comerciais e de VIPs.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// @ts-expect-error importação de módulo JS no runner de testes
import { buildV2CourseFields } from '../../scripts/migrate_courses_v2.js';
// @ts-expect-error importação de módulo JS no runner de testes
import { PRODUCT_MAPPINGS_DATA, VIP_OVERRIDES_DATA } from '../../scripts/seed_config_docs.js';
// @ts-expect-error importação de módulo JS no runner de testes
import {
  getDynamicProductMappings,
  getDynamicVipOverrides,
  isEmailAdmin,
  PRODUCT_CATEGORY_MAPPING,
  normalizeUserV2
} from '../../cloudflare-worker/worker.js';

describe('Suite de Testes de Migração Firestore V2 & Externalização de Configurações', () => {

  describe('1. Normalização e Contrato V2 de Cursos (buildV2CourseFields)', () => {
    it('deve gerar AccessGrant V2 correto para curso gratuito (dtc_curso)', () => {
      const course = {
        id: 'dtc_curso',
        title: 'Dates and Times - Curso Rápido',
        published: true
      };
      const v2 = buildV2CourseFields(course);
      assert.strictEqual(v2.schemaVersion, 2);
      assert.strictEqual(v2.accessTier, 'free');
      assert.ok(Array.isArray(v2.access.entitlements));
      assert.ok(v2.access.entitlements.includes('member_free'));
      assert.ok(v2.access.entitlements.includes('member_pago'));
      assert.deepStrictEqual(v2.access.requiresProductId, []);
      assert.strictEqual(v2.isPublished, true);
    });

    it('deve gerar AccessGrant V2 correto para curso all_access (ms-legacy)', () => {
      const course = {
        id: 'ms-legacy',
        title: 'Magic Stories Legacy',
        published: true
      };
      const v2 = buildV2CourseFields(course);
      assert.strictEqual(v2.schemaVersion, 2);
      assert.strictEqual(v2.accessTier, 'all_access');
      assert.deepStrictEqual(v2.access.entitlements, ['member_pago']);
      assert.deepStrictEqual(v2.access.requiresProductId, []);
    });

    it('deve gerar AccessGrant V2 correto para produto avulso (airport_flight_level_1)', () => {
      const course = {
        id: 'airport_flight_level_1',
        title: 'Aeroportos e Vôos',
        published: true
      };
      const v2 = buildV2CourseFields(course);
      assert.strictEqual(v2.schemaVersion, 2);
      assert.strictEqual(v2.accessTier, 'standalone');
      assert.ok(v2.access.entitlements.includes('venda_avulsa'));
      assert.ok(v2.access.requiresProductId.includes('airport_flight_level_1'));
    });

    it('deve gerar AccessGrant V2 correto para cursos de mentoria VIP', () => {
      const course = {
        id: 'mentoria-andre',
        title: 'Mentoria VIP • André Barrote',
        published: true
      };
      const v2 = buildV2CourseFields(course);
      assert.strictEqual(v2.schemaVersion, 2);
      assert.strictEqual(v2.accessTier, 'standalone');
      assert.ok(v2.access.entitlements.includes('member_mentoria'));
      assert.ok(v2.access.requiresProductId.includes('mentoria-andre'));
      assert.ok(v2.access.requiresProductId.includes('PROJETO_AEF_2026'));
      assert.ok(v2.access.requiresProductId.includes('MENTORIA_VIP'));
    });
  });

  describe('2. Integridade dos Documentos de Configuração Externalizados', () => {
    it('config/productMappings deve cobrir todos os produtos comerciais ativos', () => {
      assert.strictEqual(PRODUCT_MAPPINGS_DATA.schemaVersion, 2);
      const mappings = PRODUCT_MAPPINGS_DATA.mappings;
      assert.ok(mappings['8460579'], 'Deve conter produto principal do Club');
      assert.ok(mappings['PROJETO_AEF_2026'], 'Deve conter Mentoria VIP 2026');
      assert.ok(mappings['airport_flight_level_1'], 'Deve conter curso avulso');

      // Validação de estrutura em cada mapping
      for (const [prodId, map] of Object.entries(mappings)) {
        assert.ok(map.productId, `Mapping ${prodId} deve ter productId`);
        assert.ok(map.entitlement, `Mapping ${prodId} deve ter entitlement`);
        assert.ok(Array.isArray(map.categories), `Mapping ${prodId} deve ter categories[]`);
        assert.ok(Array.isArray(map.enrolledProducts), `Mapping ${prodId} deve ter enrolledProducts[]`);
      }
    });

    it('config/vipOverrides deve conter superadmins e mentorados VIP', () => {
      assert.strictEqual(VIP_OVERRIDES_DATA.schemaVersion, 2);
      assert.ok(Array.isArray(VIP_OVERRIDES_DATA.adminEmails));
      assert.ok(VIP_OVERRIDES_DATA.adminEmails.includes('selexenglish@gmail.com'));
      assert.ok(VIP_OVERRIDES_DATA.adminEmails.includes('leonardo@agoraeufalo.com.br'));

      assert.ok(Array.isArray(VIP_OVERRIDES_DATA.vipEmails));
      assert.ok(VIP_OVERRIDES_DATA.vipEmails.includes('andrebarrote1992@gmail.com'));
      assert.ok(VIP_OVERRIDES_DATA.vipEmails.includes('estevaopin@gmail.com'));

      const overrides = VIP_OVERRIDES_DATA.overrides;
      assert.strictEqual(overrides['selexenglish@gmail.com']?.role, 'admin');
      assert.strictEqual(overrides['andrebarrote1992@gmail.com']?.tier, 'vip_mentorship');
    });
  });

  describe('3. Integração Dinâmica no Cloudflare Worker', () => {
    it('getDynamicProductMappings deve retornar fallback consistente', async () => {
      const mappings = await getDynamicProductMappings();
      assert.ok(mappings);
      assert.ok(mappings['8460579']);
      assert.ok(mappings['PROJETO_AEF_2026']);
    });

    it('getDynamicVipOverrides deve retornar lista de VIPs e administradores', async () => {
      const vipConfig = await getDynamicVipOverrides();
      assert.ok(vipConfig);
      assert.ok(Array.isArray(vipConfig.adminEmails));
      assert.ok(Array.isArray(vipConfig.vipEmails));
      assert.ok(vipConfig.adminEmails.includes('selexenglish@gmail.com'));
    });

    it('isEmailAdmin deve resolver permissões administrativas com e sem vipConfig dinâmico', () => {
      assert.strictEqual(isEmailAdmin('selexenglish@gmail.com'), true);
      assert.strictEqual(isEmailAdmin('SELEXENGLISH@GMAIL.COM '), true);
      assert.strictEqual(isEmailAdmin('aluno@agoraeufalo.com.br'), false);

      const mockVipConfig = {
        adminEmails: ['novo_admin@agoraeufalo.com.br', 'selexenglish@gmail.com']
      };
      assert.strictEqual(isEmailAdmin('novo_admin@agoraeufalo.com.br', mockVipConfig), true);
      assert.strictEqual(isEmailAdmin('estranho@gmail.com', mockVipConfig), false);
    });

    it('normalizeUserV2 deve atribuir role admin respeitando o vipConfig dinâmico', () => {
      const mockVipConfig = {
        adminEmails: ['diretor@agoraeufalo.com.br']
      };
      const user = normalizeUserV2({
        id: 'u_dir',
        email: 'diretor@agoraeufalo.com.br',
        role: 'student'
      }, mockVipConfig);

      assert.strictEqual(user.role, 'admin');
    });
  });
});
