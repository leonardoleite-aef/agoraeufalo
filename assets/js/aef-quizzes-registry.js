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
    "passingScore": 75,
    "questions": [
      {
        "id": "q1",
        "type": "dialogue_comprehension",
        "questionText": "Ouça o diálogo e responda: A que horas vai começar a reunião?",
        "audioUrl": "https://firebasestorage.googleapis.com/v0/b/agoraeufalo-3463a.firebasestorage.app/o/courses%2Fdtc_curso%2Fciclo-02%2FDTC_mod_1_1.mp3?alt=media",
        "audioScript": "Rodrigo: Hello, my dear friend! What time is our meeting today?\nLiam: It is at a quarter to five in the afternoon!",
        "options": [
          { "id": "opt_a", "text": "Às 5:15 da tarde", "isCorrect": false },
          { "id": "opt_b", "text": "Às 4:45 da tarde (Quinze pras cinco)", "isCorrect": true },
          { "id": "opt_c", "text": "Às 5:45 da manhã", "isCorrect": false },
          { "id": "opt_d", "text": "Às 4:15 da tarde", "isCorrect": false }
        ],
        "goldenTip": "Em inglês, 'a quarter to five' significa 15 minutos que faltam para as 5, ou seja, 4h45!",
        "retryHint": "Preste atenção na palavra 'TO' no áudio. 'To' indica minutos que faltam para a hora seguinte."
      },
      {
        "id": "q2",
        "type": "sound_discrimination",
        "questionText": "Qual horário foi dito com naturalidade pelo falante?",
        "audioUrl": "https://firebasestorage.googleapis.com/v0/b/agoraeufalo-3463a.firebasestorage.app/o/courses%2Fdtc_curso%2Fciclo-02%2FDTC_mod_1_2.mp3?alt=media",
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
        "audioUrl": "https://firebasestorage.googleapis.com/v0/b/agoraeufalo-3463a.firebasestorage.app/o/courses%2Fdtc_curso%2Fciclo-02%2FDTC_mod_1_1.mp3?alt=media",
        "audioScript": "Leo: Don't worry! I'll be there in _____ minutes.",
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
        "questionText": "Por que a Grazi decidiu mudar sua rotina?",
        "audioUrl": "https://firebasestorage.googleapis.com/v0/b/agoraeufalo-3463a.firebasestorage.app/o/courses%2Fms-legacy%2Fms001-grazi%2FMS001_LR.mp3?alt=media",
        "audioScript": "Narrator: Grazi is tired of feeling stuck. She wants to speak English with confidence and change her career.",
        "options": [
          { "id": "opt_a", "text": "Porque ela quer mudar de carreira e destravar o inglês", "isCorrect": true },
          { "id": "opt_b", "text": "Porque ela vai fazer uma viagem curta de férias", "isCorrect": false },
          { "id": "opt_c", "text": "Porque o chefe dela a obrigou a fazer uma prova", "isCorrect": false },
          { "id": "opt_d", "text": "Porque ela não gosta de acordar cedo", "isCorrect": false }
        ],
        "goldenTip": "'Tired of feeling stuck' é o sentimento de estar estagnado. Quando ela decide mudar, a ação vira reflexo!",
        "retryHint": "Ouça o início da história: 'Grazi is tired of feeling stuck...'"
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
