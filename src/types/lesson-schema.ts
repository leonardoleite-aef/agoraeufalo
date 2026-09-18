/**
 * AgoraEuFalo • Contrato Didático Canônico & Schema Estruturado
 * Professor Leonardo Leite
 *
 * Define o schema canônico estruturado (Zod + TypeScript) compartilhado entre o
 * v2-pdf-factory, Course Studio, Sala de Aula e Training Player.
 * Elimina o parsing frágil por regex e provê adaptador de fallback com emissão de advertência.
 */

import { z } from 'zod';

// ============================================================================
// 1. CONFIGURAÇÃO DE TEMA VISUAL
// ============================================================================

export const ThemeIdSchema = z.enum(['amber', 'cobalt', 'emerald', 'ruby', 'indigo', 'slate']);
export type ThemeId = z.infer<typeof ThemeIdSchema>;

export const ThemeConfigSchema = z.object({
  themeId: ThemeIdSchema,
});
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;

// ============================================================================
// 2. SCHEMAS DOS BLOCOS PEDAGÓGICOS CANÔNICOS
// ============================================================================

/**
 * 0. Bloco de Introdução e Metadados da Aula
 */
export const IntroBlockSchema = z.object({
  type: z.literal('INTRO'),
  tag: z.literal('[INTRO]').default('[INTRO]'),
  documentTitle: z.string().optional(),
  focus: z.string().describe('Visão geral e foco da lição (sentimento da estrutura)'),
  keyChunks: z.array(z.string()).default([]).describe('Frases/Chunks importantes que serão trabalhados'),
  grammarPoints: z.array(z.string()).default([]).describe('Pontos práticos sem jargões abstratos'),
  recommendations: z.array(z.string()).default([]).describe('Recomendações de estudo'),
  roadblocks: z.array(z.string()).default([]).describe('Possíveis dificuldades e como superá-las'),
});
export type IntroBlock = z.infer<typeof IntroBlockSchema>;

/**
 * 1. Listen & Read (LR) - Imersão Auditiva Real
 */
export const LRBlockSchema = z.object({
  type: z.literal('LR'),
  tag: z.literal('[LR]').default('[LR]'),
  paragraphs: z.array(z.string()).min(1).describe('Parágrafos ou falas da história/texto em inglês'),
});
export type LRBlock = z.infer<typeof LRBlockSchema>;

/**
 * Item Individual do Vocabulário / Chunks
 */
export const VocabItemTypeSchema = z.enum(['chunk', 'lazy_verb', 'grammar_pill', 'general']);
export type VocabItemType = z.infer<typeof VocabItemTypeSchema>;

export const VocabItemSchema = z.object({
  type: VocabItemTypeSchema.default('general'),
  target: z.string().describe('Palavra ou frase em inglês'),
  spokenTranslation: z.string().optional().describe('Tradução em português falado brasileiro real'),
  grammarNote: z.string().optional().describe('Pílula do sentimento da estrutura'),
});
export type VocabItem = z.infer<typeof VocabItemSchema>;

/**
 * 2. Vocabulary Session (VOC) - Matriz de Chunks & Compreensão
 */
export const VocBlockSchema = z.object({
  type: z.literal('VOC'),
  tag: z.literal('[VOC]').default('[VOC]'),
  storyTranslation: z.array(z.string()).optional().describe('Tradução completa de apoio da história'),
  items: z.array(VocabItemSchema).default([]),
});
export type VocBlock = z.infer<typeof VocBlockSchema>;

/**
 * Grupo de Disparo / Pergunta & Resposta
 */
export const NegativeTriggerGroupSchema = z.object({
  negativeContext: z.string().describe('Contexto estímulo ou frase afirmativa/negativa base'),
  questionVariations: z.array(z.string()).default([]).describe('Variações da pergunta'),
  answerVariations: z.array(z.string()).default([]).describe('Variações da resposta'),
});
export type NegativeTriggerGroup = z.infer<typeof NegativeTriggerGroupSchema>;

/**
 * 3. Listen & Answer (LA) - Reflexo & Velocidade de Resposta
 * Regra: Zero respostas reveladas na tela do aluno / apostila.
 */
