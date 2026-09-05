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

  // =========================================================================
  // MATRIZ DAS 10 CATEGORIAS CANÔNICAS DE POCKET COURSES (AGORAEUFALO)
  // =========================================================================
  const POCKET_PRESETS = {
    airport_flight: {
      id: 'airport-flight-survival',
      category: 'Viagem & Mobilidade',
      label: '✈️ Airport & In-Flight Survival',
      defaultPrompt: 'Navigating check-in, baggage claims, security screenings, flight delays, customs declarations, and asking flight attendants for assistance.',
      suggestedTitle: 'Airport & In-Flight Survival',
      badge: 'AIRPORT & FLIGHT',
      artConcept: 'Modern international airport departure lounge at dusk, warm soft lighting through floor-to-ceiling glass windows, adult passenger with carry-on suitcase looking at departures board, cinematic 35mm film photography, shallow depth of field, authentic expression, Calm EdTech luxury color grading, no text, no watermarks',
      lessons: [
        {
          title: 'Aula 01 • Check-in, Baggage Claims & Security Screening',
          order: 1,
          duration: '03:50',
          description: 'Despacho de malas, limites de bagagem de mão, líquidos e inspeção no raio-x sem suar frio.',
          goldenTip: 'Nunca traduza "vai despachar mala?" palavra por palavra. O nativo diz: "Are you checking any bags today?". Responda no reflexo: "Just this carry-on!"',
          dialogue: {
            speakerA: 'GateAgent (Aoede)',
            speakerB: 'Traveler (Puck)',
            lines: [
              { speaker: 'GateAgent', text: 'Good afternoon! Where are you flying to today? May I see your passport?', pause: 1.0 },
              { speaker: 'Traveler', text: 'Hi! Flying to Chicago. Here is my passport and boarding pass.', pause: 0.8 },
              { speaker: 'GateAgent', text: 'Are you checking any bags today, or do you just have this carry-on?', pause: 0.8 },
              { speaker: 'Traveler', text: 'Just this carry-on and my backpack. Does this fit the overhead bin?', pause: 0.8 },
              { speaker: 'GateAgent', text: 'Yes, perfect size. At security, please take out laptops and liquids.', pause: 1.2 }
            ],
            leoExplanation: 'Atenção ao chunk "Are you checking any bags?". No português falado real é simplesmente: "Vai despachar alguma mala?". E "carry-on" é a sua mala de mão. Ouça no player até sair no automático!',
            chunks: [
              { en: 'Are you checking any bags?', pt: 'Vai despachar alguma mala?' },
              { en: 'Just this carry-on.', pt: 'Só essa mala de mão mesmo.' },
              { en: 'Does this fit the overhead bin?', pt: 'Cabe no bagageiro em cima?' }
            ]
          }
        },
        {
          title: 'Aula 02 • Flight Delays, Gate Changes & In-Flight Assistance',
          order: 2,
          duration: '04:15',
          description: 'Como lidar com trocas de portão, voos atrasados e pedir ajuda às comissárias a bordo.',
          goldenTip: 'Se o voo atrasar e você tiver conexão apertada, chame a comissária e diga: "My connection is very tight in Dallas". Ela vai te adiantar!',
          dialogue: {
            speakerA: 'FlightAttendant (Aoede)',
            speakerB: 'Passenger (Puck)',
            lines: [
              { speaker: 'Passenger', text: 'Excuse me! Due to this departure delay, my connection in Dallas is very tight. Will I make it?', pause: 1.0 },
              { speaker: 'FlightAttendant', text: 'Let me check your connecting gate on my tablet. Your next flight was moved to gate B12 and is also delayed twenty minutes.', pause: 1.2 },
              { speaker: 'Passenger', text: 'What a relief! Could I also get a cup of hot tea and a blanket, please?', pause: 0.8 },
              { speaker: 'FlightAttendant', text: 'Right away, sir. Just press the call button if you need anything else.', pause: 1.2 }
            ],
            leoExplanation: 'Pegou o sentimento de "My connection is very tight"? Em bom português falado: "Minha conexão tá muito em cima da hora!". Simples, direto e sem jargões.',
            chunks: [
              { en: 'My connection is very tight.', pt: 'Minha conexão tá super apertada.' },
              { en: 'What a relief!', pt: 'Que alívio!' },
              { en: 'Press the call button.', pt: 'Aperte o botão de chamar comissário.' }
            ]
          }
        },
        {
          title: 'Aula 03 • Immigration, Customs Declarations & Arrival',
          order: 3,
          duration: '04:00',
          description: 'A entrevista de imigração, formulários de alfândega e localização da esteira de bagagens.',
          goldenTip: 'Na imigração, responda somente o que foi perguntado, em frases curtas e objetivas. Nada de historinha longa!',
          dialogue: {
            speakerA: 'ImmigrationOfficer (Aoede)',
            speakerB: 'Traveler (Puck)',
            lines: [
              { speaker: 'ImmigrationOfficer', text: 'Next! What is the purpose of your visit to the United States?', pause: 0.8 },
              { speaker: 'Traveler', text: 'Vacation and tourism, officer. Staying for twelve days.', pause: 0.8 },
              { speaker: 'ImmigrationOfficer', text: 'Where will you be staying? Do you have anything to declare?', pause: 0.8 },
              { speaker: 'Traveler', text: 'At the Hilton Downtown. Nothing to declare, no food or agricultural items.', pause: 0.8 },
              { speaker: 'ImmigrationOfficer', text: 'Welcome to the US. Baggage claim is downstairs on carousel four.', pause: 1.2 }
            ],
            leoExplanation: 'Zero pânico na imigração. "Nothing to declare" = "Nada a declarar". "Baggage claim" = "Retirada de bagagens". Repita os turnos até a pronúncia ficar solta!',
            chunks: [
              { en: 'What is the purpose of your visit?', pt: 'Qual o objetivo da sua viagem?' },
              { en: 'Nothing to declare.', pt: 'Nada a declarar.' },
              { en: 'Baggage claim on carousel four.', pt: 'Retirada de malas na esteira quatro.' }
            ]
          }
        }
      ]
    },

    dining_out: {
      id: 'dining-out-table-talk',
      category: 'Alimentação & Vida Social',
      label: '🍽️ Dining Out & Social Table Talk',
      defaultPrompt: 'Reading menus, asking about ingredients, ordering modifications, returning dishes politely, splitting the bill, and handling casual small talk with servers.',
      suggestedTitle: 'Dining Out & Social Table Talk',
      badge: 'DINING & SOCIAL',
      artConcept: 'Warm ambient restaurant interior in New York, authentic wooden dining table with plates and water glasses, server smiling taking an order from an adult guest, cinematic 35mm film photography, shallow depth of field, natural warm glow, rich textures, Calm EdTech luxury color grading, no text, no watermarks',
      lessons: [
        {
          title: 'Aula 01 • Reading Menus, Daily Specials & Ordering Drinks',
          order: 1,
          duration: '03:45',
          description: 'Chegada ao restaurante, entender o cardápio, pedir sugestão da casa e bebidas.',
          goldenTip: 'Quando o garçom perguntar "Still or sparkling?", ele só quer saber: "Água sem gás ou com gás?". Responda no reflexo: "Still with lemon, please!"',
          dialogue: {
            speakerA: 'Server (Aoede)',
            speakerB: 'Guest (Puck)',
            lines: [
              { speaker: 'Server', text: 'Good evening! Welcome to Bistro 21. Table for two inside, or would you prefer the patio?', pause: 1.0 },
              { speaker: 'Guest', text: 'Inside by the window, please. Could we see the drink menu?', pause: 0.8 },
              { speaker: 'Server', text: 'Certainly! Still or sparkling water to start while you look over the specials?', pause: 0.8 },
              { speaker: 'Guest', text: 'Sparkling with lime, please. What do you recommend for appetizers?', pause: 1.2 }
            ],
            leoExplanation: '"Table for two" = "Mesa para dois". "Sparkling with lime" = "Com gás e limão". Treine o ritmo da fala sem pensar na gramática!',
            chunks: [
              { en: 'Table for two, please.', pt: 'Mesa para dois, por favor.' },
              { en: 'Still or sparkling water?', pt: 'Água sem gás ou com gás?' },
              { en: 'What do you recommend?', pt: 'O que você recomenda?' }
            ]
          }
        },
        {
          title: 'Aula 02 • Ordering Modifications, Dietary Needs & Returning Dishes',
          order: 2,
          duration: '04:20',
          description: 'Fazer alterações no prato sem parecer grosseiro e devolver algo que veio errado com polidez.',
          goldenTip: 'Para pedir molho separado ou tirar algum ingrediente, use: "On the side" ou "Hold the onions". É como nativo fala no dia a dia.',
          dialogue: {
            speakerA: 'Server (Aoede)',
            speakerB: 'Guest (Puck)',
            lines: [
              { speaker: 'Guest', text: 'Excuse me, does the salmon come with cream sauce? I am lactose intolerant.', pause: 1.0 },
              { speaker: 'Server', text: 'Yes, but the chef can prepare it with olive oil and fresh herbs instead.', pause: 0.8 },
              { speaker: 'Guest', text: 'That sounds fantastic! Could I also have the salad dressing on the side?', pause: 0.8 },
              { speaker: 'Guest', text: 'Also, excuse me, this steak is a bit undercooked. Could you have them cook it a bit longer?', pause: 1.0 },
              { speaker: 'Server', text: 'Oh, absolutely! I will take care of that right away for you.', pause: 1.2 }
            ],
            leoExplanation: '"Dressing on the side" = "Molho à parte". "A bit undercooked" = "Passou do ponto / tá muito cru". Educação e precisão!',
            chunks: [
              { en: 'Dressing on the side, please.', pt: 'Molho à parte, por favor.' },
              { en: 'I am lactose intolerant.', pt: 'Sou intolerante a lactose.' },
              { en: 'Could you cook it a bit longer?', pt: 'Poderia passar um pouco mais?' }
            ]
          }
        },
        {
          title: 'Aula 03 • Small Talk, Splitting the Bill & Tipping Etiquette',
          order: 3,
          duration: '03:50',
          description: 'Bate-papo rápido com o garçom, pedir caixinha para viagem, rachar a conta e gorjetas.',
          goldenTip: 'Para pedir a conta, não precisa de discurso. Diga: "Could we get the check, please? Can we split it down the middle?".',
          dialogue: {
            speakerA: 'Server (Aoede)',
            speakerB: 'Guest (Puck)',
            lines: [
              { speaker: 'Server', text: 'How was everything this evening? Can I get you any dessert or coffee?', pause: 0.8 },
              { speaker: 'Guest', text: 'Everything was delicious, thank you! Could we get a box for the rest of this pasta?', pause: 0.8 },
              { speaker: 'Server', text: 'Sure thing, I will box that up for you right now.', pause: 0.8 },
              { speaker: 'Guest', text: 'And whenever you are ready, could we have the check? Can we split it onto two credit cards?', pause: 1.0 },
              { speaker: 'Server', text: 'No problem at all. I will bring the portable terminal right over.', pause: 1.2 }
            ],
            leoExplanation: '"Split it down the middle" = "Rachar meio a meio". "Could we get a box?" = "Pode me arrumar uma caixinha pra viagem?". Chunks de pura vida prática!',
            chunks: [
              { en: 'Could we get the check, please?', pt: 'Pode trazer a conta, por favor?' },
              { en: 'Can we split it between two cards?', pt: 'Dá pra dividir em dois cartões?' },
              { en: 'Could we get a to-go box?', pt: 'Pode embalar pra viagem?' }
            ]
          }
        }
      ]
    },

    hotels_rentals: {
      id: 'hotels-short-term-rentals',
      category: 'Hospedagem & Acomodação',
      label: '🏨 Hotels & Short-Term Rentals (Airbnb)',
      defaultPrompt: 'Checking in, handling room issues (air conditioning, noisy neighbors, missing amenities), requesting early/late checkout, and communicating with hosts.',
      suggestedTitle: 'Hotels & Short-Term Rentals (Airbnb)',
      badge: 'HOTELS & AIRBNB',
      artConcept: 'Boutique hotel lobby or modern sunlit Airbnb apartment entryway with keys on a counter, adult traveler entering with luggage, cinematic 35mm film photography, photorealistic, shallow depth of field, natural morning light, Calm EdTech luxury color grading, no text, no watermarks',
      lessons: [
        {
          title: 'Aula 01 • Front Desk Check-in & Keyless Host Access',
          order: 1,
          duration: '03:40',
          description: 'Fazer check-in sob seu nome, pegar cartões do quarto, senhas de Wi-Fi e fechaduras digitais no Airbnb.',
          goldenTip: 'Ao chegar, diga com segurança: "Hi! Check-in under Leonardo Leite. We have a reservation for three nights." Simples e direto.',
          dialogue: {
            speakerA: 'FrontDesk (Aoede)',
            speakerB: 'Guest (Puck)',
            lines: [
              { speaker: 'FrontDesk', text: 'Good afternoon! Welcome to the Urban Stay. Checking in today?', pause: 0.8 },
              { speaker: 'Guest', text: 'Hi, yes! Check-in under Leonardo Leite. I booked through Airbnb.', pause: 0.8 },
              { speaker: 'FrontDesk', text: 'Found your booking! Here are your key cards for room 514. Breakfast is served from 7 to 10 on the mezzanine.', pause: 1.0 },
              { speaker: 'Guest', text: 'Thank you! What is the Wi-Fi password, and what time is checkout?', pause: 0.8 },
              { speaker: 'FrontDesk', text: 'Checkout is at 11 AM, and the Wi-Fi details are on your key sleeve.', pause: 1.2 }
            ],
            leoExplanation: '"Check-in under [Nome]" é a fórmula de ouro. Não invente moda. Ouça e repita a cadência da frase no player!',
            chunks: [
              { en: 'Check-in under my name.', pt: 'Check-in no meu nome.' },
              { en: 'What time is checkout?', pt: 'Que horas é o checkout?' },
              { en: 'Breakfast on the mezzanine.', pt: 'Café da manhã no mezanino.' }
            ]
          }
        },
        {
          title: 'Aula 02 • Resolving Room Issues: A/C, Noise & Missing Amenities',
          order: 2,
          duration: '04:10',
          description: 'Resolver ar-condicionado com defeito, vizinhos barulhentos e pedir toalhas ou amenidades faltantes.',
          goldenTip: 'Se o ar estiver ruim, diga: "The A/C seems to be blowing warm air". Soa educado e os técnicos resolvem na hora.',
          dialogue: {
            speakerA: 'FrontDesk (Aoede)',
            speakerB: 'Guest (Puck)',
            lines: [
              { speaker: 'Guest', text: 'Hello, front desk? This is room 514. The air conditioning seems to be blowing warm air.', pause: 1.0 },
              { speaker: 'Guest', text: 'Also, we are missing extra towels, and the neighbors next door have loud music on.', pause: 1.0 },
              { speaker: 'FrontDesk', text: 'I am terribly sorry about that, sir. I will send maintenance up with fresh towels and speak with room 516 immediately.', pause: 1.2 },
              { speaker: 'Guest', text: 'I appreciate the quick help. Thank you very much.', pause: 1.0 }
            ],
            leoExplanation: '"Blowing warm air" = "Tá saindo ar quente". "Missing extra towels" = "Faltam toalhas extras". Comunicação clara e sem estresse.',
            chunks: [
              { en: 'The A/C is blowing warm air.', pt: 'O ar-condicionado só tá saindo ar quente.' },
              { en: 'We are missing extra towels.', pt: 'Estão faltando toalhas extras.' },
              { en: 'I appreciate the quick help.', pt: 'Agradeço pela ajuda rápida.' }
            ]
          }
        },
        {
          title: 'Aula 03 • Requesting Late Checkout, Luggage Hold & Departure',
          order: 3,
          duration: '03:45',
          description: 'Pedir para sair mais tarde do quarto, guardar malas na recepção e deixar a chave no checkout.',
          goldenTip: 'Se o seu voo for só à noite, peça: "Could we store our luggage until 5 PM?". Todo hotel tem esse serviço gratuito.',
          dialogue: {
            speakerA: 'Host (Aoede)',
            speakerB: 'Guest (Puck)',
            lines: [
              { speaker: 'Guest', text: 'Hi! Our flight does not leave until 8 PM tonight. Would it be possible to get a late checkout?', pause: 1.0 },
              { speaker: 'Host', text: 'We have guests arriving at 3, but you can stay until 1 PM complimentary.', pause: 0.8 },
              { speaker: 'Guest', text: 'That would be great! Can we leave our luggage in the storage room after that?', pause: 0.8 },
              { speaker: 'Host', text: 'Absolutely. Just bring your bags down when you head out, and we will hold them safely.', pause: 1.2 }
            ],
            leoExplanation: '"Late checkout" = "Saída estendida". "Store luggage" = "Guardar as malas". Pegue o ritmo da conversa no Training Player!',
            chunks: [
              { en: 'Is late checkout possible?', pt: 'É possível sair mais tarde?' },
              { en: 'Can we store our luggage?', pt: 'Podemos deixar as malas guardadas?' },
              { en: 'Head out.', pt: 'Sair / ir embora.' }
            ]
          }
        }
      ]
    },

    getting_around: {
      id: 'getting-around-town',
      category: 'Mobilidade Urbana',
      label: '🚕 Getting Around Town',
      defaultPrompt: 'Hailing taxis/rideshares, buying transit tickets, interpreting metro maps, and asking locals for real-time walking or driving directions.',
      suggestedTitle: 'Getting Around Town',
      badge: 'TRANSIT & CITY',
      artConcept: 'Atmospheric London or Chicago city street corner, adult pedestrian holding an umbrella and checking directions on phone, yellow cab passing by in soft focus, cinematic 35mm film photography, photorealistic, natural warm street lighting, shallow depth of field, no text, no watermarks',
      lessons: [
        {
          title: 'Aula 01 • Rideshares & Taxis: Hailing, Pickup & Destination',
          order: 1,
          duration: '03:50',
          description: 'Chamar Uber/táxi, confirmar o motorista, pedir para abrir o porta-malas e acertar o destino.',
          goldenTip: 'Ao entrar no Uber, confirme com um sorriso: "Hi! For Leonardo?". E para abrir o porta-malas: "Could you pop the trunk, please?".',
          dialogue: {
            speakerA: 'Driver (Aoede)',
            speakerB: 'Passenger (Puck)',
            lines: [
              { speaker: 'Passenger', text: 'Hi there! Uber for Leonardo? Could you pop the trunk for my luggage?', pause: 1.0 },
              { speaker: 'Driver', text: 'Hop right in! Trunk is open. Heading over to Millennium Park, right?', pause: 0.8 },
              { speaker: 'Passenger', text: 'Yes, exactly. Could you drop me off right at the main entrance on Michigan Ave?', pause: 0.8 },
              { speaker: 'Driver', text: 'Sure thing, traffic looks clear. We should be there in about fifteen minutes.', pause: 1.2 }
            ],
            leoExplanation: '"Pop the trunk" = "Abrir o porta-malas". "Hop right in" = "Pode entrar / entra aí!". Português falado vivo sem complicação!',
            chunks: [
              { en: 'Could you pop the trunk?', pt: 'Pode abrir o porta-malas?' },
              { en: 'Hop right in!', pt: 'Pode entrar!' },
              { en: 'Drop me off at the entrance.', pt: 'Me deixe bem na entrada.' }
            ]
          }
        },
        {
          title: 'Aula 02 • Subway & Metro: Ticket Machines, Tap Cards & Lines',
          order: 2,
          duration: '04:15',
          description: 'Comprar bilhetes de metrô, usar cartões por aproximação e entender trens locais vs. expressos.',
          goldenTip: 'No metrô de Nova York ou Londres, preste atenção em "Uptown" (sentido norte) e "Downtown" (sentido sul). E "Local" para em todas, "Express" pula estações!',
          dialogue: {
            speakerA: 'StationAttendant (Aoede)',
            speakerB: 'Traveler (Puck)',
            lines: [
              { speaker: 'Traveler', text: 'Excuse me! Can I tap my credit card directly at the turnstile, or do I need a MetroCard?', pause: 1.0 },
              { speaker: 'StationAttendant', text: 'You can just tap your contactless card or phone right on the reader.', pause: 0.8 },
              { speaker: 'Traveler', text: 'Awesome. And does this platform head uptown toward Central Park?', pause: 0.8 },
              { speaker: 'StationAttendant', text: 'Yes, take the blue line uptown. Make sure to board the local train so you do not miss your stop.', pause: 1.2 }
            ],
            leoExplanation: '"Tap directly at the turnstile" = "Aproximar direto na catraca". Sem fila e sem complicação.',
            chunks: [
              { en: 'Tap directly at the turnstile.', pt: 'Passar por aproximação na catraca.' },
              { en: 'Does this train head uptown?', pt: 'Esse trem vai sentido zona norte?' },
              { en: 'Board the local train.', pt: 'Embarcar no trem parador.' }
            ]
          }
        },
        {
          title: 'Aula 03 • Asking Locals for Real-Time Directions',
          order: 3,
          duration: '03:40',
          description: 'Pedir direções na rua com elegância e entender referências de quarteirões, esquinas e marcos.',
          goldenTip: 'A pergunta que todo viajante precisa saber de cor: "Is it within walking distance?". Tradução: "Dá pra ir a pé?".',
          dialogue: {
            speakerA: 'Local (Aoede)',
            speakerB: 'Traveler (Puck)',
            lines: [
              { speaker: 'Traveler', text: 'Excuse me, sorry to bother you! Is the Art Institute within walking distance from here?', pause: 1.0 },
              { speaker: 'Local', text: 'Not far at all! Walk straight down this street for three blocks, then take a right at the traffic lights.', pause: 1.0 },
              { speaker: 'Traveler', text: 'Three blocks down and take a right. Is it across from the park?', pause: 0.8 },
              { speaker: 'Local', text: 'Exactly, you cannot miss it. Massive building with bronze lions in front.', pause: 1.2 }
            ],
            leoExplanation: '"Within walking distance" = "Dá pra ir a pé". "Three blocks down" = "Desce três quadras". O inglês das ruas que você usa na hora!',
            chunks: [
              { en: 'Is it within walking distance?', pt: 'Dá pra ir a pé daqui?' },
              { en: 'Three blocks down.', pt: 'Desce três quarteirões.' },
              { en: 'You cannot miss it.', pt: 'Não tem erro / é impossível não ver.' }
            ]
          }
        }
      ]
    },

    emergency_medical: {
      id: 'emergency-medical-situations',
      category: 'Saúde & Emergências',
      label: '🚨 Emergency & Medical Situations',
      defaultPrompt: 'Describing symptoms at a pharmacy, communicating acute pain or allergies at a clinic, reporting lost passports or wallets, and calling local emergency services.',
      suggestedTitle: 'Emergency & Medical Situations',
      badge: 'EMERGENCY & MEDICAL',
      artConcept: 'Clean modern pharmacy counter with soft warm apothecary lighting, calm adult patient talking to a compassionate pharmacist, amber medicine bottles in background, cinematic 35mm film photography, shallow depth of field, natural tones, Calm EdTech luxury color grading, no text, no watermarks',
      lessons: [
        {
          title: 'Aula 01 • Pharmacy: Describing Symptoms & Over-the-Counter Relief',
          order: 1,
          duration: '04:00',
          description: 'Descrever sintomas comuns na farmácia: dor de cabeça, febre, mal-estar e remédios sem receita.',
          goldenTip: 'Se não quiser remédio que dê sono, peça sempre a versão "Non-drowsy". "Do you have something non-drowsy for allergies?".',
          dialogue: {
            speakerA: 'Pharmacist (Aoede)',
            speakerB: 'Patient (Puck)',
            lines: [
              { speaker: 'Pharmacist', text: 'Hello, how can I help you today?', pause: 0.8 },
              { speaker: 'Patient', text: 'Hi! I have had a bad sore throat and a pounding headache since last night. Do you have something for pain relief?', pause: 1.0 },
              { speaker: 'Pharmacist', text: 'Do you have any fever or stomach issues? And are you allergic to ibuprofen or acetaminophen?', pause: 1.0 },
              { speaker: 'Patient', text: 'No fever, and no allergies. Just need something that will not make me drowsy during the day.', pause: 0.8 },
              { speaker: 'Pharmacist', text: 'Take two of these tablets every six hours with water, after meals.', pause: 1.2 }
            ],
            leoExplanation: '"Pounding headache" = "Dor de cabeça daquelas latejando". "Non-drowsy" = "Que não dá sono". Vocabulário salva-vidas!',
            chunks: [
              { en: 'Pounding headache.', pt: 'Dor de cabeça latejando forte.' },
              { en: 'Will not make me drowsy.', pt: 'Não vai me dar sono.' },
              { en: 'Take with water after meals.', pt: 'Tomar com água depois das refeições.' }
            ]
          }
        },
        {
          title: 'Aula 02 • Urgent Care & Clinic: Acute Pain, Allergies & Care',
          order: 2,
          duration: '04:20',
          description: 'Como relatar dor intensa, alergias graves e histórico em uma clínica ou pronto-socorro.',
          goldenTip: 'A escala de dor americana é de 1 a 10. Diga o número com clareza: "It is an eight on a scale of ten, a sharp shooting pain right here".',
          dialogue: {
            speakerA: 'Doctor (Aoede)',
            speakerB: 'Patient (Puck)',
            lines: [
              { speaker: 'Doctor', text: 'Tell me what brings you in today, and where is the pain located?', pause: 0.8 },
              { speaker: 'Patient', text: 'Doctor, I have a sharp pain in my lower right abdomen. It started this morning and it is getting worse.', pause: 1.0 },
              { speaker: 'Doctor', text: 'On a scale from one to ten, how would you rate it? Any nausea?', pause: 0.8 },
              { speaker: 'Patient', text: 'It is around an eight. Yes, slight nausea. And please note I am severely allergic to penicillin.', pause: 1.0 },
              { speaker: 'Doctor', text: 'Understood. We are going to run an ultrasound right away to rule out appendicitis.', pause: 1.2 }
            ],
            leoExplanation: '"Sharp pain" = "Dor aguda / pontada forte". "Allergic to penicillin" = "Alérgico a penicilina". Clareza total!',
            chunks: [
              { en: 'A sharp pain in my abdomen.', pt: 'Uma pontada forte na barriga.' },
              { en: 'Getting worse.', pt: 'Piorando.' },
              { en: 'Severely allergic to penicillin.', pt: 'Muito alérgico a penicilina.' }
            ]
          }
        },
        {
          title: 'Aula 03 • Lost Passports, Police Reports & Emergency Calls',
          order: 3,
          duration: '03:50',
          description: 'Perda ou furto de documentos, fazer boletim de ocorrência e ligar para serviços de emergência (911).',
          goldenTip: 'Nos EUA e Canadá, ligue 911; no Reino Unido, 999. Fale com calma seu nome, localização e o que aconteceu.',
          dialogue: {
            speakerA: 'PoliceOfficer (Aoede)',
            speakerB: 'Citizen (Puck)',
            lines: [
              { speaker: 'Citizen', text: 'Officer, I need to file a report. My backpack was stolen at the coffee shop ten minutes ago.', pause: 1.0 },
              { speaker: 'PoliceOfficer', text: 'Were there passports, credit cards, or identification inside?', pause: 0.8 },
              { speaker: 'Citizen', text: 'Yes, my Brazilian passport, wallet, and laptop. I need a copy of the police report for my consulate.', pause: 1.0 },
              { speaker: 'PoliceOfficer', text: 'We will take your official statement right now and print an official case number for you.', pause: 1.2 }
            ],
            leoExplanation: '"File a police report" = "Fazer um boletim de ocorrência". O documento obrigatório para o consulado emitir novo passaporte.',
            chunks: [
              { en: 'File a police report.', pt: 'Fazer um B.O. (boletim de ocorrência).' },
              { en: 'Official case number.', pt: 'Número oficial do registro da ocorrência.' },
              { en: 'Stolen at the coffee shop.', pt: 'Furtado na cafeteria.' }
            ]
          }
        }
      ]
    },

    online_meetings: {
      id: 'online-meetings-remote-work',
      category: 'Trabalho & Negócios',
      label: '💻 Online Meetings & Remote Work',
      defaultPrompt: 'Unmuting etiquette, interrupting politely, stating audio/video issues, screen sharing, chiming in during fast-paced group discussions, and wrapping up action items.',
      suggestedTitle: 'Online Meetings & Remote Work',
      badge: 'REMOTE WORK',
      artConcept: 'Professional home office workspace with laptop displaying video conference window, warm sunlight through window, adult professional with wireless headset speaking confidently, cinematic 35mm film photography, photorealistic, shallow depth of field, Calm EdTech luxury color grading, no text, no watermarks',
      lessons: [
        {
          title: 'Aula 01 • Unmuting Etiquette, Audio/Video Glitches & Screen Sharing',
          order: 1,
          duration: '03:45',
          description: 'Como lidar com o clássico "você tá mudo", quedas de conexão, atraso no áudio e compartilhar a tela.',
          goldenTip: 'Esqueceu o microfone fechado? Sorria e solte: "Sorry about that, classic double-mute! Can everyone see my screen?". Quebra o gelo na hora!',
          dialogue: {
            speakerA: 'Colleague (Aoede)',
            speakerB: 'LeoProfessional (Puck)',
            lines: [
              { speaker: 'Colleague', text: 'Leo, I think you might be on mute. We cannot hear you yet.', pause: 0.8 },
              { speaker: 'LeoProfessional', text: 'Sorry about that, speaking to myself on mute! Can everyone hear me clearly now and see the slides?', pause: 1.0 },
              { speaker: 'Colleague', text: 'Loud and clear now, slides look sharp. Whenever you are ready to kick off!', pause: 0.8 },
              { speaker: 'LeoProfessional', text: 'Great. If there is any lag on my connection, just flag it in the chat.', pause: 1.2 }
            ],
            leoExplanation: '"You are on mute" = "Seu microfone tá fechado". "Loud and clear" = "Alto e bom som". Frases que você vai usar todo santo dia!',
            chunks: [
              { en: 'You are on mute.', pt: 'Você tá no mudo.' },
              { en: 'Loud and clear.', pt: 'Alto e bom som.' },
              { en: 'Can everyone see my screen?', pt: 'Todos conseguem ver minha tela?' }
            ]
          }
        },
        {
          title: 'Aula 02 • Chiming In Politely & Fast-Paced Group Discussions',
          order: 2,
          duration: '04:15',
          description: 'Como intervir sem ser grosseiro, discordar diplomaticamente e somar pontos em reuniões rápidas.',
          goldenTip: 'Para entrar na conversa sem atropelar, diga com voz calma: "Can I jump in here for a quick second?". Todo mundo para pra te ouvir.',
          dialogue: {
            speakerA: 'TeamLead (Aoede)',
            speakerB: 'Colleague (Puck)',
            lines: [
              { speaker: 'TeamLead', text: '...and that is why the marketing budget should shift entirely to paid ads next quarter.', pause: 1.0 },
              { speaker: 'Colleague', text: 'Can I jump in here for a quick second? Just to add a different perspective to what Sarah said.', pause: 1.0 },
              { speaker: 'TeamLead', text: 'Sure, go ahead!', pause: 0.6 },
              { speaker: 'Colleague', text: 'While paid ads are important, our organic conversion doubled this month. I suggest we balance both.', pause: 1.0 },
              { speaker: 'TeamLead', text: 'Fair point. Let us look into the blended metrics before making a final call.', pause: 1.2 }
            ],
            leoExplanation: '"Can I jump in here?" = "Posso dar uma palavrinha aqui rapidinho?". "Fair point" = "Faz sentido / bem pensado". Diplomacia pura!',
            chunks: [
              { en: 'Can I jump in here for a second?', pt: 'Posso dar um pulo aqui rapidinho?' },
              { en: 'Just to add to that point.', pt: 'Só pra complementar esse ponto.' },
              { en: 'Fair point.', pt: 'Bem pensado / faz sentido.' }
            ]
          }
        },
        {
          title: 'Aula 03 • Action Items, Deadlines & Meeting Wrap-up',
          order: 3,
          duration: '03:50',
          description: 'Alinhamento de donos de tarefas, prazos combinados e fechamento de reuniões no horário.',
          goldenTip: 'Finalize sempre recapitulando quem faz o que: "Who is owning this action item by Friday?". Evita retrabalho e demonstra autoridade.',
          dialogue: {
            speakerA: 'ProjectManager (Aoede)',
            speakerB: 'LeoProfessional (Puck)',
            lines: [
              { speaker: 'ProjectManager', text: 'We are almost at the top of the hour. Let us quickly recap action items.', pause: 0.8 },
              { speaker: 'LeoProfessional', text: 'I will take ownership of updating the client presentation by Thursday afternoon.', pause: 0.8 },
              { speaker: 'ProjectManager', text: 'Awesome. And who can handle the spreadsheet review before our client demo?', pause: 0.8 },
              { speaker: 'LeoProfessional', text: 'Mark and I will tag-team that. I will shoot an email recap over to the whole team by 5 PM.', pause: 1.2 }
            ],
            leoExplanation: '"Top of the hour" = "No final do horário / batendo a hora". "Take ownership" = "Assumir a responsabilidade". "Shoot an email" = "Mandar um e-mail rápido".',
            chunks: [
              { en: 'Top of the hour.', pt: 'No final do horário marcado.' },
              { en: 'I will take ownership of that.', pt: 'Eu fico responsável por isso.' },
              { en: 'Shoot an email over.', pt: 'Disparar um e-mail rápido.' }
            ]
          }
        }
      ]
    },

    job_interview: {
      id: 'job-interview-fast-track',
      category: 'Carreira & Entrevistas',
      label: '🎯 Job Interview Fast-Track',
      defaultPrompt: 'Delivering a punchy 60-second self-introduction, explaining career milestones, answering common behavioral questions ("Tell me about a time you..."), and asking insightful questions to the interviewer.',
      suggestedTitle: 'Job Interview Fast-Track',
      badge: 'JOB INTERVIEW',
      artConcept: 'Bright executive boardroom with glass walls, candidate in smart business attire smiling and speaking to hiring managers across a clean wooden conference table, cinematic 35mm film photography, shallow depth of field, authentic expression, Calm EdTech luxury color grading, no text, no watermarks',
      lessons: [
        {
          title: 'Aula 01 • The Punchy 60-Second "Tell Me About Yourself" Pitch',
          order: 1,
          duration: '04:10',
          description: 'Como responder a pergunta de abertura conectando passado, presente e por que você é a solução ideal.',
          goldenTip: 'Não conte a história da sua infância! Estrutura: Presente (onde estou hoje) + Passado (o que construí) + Futuro (por que essa vaga). Em 60 segundos cravados!',
          dialogue: {
            speakerA: 'HiringManager (Aoede)',
            speakerB: 'Candidate (Puck)',
            lines: [
              { speaker: 'HiringManager', text: 'Welcome, Leo! To start off, walk me through your background and tell me a bit about yourself.', pause: 1.0 },
              { speaker: 'Candidate', text: 'Certainly! Over the past eight years, I have specialized in building customer operations in high-growth companies.', pause: 1.0 },
              { speaker: 'Candidate', text: 'In my last role, I scaled our team from five to twenty specialists while improving response times by forty percent.', pause: 1.0 },
              { speaker: 'Candidate', text: 'What excites me about this role is the opportunity to bring that scalable mindset to your global expansion.', pause: 1.0 },
              { speaker: 'HiringManager', text: 'That is impressive and aligns directly with our next quarter targets.', pause: 1.2 }
            ],
            leoExplanation: '"Walk me through your background" = "Me dá um panorama da sua trajetória". Responda com foco em resultados mensuráveis!',
            chunks: [
              { en: 'Walk me through your background.', pt: 'Me conta sobre a sua trajetória.' },
              { en: 'In my last role...', pt: 'Na minha última função...' },
              { en: 'What excites me about this role...', pt: 'O que mais me atrai nessa oportunidade...' }
            ]
          }
        },
        {
          title: 'Aula 02 • Storytelling Behavioral Questions (The STAR Method)',
          order: 2,
          duration: '04:30',
          description: 'Dominar perguntas do tipo "Tell me about a time when..." usando Situação, Tarefa, Ação e Resultado.',
          goldenTip: 'Toda resposta comportamental tem que terminar no Resultado. Fale o que aconteceu depois da sua atitude!',
          dialogue: {
            speakerA: 'HiringManager (Aoede)',
            speakerB: 'Candidate (Puck)',
            lines: [
              { speaker: 'HiringManager', text: 'Tell me about a time you faced a tight deadline with conflicting priorities.', pause: 1.0 },
              { speaker: 'Candidate', text: 'At my previous company, our main client requested a major product redesign two weeks before launch.', pause: 1.0 },
              { speaker: 'Candidate', text: 'I prioritized our core deliverables, negotiated phased rollouts with the client, and rallied the team for daily check-ins.', pause: 1.0 },
              { speaker: 'Candidate', text: 'As a result, we launched on time with zero downtime, and the client renewed their annual contract.', pause: 1.2 },
              { speaker: 'HiringManager', text: 'Great example of stakeholder management under pressure.', pause: 1.0 }
            ],
            leoExplanation: 'Note a transição mágica: "As a result, we launched on time...". O entrevistador compra resultados, não desculpas.',
            chunks: [
              { en: 'Tell me about a time you...', pt: 'Me conte sobre uma ocasião em que você...' },
              { en: 'I prioritized core deliverables.', pt: 'Priorizei as entregas principais.' },
              { en: 'As a result...', pt: 'Como resultado...' }
            ]
          }
        },
        {
          title: 'Aula 03 • Asking High-Impact Questions & The Closing Pitch',
          order: 3,
          duration: '03:50',
          description: 'As melhores perguntas para fazer ao entrevistador e fechar a conversa com autoridade e entusiasmo.',
          goldenTip: 'Nunca diga "No, you answered everything". Pergunte: "What does success look like in this role in the first 90 days?". Deixa o entrevistador impressionado.',
          dialogue: {
            speakerA: 'HiringManager (Aoede)',
            speakerB: 'Candidate (Puck)',
            lines: [
              { speaker: 'HiringManager', text: 'We have covered a lot today. Do you have any questions for us?', pause: 0.8 },
              { speaker: 'Candidate', text: 'Yes, thank you! What does success look like in this role during the first ninety days?', pause: 1.0 },
              { speaker: 'Candidate', text: 'And what is the biggest challenge the team is working through right now?', pause: 0.8 },
              { speaker: 'HiringManager', text: 'Fantastic questions. Our biggest hurdle right now is cross-functional communication between tech and ops.', pause: 1.2 },
              { speaker: 'Candidate', text: 'That makes total sense. That is precisely where my background can make an immediate impact.', pause: 1.0 }
            ],
            leoExplanation: 'Você virou o jogo. Em vez de ser avaliado, você está demonstrando que é a solução para a maior dor do time dele.',
            chunks: [
              { en: 'What does success look like in 90 days?', pt: 'Como se define sucesso nessa vaga nos primeiros 90 dias?' },
              { en: 'What is the biggest challenge right now?', pt: 'Qual o maior desafio da equipe no momento?' },
              { en: 'Make an immediate impact.', pt: 'Gerar impacto imediato.' }
            ]
          }
        }
      ]
    },

    shopping_returns: {
      id: 'shopping-sizing-returns',
      category: 'Compras & Varejo',
      label: '🛍️ Shopping, Sizing & Returns',
      defaultPrompt: 'Asking for different sizes/colors, asking about return policies, tax-free refunds, finding bargains, and declining persistent sales reps without being rude.',
      suggestedTitle: 'Shopping, Sizing & Returns',
      badge: 'SHOPPING & SIZING',
      artConcept: 'High-end clothing boutique or department store, warm natural spotlights illuminating racks of clothes, adult customer holding a garment talking pleasantly with a sales associate, cinematic 35mm film photography, shallow depth of field, rich textures, Calm EdTech colors, no text, no watermarks',
      lessons: [
        {
          title: 'Aula 01 • Browsing, Asking for Sizes & Fitting Rooms',
          order: 1,
          duration: '03:40',
          description: 'Pedir tamanhos maiores/menores, cores diferentes e experimentar roupas no provador.',
          goldenTip: 'Para pedir tamanho maior ou menor sem tropeçar nas palavras: "Do you have this a size up?" ou "Do you have this a size down?".',
          dialogue: {
            speakerA: 'StoreAssociate (Aoede)',
            speakerB: 'Shopper (Puck)',
            lines: [
              { speaker: 'StoreAssociate', text: 'Hi! Can I help you find anything in particular today?', pause: 0.8 },
              { speaker: 'Shopper', text: 'Hi! I love this jacket, but it is a bit tight across the chest. Do you have this in a size up?', pause: 1.0 },
              { speaker: 'StoreAssociate', text: 'Let me check our stock in the back. Yes, we have a large in navy blue and olive green. Would you like to try it on?', pause: 1.0 },
              { speaker: 'Shopper', text: 'I would love to try the navy. Where are the fitting rooms?', pause: 0.8 },
              { speaker: 'StoreAssociate', text: 'Right down that corridor on your right. Take your time!', pause: 1.2 }
            ],
            leoExplanation: '"A bit tight" = "Meio apertado". "A size up" = "Um número maior". "Try it on" = "Provar". Rápido e prático!',
            chunks: [
              { en: 'Do you have this a size up?', pt: 'Você tem essa peça um número maior?' },
              { en: 'Where are the fitting rooms?', pt: 'Onde ficam os provadores?' },
              { en: 'Would you like to try it on?', pt: 'Quer experimentar/provar?' }
            ]
          }
        },
        {
          title: 'Aula 02 • Declining Sales Reps Politely & Finding Bargains',
          order: 2,
          duration: '03:30',
          description: 'Dizer que está só dando uma olhadinha sem ser rude e perguntar sobre promoções e descontos.',
          goldenTip: 'A frase de ouro de qualquer loja: "I am just browsing, thank you so much!". Se o vendedor insistir: "I am all set for now!".',
          dialogue: {
            speakerA: 'SalesRep (Aoede)',
            speakerB: 'Shopper (Puck)',
            lines: [
              { speaker: 'SalesRep', text: 'Good morning! We have a special buy-one-get-one fifty percent off today on all sweaters.', pause: 1.0 },
              { speaker: 'Shopper', text: 'Thank you, I am just browsing for now. Actually, is this clearance rack discounted further at the register?', pause: 1.0 },
              { speaker: 'SalesRep', text: 'Yes, everything with a red tag is an additional twenty percent off.', pause: 0.8 },
              { speaker: 'Shopper', text: 'Awesome, I appreciate the tip!', pause: 0.8 }
            ],
            leoExplanation: '"Just browsing" = "Tô só dando uma olhadinha". "Buy-one-get-one" (BOGO) = "Compre um e leve o segundo com desconto". Chunks comerciais nativos!',
            chunks: [
              { en: 'I am just browsing, thank you.', pt: 'Tô só dando uma olhadinha, obrigado.' },
              { en: 'Clearance rack.', pt: 'Arara de ponta de estoque / liquidação.' },
              { en: 'I am all set for now.', pt: 'Pra mim tá ótimo assim por enquanto.' }
            ]
          }
        },
        {
          title: 'Aula 03 • Register Checkout, Tax-Free Refunds & Handling Returns',
          order: 3,
          duration: '04:00',
          description: 'No caixa: formulário tax-free para turistas, prazos de devolução e troca com nota fiscal.',
          goldenTip: 'Em viagens internacionais, peça sempre o formulário de devolução de imposto: "Could you provide a tax-free refund form for customs?".',
          dialogue: {
            speakerA: 'Cashier (Aoede)',
            speakerB: 'Shopper (Puck)',
            lines: [
              { speaker: 'Cashier', text: 'Total comes to ninety-two dollars. Would you like a bag today?', pause: 0.8 },
              { speaker: 'Shopper', text: 'Yes, please. Also, I am visiting from Brazil. Could you fill out a tax-free VAT refund form for me?', pause: 1.0 },
              { speaker: 'Cashier', text: 'Sure thing, just need to see your passport. And what is your return policy?', pause: 0.8 },
              { speaker: 'Cashier', text: 'You have thirty days for a full refund with the receipt and original tags attached.', pause: 1.2 }
            ],
            leoExplanation: '"Tax-free refund form" = Formulário para pegar os impostos de volta no aeroporto. Guarde junto com o comprovante fiscal!',
            chunks: [
              { en: 'Tax-free refund form.', pt: 'Formulário de reembolso de imposto (tax-free).' },
              { en: 'What is your return policy?', pt: 'Qual a política de troca e devolução?' },
              { en: 'Full refund with receipt.', pt: 'Reembolso total apresentando o comprovante.' }
            ]
          }
        }
      ]
    },

    networking_smalltalk: {
      id: 'networking-small-talk',
      category: 'Convivência & Eventos',
      label: '🤝 Networking & Small Talk',
      defaultPrompt: 'Breaking the ice at mixers or conferences, introducing mutual colleagues, finding common ground (hobbies, weather, current projects), and gracefully exiting conversations.',
      suggestedTitle: 'Networking & Small Talk',
      badge: 'NETWORKING',
      artConcept: 'Elegant evening conference reception or rooftop networking mixer, adults holding beverage glasses in warm relaxed conversation, city skyline bokeh in the background, cinematic 35mm film photography, photorealistic, natural warm golden hour lighting, shallow depth of field, no text, no watermarks',
      lessons: [
        {
          title: 'Aula 01 • Breaking the Ice: Natural Openers at Mixers',
          order: 1,
          duration: '03:45',
          description: 'Aproximar-se de grupos, quebrar o silêncio e iniciar papos leves em conferências sem constrangimento.',
          goldenTip: 'Chegue com um sorriso e diga: "Mind if I join you? Great keynote this morning, wasn\'t it?". Ninguém jamais recusa uma aproximação dessa.',
          dialogue: {
            speakerA: 'Attendee (Aoede)',
            speakerB: 'LeoParticipant (Puck)',
            lines: [
              { speaker: 'LeoParticipant', text: 'Hi! Mind if I join you? Great turnout at this evening reception, isn\'t it?', pause: 1.0 },
              { speaker: 'Attendee', text: 'Not at all, please do! Yes, it is packed. Did you catch the opening panel on AI?', pause: 0.8 },
              { speaker: 'LeoParticipant', text: 'I did! The speaker made some fascinating points about conversational systems. Are you based locally here?', pause: 1.0 },
              { speaker: 'Attendee', text: 'No, I flew in from Boston yesterday. How about you?', pause: 1.2 }
            ],
            leoExplanation: '"Mind if I join you?" = "Se importa se eu me juntar a você?". "Great turnout" = "Quanta gente veio hoje!". O abridor mais elegante de eventos.',
            chunks: [
              { en: 'Mind if I join you?', pt: 'Se importa se eu me juntar a vocês?' },
              { en: 'Great turnout tonight!', pt: 'Evento cheio / bastante gente aqui hoje!' },
              { en: 'Are you based locally?', pt: 'Você mora/trabalha aqui na cidade?' }
            ]
          }
        },
        {
          title: 'Aula 02 • Finding Common Ground & Introducing Colleagues',
          order: 2,
          duration: '04:10',
          description: 'Descobrir afinidades rapidamente, falar de projetos e apresentar colegas de forma natural.',
          goldenTip: 'A maior habilidade social de um evento é conectar duas pessoas: "Have you met my colleague Alex? You two are both working on logistics!".',
          dialogue: {
            speakerA: 'Attendee (Aoede)',
            speakerB: 'LeoParticipant (Puck)',
            lines: [
              { speaker: 'Attendee', text: 'We are currently restructuring our digital learning platform for mature adults.', pause: 0.8 },
              { speaker: 'LeoParticipant', text: 'That is incredible! Have you met my friend Roberto? Roberto, come over here for a second.', pause: 1.0 },
              { speaker: 'LeoParticipant', text: 'Roberto is building mobile audio workflows in São Paulo. You two were just discussing that exact topic.', pause: 1.0 },
              { speaker: 'Attendee', text: 'What a coincidence! Roberto, pleasure to meet you. Tell me what you are working on.', pause: 1.2 }
            ],
            leoExplanation: '"Have you met...?" = "Você já conhece o...?". "Come over here" = "Chega mais / vem cá!". Criar conexões é o ápice do networking.',
            chunks: [
              { en: 'Have you met my colleague?', pt: 'Você já conhece meu colega?' },
              { en: 'Come over here for a second.', pt: 'Chega aqui um segundo.' },
              { en: 'What a coincidence!', pt: 'Que coincidência!' }
            ]
          }
        },
        {
          title: 'Aula 03 • Gracefully Exiting Conversations & Exchanging Contacts',
          order: 3,
          duration: '03:30',
          description: 'Como sair educadamente de uma conversa sem parecer que está fugindo e pegar o LinkedIn/WhatsApp.',
          goldenTip: 'Para encerrar a conversa com classe impecável: "I don\'t want to monopolize your time, but let\'s connect on LinkedIn. Can I scan your QR code?".',
          dialogue: {
            speakerA: 'Attendee (Aoede)',
            speakerB: 'LeoParticipant (Puck)',
            lines: [
              { speaker: 'LeoParticipant', text: 'It has been an absolute pleasure talking with you, Mark. I do not want to monopolize your time, but let us stay in touch.', pause: 1.0 },
              { speaker: 'Attendee', text: 'Definitely! Do you have a business card, or are you on LinkedIn?', pause: 0.8 },
              { speaker: 'LeoParticipant', text: 'LinkedIn is perfect. Let me pull up my QR code right on my phone.', pause: 0.8 },
              { speaker: 'Attendee', text: 'Got it, just sent the invite. Enjoy the rest of the conference!', pause: 1.2 }
            ],
            leoExplanation: '"I don\'t want to monopolize your time" = "Não quero prender você / monopolizar seu tempo". Frase de ouro de quem domina as regras sociais.',
            chunks: [
              { en: 'I do not want to monopolize your time.', pt: 'Não quero monopolizar seu tempo.' },
              { en: 'Let us stay in touch.', pt: 'Vamos manter contato.' },
              { en: 'Let me pull up my QR code.', pt: 'Deixa eu abrir meu QR code no celular.' }
            ]
          }
        }
      ]
    },

    sightseeing_experiences: {
      id: 'local-sightseeing-guided-experiences',
      category: 'Turismo & Lazer',
      label: '🏛️ Local Sightseeing & Guided Experiences',
      defaultPrompt: 'Booking tours, asking about photography rules, understanding museum guides, renting vehicles/equipment, and negotiating prices at street markets.',
      suggestedTitle: 'Local Sightseeing & Guided Experiences',
      badge: 'SIGHTSEEING & TOURS',
      artConcept: 'Historic cobblestone European plaza or museum courtyard in morning light, adult traveler looking at a guide pamphlet or talking with a friendly local tour guide, ancient architecture, cinematic 35mm film photography, shallow depth of field, rich historical textures, Calm EdTech luxury color grading, no text, no watermarks',
      lessons: [
        {
          title: 'Aula 01 • Booking Tours, Inquiring Rules & Museum Guidelines',
          order: 1,
          duration: '03:45',
          description: 'Reservar passeios guiados, perguntar sobre regras de fotos e fones de audioguia.',
          goldenTip: 'Em museus ou igrejas, pergunte sempre: "Is flash photography allowed inside?". Quase todos permitem fotos, desde que sem flash e sem tripé.',
          dialogue: {
            speakerA: 'TicketClerk (Aoede)',
            speakerB: 'Sightseer (Puck)',
            lines: [
              { speaker: 'Sightseer', text: 'Good morning! Two adult tickets for the afternoon walking tour, please. Do you have an English audio guide?', pause: 1.0 },
              { speaker: 'TicketClerk', text: 'Yes, audio guides are included with your pass. And the live English tour departs at two o\'clock from the fountain.', pause: 1.0 },
              { speaker: 'Sightseer', text: 'Wonderful! Is flash photography permitted inside the historical galleries?', pause: 0.8 },
              { speaker: 'TicketClerk', text: 'Non-flash photography is welcome, but tripods and selfie sticks are prohibited.', pause: 1.2 }
            ],
            leoExplanation: '"Audio guide included" = "Audioguia incluso". "Non-flash photography" = "Fotos sem flash permitidas". Simples e objetivo!',
            chunks: [
              { en: 'Two adult tickets, please.', pt: 'Dois ingressos para adulto, por favor.' },
              { en: 'Is flash photography permitted?', pt: 'É permitido tirar fotos com flash?' },
              { en: 'Departs from the fountain.', pt: 'Sai ali da fonte.' }
            ]
          }
        },
        {
          title: 'Aula 02 • Renting Vehicles, Bikes & Policy Etiquette',
          order: 2,
          duration: '04:15',
          description: 'Alugar carros, patinetes ou bicicletas, entender seguros totais e regras de devolução de combustível.',
          goldenTip: 'No aluguel de carro, pergunte da política de combustível: "Is it full-to-full?". Significa que você pega cheio e devolve cheio.',
          dialogue: {
            speakerA: 'RentalAgent (Aoede)',
            speakerB: 'Sightseer (Puck)',
            lines: [
              { speaker: 'Sightseer', text: 'Hi! I have a reservation for an intermediate automatic car under Leonardo Leite.', pause: 0.8 },
              { speaker: 'RentalAgent', text: 'Found it! Would you like our full collision damage waiver for peace of mind?', pause: 0.8 },
              { speaker: 'Sightseer', text: 'Yes, full comprehensive coverage, please. What is the fuel policy on return?', pause: 0.8 },
              { speaker: 'RentalAgent', text: 'It is full-to-full. Just top it off at the gas station right next to the drop-off lot.', pause: 1.2 }
            ],
            leoExplanation: '"Full-to-full" = "Tanque cheio para tanque cheio". "Comprehensive coverage" = "Seguro total sem franquia". Zero surpresas no bolso.',
            chunks: [
              { en: 'Full comprehensive coverage.', pt: 'Seguro completo total.' },
              { en: 'Is the fuel policy full-to-full?', pt: 'A política de combustível é tanque cheio pra tanque cheio?' },
              { en: 'Drop-off lot.', pt: 'Pátio de devolução de veículos.' }
            ]
          }
        },
        {
          title: 'Aula 03 • Street Markets, Crafts & Friendly Haggling',
          order: 3,
          duration: '03:30',
          description: 'Comprar artesanato em feiras de rua, elogiar o produto e negociar desconto com um sorriso.',
          goldenTip: 'Negociar em feira com simpatia: "These are beautiful! Would you take forty if I take both?". Sempre com dinheiro na mão!',
          dialogue: {
            speakerA: 'MarketVendor (Aoede)',
            speakerB: 'Sightseer (Puck)',
            lines: [
              { speaker: 'Sightseer', text: 'These handmade ceramic mugs are stunning! Did you craft them yourself?', pause: 0.8 },
              { speaker: 'MarketVendor', text: 'Yes, hand-painted in my studio nearby. They are twenty-five dollars each.', pause: 0.8 },
              { speaker: 'Sightseer', text: 'They are gorgeous. Would you take forty dollars for the pair? I can pay in cash right now.', pause: 1.0 },
              { speaker: 'MarketVendor', text: 'For cash, you have a deal, my friend! Let me wrap them up securely for your luggage.', pause: 1.2 }
            ],
            leoExplanation: '"Would you take forty for the pair?" = "Faz quarenta no par?". Negociação descontraída e calorosa.',
            chunks: [
              { en: 'Did you craft them yourself?', pt: 'Foi você mesmo que fez artesanalmente?' },
              { en: 'Would you take forty for the pair?', pt: 'Faz quarenta dólares no par?' },
              { en: 'Wrap them securely for my luggage.', pt: 'Embalar bem protegido pra minha mala.' }
            ]
          }
        }
      ]
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
     * Identifica automaticamente qual das 10 categorias canônicas melhor se encaixa no prompt
     */
    detectPresetKey(prompt) {
      if (!prompt) return 'airport_flight';
      const p = prompt.toLowerCase();
      if (/aeroporto|airport|flight|v[oô]o|check-in|embarque|bagagem|baggage|customs|flight attendant/i.test(p)) return 'airport_flight';
      if (/restaurante|restaurant|dining|table talk|gar[cç]om|server|dish|prato|card[aá]pio|food|bill|menu/i.test(p)) return 'dining_out';
      if (/hotel|airbnb|hospedagem|host|rental|quarto|checkout|check-out|amenities|aluguel/i.test(p)) return 'hotels_rentals';
      if (/getting around|taxi|uber|rideshare|metro|subway|transit|direction|cidade|ônibus|bus|rua/i.test(p)) return 'getting_around';
      if (/emerg[eê]ncia|emergency|medical|m[eé]dico|farm[aá]cia|pharmacy|sintoma|symptom|hospital|passport|clinic|dor/i.test(p)) return 'emergency_medical';
      if (/meeting|reuni[aã]o|remote work|unmute|screen share|zoom|teams|action item|remoto/i.test(p)) return 'online_meetings';
      if (/interview|entrevista|job|carreira|career|hiring|self-introduction|contrata/i.test(p)) return 'job_interview';
      if (/shopping|loja|store|tamanho|sizing|return|devolu[cç][aã]o|bargain|tax-free|roupa/i.test(p)) return 'shopping_returns';
      if (/networking|small talk|mixer|conference|confer[eê]ncia|icebreak|colleague|conversa/i.test(p)) return 'networking_smalltalk';
      if (/sightseeing|tour|passeio|museum|museu|guia|market|mercado|monument|viagem/i.test(p)) return 'sightseeing_experiences';
      return null;
    }

    /**
     * Gera a estrutura completa de um Pocket Course Player-First
     * a partir de um prompt e das diretrizes do Professor Leo
     */
    async generatePocketCourse(promptText, presetKey = null) {
      const cleanPrompt = (promptText || '').trim();
      const resolvedKey = presetKey || this.detectPresetKey(cleanPrompt);
      const preset = resolvedKey && this.presets[resolvedKey] ? this.presets[resolvedKey] : null;

      // Identifica título e metadados
      const title = preset ? preset.suggestedTitle : this.deriveTitle(cleanPrompt);
      const slug = this.slugify(title);
      const badge = preset ? preset.badge : 'POCKET COURSE';

      // 1. Geração da Promessa e Sinopse no Tom do Professor Leo
      const promise = this.generateLeoPromise(cleanPrompt || (preset ? preset.defaultPrompt : ''), title);

      // 2. Geração das 3 Aulas Player-First com Scripts de Áudio Dramatizados para TTS
      const lessons = this.generateLessonsWithAudioScripts(cleanPrompt, title, slug, preset);

      // 3. Blueprint Visual de Cinema 35mm
      const artConcept = preset ? preset.artConcept : `${cleanPrompt}, cinematic 35mm film photography, photorealistic, natural warm lighting, shallow depth of field, authentic emotional expression, Calm EdTech luxury color grading, no text, no watermarks`;

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
        courseCategory: 'pocket',
        isPocketCourse: true,
        aiPromptUsed: cleanPrompt || (preset ? preset.defaultPrompt : ''),
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
      const detected = this.detectPresetKey(prompt);
      if (detected && this.presets[detected]) {
        return this.presets[detected].suggestedTitle;
      }
      const words = prompt.split(' ').slice(0, 4).join(' ');
      return `${words.charAt(0).toUpperCase() + words.slice(1)} • Pocket Course`;
    }

    generateLeoPromise(prompt, title) {
      return `Hello, my dear friend! Leonardo Leite aqui. Se você já passou pela situação de travar em "${title}", respire fundo: o problema nunca foi a sua capacidade. Foi tentar decorar regras no papel em vez de treinar os seus ouvidos na situação viva. Neste Pocket Course, você não vai perder horas na frente do computador: pegue seus fones, aperte o play e repita comigo até a fala virar reflexo!`;
    }

    generateLessonsWithAudioScripts(prompt, courseTitle, slug, preset) {
      // Se tiver aulas personalizadas no preset canônico, use-as com scripts ricos
      if (preset && Array.isArray(preset.lessons) && preset.lessons.length > 0) {
        return preset.lessons.map((lData, idx) => {
          const lesId = `${slug}-l${idx + 1}`;
          const d = lData.dialogue;

          const audioScriptLines = [
            `[Speaker: Leo (Charon)]`,
            `Fala, meu amigo! Leonardo Leite aqui. Vamos para a ${lData.title.split('•')[0].trim()} de "${courseTitle}"!`,
            `Coloque os fones e observe pelos ouvidos como dois nativos resolvem essa situação no dia a dia real.`,
            `[pause: 1.5s]`
          ];

          if (d && Array.isArray(d.lines)) {
            d.lines.forEach(line => {
              const spkTag = (d.speakerA && line.speaker === d.speakerA.split(' ')[0]) ? d.speakerA : ((d.speakerB && line.speaker === d.speakerB.split(' ')[0]) ? d.speakerB : `${line.speaker} (Aoede)`);
              audioScriptLines.push(`[Speaker: ${spkTag}]`);
              audioScriptLines.push(line.text);
              if (line.pause) audioScriptLines.push(`[pause: ${line.pause}s]`);
            });
          }

          if (d && d.leoExplanation) {
            audioScriptLines.push(`[Speaker: Leo (Charon)]`);
            audioScriptLines.push(d.leoExplanation);
          }

          const chunksHtml = (d && Array.isArray(d.chunks)) ? d.chunks.map(c => `
            <div class="p-3 bg-white rounded-xl border border-amber-200/60 flex items-center justify-between gap-2">
              <span class="font-bold text-slate-900 text-xs sm:text-sm">"${c.en}"</span>
              <span class="text-amber-800 font-medium text-xs">➔ "${c.pt}"</span>
            </div>
          `).join('') : '';

          const processedContentHtml = `
            <div class="space-y-4">
              <div class="p-5 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs space-y-3">
                <div class="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
                  <span class="font-black text-xs uppercase tracking-wider text-[#0A192F] flex items-center gap-2">
                    🎧 Treino Pelos Ouvidos no Player
                  </span>
                  <span class="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Foco no Som</span>
                </div>
                <p class="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  Coloque seus fones de ouvido. Ouça a cadência, as junções sonoras e a naturalidade da conversa. A fala é consequência tardia da escuta atenta e curiosa!
                </p>
              </div>

              <div class="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs space-y-3">
                <h4 class="font-black text-xs uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  ⚡ O Sentimento da Estrutura (Português Falado Real)
                </h4>
                <div class="space-y-2">
                  ${chunksHtml}
                </div>
              </div>
            </div>
          `;

          return {
            id: lesId,
            moduleId: `${slug}-m1`,
            courseId: slug,
            title: lData.title,
            order: lData.order || (idx + 1),
            duration: lData.duration || '03:50',
            description: lData.description || 'Treino prático de escuta e reflexo oral.',
            videoUrl: '',
            audioUrl: '',
            thumbnailUrl: 'assets/images/cover-default-aef.jpg',
            artworkUrl: 'assets/images/cover-default-aef.jpg',
            pdfUrl: '',
            hasTrainingTrack: true,
            trainingTrackId: `${slug}-track-${idx + 1}`,
            published: true,
            goldenTip: lData.goldenTip || 'Foque na melodia e no ritmo antes de se preocupar com cada palavra isolada.',
            audioScript: audioScriptLines.join('\n'),
            processedContentHtml: processedContentHtml
          };
        });
      }

      // Fallback dinâmico para prompt genérico
      return [
        {
          id: `${slug}-l1`,
          moduleId: `${slug}-m1`,
          courseId: slug,
          title: 'Aula 01 • O Primeiro Contato Sem Travar',
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
          goldenTip: 'Nunca traduza palavra por palavra. Foque no ritmo e no sentimento da frase inteira!',
          audioScript: `[Speaker: Leo (Charon)]\nHello, my friend! Leonardo Leite aqui. Vamos para o primeiro impacto de "${courseTitle}"!\n[pause: 1.5s]\n[Speaker: Native (Aoede)]\nHi there! How can I help you today?\n[pause: 0.8s]\n[Speaker: Traveler (Puck)]\nHi! I need some assistance with this, please.\n[pause: 1.5s]\n[Speaker: Leo (Charon)]\nSimples, direto e elegante. Repita no player até virar reflexo!`,
          processedContentHtml: `<div class="p-5 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs"><p class="text-xs text-slate-800">Treine no Player até a fala sair no automático.</p></div>`
        },
        {
          id: `${slug}-l2`,
          moduleId: `${slug}-m1`,
          courseId: slug,
          title: 'Aula 02 • O Bate-Pronto: Velocidade de Resposta',
          order: 2,
          duration: '04:10',
          description: 'Velocidade de resposta quando o nativo fala rápido ou oferece opções.',
          videoUrl: '',
          audioUrl: '',
          thumbnailUrl: 'assets/images/cover-default-aef.jpg',
          artworkUrl: 'assets/images/cover-default-aef.jpg',
          pdfUrl: '',
          hasTrainingTrack: true,
          trainingTrackId: `${slug}-track-2`,
          published: true,
          goldenTip: 'Se não entender de primeira, não diga "What?". Use "Could you say that again, please?" com cadência suave.',
          audioScript: `[Speaker: Leo (Charon)]\nAula dois! Treino de bate-pronto.\n[pause: 1.5s]\n[Speaker: Native (Aoede)]\nWould you prefer option A or option B?\n[pause: 0.8s]\n[Speaker: Traveler (Puck)]\nOption A works great for me, thank you.\n[pause: 1.5s]\n[Speaker: Leo (Charon)]\nRepita até a sua boca acostumar com o som!`,
          processedContentHtml: `<div class="p-5 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs"><p class="text-xs text-slate-800">Pratique o reflexo imediato no Player.</p></div>`
        },
        {
          id: `${slug}-l3`,
          moduleId: `${slug}-m1`,
          courseId: slug,
          title: 'Aula 03 • Fechamento com Elegância & Autonomia',
          order: 3,
          duration: '03:50',
          description: 'Conclusão da conversa, agradecimento e despedida autêntica.',
          videoUrl: '',
          audioUrl: '',
          thumbnailUrl: 'assets/images/cover-default-aef.jpg',
          artworkUrl: 'assets/images/cover-default-aef.jpg',
          pdfUrl: '',
          hasTrainingTrack: true,
          trainingTrackId: `${slug}-track-3`,
          published: true,
          goldenTip: 'Termine sempre agradecendo com um sorriso: "I really appreciate your help. Have a great one!".',
          audioScript: `[Speaker: Leo (Charon)]\nFechando com chave de ouro!\n[pause: 1.5s]\n[Speaker: Native (Aoede)]\nIs there anything else I can do for you?\n[pause: 0.8s]\n[Speaker: Traveler (Puck)]\nThat is all, thank you so much for your help!\n[pause: 1.5s]\n[Speaker: Leo (Charon)]\nExcelente! Leve essa confiança para a vida prática!`,
          processedContentHtml: `<div class="p-5 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs"><p class="text-xs text-slate-800">Missão cumprida! Seu inglês da vida prática destravado.</p></div>`
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
