/**
 * AgoraEuFalo - Universal PDF & Pedagogical Document Generator
 * Professor Leonardo Leite
 * 
 * Generates beautiful, print-ready, high-resolution A4 PDFs for both:
 * 1. Masterclass Clássica / Cursos Temáticos (Explicações Vivas, Tabelas de Melodia, Exercícios Pautados & Sacada de Ouro)
 * 2. Magic Stories (3 Canonical Archetypes: Deep Navy Cover, LR/VOC, Practice Workbook)
 * 3. Guia de Consulta Rápida (Cheat Sheet A4)
 */

(function (window) {
  'use strict';

  const COLOR_PALETTES = {
    cobalt: { primary: '#1A56DB', bgLight: '#EFF6FF', border: '#BFDBFE', textDark: '#1E3A8A', name: 'Azul Cobalto' },
    emerald: { primary: '#047857', bgLight: '#ECFDF5', border: '#A7F3D0', textDark: '#064E3B', name: 'Verde Esmeralda' },
    amber: { primary: '#C68A36', bgLight: '#FDF8F0', border: '#FDE68A', textDark: '#78350F', name: 'Âmbar Real / Ouro' },
    ruby: { primary: '#E11D48', bgLight: '#FFF1F2', border: '#FECDD3', textDark: '#881337', name: 'Rubi Quente' },
    indigo: { primary: '#6366F1', bgLight: '#EEF2FF', border: '#C7D2FE', textDark: '#312E81', name: 'Índigo Violeta' },
    slate: { primary: '#1E293B', bgLight: '#F8FAFC', border: '#CBD5E1', textDark: '#0F172A', name: 'Deep Slate' }
  };

  class AEFPdfGenerator {
    constructor() {
      this.palettes = COLOR_PALETTES;
    }

    resolvePalette(themeColor) {
      if (!themeColor) return COLOR_PALETTES.amber;
      if (COLOR_PALETTES[themeColor]) return COLOR_PALETTES[themeColor];
      if (themeColor.startsWith('#')) {
        return {
          primary: themeColor,
          bgLight: '#FAF8F5',
          border: '#EAE5DC',
          textDark: '#0F172A',
          name: 'Custom'
        };
      }
      return COLOR_PALETTES.amber;
    }

    /**
     * Limpa e desescapa quebras de linha e caracteres literais vindos de JSON/string
     */
    cleanText(str) {
      if (!str) return '';
      return String(str)
        .replace(/\\r\\n/g, '\n')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, ' ')
        .replace(/\\"/g, '"')
        .trim();
    }

    /**
     * Formata markdown básico para HTML limpo
     */
    formatInlineMarkdown(text) {
      if (!text) return '';
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code style="background:#F1F5F9; padding:2px 5px; border-radius:4px; font-family:monospace; font-size:0.9em; color:#0F172A;">$1</code>');
    }

    /**
     * Compila o documento A4 completo para impressão
     */
    generatePrintableHtml(course, module, lesson, rawScript) {
      const palette = this.resolvePalette(course?.themeColor || 'amber');
      const courseTitle = course?.title || 'Curso AgoraEuFalo';
      const moduleTitle = module?.title || 'Módulo Oficial';
      const lessonTitle = lesson?.title || 'Aula Oficial';
      const goldenTip = this.cleanText(lesson?.goldenTip || '');

      let processedHtml = this.cleanText(lesson?.processedContentHtml || '');
      let rawText = this.cleanText(rawScript || lesson?.rawScript || '');

      let bodyContentHtml = '';

      // CASO 1: A aula já possui HTML didático estruturado (processedContentHtml)
      if (processedHtml && processedHtml.length > 20) {
        bodyContentHtml = `
          <div class="pedagogical-stream">
            ${processedHtml}
          </div>
        `;
      } 
      // CASO 2: Processa o rawScript transformando em seções didáticas diagramadas
      else if (rawText && rawText.length > 0) {
        const paragraphs = rawText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
        const sectionsHtml = [];

        paragraphs.forEach((p, idx) => {
          const lines = p.split('\n').map(l => l.trim()).filter(Boolean);

          // Se é uma lista numerada ou tópicos
          if (lines.some(l => /^\d+[\.\)]|^\•|^\-/.test(l))) {
            const listItems = lines.map(l => {
              const cleaned = l.replace(/^\d+[\.\)]\s*|^[\•\-]\s*/, '');
              return `<li style="margin-bottom:8px; line-height:1.5;">${this.formatInlineMarkdown(cleaned)}</li>`;
            }).join('');

            sectionsHtml.push(`
              <div class="pedagogical-box">
                <div class="box-title">✦ Pontos Principais & Estruturas da Aula</div>
                <ul style="padding-left:20px; margin:0; font-size:13pt; color:#1E293B;">
                  ${listItems}
                </ul>
              </div>
            `);
          } 
          // Se é parágrafo explicativo
          else {
            const textFormatted = lines.map(l => `<p style="margin-bottom:10px; line-height:1.6; font-size:13.5pt; color:#1E293B;">${this.formatInlineMarkdown(l)}</p>`).join('');
            sectionsHtml.push(`
              <div class="pedagogical-box">
                <div class="box-title">✦ ${idx === 0 ? 'O Sentimento da Estrutura & Contexto da Aula' : 'Notas & Explicações Práticas'}</div>
                <div class="box-body">
                  ${textFormatted}
                </div>
              </div>
            `);
          }
        });

        // Bloco de Anotações Pautadas do Aluno
        sectionsHtml.push(`
          <div class="practice-box">
            <div class="practice-title">📝 Anotações Pessoais & Pílulas de Treino</div>
            <p style="font-size:11pt; color:#64748B; margin-bottom:12px;">Use este espaço para anotar as palavras contraintuitivas e as melodias sonoras que você identificou:</p>
            <div class="notebook-line"></div>
            <div class="notebook-line"></div>
            <div class="notebook-line"></div>
            <div class="notebook-line"></div>
          </div>
        `);

        bodyContentHtml = sectionsHtml.join('');
      } 
      // CASO 3: Sem conteúdo ainda (Aviso acolhedor)
      else {
        bodyContentHtml = `
          <div class="pedagogical-box">
            <div class="box-title">✦ Orientações & Guia de Estudo</div>
            <div class="box-body">
              <p>Assista à masterclass com atenção focada aos blocos sonoros. Repita cada expressão em voz alta acompanhando a cadência e melodia natural do Professor Leonardo Leite.</p>
            </div>
          </div>
          <div class="practice-box">
            <div class="practice-title">📝 Anotações do Aluno</div>
            <div class="notebook-line"></div>
            <div class="notebook-line"></div>
            <div class="notebook-line"></div>
          </div>
        `;
      }

      // Sacada de Ouro em Destaque Monumental
      let goldenTipHtml = '';
      if (goldenTip) {
        goldenTipHtml = `
          <div class="golden-box">
            <div class="golden-header">
              <span class="golden-badge">💡 A SACADA DE OURO DO PROFESSOR LEO</span>
            </div>
            <div class="golden-body">
              "${this.formatInlineMarkdown(goldenTip)}"
            </div>
          </div>
        `;
      }

      return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${courseTitle} • ${lessonTitle} | Apostila Oficial</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,600&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 14mm 16mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      margin: 0;
      padding: 0;
      font-size: 14pt;
      line-height: 1.6;
    }

    /* Anti-orphan and anti-cut rules for print */
    .pedagogical-box, .golden-box, .practice-box, .header-banner, .pedagogical-stream > div {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* Header Banner Institucional Nobre */
    .header-banner {
      background: linear-gradient(135deg, ${palette.primary}, #0A192F);
      color: #FFFFFF;
      border-radius: 18px;
      padding: 22px 26px;
      margin-bottom: 24px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    }
    .header-tag {
      font-size: 9pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #FDE68A;
      margin-bottom: 6px;
    }
    .header-course-title {
      font-size: 13pt;
      font-weight: 700;
      opacity: 0.95;
      margin-bottom: 4px;
      color: #E2E8F0;
    }
    .header-lesson-title {
      font-size: 20pt;
      font-weight: 900;
      line-height: 1.2;
      margin: 0;
      color: #FFFFFF;
      letter-spacing: -0.5px;
    }

    /* Pedagogical Boxes */
    .pedagogical-box {
      background: #FAF8F5;
      border: 1.5px solid ${palette.border};
      border-left: 6px solid ${palette.primary};
      border-radius: 14px;
      padding: 18px 22px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .box-title {
      font-size: 11pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: ${palette.textDark};
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .box-body {
      font-size: 13pt;
      color: #1E293B;
      line-height: 1.6;
    }

    /* Practice & Notebook Lines */
    .practice-box {
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 14px;
      padding: 18px 22px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .practice-title {
      font-size: 11pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #0F172A;
      margin-bottom: 8px;
    }
    .notebook-line {
      border-bottom: 1px dashed #CBD5E1;
      height: 24px;
      margin-bottom: 6px;
    }

    /* Sacada de Ouro do Professor Leo (Monumental) */
    .golden-box {
      background: #FFFBEB;
      border: 2px solid #F59E0B;
      border-radius: 16px;
      padding: 20px 24px;
      margin-top: 24px;
      margin-bottom: 24px;
      page-break-inside: avoid;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.08);
    }
    .golden-header {
      margin-bottom: 8px;
    }
    .golden-badge {
      font-size: 9.5pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #B45309;
      background: #FEF3C7;
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid #FDE68A;
      display: inline-block;
    }
    .golden-body {
      font-size: 14pt;
      font-style: italic;
      color: #78350F;
      line-height: 1.6;
      font-weight: 700;
    }

    /* Footer Institucional */
    .document-footer {
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9pt;
      color: #64748B;
      font-weight: 600;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>

  <!-- Header Banner -->
  <div class="header-banner">
    <div class="header-tag">✦ AGORAEUFALO • PROFESSOR LEONARDO LEITE</div>
    <div class="header-course-title">${courseTitle} • ${moduleTitle}</div>
    <h1 class="header-lesson-title">${lessonTitle}</h1>
  </div>

  <!-- Main Pedagogical Stream -->
  <main>
    ${bodyContentHtml}
    ${goldenTipHtml}
  </main>

  <!-- Institutional Footer -->
  <footer class="document-footer">
    <div>AgoraEuFalo Ecossistema Digital • Material Exclusivo de Apoio</div>
    <div>Suporte: selexenglish@gmail.com</div>
  </footer>

</body>
</html>`;
    }

    printDocument(htmlContent) {
      const printWindow = window.open('', '_blank', 'width=850,height=950');
      if (!printWindow) {
        alert("Por favor, permita popups para abrir a janela de visualização e impressão da apostila.");
        return;
      }
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 600);
    }
  }

  window.AEFPdfGenerator = new AEFPdfGenerator();
})(window);