export const LABlockSchema = z.object({
  type: z.literal('LA'),
  tag: z.literal('[LA]').default('[LA]'),
  drills: z.array(NegativeTriggerGroupSchema).min(1),
});
export type LABlock = z.infer<typeof LABlockSchema>;

/**
 * 4. Look & Retell (LRT) - Produção Oral Autônoma
 * Regra: Utiliza estritamente as perguntas de LA como guia.
 */
export const LRTBlockSchema = z.object({
  type: z.literal('LRT'),
  tag: z.literal('[LRT]').default('[LRT]'),
  guideQuestions: z.array(z.string()).min(1).describe('Perguntas-guia para reconto oral'),
  keywords: z.array(z.string()).optional().describe('Palavras-chave de apoio opcional'),
  moviePrompt: z.string().optional().describe('Prompt do filme sem áudio caso disponível'),
});
export type LRTBlock = z.infer<typeof LRTBlockSchema>;

/**
 * 5. Listen & Ask (LASK) - Desafio de Formulação de Perguntas
 * Regra: Zero perguntas reveladas na tela do aluno / apostila.
 */
export const LASKBlockSchema = z.object({
  type: z.literal('LASK'),
  tag: z.literal('[LASK]').default('[LASK]'),
  drills: z.array(NegativeTriggerGroupSchema).min(1),
});
export type LASKBlock = z.infer<typeof LASKBlockSchema>;

/**
 * 6. Pronunciation & Connected Speech (PRO)
 * Regra: Texto integral com marcações de conexões sonoras + Sacada de Ouro do Leo.
 */
export const ProBlockSchema = z.object({
  type: z.literal('PRO'),
  tag: z.literal('[PRO]').default('[PRO]'),
  fullTextWithLinking: z.array(z.string()).min(1).describe('Texto integral com marcações sonoras'),
  goldenTip: z.string().describe('A Sacada de Ouro monumental do Professor Leo'),
});
export type ProBlock = z.infer<typeof ProBlockSchema>;

/**
 * Bloco Auxiliar de Acesso Rápido via QR Code
 */
export const QRCodeBlockSchema = z.object({
  type: z.literal('QR_CODE'),
  tag: z.literal('[QR_CODE]').default('[QR_CODE]'),
  url: z.string().url().describe('URL do Player ou Recurso Digital'),
  instruction: z.string().describe('Instrução para leitura do QR Code'),
});
export type QRCodeBlock = z.infer<typeof QRCodeBlockSchema>;

// ============================================================================
// 3. UNIÃO DISCRIMINADA DE BLOCOS & PAYLOAD DE DOCUMENTO
// ============================================================================

export const PedagogicalBlockSchema = z.discriminatedUnion('type', [
  IntroBlockSchema,
  LRBlockSchema,
  VocBlockSchema,
  LABlockSchema,
  LRTBlockSchema,
  LASKBlockSchema,
  ProBlockSchema,
  QRCodeBlockSchema,
]);
export type PedagogicalBlock = z.infer<typeof PedagogicalBlockSchema>;

export const LessonArchetypeSchema = z.enum([
  'magic_story',
  'curso_livre',
  'presentation',
  'masterclass',
  'express',
]);
export type LessonArchetype = z.infer<typeof LessonArchetypeSchema>;

export const PDFDocumentPayloadSchema = z.object({
  documentId: z.string(),
  archetype: LessonArchetypeSchema,
  documentTitle: z.string(),
  brandHeader: z.string().optional().describe('Texto da esquerda no cabeçalho'),
  seriesHeader: z.string().optional().describe('Texto da direita no cabeçalho'),
  theme: ThemeConfigSchema,
  blocks: z.array(PedagogicalBlockSchema),
});
export type PDFDocumentPayload = z.infer<typeof PDFDocumentPayloadSchema>;

// ============================================================================
// 4. FUNÇÕES PURAS DE VALIDAÇÃO E TYPE GUARDS
// ============================================================================

/**
 * Verifica se um objeto desconhecido atende à estrutura de um bloco pedagógico canônico
 */
