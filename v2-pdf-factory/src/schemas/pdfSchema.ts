import { z } from 'zod';

export const ThemeConfigSchema = z.object({
  themeId: z.enum(['amber', 'cobalt', 'emerald', 'ruby', 'indigo', 'slate']),
});

// NOVO: Bloco de Introdução (Opcional)
export const IntroBlockSchema = z.object({
  type: z.literal('INTRO'),
  tag: z.literal('[INTRO]'),
  focus: z.string().describe('Visão geral e foco da lição'),
  keyChunks: z.array(z.string()).describe('Frases/Chunks importantes que serão trabalhados'),
  grammarPoints: z.array(z.string()).describe('Pontos gramaticais para os alunos mais técnicos'),
  recommendations: z.array(z.string()).describe('Recomendações de estudo'),
  roadblocks: z.array(z.string()).describe('Possíveis dificuldades e como superá-las'),
});

export const LRBlockSchema = z.object({
  type: z.literal('LR'),
  tag: z.literal('[LR]'),
  paragraphs: z.array(z.string()),
});

export const VocabItemSchema = z.object({
  type: z.enum(['chunk', 'lazy_verb', 'grammar_pill', 'general']).default('general'),
  target: z.string().describe('Palavra ou frase em inglês'),
  spokenTranslation: z.string().optional().describe('Tradução focada no português falado real'),
  grammarNote: z.string().optional().describe('Notas sobre o sentimento da estrutura'),
});

export const VocBlockSchema = z.object({
  type: z.literal('VOC'),
  tag: z.literal('[VOC]'),
  storyTranslation: z.array(z.string()).optional().describe('Tradução completa da história para contexto geral'),
  items: z.array(VocabItemSchema),
});

export const NegativeTriggerGroupSchema = z.object({
  negativeContext: z.string(),
  questionVariations: z.array(z.string()),
  answerVariations: z.array(z.string()),
});

export const LABlockSchema = z.object({
  type: z.literal('LA'),
  tag: z.literal('[LA]'),
  drills: z.array(NegativeTriggerGroupSchema),
  failClosed: z.boolean().optional(),
  warningNotice: z.string().optional(),
});

export const LRTBlockSchema = z.object({
  type: z.literal('LRT'),
  tag: z.literal('[LRT]'),
  guideQuestions: z.array(z.string()),
});

export const LASKBlockSchema = z.object({
  type: z.literal('LASK'),
  tag: z.literal('[LASK]'),
  drills: z.array(NegativeTriggerGroupSchema),
  failClosed: z.boolean().optional(),
  warningNotice: z.string().optional(),
});

export const ProBlockSchema = z.object({
  type: z.literal('PRO'),
  tag: z.literal('[PRO]'),
  fullTextWithLinking: z.array(z.string()).describe('Texto integral com marcações de conexões sonoras (linking sounds)'),
  goldenTip: z.string().describe('A Sacada de Ouro monumental do Professor Leo'),
});

export const QRCodeBlockSchema = z.object({
  type: z.literal('QR_CODE'),
  tag: z.literal('[QR_CODE]'),
  url: z.string().describe('URL de destino do QR Code (ex: link do Player)'),
  instruction: z.string().describe('Instrução curta abaixo do QR Code (ex: Escaneie para ouvir a aula)'),
});

export const PedagogicalBlockSchema = z.discriminatedUnion('type', [
  IntroBlockSchema,
  LRBlockSchema,
  VocBlockSchema,
  LABlockSchema,
  LRTBlockSchema,
  LASKBlockSchema,
  ProBlockSchema,
  QRCodeBlockSchema
]);

export const PDFDocumentPayloadSchema = z.object({
  documentId: z.string(),
  archetype: z.enum(['magic_story', 'curso_livre', 'presentation', 'masterclass', 'express']),
  documentTitle: z.string(),
  brandHeader: z.string().optional().describe('Texto da esquerda no cabeçalho (Ex: AGORAEUFALO ACADEMY)'),
  seriesHeader: z.string().optional().describe('Texto da direita no cabeçalho (Ex: MAGIC STORIES)'),
  theme: ThemeConfigSchema,
  blocks: z.array(PedagogicalBlockSchema),
});

export type PDFDocumentPayload = z.infer<typeof PDFDocumentPayloadSchema>;
export type PedagogicalBlock = z.infer<typeof PedagogicalBlockSchema>;
