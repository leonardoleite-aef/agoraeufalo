/**
 * AgoraEuFalo • In-Browser Studio AI Engine (Autonomous SaaS)
 * Professor Leonardo Leite — 35+ Anos de Sala de Aula
 * 
 * Este motor permite que qualquer usuário/assistente no navegador (Mac, PC, iPad)
 * execute tarefas completas de Inteligência Artificial sem depender de terminal:
 * 1. 🎙️ Transcrição Multimodal de Áudio/Vídeo com Gemini 2.0 Flash
 * 2. ✨ Estruturação Pedagógica (Sentimento da Estrutura, Chunks & Zero Traduções Óbvias)
 * 3. 💡 Extração da Sacada de Ouro do Professor Leo
 */

(function (window) {
  'use strict';

  class AEFStudioAI {
    constructor() {
      this.modelText = localStorage.getItem('AEF_GEMINI_MODEL') || 'gemini-2.0-flash';
      this.apiKey = localStorage.getItem('AEF_GEMINI_API_KEY') || '';
    }

    getApiKey() {
      if (!this.apiKey) {
        this.apiKey = localStorage.getItem('AEF_GEMINI_API_KEY') || '';
      }
      return this.apiKey.trim();
    }

    setApiKey(key) {
      this.apiKey = (key || '').trim();
      if (this.apiKey) {
        localStorage.setItem('AEF_GEMINI_API_KEY', this.apiKey);
      } else {
        localStorage.removeItem('AEF_GEMINI_API_KEY');
      }
    }

    hasApiKey() {
      return Boolean(this.getApiKey());
    }

    /**
     * Modal amigável para solicitar ou alterar a chave do Gemini
     */
    promptApiKeyConfig() {
      const current = this.getApiKey();
      const newKey = window.prompt(
        "🔑 Insira sua Chave de API do Google Gemini (Google AI Studio):\n\nEsta chave fica salva com segurança no seu navegador para permitir transcrição de áudio, geração de roteiros e criação de artes com IA.",
        current
      );
      if (newKey !== null) {
        this.setApiKey(newKey);
        if (this.hasApiKey()) {
          if (window.showToast) window.showToast("✅ Chave Gemini configurada com sucesso!");
        } else {
          if (window.showToast) window.showToast("⚠️ Chave Gemini removida.");
        }
        this.updateUiKeyStatus();
      }
      return this.hasApiKey();
    }

    updateUiKeyStatus() {
      const keyBtn = document.getElementById("studioAiKeyBtn");
      const keyDot = document.getElementById("studioAiKeyDot");
      const keyText = document.getElementById("studioAiKeyText");
      const hasKey = this.hasApiKey();

      if (keyDot) {
        keyDot.className = hasKey ? "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" : "w-2 h-2 rounded-full bg-amber-400";
      }
      if (keyText) {
        keyText.innerText = hasKey ? "IA Conectada" : "Configurar IA";
      }
      if (keyBtn) {
        keyBtn.className = hasKey 
          ? "px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          : "px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer";
      }
    }

    /**
     * Converte um arquivo do navegador (File/Blob) em Base64
     */
    async fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    }

    /**
     * 1. TRANSCRIÇÃO MULTIMODAL DE VÍDEO / ÁUDIO
     */
    async transcribeMediaFile(file, onProgress = null) {
      const apiKey = this.getApiKey();
      if (!apiKey) {
        this.promptApiKeyConfig();
        if (!this.hasApiKey()) throw new Error("Chave da API do Gemini necessária para transcrição.");
      }

      if (onProgress) onProgress("Lendo arquivo de mídia...");
      const base64Data = await this.fileToBase64(file);
      const mimeType = file.type || (file.name.endsWith('.mp3') ? 'audio/mp3' : 'video/mp4');

      if (onProgress) onProgress("Enviando para o Gemini Multimodal...");

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(this.getApiKey())}`;

      const systemPrompt = `Você é o transcritor de alta fidelidade do Professor Leonardo Leite (AgoraEuFalo).
Transcreva com EXTREMA PRECISÃO todo o áudio falado nesta aula.
Preserve a fala natural, as pausas, termos em inglês e explicações em português do professor.
Retorne APENAS o texto da transcrição limpo e pontuado, sem introduções, sem metadados e sem marcações Markdown de código.`;

      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              },
              {
                text: "Por favor, transcreva integralmente todo o áudio desta aula em português e inglês."
              }
            ]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Erro HTTP ${response.status}: ${response.statusText}`);
      }

      const resData = await response.json();
      const text = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return text.trim();
    }

    /**
     * 2. ESTRUTURAÇÃO PEDAGÓGICA DA MASTERCLASS & SACADA DE OURO
     */
    async structureMasterclass(rawScript, lessonTitle = "", courseTitle = "", onProgress = null) {
      const apiKey = this.getApiKey();
      if (!apiKey) {
        this.promptApiKeyConfig();
        if (!this.hasApiKey()) throw new Error("Chave da API do Gemini necessária para estruturar a aula.");
      }

      if (!rawScript || rawScript.trim().length < 10) {
        throw new Error("O roteiro bruto (rawScript) está muito curto ou vazio. Cole o texto ou transcreva a aula primeiro.");
      }

      if (onProgress) onProgress("Processando didática do Professor Leo com IA...");

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(this.getApiKey())}`;

      const systemPrompt = `Você é o Arquiteto Pedagógico Sênior do ecossistema AgoraEuFalo, codificando a didática consagrada de mais de 35 anos de sala de aula do Professor Leonardo Leite.