export function isCanonicalBlock(obj: unknown): obj is PedagogicalBlock {
  if (!obj || typeof obj !== 'object') return false;
  const result = PedagogicalBlockSchema.safeParse(obj);
  return result.success;
}

/**
 * Valida um bloco pedagógico individual, retornando-o ou lançando ZodError
 */
export function validatePedagogicalBlock(block: unknown): PedagogicalBlock {
  return PedagogicalBlockSchema.parse(block);
}

/**
 * Valida com segurança um bloco pedagógico sem lançar exceções
 */
export function safeValidatePedagogicalBlock(block: unknown): {
  success: boolean;
  data?: PedagogicalBlock;
  error?: string;
} {
  const result = PedagogicalBlockSchema.safeParse(block);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
  };
}

/**
 * Valida uma lista completa de blocos pedagógicos
 */
export function validatePedagogicalBlocks(blocks: unknown): PedagogicalBlock[] {
  if (!Array.isArray(blocks)) {
    throw new Error('O conteúdo didático estruturado deve ser um array de blocos.');
  }
  return blocks.map((b, idx) => {
    try {
      return PedagogicalBlockSchema.parse(b);
    } catch (err: any) {
      throw new Error(`Bloco didático inválido no índice ${idx} (${b?.type || 'sem tipo'}): ${err.message}`);
    }
  });
}

// ============================================================================
// 5. PARSER DE FALLBACK PARA CONTEÚDO LEGADO BASEADO EM TAGS
// ============================================================================

/**
 * Converte strings legadas com marcadores [INTRO], [LR], [VOC], [LA], [Q], [LRT], [LASK], [PRO]
 * no formato canônico estruturado de blocos PedagogicalBlock[].
 */
