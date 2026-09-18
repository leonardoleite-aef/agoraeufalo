#!/usr/bin/env node
/**
 * AgoraEuFalo Ecosystem - Fail-Closed Content Inventory Audit (§3.6)
 * Professor Leonardo Leite
 *
 * Escaneia 100% das lições do repositório local (Magic Stories, DTC, EQS e Mentoria VIP),
 * submetendo seus scripts brutos (rawScript) e conteúdos didáticos (processedContentHtml)
 * ao parser canônico AEFBlockEngine (assets/js/aef-block-engine.js).
 *
 * Audita e quantifica:
 * 1. Total de cursos, módulos e lições avaliadas.
 * 2. Lições que operam em modo normal (failClosed: false).
 * 3. Lições que acionaram o modo preventivo de segurança (failClosed: true), com listagem nominal
 *    e causa raiz identificada (regex de vazamento de resposta ou pergunta sem delimitação).
 */

const fs = require('fs');
const path = require('path');

// Configura ambiente global para carregar módulos do browser/Node
global.window = global;
global.document = {
  readyState: 'complete',
  addEventListener: () => {},
  querySelectorAll: () => [],
  getElementById: () => null
};

const { aefBlockEngine } = require('../assets/js/aef-block-engine.js');
require('../assets/js/aef-courses-registry.js');

const registry = global.AEF_COURSES_REGISTRY || {};

// Regex canônicos de detecção de vazamento para análise diagnóstica
const ANSWER_LEAK_REGEX = /(?:^|\s)(?:\[(?:A|Ans|Answer|Resp|Resposta)\]|\(?(?:A|Ans|Answer|Resp|Resposta)\)?\s*[:\-])/i;
const QUESTION_LEAK_REGEX = /(?:^|\s)(?:\[(?:Q|Quest|Question|Pergunta|Perg|P|Ask)\]|\(?(?:Q|Quest|Question|Pergunta|Perg|P|Ask)\)?\s*[:\-])/i;

const targetCourseIds = [
  'dtc_curso',
  'english-quickstart',
  'ms-legacy',
  'mentoria-andre',
  'mentoria-thomasskt21',
  'mentoria-mateus.s.gomes.novo',
  'mentoria-estevaopin'
];

