#!/usr/bin/env python3
"""
AgoraEuFalo PDF Generator - Complete Module 1 Set (Lessons 1.1 to 1.4)
Generates A4 luxury light-themed PDFs using Google Chrome Headless.
Renders pages to PNG inside the artifacts directory for validation.
"""

import os, subprocess, fitz

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>{title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

    @page {{
      size: A4 portrait;
      margin: 12mm 15mm;
    }}

    * {{
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }}

    body {{
      background-color: #ffffff;
      color: #1e293b;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      margin: 0;
      padding: 0;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }}

    .page {{
      width: 100%;
      height: 268mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      break-after: page;
    }}

    .page-content {{
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding: 10px 0;
    }}

    /* Running Header */
    .running-header {{
      width: 100%;
      border-bottom: 1.2px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}

    .running-header .brand {{
      font-size: 10.5pt;
      font-weight: 800;
      color: #0a192f;
      letter-spacing: -0.01em;
    }}

    .running-header .brand span {{
      color: #d97706;
    }}

    .running-header .pill {{
      background-color: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 9999px;
      padding: 3px 10px;
      font-size: 7pt;
      font-weight: 800;
      color: #d97706;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }}

    /* Running Footer */
    .running-footer {{
      width: 100%;
      border-top: 1.2px solid #e2e8f0;
      padding-top: 6px;
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7.5pt;
      color: #94a3b8;
      font-weight: 500;
    }}

    /* Titulação */
    .lesson-header {{
      margin-bottom: 8px;
    }}

    .lesson-tag {{
      font-size: 8pt;
      font-weight: 800;
      color: #047857;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 2px;
    }}

    .lesson-title {{
      font-size: 17pt;
      font-weight: 800;
      color: #0a192f;
      margin: 0 0 3px 0;
      letter-spacing: -0.02em;
    }}

    .lesson-subtitle {{
      font-size: 9.5pt;
      color: #64748b;
      margin: 0;
      font-style: italic;
    }}

    /* Cards */
    .card {{
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      margin-top: 10px;
    }}

    .card-concept {{
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-left: 4px solid #047857;
    }}

    .card-concept h2 {{
      font-size: 10.5pt;
      font-weight: 800;
      color: #064e3b;
      margin: 0 0 4px 0;
      display: flex;
      align-items: center;
      gap: 6px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}

    .card-concept p {{
      font-size: 9.5pt;
      line-height: 1.5;
      color: #1e293b;
      margin: 0;
    }}

    .card-concept strong {{
      color: #047857;
    }}

    .section-title {{
      font-size: 11pt;
      font-weight: 800;
      color: #047857;
      text-transform: uppercase;
      text-align: center;
      margin: 16px 0 8px 0;
      letter-spacing: 0.06em;
    }}

    /* Table styles */
    .data-table {{
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 8.5pt;
    }}

    .data-table th {{
      background-color: #047857;
      color: #ffffff;
      text-align: left;
      padding: 8px;
      font-weight: 700;
      border: 1px solid #e2e8f0;
    }}

    .data-table td {{
      padding: 8px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
    }}

    .data-table tr:nth-child(even) {{
      background-color: #f8fafc;
    }}

    /* Grid layout */
    .shapes-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }}

    .shape-card {{
      background-color: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 140px;
    }}

    .shape-card.am {{ border-top: 3.5px solid #ef4444; }}
    .shape-card.is {{ border-top: 3.5px solid #ec4899; }}
    .shape-card.are {{ border-top: 3.5px solid #22c55e; }}

    .shape-title {{
      font-size: 20pt;
      font-weight: 800;
      color: #0a192f;
      margin: 0 0 4px 0;
    }}

    .shape-desc {{
      font-size: 8.2pt;
      line-height: 1.35;
      color: #475569;
      margin: 0 0 8px 0;
    }}

    .shape-desc strong {{
      color: #0f172a;
    }}

    .shape-contraction-label {{
      font-size: 7.5pt;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 2px;
    }}

    .shape-contraction-val {{
      font-size: 12.5pt;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }}

    .shape-card.am .shape-contraction-val {{ color: #2563eb; }}
    .shape-card.is .shape-contraction-val {{ color: #db2777; }}
    .shape-card.are .shape-contraction-val {{ color: #16a34a; }}

    /* Exemplos */
    .examples-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }}

    .example-col-title {{
      font-size: 9.5pt;
      font-weight: 700;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }}

    .example-col-title.ser {{ color: #dc2626; }}
    .example-col-title.estar {{ color: #2563eb; }}

    .example-list {{
      display: flex;
      flex-direction: column;
      gap: 6px;
    }}

    .example-item {{
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 3.5px solid #d97706;
      border-radius: 0 6px 6px 0;
      padding: 6px 10px;
      font-size: 8.8pt;
      line-height: 1.35;
    }}

    .example-item span.en {{
      font-weight: 600;
      color: #0f172a;
    }}

    .example-item span.highlight {{
      color: #2563eb;
      font-weight: 700;
    }}

    .example-item span.pt {{
      color: #475569;
      display: block;
      margin-top: 1px;
    }}

    /* Sacada de Ouro Box */
    .sacada-box {{
      background-color: #fffbeb;
      color: #78350f;
      border: 1px solid #fcd34d;
      border-left: 4px solid #f59e0b;
      border-radius: 8px;
      padding: 10px 14px;
      margin-top: 12px;
      font-size: 9pt;
      line-height: 1.45;
    }}

    .sacada-box h3 {{
      margin: 0 0 3px 0;
      font-size: 9.5pt;
      font-weight: 800;
      color: #b45309;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}

    /* Workbook */
    .workbook-intro {{
      font-size: 9.5pt;
      line-height: 1.45;
      color: #334155;
      margin: 5px 0 10px 0;
    }}

    .workbook-intro strong {{
      color: #047857;
    }}

    .exercise-list {{
      display: flex;
      flex-direction: column;
      gap: 7px;
    }}

    .exercise-card {{
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      border-left: 3.5px solid #047857;
      display: grid;
      grid-template-columns: 75mm 1fr;
      align-items: center;
      gap: 15px;
    }}

    .exercise-q {{
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
    }}

    .exercise-ans-lines {{
      font-size: 8.5pt;
      color: #475569;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }}

    .exercise-ans-line {{
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 2px;
    }}

    /* Notebook Grid */
    .notepad-container {{
      background-color: #fdfdfd;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      margin-top: 12px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }}

    .notepad-title {{
      font-size: 9.5pt;
      font-weight: 800;
      color: #d97706;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }}

    .notepad-lines {{
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-top: 5px;
    }}

    .notepad-line {{
      border-bottom: 1px dashed #e2e8f0;
      height: 18px;
    }}
  </style>
</head>
<body>
{body}
</body>
</html>
"""

def generate_pdf(name, html_content):
    artifact_dir = "/Users/macbookpro/.gemini/antigravity/brain/a4b916ca-1ea8-4168-ad1a-721fbe772a0c"
    temp_html = f"{artifact_dir}/temp_{name}.html"
    pdf_path = f"/Users/macbookpro/Desktop/agoraeufalo_site/Material-PDF/{name}.pdf"
    
    # Escreve o HTML temporário
    with open(temp_html, "w", encoding="utf-8") as f:
        f.write(html_content)
        
    # Compila via Chrome
    chrome_cmd = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        temp_html
    ]
    subprocess.run(chrome_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # Remove HTML temporário
    if os.path.exists(temp_html):
        os.remove(temp_html)
        
    print(f"Generated {name}.pdf successfully!")
    
    # Converte páginas em PNG para validação visual
    doc = fitz.open(pdf_path)
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=150)
        png_path = f"{artifact_dir}/{name}_page{i+1}.png"
        pix.save(png_path)
        print(f"  Rendered Page {i+1} to {png_path}")

def build_lesson_1_1():
    body = """
<!-- ========================================================================= -->
<!-- PÁGINA 1: TEORIA                                                          -->
<!-- ========================================================================= -->
<div class="page">
  <div class="running-header">
    <div class="brand">AgoraEuFalo<span>.</span></div>
    <div class="pill">ENGLISH QUICKSTART • MATERIAL DIDÁTICO</div>
  </div>

  <div class="page-content">
    <div class="lesson-header">
      <div class="lesson-tag">MÓDULO 1 • AULA 1.1</div>
      <h1 class="lesson-title">Os Pronomes Sujeito (O Sujeito da História)</h1>
      <p class="lesson-subtitle">Identifique rapidamente quem faz a ação ou quem é o personagem principal.</p>
    </div>

    <div class="card card-concept">
      <h2>💡 O CONCEITO</h2>
      <p>Pronomes substituem nomes e evitam repetições desnecessárias. Em inglês, <strong>o sujeito é OBRIGATÓRIO</strong>. Ao contrário do português, o inglês não aceita sujeito oculto. Toda frase precisa de um pronome ou nome explícito.</p>
      <p style="margin-top: 6px; font-size: 8.8pt; font-family: 'JetBrains Mono', monospace; color: #b91c1c;">❌ Is ready. (Errado) | ✅ He is ready. (Certo)</p>
    </div>

    <div class="section-title">A Tabela Essencial dos Pronomes</div>
    
    <table class="data-table">
      <thead>
        <tr>
          <th>Pronome (Inglês)</th>
          <th>Significado (Português)</th>
          <th>Função na História</th>
          <th>Exemplo Prático</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>I</strong></td>
          <td>Eu</td>
          <td>O narrador ou quem está falando. Sempre em maiúscula.</td>
          <td>I am here.</td>
        </tr>
        <tr>
          <td><strong>YOU</strong></td>
          <td>Você / Vocês</td>
          <td>Quem está ouvindo o narrador. Serve para singular/plural.</td>
          <td>You are smart.</td>
        </tr>
        <tr>
          <td><strong>HE</strong></td>
          <td>Ele</td>
          <td>Um homem ou garoto (gênero masculino singular).</td>
          <td>He is the hero.</td>
        </tr>
        <tr>
          <td><strong>SHE</strong></td>
          <td>Ela</td>
          <td>Uma mulher ou garota (gênero feminino singular).</td>
          <td>She is the witch.</td>
        </tr>
        <tr>
          <td><strong>IT</strong></td>
          <td>Ele / Ela / Isso</td>
          <td>Pronome neutro. Para tudo que não é pessoa (objetos, animais, clima).</td>
          <td>It is the door.</td>
        </tr>
        <tr>
          <td><strong>WE</strong></td>
          <td>Nós</td>
          <td>O narrador mais outras pessoas.</td>
          <td>We are friends.</td>
        </tr>
        <tr>
          <td><strong>THEY</strong></td>
          <td>Eles / Elas</td>
          <td>Plural de tudo (pessoas, objetos, animais, ideias).</td>
          <td>They run fast.</td>
        </tr>
      </tbody>
    </table>

    <div class="section-title">Armadilhas Críticas da Audição</div>
    <div style="font-size: 8.8pt; line-height: 1.4; color: #334155;">
      <strong>1. O "It" de Identidade Oculta:</strong> Usamos <i>"It's me"</i> (sou eu) ou <i>"Who is it?"</i> (quem é?) quando a identidade de alguém ainda é desconhecida. O "It" funciona como um placeholder até descobrirmos quem está agindo.<br/>
      <strong>2. Pluralidade do "They":</strong> Se na história houver dois livros ou três cachorros agindo, o narrador usará <b>They</b>. Ele não serve apenas para pessoas!
    </div>
  </div>

  <div class="running-footer">
    <div>© 2026 AgoraEuFalo • Todos os direitos reservados.</div>
    <div>Página 1 de 2</div>
  </div>
</div>

<!-- ========================================================================= -->
<!-- PÁGINA 2: WORKBOOK                                                        -->
<!-- ========================================================================= -->
<div class="page">
  <div class="running-header">
    <div class="brand">AgoraEuFalo<span>.</span></div>
    <div class="pill">ENGLISH QUICKSTART • MATERIAL DIDÁTICO</div>
  </div>

  <div class="page-content">
    <div class="lesson-header">
      <div class="lesson-tag">MÓDULO 1 • WORKBOOK</div>
      <h1 class="lesson-title">Aula 1.1: Prática de Reflexo</h1>
      <p class="lesson-subtitle">Escreva as estruturas corretas e identifique o sujeito oculto.</p>
    </div>

    <div class="workbook-intro">
      Identifique o <strong>sujeito</strong> correspondente substituído por pronome nas frases abaixo:
    </div>

    <div class="exercise-list">
      <div class="exercise-card">
        <div class="exercise-q">1. The robot is here. It is ready.</div>
        <div class="exercise-ans-lines">
          <div class="exercise-ans-line">O pronome "It" substitui: _________________________________________</div>
          <div class="exercise-ans-line">Tradução da frase: __________________________________________</div>
        </div>
      </div>

      <div class="exercise-card">
        <div class="exercise-q">2. The phone is ringing. It's your boss.</div>
        <div class="exercise-ans-lines">
          <div class="exercise-ans-line">Por que usamos "It's" aqui? _________________________________________</div>
          <div class="exercise-ans-line">Tradução da frase: __________________________________________</div>
        </div>
      </div>

      <div class="exercise-card">
        <div class="exercise-q">3. My sister and I are ready. We go now.</div>
        <div class="exercise-ans-lines">
          <div class="exercise-ans-line">O pronome "We" substitui: _________________________________________</div>
          <div class="exercise-ans-line">Tradução da frase: __________________________________________</div>
        </div>
      </div>
    </div>

    <div class="notepad-container">
      <div class="notepad-title">📝 CADERNO DE ANOTAÇÕES DE ESCUTA (SOUND PATTERNS)</div>
      <div style="font-size: 8pt; color: #475569; margin-bottom: 6px;">
        Anote abaixo as palavras que se fundem (Connected Speech) e as diferenças entre a pronúncia real e a escrita.
      </div>
      <div class="notepad-lines">
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
      </div>
    </div>
  </div>

  <div class="running-footer">
    <div>© 2026 AgoraEuFalo • Todos os direitos reservados.</div>
    <div>Página 2 de 2</div>
  </div>
</div>
"""
    return HTML_TEMPLATE.format(title="EQS Aula 1.1 - Pronomes Pessoais", body=body)

def build_lesson_1_3():
    body = """
<div class="page">
  <div class="running-header">
    <div class="brand">AgoraEuFalo<span>.</span></div>
    <div class="pill">ENGLISH QUICKSTART • MATERIAL DIDÁTICO</div>
  </div>

  <div class="page-content">
    <div class="lesson-header">
      <div class="lesson-tag">MÓDULO 1 • AULA 1.3</div>
      <h1 class="lesson-title">O Rei dos Verbos "To Be" (Forma Negativa)</h1>
      <p class="lesson-subtitle">Aprenda a negar a identidade ou o estado de espírito do personagem.</p>
    </div>

    <div class="card card-concept">
      <h2>💡 A REGRA DO "NOT"</h2>
      <p>Negar com o To Be é extremamente simples: basta colocar a partícula <strong>NOT</strong> imediatamente após o verbo conjugado (am, is, are). Assim, você nega quem o personagem é ou como ele está na cena.</p>
      <p style="margin-top: 6px; font-size: 8.8pt; font-family: 'JetBrains Mono', monospace; color: #047857;">Estrutura: SUJEITO + TO BE + NOT + COMPLEMENTO</p>
    </div>

    <div class="section-title">A Tabela da Negação & Contrações</div>
    
    <table class="data-table">
      <thead>
        <tr>
          <th>Sujeito</th>
          <th>Forma Completa</th>
          <th>Contração Mais Comum</th>
          <th>Significado Falado Real</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>I</strong></td>
          <td>I am not</td>
          <td><strong>I'm not</strong></td>
          <td>Eu não sou / Eu não estou</td>
        </tr>
        <tr>
          <td><strong>HE / SHE / IT</strong></td>
          <td>He is not</td>
          <td><strong>He isn't</strong> / She isn't / It isn't</td>
          <td>Ele/Ela não é ou não está</td>
        </tr>
        <tr>
          <td><strong>YOU</strong></td>
          <td>You are not</td>
          <td><strong>You aren't</strong></td>
          <td>Você não é / Você não está</td>
        </tr>
        <tr>
          <td><strong>WE</strong></td>
          <td>We are not</td>
          <td><strong>We aren't</strong></td>
          <td>Nós não somos / Não estamos</td>
        </tr>
        <tr>
          <td><strong>THEY</strong></td>
          <td>They are not</td>
          <td><strong>They aren't</strong></td>
          <td>Eles/Elas não são ou não estão</td>
        </tr>
      </tbody>
    </table>

    <div class="section-title">Foco nas Duas Contrações Principais</div>
    <div style="font-size: 8.8pt; line-height: 1.4; color: #334155;">
      Nas Magic Stories e na fala real, você ouvirá **ISN'T** (Is + Not) e **AREN'T** (Are + Not) 99% das vezes. <br/>
      *Nota do Leo:* O pronome **I** não aceita a contração "amn't" na norma padrão. Por isso, a única forma contraída aceita é <b>I'm not</b>.
    </div>

    <div class="sacada-box">
      <h3>💡 SACADA DE OURO DO PROFESSOR LEO</h3>
      Preste atenção nas contrações negativas de ouvido: elas dizem muito sobre os conflitos da história. Ao ouvir <i>"isn't"</i> ou <i>"aren't"</i>, seu cérebro deve imediatamente inverter a expectativa visual!
    </div>
  </div>

  <div class="running-footer">
    <div>© 2026 AgoraEuFalo • Todos os direitos reservados.</div>
    <div>Página 1 de 2</div>
  </div>
</div>

<div class="page">
  <div class="running-header">
    <div class="brand">AgoraEuFalo<span>.</span></div>
    <div class="pill">ENGLISH QUICKSTART • MATERIAL DIDÁTICO</div>
  </div>

  <div class="page-content">
    <div class="lesson-header">
      <div class="lesson-tag">MÓDULO 1 • WORKBOOK</div>
      <h1 class="lesson-title">Aula 1.3: Prática de Reflexo</h1>
      <p class="lesson-subtitle">Escreva as negações corretas e identifique a contração usada.</p>
    </div>

    <div class="workbook-intro">
      Traduza as frases e indique a forma completa de cada contração:
    </div>

    <div class="exercise-list">
      <div class="exercise-card">
        <div class="exercise-q">1. The mission isn't impossible.</div>
        <div class="exercise-ans-lines">
          <div class="exercise-ans-line">Forma Completa: _________________________________________</div>
          <div class="exercise-ans-line">Tradução Real: __________________________________________</div>
        </div>
      </div>

      <div class="exercise-card">
        <div class="exercise-q">2. They aren't telling the truth.</div>
        <div class="exercise-ans-lines">
          <div class="exercise-ans-line">Forma Completa: _________________________________________</div>
          <div class="exercise-ans-line">Tradução Real: __________________________________________</div>
        </div>
      </div>

      <div class="exercise-card">
        <div class="exercise-q">3. I'm not the enemy.</div>
        <div class="exercise-ans-lines">
          <div class="exercise-ans-line">Forma Completa: _________________________________________</div>
          <div class="exercise-ans-line">Tradução Real: __________________________________________</div>
        </div>
      </div>

      <div class="exercise-card">
        <div class="exercise-q">4. She isn't a part of this.</div>
        <div class="exercise-ans-lines">
          <div class="exercise-ans-line">Forma Completa: _________________________________________</div>
          <div class="exercise-ans-line">Tradução Real: __________________________________________</div>
        </div>
      </div>
    </div>

    <div class="notepad-container">
      <div class="notepad-title">📝 CADERNO DE ANOTAÇÕES DE ESCUTA (SOUND PATTERNS)</div>
      <div style="font-size: 8pt; color: #475569; margin-bottom: 6px;">
        Anote abaixo as palavras que se fundem (Connected Speech) e as diferenças entre a pronúncia real e a escrita.
      </div>
      <div class="notepad-lines">
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
      </div>
    </div>
  </div>

  <div class="running-footer">
    <div>© 2026 AgoraEuFalo • Todos os direitos reservados.</div>
    <div>Página 2 de 2</div>
  </div>
</div>
"""
    return HTML_TEMPLATE.format(title="EQS Aula 1.3 - To Be Negativa", body=body)

def build_lesson_1_4():
    body = """
<div class="page">
  <div class="running-header">
    <div class="brand">AgoraEuFalo<span>.</span></div>
    <div class="pill">ENGLISH QUICKSTART • MATERIAL DIDÁTICO</div>
  </div>

  <div class="page-content">
    <div class="lesson-header">
      <div class="lesson-tag">MÓDULO 1 • AULA 1.4</div>
      <h1 class="lesson-title">Adjetivos (Como descrever coisas, pessoas e lugares)</h1>
      <p class="lesson-subtitle">Aprenda a aplicar cores, sentimentos e detalhes na sua história.</p>
    </div>

    <div class="card card-concept">
      <h2>💡 REGRA DE OURO: GÊNERO E NÚMERO</h2>
      <p>Em inglês, os adjetivos são <strong>totalmente invariáveis</strong>. Eles não mudam para o feminino/masculino e nem para o singular/plural. Quem muda é apenas o substantivo!</p>
      <p style="margin-top: 6px; font-size: 8.8pt; font-family: 'JetBrains Mono', monospace; color: #047857;">Singular: a fast car. | Plural: two fast cars. (Adjetivo 'fast' permaneceu idêntico)</p>
    </div>

    <div class="section-title">As Duas Posições Fundamentais</div>
    
    <div class="examples-grid">
      <div>
        <div class="example-col-title ser">1. Antes do Substantivo</div>
        <div class="example-list">
          <div class="example-item">
            <span class="en"><span class="highlight">big</span> house</span>
            <span class="pt">(Casa grande - O adjetivo vem antes)</span>
          </div>
          <div class="example-item">
            <span class="en"><span class="highlight">new</span> clients</span>
            <span class="pt">(Clientes novos)</span>
          </div>
          <div class="example-item">
            <span class="en"><span class="highlight">old</span> map</span>
            <span class="pt">(Mapa antigo)</span>
          </div>
        </div>
      </div>

      <div>
        <div class="example-col-title estar">2. Após o Verbo To Be</div>
        <div class="example-list">
          <div class="example-item">
            <span class="en">The dragon is <span class="highlight">big</span>.</span>
            <span class="pt">(O dragão é grande)</span>
          </div>
          <div class="example-item">
            <span class="en">The meeting is <span class="highlight">important</span>.</span>
            <span class="pt">(A reunião é importante)</span>
          </div>
          <div class="example-item">
            <span class="en">We are <span class="highlight">ready</span>.</span>
            <span class="pt">(Nós estamos prontos)</span>
          </div>
        </div>
      </div>
    </div>

    <div class="section-title">Ordem de Vários Adjetivos (Dica Avançada)</div>
    <div style="font-size: 8.8pt; line-height: 1.4; color: #334155;">
      Se usar mais de um adjetivo antes de um substantivo, eles seguem uma hierarquia: <br/>
      <b>Opinião ➔ Tamanho ➔ Idade ➔ Cor ➔ Substantivo</b>. <br/>
      Exemplo: <i>"a beautiful (Opinião) small (Tamanho) old (Idade) red (Cor) car."</i>
    </div>

    <div class="sacada-box">
      <h3>💡 SACADA DE OURO DO PROFESSOR LEO</h3>
      O maior erro é tentar traduzir o adjetivo depois do substantivo na fala rápida. Acostume seu cérebro a qualificar a coisa antes de dizer o nome dela: pense na qualidade primeiro!
    </div>
  </div>

  <div class="running-footer">
    <div>© 2026 AgoraEuFalo • Todos os direitos reservados.</div>
    <div>Página 1 de 2</div>
  </div>
</div>

<div class="page">
  <div class="running-header">
    <div class="brand">AgoraEuFalo<span>.</span></div>
    <div class="pill">ENGLISH QUICKSTART • MATERIAL DIDÁTICO</div>
  </div>

  <div class="page-content">
    <div class="lesson-header">
      <div class="lesson-tag">MÓDULO 1 • WORKBOOK</div>
      <h1 class="lesson-title">Aula 1.4: Prática de Reflexo</h1>
      <p class="lesson-subtitle">Desafie sua mente a organizar a ordem correta dos adjetivos.</p>
    </div>

    <div class="workbook-intro">
      Traduza as frases abaixo, observando a inversão do adjetivo:
    </div>

    <div class="exercise-list">
      <div class="exercise-card">
        <div class="exercise-q">1. A dark night.</div>
        <div class="exercise-ans-lines">
          <div class="exercise-ans-line">Explicação da ordem: _________________________________________</div>
          <div class="exercise-ans-line">Tradução Real: __________________________________________</div>
        </div>
      </div>

      <div class="exercise-card">
        <div class="exercise-q">2. The warrior is tired.</div>
        <div class="exercise-ans-lines">
          <div class="exercise-ans-line">Explicação da ordem: _________________________________________</div>
          <div class="exercise-ans-line">Tradução Real: __________________________________________</div>
        </div>
      </div>

      <div class="exercise-card">
        <div class="exercise-q">3. It's a bad decision.</div>
        <div class="exercise-ans-lines">
          <div class="exercise-ans-line">Explicação da ordem: _________________________________________</div>
          <div class="exercise-ans-line">Tradução Real: __________________________________________</div>
        </div>
      </div>
    </div>

    <div class="notepad-container">
      <div class="notepad-title">📝 CADERNO DE ANOTAÇÕES DE ESCUTA (SOUND PATTERNS)</div>
      <div style="font-size: 8pt; color: #475569; margin-bottom: 6px;">
        Anote abaixo as palavras que se fundem (Connected Speech) e as diferenças entre a pronúncia real e a escrita.
      </div>
      <div class="notepad-lines">
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
      </div>
    </div>
  </div>

  <div class="running-footer">
    <div>© 2026 AgoraEuFalo • Todos os direitos reservados.</div>
    <div>Página 2 de 2</div>
  </div>
</div>
"""
    return HTML_TEMPLATE.format(title="EQS Aula 1.4 - Adjetivos Essenciais", body=body)

def build_lesson_1_2():
    body = """
<div class="page">
  <div class="running-header">
    <div class="brand">AgoraEuFalo<span>.</span></div>
    <div class="pill">ENGLISH QUICKSTART • MATERIAL DIDÁTICO</div>
  </div>

  <div class="page-content">
    <div class="lesson-header">
      <div class="lesson-tag">MÓDULO 1 • AULA 1.2</div>
      <h1 class="lesson-title">O Rei dos Verbos "To Be" (Afirmativa)</h1>
      <p class="lesson-subtitle">Conecte o Sujeito para definir QUEM É e COMO ESTÁ o personagem.</p>
    </div>

    <div class="card card-concept">
      <h2>💡 O CONCEITO</h2>
      <p>O Verbo <strong>TO BE</strong> é a espinha dorsal do inglês. Ele assume o duplo papel de <strong>SER</strong> (identidade imutável: <i>"I'm a teacher"</i>) ou <strong>ESTAR</strong> (situação transitória ou local: <i>"I'm at school"</i>). Dominá-lo elimina 80% das dúvidas de estruturação.</p>
    </div>

    <div class="section-title">As 3 Formas Básicas (Afirmativa)</div>
    
    <div class="shapes-grid">
      <div class="shape-card am">
        <div>
          <div class="shape-title">AM</div>
          <div class="shape-desc">Vinculado exclusivamente à primeira pessoa singular: <strong>*I*</strong>.</div>
        </div>
        <div>
          <div class="shape-contraction-label">Contração Falada:</div>
          <div class="shape-contraction-val">I'm</div>
        </div>
      </div>
      
      <div class="shape-card is">
        <div>
          <div class="shape-title">IS</div>
          <div class="shape-desc">Utilizado com a <strong>*3ª pessoa do singular*</strong> (He, She, It, ou nomes como *John*).</div>
        </div>
        <div>
          <div class="shape-contraction-label">Contrações:</div>
          <div class="shape-contraction-val">He's / She's / It's</div>
        </div>
      </div>

      <div class="shape-card are">
        <div>
          <div class="shape-title">ARE</div>
          <div class="shape-desc">Aplicado a todos os pronomes <strong>*plurais*</strong> (You, We, They e nomes compostos).</div>
        </div>
        <div>
          <div class="shape-contraction-label">Contrações:</div>
          <div class="shape-contraction-val">You're / We're / They're</div>
        </div>
      </div>
    </div>

    <div class="section-title">Aplicações Práticas: SER vs. ESTAR</div>

    <div class="examples-grid">
      <div>
        <div class="example-col-title ser">SER (Identidade & Profissão)</div>
        <div class="example-list">
          <div class="example-item">
            <span class="en">I'm <span class="highlight">a designer</span>.</span>
            <span class="pt">(Eu sou designer.)</span>
          </div>
          <div class="example-item">
            <span class="en">She's <span class="highlight">smart</span>.</span>
            <span class="pt">(Ela é inteligente.)</span>
          </div>
          <div class="example-item">
            <span class="en">They're <span class="highlight">colleagues</span>.</span>
            <span class="pt">(Eles são colegas.)</span>
          </div>
        </div>
      </div>

      <div>
        <div class="example-col-title estar">ESTAR (Localização & Estado)</div>
        <div class="example-list">
          <div class="example-item">
            <span class="en">I'm <span class="highlight">in the office</span>.</span>
            <span class="pt">(Eu estou no escritório.)</span>
          </div>
          <div class="example-item">
            <span class="en">He's <span class="highlight">tired</span>.</span>
            <span class="pt">(Ele está cansado.)</span>
          </div>
          <div class="example-item">
            <span class="en">The reports are <span class="highlight">ready</span>.</span>
            <span class="pt">(Os relatórios estão prontos.)</span>
          </div>
        </div>
      </div>
    </div>

    <div class="sacada-box">
      <h3>💡 SACADA DE OURO DO PROFESSOR LEO</h3>
      Não decore tabelas de conjugação no papel! O segredo é treinar a musculatura da boca com as contrações (<i>"He's"</i>, <i>"We're"</i>) no Player até que o som se torne automático. A escrita serve apenas para consolidar o que você ouviu.
    </div>
  </div>

  <div class="running-footer">
    <div>© 2026 AgoraEuFalo • Todos os direitos reservados.</div>
    <div>Página 1 de 2</div>
  </div>
</div>

<div class="page">
  <div class="running-header">
    <div class="brand">AgoraEuFalo<span>.</span></div>
    <div class="pill">ENGLISH QUICKSTART • MATERIAL DIDÁTICO</div>
  </div>

  <div class="page-content">
    <div class="lesson-header">
      <div class="lesson-tag">MÓDULO 1 • WORKBOOK</div>
      <h1 class="lesson-title">Aula 1.2: Prática de Reflexo</h1>
      <p class="lesson-subtitle">Escreva as estruturas corretas e teste a sua velocidade mental.</p>
    </div>

    <div class="workbook-intro">
      Ouça as frases correspondentes no vídeo e escreva a <strong>forma completa</strong> (sem contração) e a <strong>tradução falada real</strong>.
    </div>

    <div class="exercise-list">
      <div class="exercise-card">
        <div class="exercise-q">1. It's a strange noise.</div>
        <div class="exercise-ans-lines">
          <div class="exercise-ans-line">Forma Completa: _________________________________________</div>
          <div class="exercise-ans-line">Tradução Real: __________________________________________</div>
        </div>
      </div>

      <div class="exercise-card">
        <div class="exercise-q">2. They're not home.</div>
        <div class="exercise-ans-lines">
          <div class="exercise-ans-line">Forma Completa: _________________________________________</div>
          <div class="exercise-ans-line">Tradução Real: __________________________________________</div>
        </div>
      </div>

      <div class="exercise-card">
        <div class="exercise-q">3. We're late for the meeting.</div>
        <div class="exercise-ans-lines">
          <div class="exercise-ans-line">Forma Completa: _________________________________________</div>
          <div class="exercise-ans-line">Tradução Real: __________________________________________</div>
        </div>
      </div>

      <div class="exercise-card">
        <div class="exercise-q">4. He's a good pilot.</div>
        <div class="exercise-ans-lines">
          <div class="exercise-ans-line">Forma Completa: _________________________________________</div>
          <div class="exercise-ans-line">Tradução Real: __________________________________________</div>
        </div>
      </div>
    </div>

    <div class="notepad-container">
      <div class="notepad-title">📝 CADERNO DE ANOTAÇÕES DE ESCUTA (SOUND PATTERNS)</div>
      <div style="font-size: 8pt; color: #475569; margin-bottom: 6px;">
        Anote abaixo as palavras que se fundem (Connected Speech) e as diferenças entre a pronúncia real e a escrita.
      </div>
      <div class="notepad-lines">
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
        <div class="notepad-line"></div>
      </div>
    </div>
  </div>

  <div class="running-footer">
    <div>© 2026 AgoraEuFalo • Todos os direitos reservados.</div>
    <div>Página 2 de 2</div>
  </div>
</div>
"""
    return HTML_TEMPLATE.format(title="EQS Aula 1.2 - To Be Afirmativa", body=body)

if __name__ == "__main__":
    # Garante que as pastas de destino existem
    os.makedirs("/Users/macbookpro/Desktop/agoraeufalo_site/Material-PDF", exist_ok=True)
    
    # Compila cada uma das aulas
    generate_pdf("EQS_1_1_Pronomes_Pessoais", build_lesson_1_1())
    generate_pdf("EQS_1_2_O_Rei_dos_Verbos_To_Be_Afirmativa", build_lesson_1_2())
    generate_pdf("EQS_1_3_O_Rei_dos_Verbos_To_Be_Negativa", build_lesson_1_3())
    generate_pdf("EQS_1_4_Adjetivos_Essenciais", build_lesson_1_4())