export function parseLegacyPedagogicalText(rawText: string): PedagogicalBlock[] {
  if (!rawText || typeof rawText !== 'string') return [];

  const text = rawText.trim();
  if (!text) return [];

  // Se o texto for um JSON válido, tenta fazer parse direto
  if (text.startsWith('[') || text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return validatePedagogicalBlocks(parsed);
      }
      if (parsed && Array.isArray(parsed.blocks)) {
        return validatePedagogicalBlocks(parsed.blocks);
      }
    } catch {
      // Continua para o parsing por tags se não for JSON válido
    }
  }

  // Regex para segmentar por tags [INTRO], [LR], [VOC], [LA], [Q], [LRT], [LASK], [PRO], [QR_CODE]
  const tagRegex = /\[(INTRO|LR|VOC|LA|Q|LRT|LASK|PRO|QR_CODE)\]/gi;
  const matches: { tag: string; type: string; index: number }[] = [];
  let m: RegExpExecArray | null;

  while ((m = tagRegex.exec(text)) !== null) {
    let normalizedType = m[1].toUpperCase();
    if (normalizedType === 'Q') normalizedType = 'LA';
    matches.push({
      tag: `[${m[1].toUpperCase()}]`,
      type: normalizedType,
      index: m.index,
    });
  }

  // Se não encontrar nenhuma tag, trata todo o texto como Listen & Read (LR) padrão
  if (matches.length === 0) {
    const paragraphs = text
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean);
    return [
      {
        type: 'LR',
        tag: '[LR]',
        paragraphs: paragraphs.length > 0 ? paragraphs : [text],
      },
    ];
  }

  const blocks: PedagogicalBlock[] = [];

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const startIndex = current.index + current.tag.length;
    const endIndex = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const content = text.slice(startIndex, endIndex).trim();

    switch (current.type) {
      case 'INTRO': {
        const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
        let focus = '';
        const keyChunks: string[] = [];
        const grammarPoints: string[] = [];
        const recommendations: string[] = [];
        const roadblocks: string[] = [];

        let currentSection = 'focus';

        for (const line of lines) {
          const lower = line.toLowerCase();
          if (lower.startsWith('chunks:') || lower.startsWith('key chunks:')) {
            currentSection = 'chunks';
            continue;
          }
          if (lower.startsWith('grammar:') || lower.startsWith('pontos gramaticais:')) {
            currentSection = 'grammar';
            continue;
          }
          if (lower.startsWith('recommendations:') || lower.startsWith('recomendações:')) {
            currentSection = 'recommendations';
            continue;
          }
          if (lower.startsWith('roadblocks:') || lower.startsWith('dificuldades:')) {
            currentSection = 'roadblocks';
            continue;
          }

          const cleanLine = line.replace(/^[\*\•\-\d+\.]\s*/, '').trim();
          if (!cleanLine) continue;

          if (currentSection === 'focus') {
            focus = focus ? `${focus} ${cleanLine}` : cleanLine;
          } else if (currentSection === 'chunks') {
            keyChunks.push(cleanLine);
          } else if (currentSection === 'grammar') {
            grammarPoints.push(cleanLine);
          } else if (currentSection === 'recommendations') {
            recommendations.push(cleanLine);
          } else if (currentSection === 'roadblocks') {
            roadblocks.push(cleanLine);
          }
        }

        blocks.push({
          type: 'INTRO',
          tag: '[INTRO]',
          focus: focus || 'Foco e visão geral da aula.',
          keyChunks,
          grammarPoints,
          recommendations,
          roadblocks,
        });
        break;
      }

      case 'LR': {
        const paragraphs = content
          .split(/\n\s*\n/)
          .map(p => p.trim())
          .filter(Boolean);

        blocks.push({
          type: 'LR',
          tag: '[LR]',
          paragraphs: paragraphs.length > 0 ? paragraphs : [content],
        });
        break;
      }

      case 'VOC': {
        const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
        const items: VocabItem[] = [];
        const storyTranslation: string[] = [];

        for (const line of lines) {
          if (line.startsWith('TRADUÇÃO:') || line.startsWith('STORY:')) {
            storyTranslation.push(line.replace(/^(TRADUÇÃO|STORY):\s*/i, '').trim());
            continue;
          }

          // Formato: - target: spokenTranslation (grammarNote) ou target - translation
          const clean = line.replace(/^[\*\•\-\d+\.]\s*/, '').trim();
          const separatorMatch = clean.match(/^(.*?)\s*[-–—:]\s*(.*)$/);

          if (separatorMatch) {
            const target = separatorMatch[1].trim();
            let remainder = separatorMatch[2].trim();
            let grammarNote: string | undefined = undefined;

            const noteMatch = remainder.match(/\((.*?)\)$/);
            if (noteMatch) {
              grammarNote = noteMatch[1].trim();
              remainder = remainder.replace(/\((.*?)\)$/, '').trim();
            }

            items.push({
              type: 'chunk',
              target,
              spokenTranslation: remainder || undefined,
              grammarNote,
            });
          } else if (clean) {
            items.push({
              type: 'general',
              target: clean,
            });
          }
        }

        blocks.push({
          type: 'VOC',
          tag: '[VOC]',
          items: items.length > 0 ? items : [{ type: 'general', target: content }],
          storyTranslation: storyTranslation.length > 0 ? storyTranslation : undefined,
        });
        break;
      }

      case 'LA': {
        // Suporta Q: Pergunta / A: Resposta ou linhas numeradas
        const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
        const drills: NegativeTriggerGroup[] = [];
        let currentQuestion = '';
        let currentAnswers: string[] = [];
        let currentContext = '';

        for (const line of lines) {
          const qMatch = line.match(/^(?:Q|Pergunta|\d+[\.\)])\s*[:\-]?\s*(.*)$/i);
          const aMatch = line.match(/^(?:A|Resposta)\s*[:\-]?\s*(.*)$/i);
          const cMatch = line.match(/^(?:Context|Cenário|Stimulus)\s*[:\-]?\s*(.*)$/i);

          if (cMatch) {
            currentContext = cMatch[1].trim();
          } else if (qMatch) {
            if (currentQuestion) {
              drills.push({
                negativeContext: currentContext || currentQuestion,
                questionVariations: [currentQuestion],
                answerVariations: currentAnswers.length > 0 ? currentAnswers : ['Yes/No response'],
              });
              currentAnswers = [];
              currentContext = '';
            }
            currentQuestion = qMatch[1].trim();
          } else if (aMatch) {
            currentAnswers.push(aMatch[1].trim());
          } else if (line.endsWith('?')) {
            if (currentQuestion) {
              drills.push({
                negativeContext: currentContext || currentQuestion,
                questionVariations: [currentQuestion],
                answerVariations: currentAnswers.length > 0 ? currentAnswers : ['Yes/No response'],
              });
              currentAnswers = [];
              currentContext = '';
            }
            currentQuestion = line;
          } else if (currentQuestion) {
            currentAnswers.push(line);
          }
        }

        if (currentQuestion) {
          drills.push({
            negativeContext: currentContext || currentQuestion,
            questionVariations: [currentQuestion],
            answerVariations: currentAnswers.length > 0 ? currentAnswers : ['Yes/No response'],
          });
        }

        // Fallback se não separou em perguntas específicas
        if (drills.length === 0 && content) {
          drills.push({
            negativeContext: content,
            questionVariations: [content],
            answerVariations: ['Practice response'],
          });
        }

        blocks.push({
          type: 'LA',
          tag: '[LA]',
          drills: drills.length > 0 ? drills : [{
            negativeContext: 'Default drill',
            questionVariations: ['Listen & Answer drill'],
            answerVariations: ['Default answer'],
          }],
        });
        break;
      }

      case 'LRT': {
        const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
        const guideQuestions = lines.map(l => l.replace(/^[\*\•\-\d+\.]\s*/, '').trim()).filter(Boolean);

        blocks.push({
          type: 'LRT',
          tag: '[LRT]',
          guideQuestions: guideQuestions.length > 0 ? guideQuestions : [content],
        });
        break;
      }

      case 'LASK': {
        const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
        const drills: NegativeTriggerGroup[] = [];

        for (const line of lines) {
          const clean = line.replace(/^[\*\•\-\d+\.]\s*/, '').trim();
          const arrowMatch = clean.match(/^(.*?)\s*(?:->|➔|=>|:\s*pergunta:)\s*(.*)$/i);
          if (arrowMatch) {
            drills.push({
              negativeContext: arrowMatch[1].trim(),
              questionVariations: [arrowMatch[2].trim()],
              answerVariations: [],
            });
          } else if (clean) {
            drills.push({
              negativeContext: clean,
              questionVariations: ['Ask question about stimulus'],
              answerVariations: [],
            });
          }
        }

        blocks.push({
          type: 'LASK',
          tag: '[LASK]',
          drills: drills.length > 0 ? drills : [{
            negativeContext: content,
            questionVariations: ['Formulate question'],
            answerVariations: [],
          }],
        });
        break;
      }

      case 'PRO': {
        const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
        const fullTextWithLinking: string[] = [];
        let goldenTip = '';

        for (const line of lines) {
          const tipMatch = line.match(/^(?:Sacada de Ouro|Golden Tip|Dica de Ouro)\s*[:\-]?\s*(.*)$/i);
          if (tipMatch) {
            goldenTip = tipMatch[1].trim();
          } else if (goldenTip) {
            goldenTip += ` ${line}`;
          } else {
            fullTextWithLinking.push(line);
          }
        }

        blocks.push({
          type: 'PRO',
          tag: '[PRO]',
          fullTextWithLinking: fullTextWithLinking.length > 0 ? fullTextWithLinking : [content],
          goldenTip: goldenTip || 'Conecte os sons consonantais na vogal seguinte para fluência contínua.',
        });
        break;
      }

      case 'QR_CODE': {
        const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
        let url = 'https://agoraeufalo.com.br';
        let instruction = 'Escaneie para acessar o Training Player';

        for (const line of lines) {
          if (/^https?:\/\//i.test(line)) {
            url = line.trim();
          } else {
            instruction = line.replace(/^[\*\•\-]\s*/, '').trim();
          }
        }

        blocks.push({
          type: 'QR_CODE',
          tag: '[QR_CODE]',
          url,
          instruction,
        });
        break;
      }
    }
  }

  return blocks;
}