REGRAS PEDAGÓGICAS CANÔNICAS ABSOLUTAS:
1. DIDÁTICA DO "SENTIMENTO DA ESTRUTURA" (ZERO JARGÕES GRAMATICAIS):
   - Proibição absoluta de explicar a língua por nomenclaturas acadêmicas abstratas (ex: "Past Perfect Continuous", "Preposições de tempo").
   - Explique SEMPRE pela intenção, pelo sentimento da estrutura, pelo contexto emocional e prático de quando a frase é dita na vida real.
2. A REGRA CANÔNICA DE "ZERO TRADUÇÕES ÓBVIAS":
   - Proibição absoluta de traduzir números universais (ex: 1973, 2026), dias da semana óbvios ou palavras de compreensão universal.
   - Traduções aplicam-se SOMENTE a expressões contraintuitivas, idiomáticas ou onde a lógica do inglês diverge do português falado brasileiro real (spokenTranslation).
3. DESIGN CALM EDTECH DE ALTO CONTRASTE (ZERO CAIXAS ESCURAS):
   - O HTML gerado deve usar exclusivamente caixas didáticas claras com Tailwind CSS:
     • Box Principal: <div class="p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-200 text-slate-900 space-y-3">...</div>
     • Cards Internos: <div class="p-3 bg-white rounded-xl border border-amber-200">...</div>
     • Títulos: <h3 class="font-black text-sm uppercase tracking-wider text-amber-950 font-sans">...</h3>
     • Textos: <p class="text-xs text-slate-700">...</p>
     • Destaques em Negrito: <b>...</b> ou <i>...</i>
4. EXTRAÇÃO DA SACADA DE OURO DO PROFESSOR LEO (goldenTip):
   - Uma sacada monumental, prática, libertadora e acolhedora de 1 a 2 frases com a sabedoria direta do Professor Leo sobre a aula.

FORMATO DE SAÍDA OBRIGATÓRIO:
Retorne EXCLUSIVAMENTE um objeto JSON válido (sem markdown de código em volta) com a seguinte estrutura:
{
  "goldenTip": "A sacada de ouro prática do Professor Leo",
  "processedContentHtml": "<div class=\\"space-y-6\\">...</div>",
  "summary": "Resumo pedagógico em 2 linhas"
}`;

      const userMessage = `Título do Curso: ${courseTitle || 'Curso de Inglês AgoraEuFalo'}
Título da Aula: ${lessonTitle || 'Aula'}
Roteiro Bruto / Transcrição da Aula:
"""
${rawScript}
"""

Por favor, analise a transcrição e gere o JSON com a Sacada de Ouro e o HTML pedagógico completo estruturado nos padrões de luxo do AgoraEuFalo.`;

      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Erro HTTP ${response.status}: ${response.statusText}`);
      }

      const resData = await response.json();
      const rawJson = resData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      
      let parsed = {};
      try {
        parsed = JSON.parse(rawJson);
      } catch (e) {
        const match = rawJson.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      }

      return {
        goldenTip: parsed.goldenTip || '',
        processedContentHtml: parsed.processedContentHtml || '',
        summary: parsed.summary || ''
      };
    }
  }

  window.AEFStudioAI = new AEFStudioAI();
})(window);
