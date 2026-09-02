/**
 * AgoraEuFalo - Universal PDF & Pedagogical Document Generator
 * Professor Leonardo Leite
 * 
 * Generates beautiful, print-ready, high-resolution A4 PDFs for both:
 * 1. Generic Courses (Dynamic Color, Flexible Page Flow: 2 to N pages, Adaptive Blocks)
 * 2. Magic Stories (3 Canonical Archetypes: Deep Navy Cover, LR/VOC, Practice Workbook)
 */

(function (window) {
  'use strict';

  const COLOR_PALETTES = {
    cobalt: { primary: '#1A56DB', bgLight: '#EFF6FF', border: '#BFDBFE', name: 'Azul Cobalto' },
    emerald: { primary: '#047857', bgLight: '#ECFDF5', border: '#A7F3D0', name: 'Verde Esmeralda' },
    amber: { primary: '#C68A36', bgLight: '#FDF8F0', border: '#FDE68A', name: 'Âmbar Real / Ouro' },
    ruby: { primary: '#E11D48', bgLight: '#FFF1F2', border: '#FECDD3', name: 'Rubi Quente' },
    indigo: { primary: '#6366F1', bgLight: '#EEF2FF', border: '#C7D2FE', name: 'Índigo Violeta' },
    slate: { primary: '#1E293B', bgLight: '#F8FAFC', border: '#E2E8F0', name: 'Deep Slate' }
  };

  class AEFPdfGenerator {
    constructor() {
      this.palettes = COLOR_PALETTES;
    }

    /**
     * Resolves course theme color palette
     */
    resolvePalette(themeColor) {
      if (!themeColor) return COLOR_PALETTES.amber;
      if (COLOR_PALETTES[themeColor]) return COLOR_PALETTES[themeColor];
      
      // Custom HEX fallback
      if (themeColor.startsWith('#')) {
        return {
          primary: themeColor,
          bgLight: '#FAF8F5',
          border: '#EAE5DC',
          name: 'Custom'
        };
      }
      return COLOR_PALETTES.amber;
    }

    /**
     * Parses raw text or structured lesson notes into pedagogical blocks
     */
    parseContentBlocks(rawText, lessonTitle = '', goldenTip = '') {
      const blocks = [];
      const text = (rawText || '').trim();

      if (!text) {
        // Fallback default blocks if empty
        blocks.push({
          type: 'concept',
          title: 'Conceito Central da Aula',
          content: `<p class="text-slate-800 leading-relaxed font-medium">Esta aula foca na assimilação e automatização das estruturas fundamentais da fala. Ouça os blocos sonoros completos e repita com musicalidade.</p>`
        });
        if (goldenTip) {
          blocks.push({
            type: 'golden_tip',
            title: 'Sacada de Ouro do Professor Leo',
            content: `"${goldenTip}"`
          });
        }
        return blocks;
      }

      // Check if text has sections demarcated by headers or bullet points
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      let currentSection = { type: 'general', title: 'Notas Didáticas', lines: [] };

      lines.forEach(line => {
        const lower = line.toLowerCase();
        if (lower.startsWith('###') || lower.startsWith('---') || lower.includes('conceito:') || lower.includes('propósito:')) {
          if (currentSection.lines.length > 0) blocks.push(this._formatSection(currentSection));
          currentSection = { type: 'concept', title: line.replace(/^[#\-\s:]+/, '') || 'Conceito & Propósito', lines: [] };
        } else if (lower.includes('chunks:') || lower.includes('vocabulário:') || lower.includes('frases:')) {
          if (currentSection.lines.length > 0) blocks.push(this._formatSection(currentSection));
          currentSection = { type: 'chunks', title: 'Matriz de Chunks & Frases Vivas', lines: [] };
        } else if (lower.includes('exercício') || lower.includes('prática:') || lower.includes('perguntas:') || lower.includes('listen & answer')) {
          if (currentSection.lines.length > 0) blocks.push(this._formatSection(currentSection));
          currentSection = { type: 'practice', title: 'Treino Prático & Fixação', lines: [] };
        } else if (lower.includes('sacada de ouro') || lower.includes('golden tip')) {
          if (currentSection.lines.length > 0) blocks.push(this._formatSection(currentSection));
          currentSection = { type: 'golden_tip', title: 'Sacada de Ouro do Professor Leo', lines: [] };
        } else {
          currentSection.lines.push(line);
        }
      });

      if (currentSection.lines.length > 0) {
        blocks.push(this._formatSection(currentSection));
      }

      // Always guarantee Golden Tip box if present
      if (goldenTip && !blocks.some(b => b.type === 'golden_tip')) {
        blocks.push({
          type: 'golden_tip',
          title: 'Sacada de Ouro do Professor Leo',
          content: `"${goldenTip}"`
        });
      }

      return blocks;
    }

    _formatSection(section) {
      if (section.type === 'chunks') {
        const chunkPairs = [];
        section.lines.forEach(l => {
          if (l.includes('->') || l.includes(' - ') || l.includes('=')) {
            const parts = l.split(/->|-|=/);
            chunkPairs.push({ en: parts[0].trim(), pt: (parts[1] || '').trim() });
          } else {
            chunkPairs.push({ en: l, pt: '' });
          }
        });

        const gridHtml = chunkPairs.map(cp => `
          <div style="background:#FAF8F5; border:1px solid #EAE5DC; border-radius:10px; padding:8px 12px; margin-bottom:6px; page-break-inside:avoid;">
            <div style="font-weight:bold; color:#0A192F; font-size:14px;">${cp.en}</div>
            ${cp.pt ? `<div style="font-size:12px; color:#047857; font-style:italic;">↳ ${cp.pt}</div>` : ''}
          </div>
        `).join('');

        return { type: 'chunks', title: section.title, content: gridHtml };
      }

      if (section.type === 'practice') {
        const practiceHtml = section.lines.map((l, i) => `
          <div style="margin-bottom:14px; page-break-inside:avoid;">
            <div style="font-weight:bold; color:#0A192F; font-size:13px; margin-bottom:4px;">${l.startsWith('1') || l.startsWith('2') || l.startsWith('•') ? l : `${i+1}. ${l}`}</div>
            <div style="border-bottom:1px dashed #C68A36; height:18px; margin-bottom:6px;"></div>
            <div style="border-bottom:1px dashed #EAE5DC; height:18px;"></div>
          </div>
        `).join('');
        return { type: 'practice', title: section.title, content: practiceHtml };
      }

      return {
        type: section.type,
        title: section.title,
        content: section.lines.map(l => `<p style="margin-bottom:8px; line-height:1.6; color:#1E293B; font-size:14px;">${l}</p>`).join('')
      };
    }

    /**
     * Compiles complete printable HTML document with dynamic A4 stylesheet and course palette
     */
    generatePrintableHtml(course, module, lesson, rawScript) {
      const palette = this.resolvePalette(course?.themeColor || 'amber');
      const courseTitle = course?.title || 'Curso AgoraEuFalo';
      const moduleTitle = module?.title || 'Módulo Oficial';
      const lessonTitle = lesson?.title || 'Aula Oficial';
      const goldenTip = lesson?.goldenTip || '';
      const blocks = this.parseContentBlocks(rawScript || lesson?.rawScript, lessonTitle, goldenTip);

      return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${courseTitle} • ${lessonTitle} | Apostila Oficial</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 18mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Segoe UI", Roboto, sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      margin: 0;
      padding: 0;
      font-size: 14pt;
      line-height: 1.6;
    }

    /* Header Banner Institucional */
    .header-banner {
      background: linear-gradient(135deg, ${palette.primary}, #0A192F);
      color: #FFFFFF;
      border-radius: 16px;
      padding: 20px 24px;
      margin-bottom: 24px;
      page-break-inside: avoid;
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
      font-size: 14pt;
      font-weight: 700;
      opacity: 0.9;
      margin-bottom: 4px;
    }
    .header-lesson-title {
      font-size: 20pt;
      font-weight: 900;
      line-height: 1.2;
      margin: 0;
      color: #FFFFFF;
    }

    /* Pedagogical Boxes */
    .pedagogical-box {
      background: #FAF8F5;
      border: 1.5px solid ${palette.border};
      border-left: 5px solid ${palette.primary};
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .box-title {
      font-size: 11pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: ${palette.primary};
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .box-body {
      font-size: 13pt;
      color: #1E293B;
      line-height: 1.6;
    }

    /* Sacada de Ouro do Leo */
    .golden-box {
      background: #FFFBEB;
      border: 2px solid #F59E0B;
      border-radius: 14px;
      padding: 18px 22px;
      margin-top: 24px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .golden-title {
      font-size: 11pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #B45309;
      margin-bottom: 8px;
    }
    .golden-body {
      font-size: 13.5pt;
      font-style: italic;
      color: #78350F;
      line-height: 1.6;
      font-weight: 600;
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
    <div class="header-tag">✦ AgoraEuFalo • Professor Leonardo Leite</div>
    <div class="header-course-title">${courseTitle} • ${moduleTitle}</div>
    <h1 class="header-lesson-title">${lessonTitle}</h1>
  </div>

  <!-- Dynamic Content Blocks -->
  <main>
    ${blocks.map(block => {
      if (block.type === 'golden_tip') {
        return `
          <div class="golden-box">
            <div class="golden-title">💡 ${block.title}</div>
            <div class="golden-body">${block.content}</div>
          </div>
        `;
      }
      return `
        <div class="pedagogical-box">
          <div class="box-title">✦ ${block.title}</div>
          <div class="box-body">${block.content}</div>
        </div>
      `;
    }).join('')}
  </main>

  <!-- Institutional Footer -->
  <footer class="document-footer">
    <div>AgoraEuFalo Ecossistema Digital • Material Exclusivo de Apoio</div>
    <div>Suporte: selexenglish@gmail.com</div>
  </footer>

</body>
</html>`;
    }

    /**
     * Opens print dialog for instant PDF compilation
     */
    printDocument(htmlContent) {
      const printWindow = window.open('', '_blank', 'width=800,height=900');
      if (!printWindow) {
        alert("Por favor, permita popups para abrir a janela de impressão da apostila em PDF.");
        return;
      }
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }

  // Global Singleton Export
  window.AEFPdfGenerator = new AEFPdfGenerator();
})(window);
