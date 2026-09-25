const fs = require('fs');
const path = require('path');
const os = require('os');
const { performance } = require('perf_hooks');

// 1. Ler a GEMINI_API_KEY do arquivo .env local
let apiKey = process.env.GEMINI_API_KEY || '';
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)/);
  if (match) {
    apiKey = match[1].trim();
  }
}

if (!apiKey) {
  console.error("❌ ERRO: GEMINI_API_KEY não encontrada no arquivo .env");
  process.exit(1);
}

console.log("🔑 GEMINI_API_KEY carregada com sucesso do .env local.");

async function testGeminiTTS() {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`;

  // =========================================================================
  // PASSO 1: TESTE ESTRITO COM O PAYLOAD ORIGINAL SOLICITADO (systemInstruction)
  // =========================================================================
  console.log("\n============================================================");
  console.log("🧪 TESTE 1: Payload estrito com 'systemInstruction'");
  console.log("============================================================");

  const payloadEstrito = {
    "systemInstruction": {
      "parts": [{ "text": "Read the following text aloud as audio speech. Generate only audio output. Do not generate any text response." }]
    },
    "contents": [{
      "role": "user", 
      "parts": [{ "text": "Hello, my dear friend! Welcome to the Agora Eu Falo audio engine test. This is a high-quality studio generation." }]
    }],
    "generationConfig": {
      "speechConfig": {
        "voiceConfig": {
          "prebuiltVoiceConfig": {
            "voiceName": "Puck"
          }
        }
      }
    }
  };

  const startTime1 = performance.now();
  let base64Audio = null;
  let mimeType = null;
  let latency1 = 0;

  try {
    const res1 = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(payloadEstrito)
    });

    latency1 = Math.round(performance.now() - startTime1);
    console.log(`📡 Status HTTP: ${res1.status} ${res1.statusText}`);
    console.log(`⏱️ Tempo de resposta: ${latency1} ms`);

    const data1 = await res1.json();

    if (!res1.ok) {
      console.warn("⚠️ API retornou erro para 'systemInstruction':");
      console.log(JSON.stringify(data1, null, 2));
    } else {
      const part = data1.candidates?.[0]?.content?.parts?.[0];
      base64Audio = part?.inlineData?.data || part?.inline_data?.data;
      mimeType = part?.inlineData?.mimeType || part?.inline_data?.mime_type;
    }
  } catch (err) {
    console.error("❌ Falha na requisição 1:", err);
  }

  // =========================================================================
  // PASSO 2: TESTE COM INSTRUÇÃO NO PROMPT (PADRÃO OFICIAL GEMINI TTS)
  // =========================================================================
  if (!base64Audio) {
    console.log("\n============================================================");
    console.log("🔄 TESTE 2: Ajuste Canônico (Instrução direta no prompt + responseModalities: ['AUDIO'])");
    console.log("============================================================");

    const preamble = "Read the following text aloud as audio speech. Generate only audio output. Do not generate any text response.\n\n";
    const userText = "Hello, my dear friend! Welcome to the Agora Eu Falo audio engine test. This is a high-quality studio generation.";

    const payloadCanonica = {
      "contents": [{
        "role": "user", 
        "parts": [{ "text": preamble + userText }]
      }],
      "generationConfig": {
        "responseModalities": ["AUDIO"],
        "speechConfig": {
          "voiceConfig": {
            "prebuiltVoiceConfig": {
              "voiceName": "Puck"
            }
          }
        }
      }
    };

    const startTime2 = performance.now();
    try {
      const res2 = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify(payloadCanonica)
      });

      const latency2 = Math.round(performance.now() - startTime2);
      console.log(`📡 Status HTTP: ${res2.status} ${res2.statusText}`);
      console.log(`⏱️ Tempo de resposta: ${latency2} ms`);

      const data2 = await res2.json();

      if (!res2.ok) {
        console.error("❌ Erro HTTP na chamada 2:");
        console.log(JSON.stringify(data2, null, 2));
        return;
      }

      const part = data2.candidates?.[0]?.content?.parts?.[0];
      base64Audio = part?.inlineData?.data || part?.inline_data?.data;
      mimeType = part?.inlineData?.mimeType || part?.inline_data?.mime_type;

      if (!base64Audio) {
        console.warn("⚠️ Base64 não localizado na parte esperada.");
        console.log("📄 Resposta completa:", JSON.stringify(data2, null, 2));
        return;
      }
    } catch (err) {
      console.error("❌ Falha na requisição 2:", err);
      return;
    }
  }

  // =========================================================================
  // PASSO 3: GRAVAÇÃO DOS ARQUIVOS DE ÁUDIO NO DESKTOP DO MAC
  // =========================================================================
  console.log("\n============================================================");
  console.log("💾 SALVANDO ARQUIVO DE ÁUDIO NO DESKTOP");
  console.log("============================================================");

  console.log(`✅ Base64 extraído com sucesso: ${base64Audio.length} caracteres.`);
  console.log(`🎵 MIME retornado pelo Gemini: ${mimeType || 'audio/l16; rate=24000; channels=1'}`);

  const rawBytes = Buffer.from(base64Audio, 'base64');
  const desktopMp3Path = path.resolve(os.homedir(), 'Desktop', 'teste-voz-puck.mp3');

  // Grava o arquivo MP3 conforme solicitado
  fs.writeFileSync(desktopMp3Path, rawBytes);
  console.log(`✅ Arquivo salvo: ${desktopMp3Path}`);
  console.log(`📦 Tamanho gravado: ${(rawBytes.length / 1024).toFixed(2)} KB (${rawBytes.length} bytes)`);

  // BÔNUS PRÁTICO: O Gemini retorna PCM Linear cru (audio/l16; rate=24000; channels=1).
  // Adicionamos também o header RIFF de 44 bytes para teste-voz-puck.wav para tocar nativamente no Mac (Finder/QuickTime/afplay)
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const dataSize = rawBytes.length;
  const wavHeader = Buffer.alloc(44);

  wavHeader.write('RIFF', 0);
  wavHeader.writeUInt32LE(36 + dataSize, 4);
  wavHeader.write('WAVE', 8);
  wavHeader.write('fmt ', 12);
  wavHeader.writeUInt32LE(16, 16);
  wavHeader.writeUInt16LE(1, 20); // PCM
  wavHeader.writeUInt16LE(numChannels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  wavHeader.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  wavHeader.writeUInt16LE(bitsPerSample, 34);
  wavHeader.write('data', 36);
  wavHeader.writeUInt32LE(dataSize, 40);

  const fullWav = Buffer.concat([wavHeader, rawBytes]);
  const desktopWavPath = path.resolve(os.homedir(), 'Desktop', 'teste-voz-puck.wav');
  fs.writeFileSync(desktopWavPath, fullWav);
  console.log(`✅ Arquivo com header WAV (24kHz Mono 16-bit) salvo em: ${desktopWavPath}`);
  console.log(`🎧 Duração estimada: ${(dataSize / (sampleRate * 2)).toFixed(2)} segundos`);
  console.log("🎉 PoC Concluída com Sucesso!");
}

testGeminiTTS();
