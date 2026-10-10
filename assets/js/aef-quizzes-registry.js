/**
 * AgoraEuFalo - Master Canonical Quizzes Registry (Single Source of Truth)
 * Professor Leonardo Leite
 * Bank of Listening & Understanding Quizzes
 */

const AEF_QUIZZES_DATA = {
  "quiz-dtc-horas-01": {
    "id": "quiz-dtc-horas-01",
    "title": "Quiz de Escuta • Reconhecendo Horas Faladas (DTC)",
    "description": "Teste seu ouvido para captar as horas e períodos do dia em conversas reais.",
    "category": "Dates & Times",
    "badge": "OUVIDO AFIADO",
    "passingScore": 70,
    "questions": [
      {
        "id": "q1",
        "type": "dialogue_comprehension",
        "questionText": "Ouça o diálogo e responda: A que horas vai começar a reunião?",
        "audioUrl": "/assets/audio/quizzes/quiz_dtc_q1.mp3",
        "audioScript": "Rodrigo: Hello, my dear friend! What time is our meeting today?\nLiam: It is at a quarter to five in the afternoon!",
        "options": [
          { "id": "opt_a", "text": "Às 5:15 da tarde", "isCorrect": false },
          { "id": "opt_b", "text": "Às 4:45 da tarde (Quinze pras cinco)", "isCorrect": true },
          { "id": "opt_c", "text": "Às 5:45 da manhã", "isCorrect": false },
          { "id": "opt_d", "text": "Às 4:15 da tarde", "isCorrect": false }
        ],
        "goldenTip": "Em inglês falado real, 'a quarter to five' significa 15 minutos que faltam para as 5, ou seja, 4h45 da tarde!",
        "retryHint": "Preste atenção na palavra 'TO' no áudio. 'To' indica os minutos que faltam para a hora seguinte."
      },
      {
        "id": "q2",
        "type": "sound_discrimination",
        "questionText": "Qual horário exato foi dito pelo falante na gravação?",
        "audioUrl": "/assets/audio/quizzes/quiz_dtc_q2.mp3",
        "audioScript": "Liam: The flight leaves at half past eight in the morning.",
        "options": [
          { "id": "opt_a", "text": "8:30 da manhã (Oito e meia)", "isCorrect": true },
          { "id": "opt_b", "text": "8:15 da manhã", "isCorrect": false },
          { "id": "opt_c", "text": "7:30 da noite", "isCorrect": false },
          { "id": "opt_d", "text": "8:45 da manhã", "isCorrect": false }
        ],
        "goldenTip": "'Half past eight' é a forma mais coloquial e natural de dizer 'oito e meia' (meia hora passada das 8).",
        "retryHint": "'Half past' sempre significa 30 minutos após a hora mencionada."
      },
      {
        "id": "q3",
        "type": "fill_chunk",
        "questionText": "Ouça a frase e selecione a expressão que completa o bloco sonoro:",
        "audioUrl": "/assets/audio/quizzes/quiz_dtc_q3.mp3",
        "audioScript": "Leo: Do not worry! I will be there in a couple of minutes.",
        "options": [
          { "id": "opt_a", "text": "a couple of (em uns dois ou três minutos)", "isCorrect": true },
          { "id": "opt_b", "text": "a dozen of", "isCorrect": false },
          { "id": "opt_c", "text": "a lot of", "isCorrect": false },
          { "id": "opt_d", "text": "each of", "isCorrect": false }
        ],
        "goldenTip": "'A couple of minutes' não é traduzido ao pé da letra como casal, mas sim 'uns dois ou três minutos'!",
        "retryHint": "Ouça o som conectado /ə ˈkʌpəl əv/. É um bloco sonoro único!"
      }
    ]
  },
  "quiz-ms-grazi-01": {
    "id": "quiz-ms-grazi-01",
    "title": "Quiz de Escuta • Grazi Wants to Change (MS001)",
    "description": "Descubra se seu ouvido captou as ações e intenções da história da Grazi.",
    "category": "Magic Stories",
    "badge": "HISTÓRIA VIVA",
    "passingScore": 70,
    "questions": [
      {
        "id": "q1",
        "type": "dialogue_comprehension",
        "questionText": "Por que a Grazi decidiu mudar sua rotina segundo o áudio?",
        "audioUrl": "/assets/audio/quizzes/quiz_ms_grazi_q1.mp3",
        "audioScript": "Narrator: Grazi is tired of feeling stuck. She wants to speak English with confidence and change her career.",
        "options": [
          { "id": "opt_a", "text": "Porque ela quer mudar de carreira e destravar o inglês com confiança", "isCorrect": true },
          { "id": "opt_b", "text": "Porque ela vai fazer uma viagem curta de férias", "isCorrect": false },
          { "id": "opt_c", "text": "Porque o chefe dela a obrigou a fazer uma prova", "isCorrect": false },
          { "id": "opt_d", "text": "Porque ela não gosta de acordar cedo", "isCorrect": false }
        ],
        "goldenTip": "'Tired of feeling stuck' é o sentimento de estar estagnado. Quando ela decide mudar, a ação vira reflexo!",
        "retryHint": "Ouça o início da frase: 'Grazi is tired of feeling stuck...'"
      },
      {
        "id": "q2",
        "type": "sound_discrimination",
        "questionText": "O que a Grazi afirma com firmeza no áudio?",
        "audioUrl": "/assets/audio/quizzes/quiz_ms_grazi_q2.mp3",
        "audioScript": "Grazi: I cannot wait any longer. Today is the day I take action!",
        "options": [
          { "id": "opt_a", "text": "Que não pode mais esperar e vai agir hoje mesmo", "isCorrect": true },
          { "id": "opt_b", "text": "Que vai esperar até o próximo ano", "isCorrect": false },
          { "id": "opt_c", "text": "Que está com medo de tentar de novo", "isCorrect": false },
          { "id": "opt_d", "text": "Que prefere estudar gramática primeiro", "isCorrect": false }
        ],
        "goldenTip": "'I cannot wait any longer' é a expressão viva de quem decidiu não adiar mais a própria vida.",
        "retryHint": "Perceba o ritmo da fala: 'Today is the day I take action!'"
      },
      {
        "id": "q3",
        "type": "fill_chunk",
        "questionText": "Complete o conselho do Professor Leo ouvido na gravação:",
        "audioUrl": "/assets/audio/quizzes/quiz_ms_grazi_q3.mp3",
        "audioScript": "Leo: Hello, my dear friend! Repeat the story until English becomes a reflex.",
        "options": [
          { "id": "opt_a", "text": "until English becomes a reflex (até o inglês virar reflexo)", "isCorrect": true },
          { "id": "opt_b", "text": "until you pass the written test", "isCorrect": false },
          { "id": "opt_c", "text": "by translating word by word", "isCorrect": false },
          { "id": "opt_d", "text": "without listening to any audio", "isCorrect": false }
        ],
        "goldenTip": "O inglês entra pelo ouvido com a repetição da mesma história até a fala sair sem pensar!",
        "retryHint": "Ouça o final da sentença: '...until English becomes a reflex.'"
      }
    ]
  },
  "quiz-quickstart-text-01": {
    "id": "quiz-quickstart-text-01",
    "title": "Quiz Tradicional (Texto) • Sentimento das Estruturas Vivas",
    "description": "Teste seu raciocínio contextual e compreensão de chunks em 100% texto sem áudio prévio.",
    "category": "English QuickStart",
    "badge": "COMPREENSÃO TOTAL",
    "passingScore": 70,
    "questions": [
      {
        "id": "q1",
        "type": "text_comprehension",
        "questionText": "Qual das opções melhor expressa o sentimento coloquial de 'Já vai!' ou 'Já estou a caminho!' em inglês falado real?",
        "audioUrl": "",
        "audioScript": "",
        "options": [
          { "id": "opt_a", "text": "I am already going", "isCorrect": false },
          { "id": "opt_b", "text": "I'm on my way! (ou 'Coming!')", "isCorrect": true },
          { "id": "opt_c", "text": "I will go now", "isCorrect": false },
          { "id": "opt_d", "text": "I am walking to there", "isCorrect": false }
        ],
        "goldenTip": "Em inglês falado do dia a dia, quando alguém te chama, você diz 'Coming!' ou 'I'm on my way!'. 'I am already going' soa como tradução literal dura.",
        "retryHint": "Pense na expressão que os nativos usam no reflexo imediato quando alguém bate à porta ou chama."
      },
      {
        "id": "q2",
        "type": "text_comprehension",
        "questionText": "No contexto da frase 'She is a 45-year-old woman', por que usamos 'is' (to be) em vez do verbo 'have' para idade?",
        "audioUrl": "",
        "audioScript": "",
        "options": [
          { "id": "opt_a", "text": "Porque em inglês a idade é um estado de ser ('to be'), e não uma posse que você carrega", "isCorrect": true },
          { "id": "opt_b", "text": "Porque o verbo have é proibido com números", "isCorrect": false },
          { "id": "opt_c", "text": "Porque a palavra woman exige um verbo no passado", "isCorrect": false },
          { "id": "opt_d", "text": "Porque a regra gramatical foi inventada para provas", "isCorrect": false }
        ],
        "goldenTip": "Em inglês, idade, fome, sede, frio e calor são estados de ser ('I am 45', 'I am hungry'). Você É o estado, não POSSUI a idade!",
        "retryHint": "Lembre-se do 'Sentimento da Estrutura': o inglês enxerga a idade como quem a pessoa É naquele momento."
      }
    ]
  },
  "quiz-1788820884388": {
    "id": "quiz-1788820884388",
    "title": "DTS_mod_1_horas_5_questions",
    "description": "Teste seu ouvido para reconhecer horas faladas e períodos do dia.",
    "category": "Horas",
    "badge": "TESTE DE ESCUTA",
    "passingScore": 70,
    "questions": [
      {
        "id": "q1",
        "type": "dialogue_comprehension",
        "questionText": "Escute o que a pessoa fala e marque apenas as horas que você compreende",
        "audioUrl": "https://assets.agoraeufalo.com.br/quizzes/audio/1788832624752_quiz_quiz-1788820884388_q1_1788832624752.wav",
        "voice": "Aoede",
        "audioScript": "I have an english class at a quarter to three this afternoon.",
        "options": [
          { "id": "opt_a", "text": "3:15", "isCorrect": false },
          { "id": "opt_b", "text": "4:45", "isCorrect": false },
          { "id": "opt_c", "text": "2:45", "isCorrect": true }
        ],
        "goldenTip": "Boa! nem sempre a hora é o número que você escuta.",
        "retryHint": "Nem sempre a hora é o número que você escuta."
      },
      {
        "id": "q2",
        "type": "dialogue_comprehension",
        "questionText": "Ouça o áudio e selecione a opção correta:",
        "audioUrl": "https://assets.agoraeufalo.com.br/quizzes/audio/1788832643074_quiz_quiz-1788820884388_q2_1788832643074.wav",
        "voice": "Charon",
        "audioScript": "I usually get to work at half past nine in the morning. I often stay until late in the evening, though.",
        "options": [
          { "id": "opt_a", "text": "3:49", "isCorrect": false },
          { "id": "opt_b", "text": "9:30", "isCorrect": true },
          { "id": "opt_c", "text": "9:00", "isCorrect": false }
        ],
        "goldenTip": "Saber dizer a hora é facil. Difícil é entender a hora dos outros.",
        "retryHint": "Contexto e treino de escuta são chave!"
      },
      {
        "id": "q3",
        "type": "dialogue_comprehension",
        "questionText": "Ouça o áudio e selecione a opção correta:",
        "audioUrl": "https://assets.agoraeufalo.com.br/quizzes/audio/1788832744005_quiz_quiz-1788820884388_q3_1788832744005.wav",
        "voice": "Fenrir",
        "audioScript": "James: Hey Leo! Let's meet for lunch today!\nLeo: Sure! We usually break for lunch around noon.\nJames: I'll meet you outside then!",
        "options": [
          { "id": "opt_a", "text": "por volta de meio dia", "isCorrect": true },
          { "id": "opt_b", "text": "uma da tarde", "isCorrect": false },
          { "id": "opt_c", "text": "meia noite", "isCorrect": false }
        ],
        "goldenTip": "Boa. Quando a hora não usa números é mais dificil!",
        "retryHint": "Essa hora não tem números! Tente de novo!",
        "audioMode": "dual",
        "speaker1Name": "Jennie",
        "speaker1Voice": "Aoede",
        "speaker2Name": "Leo",
        "speaker2Voice": "Charon"
      },
      {
        "id": "q4",
        "type": "dialogue_comprehension",
        "questionText": "Ouça o áudio e selecione a opção correta:",
        "audioUrl": "https://assets.agoraeufalo.com.br/quizzes/audio/1788832840653_quiz_quiz-1788820884388_q4_1788832840652.wav",
        "voice": "Fenrir",
        "audioScript": "Leo: Hey Jennie! I'll pick you up at work tonight! What time do you get off?\nJennie: You're so sweet Leo! I get off at a quarter past seven. Will be waiting for ya! Thanks!",
        "options": [
          { "id": "opt_a", "text": "3:45", "isCorrect": false },
          { "id": "opt_b", "text": "7:15", "isCorrect": true },
          { "id": "opt_c", "text": "7:45", "isCorrect": false }
        ],
        "goldenTip": "Explicação prática e sem gramatiquês do Leo.",
        "retryHint": "Ouça novamente com atenção ao bloco sonoro.",
        "audioMode": "dual",
        "speaker1Name": "Leo",
        "speaker1Voice": "Fenrir",
        "speaker2Name": "Jennie",
        "speaker2Voice": "Aoede"
      },
      {
        "id": "q5",
        "type": "dialogue_comprehension",
        "questionText": "Ouça o áudio e selecione a opção correta:",
        "audioUrl": "https://assets.agoraeufalo.com.br/quizzes/audio/1788832882686_quiz_quiz-1788820884388_q5_1788832882686.wav",
        "voice": "Charon",
        "audioScript": "I'm gonna go to bed early tonight. [sighs] I'm off to the airport at ten past six in the morning.",
        "options": [
          { "id": "opt_a", "text": "10:30 da manhã", "isCorrect": false },
          { "id": "opt_b", "text": "3:30 da manhã", "isCorrect": false },
          { "id": "opt_c", "text": "6:10 da manhã", "isCorrect": true }
        ],
        "goldenTip": "Explicação prática e sem gramatiquês do Leo.",
        "retryHint": "Ouça novamente com atenção ao bloco sonoro."
      }
    ]
  },
  "quiz-1788825310582": {
    "id": "quiz-1788825310582",
    "title": "DTS_Anos",
    "description": "Teste auditivo para reconhecer anos e décadas em diálogos do dia a dia.",
    "category": "Geral",
    "badge": "TESTE DE ESCUTA",
    "passingScore": 70,
    "questions": [
      {
        "id": "q1",
        "type": "dialogue_comprehension",
        "questionText": "Ouça o áudio e selecione o ano que você ouviu:",
        "audioUrl": "https://assets.agoraeufalo.com.br/quizzes/audio/1788832944761_quiz_quiz-1788825310582_q1_1788832944760.wav",
        "voice": "Aoede",
        "audioScript": "Jennie: \"Wait, is this the original family farmhouse?\"\nLiam: \"Yeah, my great-grandfather actually laid the foundation back in eighteen-oh-six.\"",
        "options": [
          { "id": "opt_a", "text": "1906", "isCorrect": false },
          { "id": "opt_b", "text": "1806", "isCorrect": true },
          { "id": "opt_c", "text": "1860", "isCorrect": false },
          { "id": "opt_1788827989664", "text": "1989", "isCorrect": false }
        ],
        "goldenTip": "Explicação prática e sem gramatiquês do Leo.",
        "retryHint": "Ouça novamente com atenção ao bloco sonoro.",
        "audioMode": "dual",
        "speaker1Name": "Jennie",
        "speaker1Voice": "Kore",
        "speaker2Name": "Liam",
        "speaker2Voice": "Charon"
      },
      {
        "id": "q2",
        "type": "dialogue_comprehension",
        "questionText": "Em qual ano eles se mudaram para o apartamento?",
        "audioUrl": "https://assets.agoraeufalo.com.br/quizzes/audio/1788832976320_quiz_quiz-1788825310582_q2_1788832976320.wav",
        "voice": "Aoede",
        "audioScript": "Rodrigo: \"Wait, did you guys move into this apartment in twenty twenty-one?\"\nJennie: \"No, we signed the lease right before that, actually. It was late twenty-twenty, right in the middle of everything.\"",
        "options": [
          { "id": "opt_a", "text": "2019", "isCorrect": false },
          { "id": "opt_b", "text": "2020", "isCorrect": true },
          { "id": "opt_c", "text": "2021", "isCorrect": false },
          { "id": "opt_1788827953976", "text": "2022", "isCorrect": false }
        ],
        "goldenTip": "Explicação prática e sem gramatiquês do Leo.",
        "retryHint": "Ouça novamente com atenção ao bloco sonoro.",
        "audioMode": "dual",
        "speaker1Name": "Rodrigo",
        "speaker1Voice": "Fenrir",
        "speaker2Name": "Jennie",
        "speaker2Voice": "Leda"
      },
      {
        "id": "q3",
        "type": "dialogue_comprehension",
        "questionText": "Que ano ele começou no emprego dele?",
        "audioUrl": "https://assets.agoraeufalo.com.br/quizzes/audio/1788833005131_quiz_quiz-1788825310582_q3_1788833005131.wav",
        "voice": "Fenrir",
        "audioScript": "\"I started my current job in twenty nineteen, and I really love working here.\"",
        "options": [
          { "id": "opt_a", "text": "2018", "isCorrect": false },
          { "id": "opt_b", "text": "2019", "isCorrect": true },
          { "id": "opt_c", "text": "2020", "isCorrect": false },
          { "id": "opt_1788828310562", "text": "2009", "isCorrect": false }
        ],
        "goldenTip": "Explicação prática e sem gramatiquês do Leo.",
        "retryHint": "Ouça novamente com atenção ao bloco sonoro.",
        "audioMode": "single"
      },
      {
        "id": "q4",
        "type": "dialogue_comprehension",
        "questionText": "Em que ano o carro foi comprado?",
        "audioUrl": "https://assets.agoraeufalo.com.br/quizzes/audio/1788833033564_quiz_quiz-1788825310582_q4_1788833033564.wav",
        "voice": "Aoede",
        "audioScript": "Jennie: When did you buy this car?\nJoe: I bought it brand new in twenty fifteen.",
        "options": [
          { "id": "opt_a", "text": "2014", "isCorrect": false },
          { "id": "opt_b", "text": "2015", "isCorrect": true },
          { "id": "opt_c", "text": "2016", "isCorrect": false },
          { "id": "opt_1788828445415", "text": "2005", "isCorrect": false }
        ],
        "goldenTip": "Explicação prática e sem gramatiquês do Leo.",
        "retryHint": "Ouça novamente com atenção ao bloco sonoro.",
        "audioMode": "dual",
        "speaker1Name": "Jennie",
        "speaker1Voice": "Aoede",
        "speaker2Name": "Joe",
        "speaker2Voice": "Puck"
      },
      {
        "id": "q5",
        "type": "dialogue_comprehension",
        "questionText": "Em que ano o irmão se formou?",
        "audioUrl": "https://assets.agoraeufalo.com.br/quizzes/audio/1788833159562_quiz_quiz-1788825310582_q5_1788833159562.wav",
        "audioMode": "single",
        "voice": "Leda",
        "speaker1Name": "Rodrigo",
        "speaker1Voice": "Aoede",
        "speaker2Name": "Liam",
        "speaker2Voice": "Puck",
        "audioScript": "My brother graduated from high school back in nineteen ninety-five.",
        "options": [
          { "id": "opt_a", "text": "1985", "isCorrect": false },
          { "id": "opt_b", "text": "1999", "isCorrect": false },
          { "id": "opt_c", "text": "2005", "isCorrect": false },
          { "id": "opt_1788833268529", "text": "1995", "isCorrect": true }
        ],
        "goldenTip": "Explicação prática e sem gramatiquês do Leo.",
        "retryHint": "Ouça novamente com atenção ao bloco sonoro."
      }
    ]
  }
};

if (typeof window !== "undefined") {
  window.AEF_QUIZZES_REGISTRY = AEF_QUIZZES_DATA;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = AEF_QUIZZES_DATA;
}
