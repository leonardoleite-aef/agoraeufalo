// scratch/test_db_save.js
// Test script for POST /api/db/save-magic-story

const payload = {
  metadata: {
    title: "Job Interview: Handling Pressure and Team Challenges",
    topic: "profissional",
    level: "intermediate",
    format: "dialogue",
    creatorId: "user_leo_12345"
  },
  content: {
    lr: {
      text: "Recruiter: What did you do at your last job in Chicago?\nLeo: I had a small team, and we made apps for local businesses.",
      audioUrl: "https://storage.agoraeufalo.com.br/audio/lr_interview_123.wav"
    },
    voc: {
      chunks: [
        { chunk: "had a small team", translation: "tinha uma equipe pequena" },
        { chunk: "made apps", translation: "fazia aplicativos / criava apps" }
      ],
      podcastAudioUrl: "https://storage.agoraeufalo.com.br/audio/voc_podcast_123.wav"
    },
    la: {
      drills: [
        { question: "Where was Leo's last job?", answer: "Leo's last job was in Chicago." },
        { question: "What did Leo have at his last job?", answer: "Leo had a small team at his last job." }
      ],
      audioUrl: "https://storage.agoraeufalo.com.br/audio/la_drills_123.wav"
    },
    lrt: {
      guideQuestions: [
        "Where was Leo's last job?",
        "What did Leo have at his last job?"
      ],
      staticAudioUrl: ""
    },
    lask: {
      stimuli: [
        { statement: "Leo's last job wasn't in Chicago.", targetQuestion: "Where was Leo's last job?" },
        { statement: "Leo didn't have a small team at his last job.", targetQuestion: "What did Leo have at his last job?" }
      ],
      audioUrl: "https://storage.agoraeufalo.com.br/audio/lask_stimuli_123.wav"
    },
    pro: {
      phrases: [
        "What_did_you do_at_your last_job_in Chicago?",
        "I had_a small team, and_we made_apps for local businesses."
      ],
      audioUrl: "https://storage.agoraeufalo.com.br/audio/pro_linking_123.wav"
    }
  }
};

async function runTest() {
  console.log("🚀 [Test DB Save] Disparando POST para http://localhost:5173/api/db/save-magic-story...");

  try {
    const response = await fetch("http://localhost:5173/api/db/save-magic-story", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    console.log("HTTP Status:", response.status, response.statusText);
    const result = await response.json();
    console.log("Response Body:", JSON.stringify(result, null, 2));

    if (response.ok && result.success && result.data?.courseName === "Magic Creations - Acervo Exclusivo da Comunidade") {
      console.log("\n✅ [SUCESSO] Endpoint respondeu com HTTP 200 e estrutura relacional íntegra!");
      console.log(`- Course ID: ${result.data.courseId}`);
      console.log(`- Course Name: ${result.data.courseName}`);
      console.log(`- Module ID: ${result.moduleId}`);
      console.log(`- Created At: ${result.data.createdAt}`);
      console.log(`- Is Community Asset: ${result.data.isCommunityAsset}`);
      console.log(`- Topic: ${result.data.metadata.topic}`);
      console.log(`- Creator ID: ${result.data.metadata.creatorId}`);
      process.exit(0);
    } else {
      console.error("\n❌ [FALHA] Validação da estrutura retornada falhou.");
      process.exit(1);
    }
  } catch (err) {
    console.error("Erro na requisição:", err);
    process.exit(1);
  }
}

runTest();
