/**
 * Suite de Testes do Motor e Pipeline Pedagógico Canônico (Fase 5)
 * Validação de schemas Zod, adaptadores de blocos, fallback parser e renderização Calm EdTech.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  IntroBlockSchema,
  LRBlockSchema,
  VocBlockSchema,
  LABlockSchema,
  LRTBlockSchema,
  LASKBlockSchema,
  ProBlockSchema,
  QRCodeBlockSchema,
  PedagogicalBlockSchema,
  PDFDocumentPayloadSchema,
  CanonicalLessonSchema,
  isCanonicalBlock,
  isCanonicalLesson,
  safeValidatePedagogicalBlock,
  safeValidateCanonicalLesson,
  validatePedagogicalBlock,
  validatePedagogicalBlocks,
  validateCanonicalLesson,
  assertCanonicalLesson,
  parseLegacyPedagogicalText,
  createFailClosedLABlock,
  createFailClosedLASKBlock,
  type PedagogicalBlock,
  type PDFDocumentPayload,
  type CanonicalLesson,
} from '../../src/types/lesson-schema.ts';

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  AEFBlockEngine,
  aefBlockEngine,
  aefPedagogicalEngine,
} = require('../../assets/js/aef-block-engine.js');

describe('Suite de Testes do Pipeline Pedagógico Canônico (Fase 5)', () => {

  // ==========================================================================
  // 1. CONTRATO CANÔNICO & VALIDAÇÃO ZOD
  // ==========================================================================
  describe('Contrato Canônico & Schemas Zod (src/types/lesson-schema.ts)', () => {

    it('deve validar bloco INTRO canônico com todos os campos estruturados', () => {
      const validIntro = {
        type: 'INTRO' as const,
        tag: '[INTRO]' as const,
        focus: 'Sentimento da estrutura ao cumprimentar e iniciar conversas reais.',
        keyChunks: ['Hello, my dear friend!', 'How have you been?'],
        grammarPoints: ['Zero foco em nomenclatura de tempos verbais'],
        recommendations: ['Ouça pelo menos 3 vezes antes de falar'],
        roadblocks: ['Não tente traduzir palavra por palavra'],
      };

      const parsed = IntroBlockSchema.parse(validIntro);
      assert.strictEqual(parsed.type, 'INTRO');
      assert.strictEqual(parsed.keyChunks.length, 2);
      assert.strictEqual(isCanonicalBlock(validIntro), true);
    });

    it('deve validar bloco LR (Listen & Read) canônico', () => {
      const validLR = {
        type: 'LR' as const,
        tag: '[LR]' as const,
        paragraphs: [
          'Hello, my dear friend! Welcome to our session.',
          'Today we are exploring natural spoken rhythm.',
        ],
      };

      const parsed = LRBlockSchema.parse(validLR);
      assert.strictEqual(parsed.type, 'LR');
      assert.strictEqual(parsed.paragraphs.length, 2);
      assert.strictEqual(isCanonicalBlock(validLR), true);
    });

    it('deve rejeitar bloco LR sem parágrafos ou com parágrafos vazios', () => {
      const invalidLR = {
        type: 'LR',
        paragraphs: [],
      };

      assert.throws(() => LRBlockSchema.parse(invalidLR));
      const safe = safeValidatePedagogicalBlock(invalidLR);
      assert.strictEqual(safe.success, false);
    });

    it('deve validar bloco VOC (Vocabulary Session) com itens e tradução falada real', () => {
      const validVoc = {
        type: 'VOC' as const,
        tag: '[VOC]' as const,
        storyTranslation: ['Olá meu amigo! Bem-vindo à nossa sessão.'],
        items: [
          {
            type: 'chunk' as const,
            target: 'a quarter to five',
            spokenTranslation: 'Quinze pras cinco',
            grammarNote: 'Lógica contraintuitiva em relação ao português',
          },
          {
            type: 'general' as const,
            target: 'take for granted',
            spokenTranslation: 'Não dar o devido valor',
          },
        ],
      };

      const parsed = VocBlockSchema.parse(validVoc);
      assert.strictEqual(parsed.type, 'VOC');
      assert.strictEqual(parsed.items.length, 2);
      assert.strictEqual(parsed.items[0].spokenTranslation, 'Quinze pras cinco');
      assert.strictEqual(isCanonicalBlock(validVoc), true);
    });

    it('deve validar blocos LA, LRT, LASK, PRO e QR_CODE', () => {
      const validLA = {
        type: 'LA' as const,
        drills: [
          {
            negativeContext: 'He did not go to the office.',
            questionVariations: ['Did he go to the office?'],
            answerVariations: ['No, he stayed home.'],
          },
        ],
      };

      const validLRT = {
        type: 'LRT' as const,
        guideQuestions: ['Did he go to the office?', 'Where did he stay?'],
      };

      const validLASK = {
        type: 'LASK' as const,
        drills: [
          {
            negativeContext: 'He stayed home all day long.',
            questionVariations: ['Where did he stay all day?'],
            answerVariations: [],
          },
        ],
      };

      const validPro = {
        type: 'PRO' as const,
        fullTextWithLinking: ['He stayed_at home all_afternoon.'],
        goldenTip: 'A Sacada de Ouro: Ligue a consoante final no som vocálico da palavra seguinte.',
      };

      const validQR = {
        type: 'QR_CODE' as const,
        url: 'https://agoraeufalo.com.br/treino/player.html?lesson=ms001',
        instruction: 'Escaneie para treinar no Training Player',
      };

      assert.strictEqual(LABlockSchema.parse(validLA).type, 'LA');
      assert.strictEqual(LRTBlockSchema.parse(validLRT).type, 'LRT');
      assert.strictEqual(LASKBlockSchema.parse(validLASK).type, 'LASK');
      assert.strictEqual(ProBlockSchema.parse(validPro).type, 'PRO');
      assert.strictEqual(QRCodeBlockSchema.parse(validQR).type, 'QR_CODE');
    });

    it('deve validar PDFDocumentPayloadSchema completo com múltiplos blocos', () => {
      const payload: PDFDocumentPayload = {
        documentId: 'ms001-story',
        archetype: 'magic_story',
        documentTitle: 'Magic Story 01 • The Beginning',
        brandHeader: 'AGORAEUFALO ACADEMY',
        seriesHeader: 'MAGIC STORIES CLÁSSICAS',
        theme: { themeId: 'amber' },
        blocks: [
          {
            type: 'LR',
            tag: '[LR]',
            paragraphs: ['Hello, my dear friend!'],
          },
          {
            type: 'VOC',
            tag: '[VOC]',
            items: [{ type: 'chunk', target: 'take care', spokenTranslation: 'Se cuida' }],
          },
          {
            type: 'LA',
            tag: '[LA]',
            drills: [{
              negativeContext: 'Context',
              questionVariations: ['Question?'],
              answerVariations: ['Answer.'],
            }],
          },
          {
            type: 'PRO',
            tag: '[PRO]',
            fullTextWithLinking: ['Hello_my dear friend!'],
            goldenTip: 'Emende as palavras com suavidade.',
          },
        ],
      };

      const validated = PDFDocumentPayloadSchema.parse(payload);
      assert.strictEqual(validated.documentId, 'ms001-story');
      assert.strictEqual(validated.blocks.length, 4);
    });

    it('deve rejeitar blocos com tipo não reconhecido', () => {
      const unknownBlock = {
        type: 'CUSTOM_UNKNOWN',
        data: 'inválido',
      };

      assert.strictEqual(isCanonicalBlock(unknownBlock), false);
      assert.throws(() => validatePedagogicalBlock(unknownBlock));
    });
  });

  // ==========================================================================
  // 2. PARSER DE FALLBACK & EMISSÃO DE ADVERTÊNCIA
  // ==========================================================================
  describe('Parser de Fallback & Emissão de Advertência (aef-block-engine.js)', () => {

    it('ao receber array canônico estruturado, NÃO deve acionar fallback nem emitir advertência', () => {
      const canonicalBlocks: PedagogicalBlock[] = [
        {
          type: 'LR',
          tag: '[LR]',
          paragraphs: ['Hello, my dear friend!', 'Second paragraph.'],
        },
      ];

      const warns: string[] = [];
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => warns.push(args.join(' '));

      try {
        const result = aefBlockEngine.parsePedagogicalContent(canonicalBlocks);
        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].type, 'LR');
        assert.strictEqual(warns.length, 0, 'Nenhum warning deve ser emitido para blocos já estruturados');
      } finally {
        console.warn = originalWarn;
      }
    });

    it('ao receber JSON canônico serializado em string, NÃO deve emitir advertência de tags', () => {
      const jsonString = JSON.stringify([
        {
          type: 'LR',
          tag: '[LR]',
          paragraphs: ['Hello, my dear friend!'],
        },
      ]);

      const warns: string[] = [];
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => warns.push(args.join(' '));

      try {
        const result = aefBlockEngine.parsePedagogicalContent(jsonString);
        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].type, 'LR');
        assert.strictEqual(warns.length, 0, 'Nenhum warning deve ser emitido para JSON serializado');
      } finally {
        console.warn = originalWarn;
      }
    });

    it('ao receber texto legado com tags [LR], [VOC], [Q], DEVE acionar o fallback e emitir console.warn explícito', () => {
      const legacyTagText = `
[INTRO]
Focus: Entender o sentimento da estrutura de tempo.
Chunks:
- at five o'clock
- in the afternoon

[LR]
Paragraph one of the story.
Paragraph two of the story.

[VOC]
- take for granted: não dar o devido valor (expressão idiomática)
- on the other hand: por outro lado

[Q]
Q: What time was it?
A: It was five o'clock.

[LRT]
1. What time was it?
2. Did he leave early?

[LASK]
1. It was five o'clock. -> What time was it?

[PRO]
He arrived_at five.
Sacada de Ouro: Ligue o som de d com a vogal seguinte.
`;

      const warns: string[] = [];
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => warns.push(args.join(' '));

      try {
        const result = aefBlockEngine.parsePedagogicalContent(legacyTagText, {
          lessonTitle: 'Aula MS001 Legada',
        });

        assert.strictEqual(warns.length > 0, true, 'Deve emitir advertência explícita');
        assert.ok(
          warns.some(w => w.includes('[AEF Pedagogical Engine] Usando parser legado de tags para: Aula MS001 Legada')),
          'Warning deve conter prefixo canônico e nome do contexto'
        );

        // Verifica os blocos gerados pelo fallback
        assert.strictEqual(result.length >= 6, true);
        const types = result.map((b: any) => b.type);
        assert.ok(types.includes('INTRO'));
        assert.ok(types.includes('LR'));
        assert.ok(types.includes('VOC'));
        assert.ok(types.includes('LA'), 'Tag legada [Q] deve ser mapeada para bloco canônico LA');
        assert.ok(types.includes('LRT'));
        assert.ok(types.includes('LASK'));
        assert.ok(types.includes('PRO'));
      } finally {
        console.warn = originalWarn;
      }
    });

    it('parseLegacyPedagogicalText deve tratar texto sem tags convertendo para LR padrão', () => {
      const rawText = 'Just a raw English narrative without any tags.\n\nSecond paragraph here.';
      const result = parseLegacyPedagogicalText(rawText);
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].type, 'LR');
      assert.strictEqual((result[0] as any).paragraphs.length, 2);
    });
  });

  // ==========================================================================
  // 3. RENDERIZAÇÃO HTML CALM EDTECH & REGRAS CANÔNICAS
  // ==========================================================================
  describe('Renderização HTML Calm EdTech (aef-block-engine.js)', () => {

    it('deve renderizar classes de alto contraste Calm EdTech (bg-amber-50, border-amber-200, zero caixas escuras)', () => {
      const blocks: PedagogicalBlock[] = [
        {
          type: 'LR',
          tag: '[LR]',
          paragraphs: ['Hello, my dear friend!'],
        },
      ];

      const html = aefBlockEngine.renderPedagogicalBlocks(blocks);
      assert.ok(html.includes('pedagogical-content-stream'));
      assert.ok(html.includes('bg-amber-50'));
      assert.ok(html.includes('border-2 border-amber-200'));
      assert.ok(html.includes('text-slate-900'));
      // Regra de Ouro: Proibição de fundos pretos/escuros em blocos didáticos
      assert.strictEqual(html.includes('bg-[#0A192F]'), false);
      assert.strictEqual(html.includes('bg-slate-950'), false);
    });

    it('Regra LA: NUNCA revelar as respostas prontas no HTML (Zero Respostas Reveladas)', () => {
      const laBlock: PedagogicalBlock = {
        type: 'LA',
        tag: '[LA]',
        drills: [
          {
            negativeContext: 'He did not go home.',
            questionVariations: ['Did he go home immediately?'],
            answerVariations: ['SUPER_SECRET_ANSWER_THAT_MUST_NEVER_BE_SHOWN'],
          },
        ],
      };

      const html = aefBlockEngine.renderPedagogicalBlock(laBlock);
      assert.ok(html.includes('Did he go home immediately?'), 'Pergunta deve estar visível');
      assert.ok(html.includes('3. Listen & Answer (LA)'));
      assert.strictEqual(
        html.includes('SUPER_SECRET_ANSWER_THAT_MUST_NEVER_BE_SHOWN'),
        false,
        'A resposta pronta jamais deve ser revelada no HTML/tela'
      );
      assert.ok(html.includes('Zero respostas reveladas'));
    });

    it('Regra LASK: NUNCA revelar as perguntas prontas no HTML (Zero Perguntas Reveladas)', () => {
      const laskBlock: PedagogicalBlock = {
        type: 'LASK',
        tag: '[LASK]',
        drills: [
          {
            negativeContext: 'She bought a new car yesterday.',
            questionVariations: ['HIDDEN_QUESTION_FORMULATION_SECRET'],
            answerVariations: [],
          },
        ],
      };

      const html = aefBlockEngine.renderPedagogicalBlock(laskBlock);
      assert.ok(html.includes('She bought a new car yesterday.'), 'Frase de estímulo deve estar visível');
      assert.ok(html.includes('5. Listen & Ask (LASK)'));
      assert.strictEqual(
        html.includes('HIDDEN_QUESTION_FORMULATION_SECRET'),
        false,
        'A formulação pronta da pergunta jamais deve ser mostrada antecipadamente'
      );
      assert.ok(html.includes('Zero perguntas reveladas'));
    });

    it('Regra PRO: Deve renderizar o texto integral com linking e a Sacada de Ouro monumental do Leo', () => {
      const proBlock: PedagogicalBlock = {
        type: 'PRO',
        tag: '[PRO]',
        fullTextWithLinking: ['She went_to the market_and bought_apples.'],
        goldenTip: 'Preste atenção na conexão do som de t com a vogal.',
      };

      const html = aefBlockEngine.renderPedagogicalBlock(proBlock);
      assert.ok(html.includes('6. Pronunciation & Connected Speech (PRO)'));
      assert.ok(html.includes('She went_to the market_and bought_apples.'));
      assert.ok(html.includes('SACADA DE OURO DO PROFESSOR LEO'));
      assert.ok(html.includes('Preste atenção na conexão do som de t com a vogal.'));
    });

    it('Regra VOC: Deve renderizar chunks com botão de áudio (▶) e tradução falada real', () => {
      const vocBlock: PedagogicalBlock = {
        type: 'VOC',
        tag: '[VOC]',
        storyTranslation: ['História completa para contexto.'],
        items: [
          {
            type: 'chunk',
            target: 'hang out',
            spokenTranslation: 'Passar um tempo junto / Ficar de bobeira',
            grammarNote: 'Verbo coloquial informal',
          },
        ],
      };

      const html = aefBlockEngine.renderPedagogicalBlock(vocBlock);
      assert.ok(html.includes('2. Vocabulary Session (VOC)'));
      assert.ok(html.includes('hang out'));
      assert.ok(html.includes('Passar um tempo junto / Ficar de bobeira'));
      assert.ok(html.includes('Verbo coloquial informal'));
      assert.ok(html.includes('▶'), 'Deve conter botão de áudio individual para cada chunk');
    });

    it('Regra LRT: Deve renderizar perguntas-guia visuais para speaking autônomo', () => {
      const lrtBlock: PedagogicalBlock = {
        type: 'LRT',
        tag: '[LRT]',
        guideQuestions: [
          'Where did they go after lunch?',
          'How did they feel about the news?',
        ],
      };

      const html = aefBlockEngine.renderPedagogicalBlock(lrtBlock);
      assert.ok(html.includes('4. Look & Retell (LRT)'));
      assert.ok(html.includes('Where did they go after lunch?'));
      assert.ok(html.includes('How did they feel about the news?'));
    });
  });

  // ==========================================================================
  // 4. INTEGRAÇÃO DE INTERFACES & RETROCOMPATIBILIDADE
  // ==========================================================================
  describe('Integração de Interfaces & Retrocompatibilidade', () => {

    it('aefPedagogicalEngine deve delegar corretamente para aefBlockEngine', () => {
      const blocks: PedagogicalBlock[] = [
        {
          type: 'LR',
          paragraphs: ['Delegated test paragraph.'],
        },
      ];

      const parsed = aefPedagogicalEngine.parse(blocks);
      assert.strictEqual(parsed.length, 1);
      assert.strictEqual(parsed[0].type, 'LR');

      const rendered = aefPedagogicalEngine.render(blocks);
      assert.ok(rendered.includes('Delegated test paragraph.'));
    });

    it('aefBlockEngine deve preservar intactas suas funcionalidades de marketing blocks', async () => {
      assert.strictEqual(typeof aefBlockEngine.getAllBlocks, 'function');
      assert.strictEqual(typeof aefBlockEngine.findBestBlockForSlot, 'function');
      assert.strictEqual(typeof aefBlockEngine.renderAllSlots, 'function');

      const blocks = await aefBlockEngine.getAllBlocks();
      assert.ok(Array.isArray(blocks));
      assert.ok(blocks.length > 0);
    });
  });

  // ==========================================================================
  // 5. BATERIA DE TESTES ADVERSARIAIS & MODO FAIL-CLOSED (LA / LASK MALFORMADOS)
  // ==========================================================================
  describe('Bateria de Testes Adversariais & Modo Fail-Closed (LA / LASK Malformados)', () => {

    it('LA malformado com tag não fechada "[LA" não deve expor a resposta secreta no HTML', () => {
      const adversarialText = `[LR]
Rodrigo was standing in the hall.

[LA
Q: Did Rodrigo open the door?
A: SECRET_ANSWER_HE_ABSOLUTELY_DID_NOT_OPEN_IT

[PRO]
Repeat after me.`;

      // 1. Testa o parser legado de TypeScript
      const parsedBlocks = parseLegacyPedagogicalText(adversarialText);
      const laBlock = parsedBlocks.find(b => b.type === 'LA');
      assert.ok(laBlock, 'Deveria identificar bloco LA mesmo com tag malformada');
      assert.strictEqual(laBlock?.failClosed, true, 'LA malformado deve marcar failClosed = true');

      // 2. Testa a renderização no motor unificado
      const renderedHtml = aefBlockEngine.renderPedagogicalContent(adversarialText);

      // Asserção inegociável de zero vazamento de resposta
      assert.strictEqual(
        renderedHtml.includes('SECRET_ANSWER_HE_ABSOLUTELY_DID_NOT_OPEN_IT'),
        false,
        'O HTML final JAMAIS deve expor o gabarito/resposta em caso de tag malformada'
      );

      // Deve renderizar aviso pedagógico seguro de alto contraste
      assert.ok(renderedHtml.includes('Aviso Didático'));
      assert.ok(renderedHtml.includes('Modo Fail-Closed Ativado'));
      assert.ok(renderedHtml.includes('Zero respostas reveladas'));
    });

    it('LA com pergunta e resposta sem quebra ou delimitador claro deve acionar Fail-Closed e omitir resposta', () => {
      const adversarialText = `[LA]
Did Rodrigo open the door? YES_HE_DID_SECRET_ANSWER_WITHOUT_DELIMITER
[PRO]
Keep talking.`;

      const parsedBlocks = parseLegacyPedagogicalText(adversarialText);
      const laBlock = parsedBlocks.find(b => b.type === 'LA');
      assert.ok(laBlock);
      assert.strictEqual(laBlock?.failClosed, true);

      const renderedHtml = aefBlockEngine.renderPedagogicalContent(adversarialText);
      assert.strictEqual(
        renderedHtml.includes('YES_HE_DID_SECRET_ANSWER_WITHOUT_DELIMITER'),
        false,
        'A resposta embutida sem delimitador seguro não pode ser exibida'
      );
      assert.ok(renderedHtml.includes('Modo Fail-Closed Ativado'));
    });

    it('LA com tag aninhada incorretamente dentro de VOC não deve vazar resposta', () => {
      const adversarialText = `[VOC]
Here is a normal chunk.
[LA]
Q: What was his destination?
A: SECRET_ANSWER_DESTINATION_LONDON
[PRO]
Practice connected speech.`;

      const renderedHtml = aefBlockEngine.renderPedagogicalContent(adversarialText);

      assert.strictEqual(
        renderedHtml.includes('SECRET_ANSWER_DESTINATION_LONDON'),
        false,
        'Gabarito não pode vazar mesmo com tags aninhadas ou sobrepostas'
      );
    });

    it('LASK malformado com tag não fechada "[LASK" deve acionar Fail-Closed e omitir pergunta prévia', () => {
      const adversarialText = `[LR]
He went to London last summer.

[LASK
He went to London.
Q: SECRET_QUESTION_DID_HE_GO_TO_LONDON?
Ask: Where did he go?

[PRO]
Final pronunciation practice.`;

      const parsedBlocks = parseLegacyPedagogicalText(adversarialText);
      const laskBlock = parsedBlocks.find(b => b.type === 'LASK');
      assert.ok(laskBlock, 'Deveria identificar bloco LASK');
      assert.strictEqual(laskBlock?.failClosed, true, 'LASK malformado deve marcar failClosed = true');

      const renderedHtml = aefBlockEngine.renderPedagogicalContent(adversarialText);

      // Asserção inegociável da Regra 5 (Zero Perguntas Reveladas)
      assert.strictEqual(
        renderedHtml.includes('SECRET_QUESTION_DID_HE_GO_TO_LONDON'),
        false,
        'O HTML final JAMAIS deve expor a pergunta prévia em LASK'
      );

      assert.ok(renderedHtml.includes('Aviso Didático'));
      assert.ok(renderedHtml.includes('Zero perguntas reveladas'));
    });

    it('LASK com pergunta exposta sem gatilho estruturado deve acionar Fail-Closed', () => {
      const adversarialText = `[LASK]
Why did she leave so early without saying goodbye?
[PRO]
Listen and repeat.`;

      const parsedBlocks = parseLegacyPedagogicalText(adversarialText);
      const laskBlock = parsedBlocks.find(b => b.type === 'LASK');
      assert.ok(laskBlock);
      assert.strictEqual(laskBlock?.failClosed, true);

      const renderedHtml = aefBlockEngine.renderPedagogicalContent(adversarialText);
      assert.strictEqual(
        renderedHtml.includes('Why did she leave so early without saying goodbye?'),
        false,
        'Pergunta crua em LASK deve ser retida pelo Fail-Closed para não estragar o reflexo'
      );
      assert.ok(renderedHtml.includes('Modo Fail-Closed Ativado'));
    });

    it('Defesa em profundidade no renderizador: bloco LA construído com texto de resposta no prompt deve interceptar e acionar Fail-Closed', () => {
      const poisonedBlock: PedagogicalBlock = {
        type: 'LA',
        questions: [
          'Did Rodrigo like the idea? Answer: SECRET_DIRECT_LEAK_NO_HE_HATED_IT',
        ],
      };

      const html = aefBlockEngine.renderPedagogicalBlock(poisonedBlock);
      assert.strictEqual(
        html.includes('SECRET_DIRECT_LEAK_NO_HE_HATED_IT'),
        false,
        'O renderizador deve interceptar respostas mesmo que inseridas diretamente no array de questões'
      );
      assert.ok(html.includes('Aviso Didático'));
      assert.ok(html.includes('Zero respostas reveladas'));
    });

    it('Defesa em profundidade no renderizador: bloco LASK com prompt contendo "Question:" deve interceptar e acionar Fail-Closed', () => {
      const poisonedBlock: PedagogicalBlock = {
        type: 'LASK',
        prompts: [
          'He lived in Madrid. Question: SECRET_DIRECT_QUESTION_WHERE_DID_HE_LIVE?',
        ],
      };

      const html = aefBlockEngine.renderPedagogicalBlock(poisonedBlock);
      assert.strictEqual(
        html.includes('SECRET_DIRECT_QUESTION_WHERE_DID_HE_LIVE'),
        false,
        'O renderizador deve interceptar perguntas prontas mesmo que inseridas no array de prompts'
      );
      assert.ok(html.includes('Aviso Didático'));
      assert.ok(html.includes('Zero perguntas reveladas'));
    });

    it('Isolamento cirúrgico: falha em LA ou LASK não quebra os outros blocos válidos da lição', () => {
      const raw = `[LR]
Valid story paragraph one. Rodrigo arrived on time.

[LA
Corrupted LA without close tag and leaked A: SECRET_POISON_ANSWER

[PRO]
Rodrigo was standing in the kitchen.`;

      const html = aefBlockEngine.renderPedagogicalContent(raw);

      // LA foi isolado
      assert.strictEqual(html.includes('SECRET_POISON_ANSWER'), false);
      assert.ok(html.includes('Modo Fail-Closed Ativado'));

      // Os blocos válidos permaneceram 100% íntegros e funcionais
      assert.ok(html.includes('1. Listen & Read (LR)'));
      assert.ok(html.includes('Rodrigo arrived on time.'));
      assert.ok(html.includes('6. Pronunciation & Connected Speech (PRO)'));
      assert.ok(html.includes('Rodrigo was standing in the kitchen.'));
    });

    it('Asserção formal estrita: NENHUMA resposta ou pergunta é vazada em cenários de teste de estresse', () => {
      const stressCases = [
        '[LA] Q: Where was she? Ans: SECRET_STRESS_1',
        '[LA] Q: Is he ready? Resposta: SECRET_STRESS_2',
        '[LA] Who called? [A] SECRET_STRESS_3',
        '[LASK] Statement. Pergunta: SECRET_STRESS_4',
        '[LASK] Statement. Ask: SECRET_STRESS_5',
      ];

      for (let i = 0; i < stressCases.length; i++) {
        const text = stressCases[i];
        const secretToken = `SECRET_STRESS_${i + 1}`;
        const html = aefBlockEngine.renderPedagogicalContent(text);

        assert.strictEqual(
          html.includes(secretToken),
          false,
          `O segredo "${secretToken}" não pode aparecer no HTML final para o caso: ${text}`
        );
      }
    });
  });

  // ==========================================================================
  // 6. TRAVA ANTI-RETROCESSO (CI / BUILD GUARD): VALIDAÇÃO CANÔNICA ZOD
  // ==========================================================================
  describe('Trava Anti-Retrocesso (CI / Build Guard): Validação Canônica Zod de Novas Lições', () => {

    it('assertCanonicalLesson deve aprovar lição canônica perfeitamente estruturada', () => {
      const validLesson: CanonicalLesson = {
        id: 'lesson-ms-01',
        slug: 'rodrigo-and-the-coffee',
        courseId: 'quickstart',
        moduleId: 'module-01',
        title: 'Rodrigo and the Coffee',
        hasTrainingTrack: true,
        trainingTrackId: 'track-ms-01',
        thumbnailUrl: '/assets/images/lessons/thumb-01.webp',
        artworkUrl: '/assets/images/lessons/art-01.webp',
        goldenTip: 'Preste atenção em como as consoantes se conectam às vogais!',
        blocks: [
          {
            type: 'LR',
            paragraphs: ['Rodrigo went downstairs to make coffee.'],
          },
          {
            type: 'VOC',
            items: [
              {
                type: 'chunk',
                target: 'went downstairs',
                spokenTranslation: 'desceu as escadas',
              },
            ],
          },
          {
            type: 'LA',
            drills: [
              {
                negativeContext: 'He did not go upstairs.',
                questionVariations: ['Where did Rodrigo go?'],
                answerVariations: ['He went downstairs.'],
              },
            ],
          },
          {
            type: 'LRT',
            guideQuestions: ['Where did Rodrigo go?'],
            keywords: ['downstairs', 'coffee'],
          },
          {
            type: 'LASK',
            drills: [
              {
                negativeContext: 'Rodrigo went downstairs to make coffee.',
                questionVariations: ['Where did Rodrigo go?'],
                answerVariations: [],
              },
            ],
          },
          {
            type: 'PRO',
            fullTextWithLinking: ['Rodrigo went_downstairs to make coffee.'],
            goldenTip: 'Conecte went com downstairs sem pausa.',
          },
        ],
      };

      assert.strictEqual(isCanonicalLesson(validLesson), true);
      const validated = validateCanonicalLesson(validLesson);
      assert.strictEqual(validated.slug, 'rodrigo-and-the-coffee');
      assert.strictEqual(validated.blocks.length, 6);

      // Não deve lançar erro
      assert.doesNotThrow(() => {
        assertCanonicalLesson(validLesson);
      });
    });

    it('assertCanonicalLesson deve rejeitar lição com campos obrigatórios ausentes ou tipos inválidos', () => {
      const invalidLesson = {
        id: 'lesson-bad',
        // slug faltando!
        title: 'Lição Inválida',
        blocks: 'isto não é um array de blocos canônicos',
      };

      assert.strictEqual(isCanonicalLesson(invalidLesson), false);

      const result = safeValidateCanonicalLesson(invalidLesson);
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok((result.error?.issues?.length ?? 0) > 0);
      }

      assert.throws(
        () => {
          assertCanonicalLesson(invalidLesson);
        },
        /Violação do Schema Canônico de Lições/
      );
    });

    it('assertCanonicalLesson deve rejeitar lição com blocos vazios ou inválidos', () => {
      const lessonWithBadBlock = {
        id: 'lesson-02',
        slug: 'bad-block-lesson',
        title: 'Lição com Bloco Vazio',
        blocks: [
          {
            type: 'LA',
            drills: [], // Vazio! Min 1 obrigatório
          },
        ],
      };

      assert.strictEqual(isCanonicalLesson(lessonWithBadBlock), false);
      assert.throws(
        () => {
          assertCanonicalLesson(lessonWithBadBlock);
        },
        /Violação do Schema Canônico de Lições/
      );
    });

    it('safeValidateCanonicalLesson retorna mensagens detalhadas de diagnóstico para CI/CD', () => {
      const payload = {
        title: 'Apenas Título',
      };

      const res = safeValidateCanonicalLesson(payload);
      assert.strictEqual(res.success, false);
      if (!res.success) {
        const issuesText = (res.error?.issues || []).map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
        assert.ok(issuesText.includes('id'));
        assert.ok(issuesText.includes('slug'));
        assert.ok(issuesText.includes('blocks'));
      }
    });
  });
});

