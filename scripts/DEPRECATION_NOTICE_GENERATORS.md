# 📜 Decomissionamento de Geradores Legados de PDF
**Fase 5 — Unificação do Pipeline Pedagógico**
*Ecossistema AgoraEuFalo • Professor Leonardo Leite*

---

## 1. Contexto & Diretriz Arquitetural
Anteriormente, o ecossistema continha múltiplos scripts isolados em Python (utilizando ReportLab ou Chrome Headless via Puppeteer/fitz) para compilar apostilas de lições específicas (`generate_ms001_pdf.py`, `generate_ms002_pdf.py`, `generate_ms003_pdf.py`, `generate_dtc_pdfs.py`, `generate_eqs_pdfs.py`, `generate_post_pdf.py`).

Esses geradores apresentavam duplicação de regras visuais, parsing frágil e divergência de contratos em relação ao Player e à Sala de Aula.

Com a conclusão da **Fase 5**, o gerador oficial único e canônico de todo o ecossistema é o:

### 🏆 `v2-pdf-factory/` (Single Source of Truth)
- **Base Técnica:** React, `@react-pdf/renderer`, Tailwind CSS e Zod Schemas.
- **Contrato Canônico:** Compartilhado estritamente com `src/types/lesson-schema.ts`.
- **Blocos Suportados:**
  - `INTRO` (Foco, Chunks, Sentimento da Estrutura, Recomendações, Roadblocks)
  - `LR` (Listen & Read - Imersão Auditiva Real)
  - `VOC` (Vocabulary Session & Matriz de Chunks Sonoros)
  - `LA` (Listen & Answer - Zero respostas reveladas)
  - `LRT` (Look & Retell - Guia visual de speaking autônomo)
  - `LASK` (Listen & Ask - Zero perguntas reveladas)
  - `PRO` (Pronunciation & Connected Speech + Sacada de Ouro do Leo)
  - `QR_CODE` (Acesso direto ao Training Player)

---

## 2. Inventário de Scripts Decomissionados (Legacy)
Os seguintes scripts em `scripts/` foram marcados com banner explícito de `@deprecated` e **NÃO devem ser utilizados em novas lições ou fluxos de produção**:

| Script | Status | Motivo da Descontinuação | Substituto Oficial |
| :--- | :--- | :--- | :--- |
| `scripts/generate_ms001_pdf.py` | `DEPRECATED` | ReportLab estático hardcoded para MS001 | `v2-pdf-factory` |
| `scripts/generate_ms002_pdf.py` | `DEPRECATED` | ReportLab estático hardcoded para MS002 | `v2-pdf-factory` |
| `scripts/generate_ms003_pdf.py` | `DEPRECATED` | ReportLab estático hardcoded para MS003 | `v2-pdf-factory` |
| `scripts/generate_dtc_pdfs.py` | `DEPRECATED` | Chrome Headless HTML template legado | `v2-pdf-factory` |
| `scripts/generate_eqs_pdfs.py` | `DEPRECATED` | Chrome Headless HTML template legado | `v2-pdf-factory` |
| `scripts/generate_post_pdf.py` | `DEPRECATED` | ReportLab para blog/posts legados | `v2-pdf-factory` |
| `scripts/generate_eqs_options.py` | `DEPRECATED` | ReportLab experimental | `v2-pdf-factory` |
| `scripts/generate_eqs_1_2_sample.py`| `DEPRECATED` | ReportLab experimental | `v2-pdf-factory` |

---

## 3. Instruções de Compilação Oficial
Para compilar a fábrica oficial e gerar PDFs canônicos:
```bash
cd v2-pdf-factory
npm install
npm run build
```
O build integrado do projeto raiz (`npm run build`) já orquestra a compilação do `v2-pdf-factory` automaticamente.
