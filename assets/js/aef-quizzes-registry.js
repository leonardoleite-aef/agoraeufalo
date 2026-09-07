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
  }
};

if (typeof window !== "undefined") {
  window.AEF_QUIZZES_REGISTRY = AEF_QUIZZES_DATA;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = AEF_QUIZZES_DATA;
}
