# RFC: Arquitetura PDF Factory 2.0 (AgoraEuFalo)

## 1. Contexto e Problema Legado
O atual motor do PDF Factory (V1) opera com um alto nível de acoplamento e rigidez. Baseia-se em manipulação de strings HTML no `aef-pdf-factory-engine.js` e coordenadas absolutas via ReportLab (`generate_*_pdf.py`).
Isso gera problemas de paginação (quebra de página manual, cortes de texto, páginas em branco) e impede a criação dinâmica de diferentes arquétipos de material (Magic Stories, Masterclasses, Cursos Livres, Apostilas Express) sem refatoração manual de código.

## 2. Objetivo da V2
Substituir o ecossistema fragmentado por uma **arquitetura moderna, baseada em blocos modulares e orientada a dados**.
*   **Separação Estrita:** O conteúdo pedagógico viverá puramente como dados (JSON/TypeScript). A renderização visual consumirá esses dados agnosticamente.
*   **Paginação Inteligente:** Adoção do `@react-pdf/renderer` para processar quebras de página nativamente (`wrap={false}`).
*   **Migração Segura (Strangler Pattern):** O sistema legado (V1) deve continuar rodando intacto. A V2 será construída em uma rota paralela e isolada.

## 3. Padrão Estético e Global
*   **Identidade:** Calm EdTech (Padrão tipográfico confortável para adultos 40+).
*   **Layout Global:** Todas as páginas devem possuir um cabeçalho fixo e discreto ("AgoraEuFalo - Leonardo Leite") gerenciado nativamente pelo motor visual através da propriedade `fixed`, sem poluir a camada de dados crua.

## 4. O Pipeline de Ingestão de Dados (AI Structured Outputs)
A geração do documento ocorrerá via ingestão de texto cru utilizando tags estruturais que uma IA transformará em um payload JSON estrito.
As tags de roteamento incluem: `[header]`, `[listen and read]`, `[VOC]`, `[LA]`, `[PRO]`, `[GRAMMAR]`, `[PRESENTATION]`, `[EXERCISES]`.

### Regras de Negócio Pedagógicas (CRÍTICO)
As seguintes regras são inegociáveis na estruturação do JSON, especialmente para o motor de ingestão de IA:
1.  **Gatilhos Negativos e Exaustão:** Para blocos `[LA]` (Listen and Answer) gerados a partir de contexto negativo (ex: "He is NOT driving"), o motor deve esgotar TODAS as possibilidades semânticas naturais em inglês.
2.  **Proibido Resumir:** É estritamente proibido o uso de arrays curtas por conveniência, abreviações, sumarizações, ou o uso de termos genéricos (omiti as palavras proibidas aqui para a estrutura não quebrar).
3.  **Chunks e Lazy Verbs:** Blocos de vocabulário e exercícios devem priorizar blocos sonoros (chunks) e verbos de alta frequência (to get, to have, to make, to put, to take, to do).
4.  **Tipagem Estrita:** Todas as listas, perguntas e respostas devem ser obrigatoriamente do tipo `string[]`.

## 5. Schema TypeScript (Fundação)

```typescript
export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  fontFamilyText: string;
  fontFamilyTitle: string;
}

export interface HeaderBlock {
  type: "header";
  tag: "[header]";
  title: string;
  subtitle: string;
}

export interface ListenAndReadBlock {
  type: "listen_and_read";
  tag: "[listen and read]" | "[LRT]";
  paragraphs: string[];
}

export interface VocabularyBlock {
  type: "vocabulary";
  tag: "[VOC]";
  lazyVerbs: string[];
  chunks: string[];
}

export interface NegativeTriggerGroup {
  negativeContext: string;
  questionVariations: string[];
  answerVariations: string[];
}

export interface ListenAndAnswerBlock {
  type: "listen_and_answer";
  tag: "[LA]" | "[LASK]";
  drills: NegativeTriggerGroup[];
}

export interface PronunciationBlock {
  type: "pronunciation";
  tag: "[PRO]";
  phoneticFocus: string;
  practiceSentences: string[];
}

export interface GrammarBlock {
  type: "grammar";
  tag: "[GRAMMAR]";
  topic: string;
  explanations: string[];
  positiveExamples: string[];
  negativeExamples: string[];
}

export interface PresentationBlock {
  type: "presentation";
  tag: "[PRESENTATION]";
  slideTitle: string;
  bulletPoints: string[];
}

export interface ExercisesBlock {
  type: "exercises";
  tag: "[EXERCISES]";
  instructions: string;
  questions: string[];
  answerKey: string[];
}

// O Union Type que permite empilhar qualquer bloco no editor
export type PedagogicalBlock =
  | HeaderBlock
  | ListenAndReadBlock
  | VocabularyBlock
  | ListenAndAnswerBlock
  | PronunciationBlock
  | GrammarBlock
  | PresentationBlock
  | ExercisesBlock;

// O payload final do documento (agnóstico ao tipo de curso)
export interface PDFDocumentPayload {
  documentId: string;
  archetype: "magic_story" | "curso_livre" | "presentation" | "masterclass" | "express";
  documentTitle: string;
  theme: ThemeConfig;
  blocks: PedagogicalBlock[];
}
## 6. Soluções de Arquitetura & Correções de Rota (Revisão Tech Lead)
Para contornar as limitações do ecossistema legado e blindar a nova engine, as seguintes diretrizes arquiteturais foram incorporadas:

1. **Isolamento Total (Strangler Fig Pattern com Vite):**
   A V2 operará em um subprojeto isolado (`v2-pdf-factory/`) utilizando React e Vite. O build deste subprojeto será exportado como `admin-pdf-factory-v2.html`, rodando em paralelo e sem tocar nos arquivos `.js` ou `.py` do legado.
2. **Validação Estrita via Zod (Anti-Alucinação de IA):**
   Para evitar que strings mal formatadas pela IA quebrem o `@react-pdf/renderer` de forma silenciosa, o schema TypeScript será convertido em um Zod Schema. Nenhum JSON alimentará o gerador de PDF sem passar pelo parse estrito do Zod.
3. **Gerenciamento Explícito de Fontes (TrueType):**
   O React-PDF não herda CSS web. As fontes do padrão Calm EdTech (ex: Plus Jakarta Sans, Playfair Display) serão baixadas localmente (arquivos `.ttf`) e registradas explicitamente através do `Font.register()`.
4. **Camada de UI / Edição Intermediária:**
   O frontend conterá uma interface de Split-Pane: de um lado a UI (Editor JSON/Forms) em React DOM, e do outro o `<PDFViewer>` do `@react-pdf/renderer`. Isso permite intervenção humana antes da renderização e download final pesados.