async function runFailClosedAudit() {
  console.log('======================================================================');
  console.log('🏛️  AUDITORIA FORENSE DE CONTEÚDO PEDAGÓGICO FAIL-CLOSED (§3.6)');
  console.log('    Ecossistema Digital AgoraEuFalo — Professor Leonardo Leite');
  console.log('======================================================================\n');

  let totalCourses = 0;
  let totalModules = 0;
  let totalLessons = 0;
  let failClosedLessonsCount = 0;
  let passingLessonsCount = 0;

  const catalogStats = {};
  const failClosedOffenders = [];

  for (const courseId of targetCourseIds) {
    const course = registry[courseId];
    if (!course) {
      console.warn(`[AVISO] Curso "${courseId}" não encontrado no registro.`);
      continue;
    }

    totalCourses++;
    const modules = course.modules || [];
    totalModules += modules.length;

    catalogStats[courseId] = {
      title: course.title || courseId,
      modulesCount: modules.length,
      lessonsCount: 0,
      failClosedCount: 0,
      passCount: 0
    };

    for (const mod of modules) {
      const lessons = mod.lessons || [];
      for (const lesson of lessons) {
        totalLessons++;
        catalogStats[courseId].lessonsCount++;

        const content = lesson.rawScript || lesson.processedContentHtml || '';
        const blocks = aefBlockEngine.parsePedagogicalContent(content);

        const failClosedBlocks = blocks.filter(b => b.failClosed === true);
        const hasFailClosed = failClosedBlocks.length > 0;

        if (hasFailClosed) {
          failClosedLessonsCount++;
          catalogStats[courseId].failClosedCount++;

          // Diagnóstico do gatilho
          let triggerType = 'Estrutura ambígua de blocos';
          let matchedSnippet = '';

          const aMatch = content.match(ANSWER_LEAK_REGEX);
          const qMatch = content.match(QUESTION_LEAK_REGEX);

          if (aMatch) {
            triggerType = 'Vazamento / Formato de Resposta (ANSWER_LEAK_REGEX)';
            const start = Math.max(0, aMatch.index - 25);
            const end = Math.min(content.length, aMatch.index + 45);
            matchedSnippet = content.substring(start, end).replace(/\s+/g, ' ').trim();
          } else if (qMatch) {
            triggerType = 'Vazamento / Pergunta sem delimitação (QUESTION_LEAK_REGEX)';
            const start = Math.max(0, qMatch.index - 25);
            const end = Math.min(content.length, qMatch.index + 45);
            matchedSnippet = content.substring(start, end).replace(/\s+/g, ' ').trim();
          }

          failClosedOffenders.push({
            courseId,
            courseTitle: course.title,
            moduleId: mod.id,
            moduleTitle: mod.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            failClosedBlocksCount: failClosedBlocks.length,
            blockTypes: failClosedBlocks.map(b => b.type),
            warningNotice: failClosedBlocks[0]?.warningNotice || 'Proteção fail-closed ativa.',
            triggerType,
            matchedSnippet
          });
        } else {
          passingLessonsCount++;
          catalogStats[courseId].passCount++;
        }
      }
    }
  }

  // Exibição do Relatório Consolidado
  console.log('📊 RESUMO ESTATÍSTICO DO CATÁLOGO:');
  console.log('----------------------------------------------------------------------');
  console.log(`• Cursos Auditados:          ${totalCourses}`);
  console.log(`• Módulos Auditados:         ${totalModules}`);
  console.log(`• Total Geral de Lições:     ${totalLessons}`);
  console.log(`• Lições em Modo Seguro (OK): ${passingLessonsCount} (${((passingLessonsCount / totalLessons) * 100).toFixed(2)}%)`);
  console.log(`• Lições com Fail-Closed:    ${failClosedLessonsCount} (${((failClosedLessonsCount / totalLessons) * 100).toFixed(2)}%)\n`);

  console.log('📚 DISTRIBUIÇÃO POR CURSO:');
  console.log('----------------------------------------------------------------------');
  for (const [cId, stats] of Object.entries(catalogStats)) {
    console.log(`  [${cId}] ${stats.title}`);
    console.log(`    - Módulos: ${stats.modulesCount} | Lições: ${stats.lessonsCount} | OK: ${stats.passCount} | Fail-Closed: ${stats.failClosedCount}`);
  }
  console.log('');

  console.log('⚠️  LISTAGEM NOMINAL DAS LIÇÕES COM PROTEÇÃO FAIL-CLOSED ATIVA:');
  console.log('----------------------------------------------------------------------');
  if (failClosedOffenders.length === 0) {
    console.log('  Nenhuma lição acionou o modo fail-closed. Todo o catálogo está em conformidade.');
  } else {
    failClosedOffenders.forEach((off, idx) => {
      console.log(`  ${idx + 1}. [${off.courseId}] ${off.courseTitle}`);
      console.log(`     • Módulo: "${off.moduleTitle}" (${off.moduleId})`);
      console.log(`     • Lição:  "${off.lessonTitle}" (${off.lessonId})`);
      console.log(`     • Blocos Afetados: [${off.blockTypes.join(', ')}]`);
      console.log(`     • Diagnóstico: ${off.triggerType}`);
      console.log(`     • Trecho Gatilho: "${off.matchedSnippet}"`);
      console.log(`     • Aviso Pedagógico Exibido: "${off.warningNotice}"`);
      console.log('');
    });
  }

  console.log('======================================================================');
  console.log('✅ AUDITORIA CONCLUÍDA COM SUCESSO');
  console.log('======================================================================\n');

  return {
    totalCourses,
    totalModules,
    totalLessons,
    passingLessonsCount,
    failClosedLessonsCount,
    failClosedOffenders
  };
}

if (require.main === module) {
  runFailClosedAudit().catch(err => {
    console.error('Erro na execução da auditoria:', err);
    process.exit(1);
  });
}

module.exports = { runFailClosedAudit };
