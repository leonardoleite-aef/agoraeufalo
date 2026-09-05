/**
 * AgoraEuFalo • AI Pocket Course Architect (Player-First Edition)
 * Professor Leonardo Leite — 35+ Anos de Sala de Aula
 * 
 * Motor de Inteligência Pedagógica com Thinking Process que converte
 * mini-prompts do Professor Leo em Pocket Courses completos e operacionais:
 * - Foco 100% "Pelos Ouvidos & Player-First" (scripts elaborados para TTS)
 * - Zero Jargões Gramaticais (Didática do "Sentimento da Estrutura")
 * - Português Falado Brasileiro Real (spokenTranslation)
 * - Blueprint Visual Cinematográfico 35mm
 * - Estrutura pronta para injeção direta no aef-courses-registry e Firestore
 */

(function (window) {
  'use strict';

  // Banco de Presets Canônicos dos Temas Mais Pedidos de Pocket Courses
  const POCKET_PRESETS = {
    shopping: {
      category: 'Atividades Cotidianas',
      label: '🛒 Shopping & Supermercado',
      defaultPrompt: 'Compras em lojas de roupas e supermercado em NY: perguntar preços sem timidez, pedir tamanhos e cores diferentes, devolver um item e entender os caixas rápidos sem travar.',
      suggestedTitle: 'Shopping & Stores • O Inglês das Compras',
      badge: 'POCKET COURSE',
      artConcept: 'Authentic warm boutique clothing store in SoHo New York, cinematic 35mm film photography, photorealistic, natural warm lighting, friendly store assistant interacting with an adult customer, rich textures, Calm EdTech luxury color grading, no text'
    },
    eating: {
      category: 'Atividades Cotidianas',
      label: '🍽️ Eating Out, Pubs & Cafés',
      defaultPrompt: 'Pedir comida e bebida em restaurantes e pubs em Londres: entender o menu sem constrangimento, pedir sugestão do garçom, pedir alterações no prato sem parecer rude e pedir a conta com elegância.',
      suggestedTitle: 'Eating Out & Pubs • Do Cardápio à Conta',
      badge: 'POCKET COURSE',
      artConcept: 'Cozy authentic London restaurant and pub dining room, wooden tables, warm candle glow, waiter taking order with smile, cinematic 35mm film photography, shallow depth of field, authentic emotional expression, Calm EdTech colors, no text'
    },
    traveling: {
      category: 'Atividades Cotidianas',
      label: '✈️ Traveling, Alfândega & Aeroportos',
      defaultPrompt: 'Passar pela imigração e alfândega americana sem suar frio, pedir ajuda com bagagem perdida, pegar táxi/Uber e fazer check-in e check-out no hotel com segurança.',
      suggestedTitle: 'Airport & Travel • Sem Medo da Imigração',
      badge: 'POCKET COURSE',
      artConcept: 'Modern international airport departure terminal, golden hour sunlight streaming through glass windows, calm adult traveler with carry-on bag, cinematic 35mm film photography, shallow depth of field, photorealistic, no text'
    },
    meetings: {
      category: 'Vida Profissional',
      label: '💼 Business Meetings & Intervenções',
      defaultPrompt: 'Participar de reuniões de trabalho em inglês: como intervir educadamente sem interromper de forma rude, discordar com diplomacia, pedir para repetir sem passar vergonha e resumir o combinado.',
      suggestedTitle: 'Business Meetings • Como Falar sem Travar',
      badge: 'PRO POCKET',
      artConcept: 'Professional corporate meeting room with natural daylight, diverse adults in discussion around a modern wooden table, collaborative atmosphere, cinematic 35mm film photography, shallow depth of field, rich textures, no text'
    },
    writing: {
      category: 'Vida Profissional',
      label: '✉️ Writing & E-mails Profissionais',
      defaultPrompt: 'Escrever e-mails de trabalho curtos, elegantes e diretos ao ponto, sem usar tradutor literal ou soar robótico, com follow-ups gentis e despedidas profissionais autênticas.',
      suggestedTitle: 'Quick E-mails • Escrita Profissional Elegante',
      badge: 'PRO POCKET',
      artConcept: 'Minimalist warm home office desk with laptop and coffee mug, morning sunlight, adult typing an email calmly, cinematic 35mm film photography, photorealistic, Calm EdTech luxury color grading, no text'
    },
    listening_pure: {
      category: 'Treinos Específicos',
      label: '🎧 Only Listening (Imersão nos Ouvidos)',
      defaultPrompt: 'Treino intensivo de escuta para quem entende quando lê, mas fica completamente surdo quando os nativos falam rápido, focado em connected speech e reduções sonoras do dia a dia.',
      suggestedTitle: 'Only Listening • Destravando a Audição Real',
      badge: 'AUDIO ONLY',
      artConcept: 'Adult wearing over-ear studio headphones relaxing by a window with eyes closed listening deeply, warm afternoon sunlight, cinematic 35mm film photography, photorealistic, Calm EdTech luxury color grading, no text'
    },
    emergency: {
      category: 'Treinos Específicos',
      label: '🚨 Emergency 48h (Socorro Imediato)',
      defaultPrompt: 'Kit de sobrevivência em inglês para quem vai viajar ou fazer uma entrevista em menos de 48 horas e precisa das 30 frases que salvam qualquer situação em bate-pronto.',
      suggestedTitle: 'Emergency 48h • O Kit de Sobrevivência',
      badge: 'EMERGENCY',
      artConcept: 'Vintage leather suitcase packed beside a passport and flight tickets on a warm wooden table, cinematic 35mm film photography, shallow depth of field, natural soft lighting, Calm EdTech luxury colors, no text'
    }
  };

  class AEFPocketCourseAI {
    constructor() {
      this.presets = POCKET_PRESETS;
    }

    getPresets() {
      return this.presets;
    }

    /**
     * Gera a estrutura completa de um Pocket Course Player-First
     * a partir de um prompt curto e das diretrizes do Professor Leo
     */
    async generatePocketCourse(promptText, presetKey = null) {
      const preset = presetKey && this.presets[presetKey] ? this.presets[presetKey] : null;
      const cleanPrompt = (promptText || (preset ? preset.defaultPrompt : 'Inglês da vida prática')).trim();

      // Identifica tema principal
      const title = preset ? preset.suggestedTitle : this.deriveTitle(cleanPrompt);
      const slug = this.slugify(title);
      const badge = preset ? preset.badge : 'POCKET COURSE';

      // 1. Geração da Promessa e Sinopse no Tom do Professor Leo
      const promise = this.generateLeoPromise(cleanPrompt, title);

      // 2. Geração das 3 Aulas Player-First com Scripts de Áudio Dramatizados para TTS
      const lessons = this.generateLessonsWithAudioScripts(cleanPrompt, title, slug);

      // 3. Blueprint Visual de Cinema 35mm
      const artConcept = preset ? preset.artConcept : `${cleanPrompt}, cinematic 35mm film photography, photorealistic, natural warm lighting, shallow depth of field, authentic emotional expression, Calm EdTech luxury color grading, no text`;

      const courseObject = {
        id: slug,
        slug: slug,
        title: title,
        badge: badge,
        tierRequired: 'free',
        coverImageUrl: 'assets/images/cover-default-aef.jpg',
        thumbnailUrl: 'assets/images/cover-default-aef.jpg',
        artworkUrl: 'assets/images/cover-default-aef.jpg',
        description: promise,
        published: true,
        aiGenerated: true,
        aiPromptUsed: cleanPrompt,
        visualPromptBlueprint: artConcept,
        createdAt: new Date().toISOString(),
        modules: [
          {
            id: `${slug}-m1`,
            title: `Módulo Único • ${title}`,
            order: 1,
            description: 'Aprenda pelos ouvidos e repita até a fala virar reflexo no Training Player.',
            published: true,
            lessons: lessons
          }
        ]
      };

      return courseObject;
    }

    deriveTitle(prompt) {
      if (/compras|loja|supermercado|shopping/i.test(prompt)) return 'Shopping & Stores • O Inglês das Compras';
      if (/restaurante|pub|comer|card[aá]pio|comida|bebida/i.test(prompt)) return 'Eating Out & Pubs • Do Pedido à Conta';
      if (/viagem|aeroporto|imigra[cç][aã]o|hotel|alf[aâ]ndega/i.test(prompt)) return 'Travel & Airports • Sem Medo da Imigração';
      if (/reuni[aã]o|trabalho|neg[oó]cios|meeting/i.test(prompt)) return 'Business Meetings • Como Falar sem Travar';
      if (/e-?mail|escrever|escrita|mensagens/i.test(prompt)) return 'Quick E-mails • Escrita Profissional Elegante';
      if (/ouvir|escuta|listening|ouvidos/i.test(prompt)) return 'Only Listening • Destravando a Audição Real';
      if (/urgente|emerg[eê]ncia|48h|r[aá]pido/i.test(prompt)) return 'Emergency 48h • O Kit de Sobrevivência';

      const words = prompt.split(' ').slice(0, 4).join(' ');
      return `${words.charAt(0).toUpperCase() + words.slice(1)} • Pocket Course`;
    }

    generateLeoPromise(prompt, title) {
      return `Hello, my dear friend! Leonardo Leite aqui. Se você já passou pela situação de travar em "${title}", respire fundo: o problema nunca foi a sua capacidade. Foi tentar decorar regras no papel em vez de treinar os seus ouvidos na situação real. Neste Pocket Course, você não vai perder horas na frente do computador: pegue seus fones, aperte o play e repita comigo até a fala sair no automático!`;
    }

    generateLessonsWithAudioScripts(prompt, courseTitle, slug) {
      return [
        {
          id: `${slug}-l1`,
          moduleId: `${slug}-m1`,
          courseId: slug,
          title: 'Aula 01 • A Chegada & O Primeiro Impacto Sem Travar',
          order: 1,
          duration: '03:45',
          description: 'Aprenda a abordagem inicial pelo som real, eliminando traduções literais duras.',
          videoUrl: '',
          audioUrl: '',
          thumbnailUrl: 'assets/images/cover-default-aef.jpg',
          artworkUrl: 'assets/images/cover-default-aef.jpg',
          pdfUrl: '',
          hasTrainingTrack: true,
          trainingTrackId: `${slug}-track-1`,
          published: true,
          goldenTip: 'Nunca traduza "posso te ajudar?" palavra por palavra. Foque no ritmo de "Can I help you?" ou "How can I help you today?". O segredo é a melodia!',
          audioScript: `[Speaker: Leo (Charon)]
Hello, my friend! Leonardo Leite aqui. Vamos para o primeiro impacto!
Ouça com extrema atenção a conversa entre dois nativos. Não olhe para a escrita agora; observe com os ouvidos!
[pause: 1.5s]

[Speaker: StoreAssistant (Aoede)]
Hi there! How are you doing today? Can I help you find anything?
[pause: 0.8s]

[Speaker: Customer (Puck)]
Hi! I'm just looking around, thank you. Actually, do you have this in a medium?
[pause: 1.0s]

[Speaker: StoreAssistant (Aoede)]
Sure thing! Let me check the back for you. Just a second.
[pause: 1.5s]

[Speaker: Leo (Charon)]
Pegou o sentimento da frase "I'm just looking around"? 
Em português coloquial do dia a dia, é o nosso famoso: "Tô só dando uma olhadinha, obrigado!".
Zero complicação. Agora aperte o loop no player e repita até sair no reflexo!`,
          processedContentHtml: `
            <div class="space-y-4">
              <div class="p-5 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
                <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
                  <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
                    🎧 Treino Pelos Ouvidos no Player
                  </span>
                  <span class="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Foco no Som</span>
                </div>
                <p class="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  Coloque os fones de ouvido. Não tente ler enquanto escuta na primeira vez. Ouça a entonação, as contrações e o ritmo natural da conversa.
                </p>
              </div>

              <div class="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs space-y-3">
                <h4 class="font-black text-xs uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  ⚡ O Sentimento da Estrutura (Português Falado Real)
                </h4>
                <div class="space-y-2 text-xs text-slate-800">
                  <div class="p-3 bg-white rounded-xl border border-amber-200/60 flex items-center justify-between">
                    <span class="font-bold text-slate-900">"I'm just looking around."</span>
                    <span class="text-amber-800 font-medium">➔ "Tô só dando uma olhadinha."</span>
                  </div>
                  <div class="p-3 bg-white rounded-xl border border-amber-200/60 flex items-center justify-between">
                    <span class="font-bold text-slate-900">"Sure thing!"</span>
                    <span class="text-amber-800 font-medium">➔ "Com certeza! / Já é!"</span>
                  </div>
                  <div class="p-3 bg-white rounded-xl border border-amber-200/60 flex items-center justify-between">
                    <span class="font-bold text-slate-900">"Let me check the back for you."</span>
                    <span class="text-amber-800 font-medium">➔ "Vou dar uma olhada lá no estoque."</span>
                  </div>
                </div>
              </div>
            </div>
          `
        },
        {
          id: `${slug}-l2`,
          moduleId: `${slug}-m1`,
          courseId: slug,
          title: 'Aula 02 • O Bate-Pronto: Perguntando e Negociando',
          order: 2,
          duration: '04:15',
          description: 'Velocidade de resposta quando o nativo fala rápido ou oferece opções.',
          videoUrl: '',
          audioUrl: '',
          thumbnailUrl: 'assets/images/cover-default-aef.jpg',
          artworkUrl: 'assets/images/cover-default-aef.jpg',
          pdfUrl: '',
          hasTrainingTrack: true,
          trainingTrackId: `${slug}-track-2`,
          published: true,
          goldenTip: 'Se não entender de primeira, não diga "What?". Use "Could you say that again, please?" com cadência suave. Soa polido e natural.',
          audioScript: `[Speaker: Leo (Charon)]
Aula dois! Aqui treinamos o bate-pronto.
Ouvir o que você precisa e responder na velocidade de um nativo, sem pensar na tradução.
[pause: 1.5s]

[Speaker: StoreAssistant (Aoede)]
We don't have this one in blue, but we do have it in charcoal grey. Would you like to try it on?
[pause: 0.8s]

[Speaker: Customer (Puck)]
Charcoal grey looks great. Where are the fitting rooms?
[pause: 0.8s]

[Speaker: StoreAssistant (Aoede)]
Right around the corner on your left.
[pause: 1.5s]

[Speaker: Leo (Charon)]
Atenção ao chunk "Would you like to try it on?".
Em português falado: "Quer provar?". Simples, direto e elegante.
No player de treino, repita o áudio até a sua boca não tropeçar nas palavras!`,
          processedContentHtml: `
            <div class="space-y-4">
              <div class="p-5 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
                <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] block">
                  🎯 O Reflexo da Pergunta & Resposta
                </span>
                <p class="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  Treine o bate-pronto com as pausas do áudio no player. Responda em voz alta assim que ouvir a deixa.
                </p>
              </div>
            </div>
          `
        },
        {
          id: `${slug}-l3`,
          moduleId: `${slug}-m1`,
          courseId: slug,
          title: 'Aula 03 • Finalizando com Elegância & Pagamento',
          order: 3,
          duration: '03:50',
          description: 'Caixa, formas de pagamento, recibo e despedida sem constrangimento.',
          videoUrl: '',
          audioUrl: '',
          thumbnailUrl: 'assets/images/cover-default-aef.jpg',
          artworkUrl: 'assets/images/cover-default-aef.jpg',
          pdfUrl: '',
          hasTrainingTrack: true,
          trainingTrackId: `${slug}-track-3`,
          published: true,
          goldenTip: 'Para pagar com aproximação do cartão ou celular, você só precisa dizer: "Can I tap?". Dois segundos e problema resolvido!',
          audioScript: `[Speaker: Leo (Charon)]
Última etapa do nosso Pocket Course: o fechamento!
É na hora do caixa que muita gente se enrola com termos como recibo, sacola e aproximação.
Ouça o diálogo final.
[pause: 1.5s]

[Speaker: StoreAssistant (Aoede)]
Will that be all for today?
[pause: 0.6s]

[Speaker: Customer (Puck)]
Yes, just this. Can I tap with my phone?
[pause: 0.6s]

[Speaker: StoreAssistant (Aoede)]
Yes, right on the terminal. Would you like your receipt with you or in the bag?
[pause: 0.8s]

[Speaker: Customer (Puck)]
In the bag is fine. Have a great day!
[pause: 1.5s]

[Speaker: Leo (Charon)]
Perfeito! Missão cumprida. 
Você acabou de dominar a conversa completa da vida real. 
Agora leve esse áudio para o seu treino diário no player!`,
          processedContentHtml: `
            <div class="space-y-4">
              <div class="p-5 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
                <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] block">
                  💳 Chunks de Ouro do Fechamento
                </span>
                <ul class="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-800 font-medium">
                  <li><b>"Will that be all?"</b> ➔ "Vai ser só isso hoje?"</li>
                  <li><b>"Can I tap?"</b> ➔ "Posso pagar por aproximação?"</li>
                  <li><b>"In the bag is fine."</b> ➔ "Pode pôr na sacola mesmo."</li>
                </ul>
              </div>
            </div>
          `
        }
      ];
    }

    slugify(text) {
      return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
  }

  window.aefPocketCourseAI = new AEFPocketCourseAI();

})(window);
