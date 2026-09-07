#!/usr/bin/env python3
"""
AgoraEuFalo PDF Generator - Dates & Times Complete Module Set
Generates luxury A4 light-themed PDFs using Google Chrome Headless.
Renders high quality pedagogical workbooks with zero obvious translations.
"""

import os
import subprocess
import json

CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUTPUT_DIR = "Material-PDF"
os.makedirs(OUTPUT_DIR, exist_ok=True)

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
      padding: 6px 0;
    }}

    .running-header {{
      width: 100%;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}

    .running-header .brand {{
      font-size: 10.5pt;
      font-weight: 800;
      color: #0a192f;
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

    .running-footer {{
      width: 100%;
      border-top: 1.5px solid #e2e8f0;
      padding-top: 6px;
      margin-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7.5pt;
      color: #94a3b8;
      font-weight: 500;
    }}

    .lesson-header {{
      margin-bottom: 8px;
    }}

    .lesson-tag {{
      font-size: 8pt;
      font-weight: 800;
      color: #d97706;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 2px;
    }}

    .lesson-title {{
      font-size: 16pt;
      font-weight: 800;
      color: #0a192f;
      margin: 0 0 3px 0;
      letter-spacing: -0.02em;
    }}

    .lesson-subtitle {{
      font-size: 9pt;
      color: #64748b;
      margin: 0;
      font-style: italic;
    }}

    .card {{
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-top: 8px;
    }}

    .card-concept {{
      background-color: #fffbeb;
      border: 1px solid #fde68a;
      border-left: 4px solid #d97706;
    }}

    .card-concept h2 {{
      font-size: 10pt;
      font-weight: 800;
      color: #78350f;
      margin: 0 0 4px 0;
      display: flex;
      align-items: center;
      gap: 6px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}

    .card-concept p {{
      font-size: 9pt;
      line-height: 1.45;
      color: #1e293b;
      margin: 0;
    }}

    .section-title {{
      font-size: 10pt;
      font-weight: 800;
      color: #0a192f;
      text-transform: uppercase;
      margin: 12px 0 6px 0;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 6px;
    }}

    table.data-table {{
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      font-size: 8.5pt;
    }}

    table.data-table th {{
      background-color: #f1f5f9;
      color: #334155;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.05em;
      padding: 6px 10px;
      border: 1px solid #e2e8f0;
      text-align: left;
    }}

    table.data-table td {{
      padding: 6px 10px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
      vertical-align: middle;
    }}

    table.data-table tr:nth-child(even) {{
      background-color: #f8fafc;
    }}

    .en-text {{
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: #0a192f;
      font-size: 8.5pt;
    }}

    .pt-spoken {{
      color: #475569;
      font-size: 8pt;
      font-style: italic;
    }}

    .golden-tip-box {{
      background-color: #fffbeb;
      border: 2px solid #fde68a;
      border-radius: 12px;
      padding: 12px 16px;
      margin-top: 12px;
    }}

    .golden-tip-box h3 {{
      font-size: 10pt;
      font-weight: 800;
      color: #b45309;
      margin: 0 0 6px 0;
      display: flex;
      align-items: center;
      gap: 6px;
      text-transform: uppercase;
    }}

    .golden-tip-box p {{
      font-size: 9pt;
      line-height: 1.45;
      color: #78350f;
      margin: 0;
      font-style: italic;
    }}

    .exercise-item {{
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 6px;
    }}

    .exercise-prompt {{
      font-size: 8.5pt;
      font-weight: 700;
      color: #0a192f;
      margin-bottom: 4px;
    }}

    .writing-line {{
      height: 18px;
      border-bottom: 1px dashed #cbd5e1;
      width: 100%;
    }}
  </style>
</head>
<body>
{pages_html}
</body>
</html>
"""

LESSONS = [
    {
        "filename": "DTC_1_1_Horas_em_Ingles.pdf",
        "title": "Dates & Times • 1.1 HORAS",
        "tag": "MÓDULO 02 • AULA 01",
        "heading": "Como Falar e Entender as Horas em Inglês",
        "subtitle": "A ordem direta (horas + minutos) e os 4 quadrantes sonoros do relógio nativo.",
        "pages": [
            """
            <div class="page">
              <div class="running-header">
                <span class="brand">Agora<span>EuFalo</span> • Dates & Times</span>
                <span class="pill">Masterclass Didática</span>
              </div>
              <div class="page-content">
                <div class="lesson-header">
                  <div class="lesson-tag">MÓDULO 02 • AULA 01</div>
                  <h1 class="lesson-title">Como Falar e Entender as Horas</h1>
                  <p class="lesson-subtitle">Ordem direta (fácil de falar) vs 4 quadrantes (essencial para entender o gringo).</p>
                </div>

                <div class="card card-concept">
                  <h2>🎯 O Sentimento da Estrutura:</h2>
                  <p>Para falar, você pode adotar a ordem direta e direta: <b>9:30 = nine thirty</b>. Mas no mundo real, você é <b>100% obrigado a entender</b> quando o nativo falar <i>a quarter to five</i> ou <i>twenty past eight</i>. Treine a melodia sonoro sem fazer contas mentais!</p>
                </div>

                <div class="section-title">⏰ 1. A Matriz dos 4 Quadrantes do Relógio:</div>
                <table class="data-table">
                  <thead>
                    <tr>
                      <th style="width: 25%;">Situação</th>
                      <th style="width: 35%;">Como o Nativo Fala</th>
                      <th style="width: 40%;">Português Falado Brasileiro</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Hora Cheia</td>
                      <td class="en-text">10:00 ➔ ten o'clock</td>
                      <td class="pt-spoken">Dez horas em ponto (o'clock só na hora cheia)</td>
                    </tr>
                    <tr>
                      <td>0 a 30 min (Past)</td>
                      <td class="en-text">5:10 ➔ ten past five</td>
                      <td class="pt-spoken">Dez passadas das cinco</td>
                    </tr>
                    <tr>
                      <td>15 minutos (Quarter)</td>
                      <td class="en-text">4:15 ➔ a quarter past four</td>
                      <td class="pt-spoken">Quatro e quinze (um quarto de hora)</td>
                    </tr>
                    <tr>
                      <td>30 minutos (Half)</td>
                      <td class="en-text">3:30 ➔ half past three</td>
                      <td class="pt-spoken">Três e meia</td>
                    </tr>
                    <tr>
                      <td>31 a 59 min (To)</td>
                      <td class="en-text">8:40 ➔ twenty to nine</td>
                      <td class="pt-spoken">Vinte pras nove</td>
                    </tr>
                    <tr>
                      <td>15 min restantes</td>
                      <td class="en-text">9:45 ➔ a quarter to ten</td>
                      <td class="pt-spoken">Quinze pras dez</td>
                    </tr>
                  </tbody>
                </table>

                <div class="golden-tip-box">
                  <h3>💡 A Sacada de Ouro do Professor Leo:</h3>
                  <p>"Você não é obrigado a falar no formato complexo ('a quarter to' ou 'twenty past'), mas é 100% OBRIGADO a entender quando os outros falam! Para falar, adote a ordem direta (9:30 = nine thirty) e pronto."</p>
                </div>
              </div>
              <div class="running-footer">
                <span>© AgoraEuFalo • Professor Leonardo Leite</span>
                <span>Página 1 de 2</span>
              </div>
            </div>

            <div class="page">
              <div class="running-header">
                <span class="brand">Agora<span>EuFalo</span> • Dates & Times</span>
                <span class="pill">Workbook de Treino</span>
              </div>
              <div class="page-content">
                <div class="section-title">✍️ 2. Treino Prático de Fixação (Responda por Extenso):</div>

                <div class="exercise-item">
                  <div class="exercise-prompt">1. Escreva 6:15 no formato "Quarter":</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">2. Escreva 7:30 no formato "Half":</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">3. Escreva 8:50 no formato "To next hour":</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">4. Escreva 1:45 no formato "Quarter to":</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">5. Escreva 11:00 no formato de hora exata:</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">6. Escreva 4:20 no formato "Past":</div>
                  <div class="writing-line"></div>
                </div>

                <div class="card" style="margin-top: 15px; background-color: #f1f5f9;">
                  <p style="font-size: 8pt; color: #475569; margin: 0;"><b>Instrução de Estudo:</b> Fale cada resposta em voz alta 3 vezes com ritmo contínuo. Não faça pausas picadas entre os blocos sonoros.</p>
                </div>
              </div>
              <div class="running-footer">
                <span>© AgoraEuFalo • Professor Leonardo Leite</span>
                <span>Página 2 de 2</span>
              </div>
            </div>
            """
        ]
    },
    {
        "filename": "DTC_1_2_AM_ou_PM_Quando_Usar.pdf",
        "title": "Dates & Times • 1.2 AM ou PM?",
        "tag": "MÓDULO 02 • AULA 02",
        "heading": "AM ou PM? O Sistema de 12 Horas em Inglês",
        "subtitle": "Por que não usamos 18h na fala comum e como dominar Noon & Midnight.",
        "pages": [
            """
            <div class="page">
              <div class="running-header">
                <span class="brand">Agora<span>EuFalo</span> • Dates & Times</span>
                <span class="pill">Masterclass Didática</span>
              </div>
              <div class="page-content">
                <div class="lesson-header">
                  <div class="lesson-tag">MÓDULO 02 • AULA 02</div>
                  <h1 class="lesson-title">AM ou PM? Quando Usar?</h1>
                  <p class="lesson-subtitle">Eliminando a confusão do relógio de 24 horas na conversação real.</p>
                </div>

                <div class="card card-concept">
                  <h2>🎯 O Sentimento da Estrutura:</h2>
                  <p>No Brasil estamos acostumados a falar 16:00 ou 22:00. No inglês do dia a dia, <b>ninguém usa formato militar de 24h</b>. O relógio reinicia a cada 12 horas: AM (Antes do Meio-Dia) e PM (Passado do Meio-Dia).</p>
                </div>

                <div class="section-title">☀️🌙 1. A Tabela de Transição AM / PM:</div>
                <table class="data-table">
                  <thead>
                    <tr>
                      <th style="width: 25%;">Horário</th>
                      <th style="width: 35%;">Como Dizer em Inglês</th>
                      <th style="width: 40%;">Significado Prático</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>07:00 da manhã</td>
                      <td class="en-text">7:00 AM (seven AM)</td>
                      <td class="pt-spoken">7 da manhã</td>
                    </tr>
                    <tr>
                      <td>12:00 do dia</td>
                      <td class="en-text">12:00 PM ➔ NOON / MIDDAY</td>
                      <td class="pt-spoken">Meio-dia exato</td>
                    </tr>
                    <tr>
                      <td>16:00 da tarde</td>
                      <td class="en-text">4:00 PM (four PM)</td>
                      <td class="pt-spoken">4 da tarde (nunca '16 hours')</td>
                    </tr>
                    <tr>
                      <td>23:00 da noite</td>
                      <td class="en-text">11:00 PM (eleven PM)</td>
                      <td class="pt-spoken">11 da noite (nunca '23 hours')</td>
                    </tr>
                    <tr>
                      <td>00:00 da noite</td>
                      <td class="en-text">12:00 AM ➔ MIDNIGHT</td>
                      <td class="pt-spoken">Meia-noite exata</td>
                    </tr>
                  </tbody>
                </table>

                <div class="golden-tip-box">
                  <h3>💡 A Sacada de Ouro do Professor Leo:</h3>
                  <p>"Para não errar nunca mais: pense no AM como Antes do Meio-dia e no PM como Passado do Meio-dia. Em inglês não se usa relógio de 24 horas (ninguém fala 16h ou 22h na vida real); dizemos 4 PM e 10 PM."</p>
                </div>
              </div>
              <div class="running-footer">
                <span>© AgoraEuFalo • Professor Leonardo Leite</span>
                <span>Página 1 de 2</span>
              </div>
            </div>

            <div class="page">
              <div class="running-header">
                <span class="brand">Agora<span>EuFalo</span> • Dates & Times</span>
                <span class="pill">Workbook de Treino</span>
              </div>
              <div class="page-content">
                <div class="section-title">✍️ 2. Treino de Conversão e Fixação:</div>

                <div class="exercise-item">
                  <div class="exercise-prompt">1. Converta 15:30 para o formato falado em inglês:</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">2. Converta 20:15 para o formato falado em inglês:</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">3. Como o nativo fala 'almoço ao meio-dia'? (Use AT):</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">4. Converta 08:45 da manhã para o formato com AM:</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">5. Como o nativo fala 'chegamos à meia-noite'? (Use AT):</div>
                  <div class="writing-line"></div>
                </div>

                <div class="card" style="margin-top: 15px; background-color: #f1f5f9;">
                  <p style="font-size: 8pt; color: #475569; margin: 0;"><b>Regra de Ouro:</b> Use a preposição <b>AT</b> com horas e momentos exatos (<i>at 3 PM, at noon, at midnight</i>).</p>
                </div>
              </div>
              <div class="running-footer">
                <span>© AgoraEuFalo • Professor Leonardo Leite</span>
                <span>Página 2 de 2</span>
              </div>
            </div>
            """
        ]
    },
    {
        "filename": "DTC_2_1_Como_Dizer_os_Anos.pdf",
        "title": "Dates & Times • 2.1 Os Anos",
        "tag": "MÓDULO 03 • AULA 01",
        "heading": "Como Dizer e ENTENDER os Anos em Inglês",
        "subtitle": "A regra canônica dos 2 blocos de 2 dígitos e os anos com zero intermediário.",
        "pages": [
            """
            <div class="page">
              <div class="running-header">
                <span class="brand">Agora<span>EuFalo</span> • Dates & Times</span>
                <span class="pill">Masterclass Didática</span>
              </div>
              <div class="page-content">
                <div class="lesson-header">
                  <div class="lesson-tag">MÓDULO 03 • AULA 01</div>
                  <h1 class="lesson-title">Como Dizer e ENTENDER os Anos</h1>
                  <p class="lesson-subtitle">Dividindo em dois pares de dígitos para soar 100% natural.</p>
                </div>

                <div class="card card-concept">
                  <h2>🎯 O Sentimento da Estrutura:</h2>
                  <p>Em português falamos <i>mil novecentos e setenta e três</i>. Em inglês, <b>ninguém fala 'one thousand nine hundred'</b>. O cérebro do nativo corta o ano ao meio e pronuncia dois blocos sonoros: <b>19 + 73 (nineteen seventy-three)</b>.</p>
                </div>

                <div class="section-title">📅 1. Padrões de Anos em Inglês:</div>
                <table class="data-table">
                  <thead>
                    <tr>
                      <th style="width: 25%;">Categoria</th>
                      <th style="width: 35%;">Como o Nativo Fala</th>
                      <th style="width: 40%;">Bloco Sonoro</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Anos Regulares</td>
                      <td class="en-text">1973 ➔ nineteen seventy-three</td>
                      <td class="pt-spoken">19 + 73</td>
                    </tr>
                    <tr>
                      <td>Anos com Zero ("OH")</td>
                      <td class="en-text">1905 ➔ nineteen oh-five</td>
                      <td class="pt-spoken">19 + 05 (o zero vira OH)</td>
                    </tr>
                    <tr>
                      <td>Anos Centenares (00)</td>
                      <td class="en-text">1800 ➔ eighteen hundred</td>
                      <td class="pt-spoken">18 + hundred</td>
                    </tr>
                    <tr>
                      <td>Ano 2000 em Diante</td>
                      <td class="en-text">2026 ➔ twenty twenty-six</td>
                      <td class="pt-spoken">20 + 26 (ou two thousand twenty-six)</td>
                    </tr>
                    <tr>
                      <td>Décadas (Plural)</td>
                      <td class="en-text">the 80s ➔ the eighties</td>
                      <td class="pt-spoken">Os anos 80</td>
                    </tr>
                  </tbody>
                </table>

                <div class="golden-tip-box">
                  <h3>💡 A Sacada de Ouro do Professor Leo:</h3>
                  <p>"Nunca tente traduzir anos mentalmente como 'mil novecentos e setenta e três'. O gringo divide em dois blocos de dois dígitos: 19 e 73 (nineteen seventy-three). Repita em blocos de dois até a boca falar no reflexo!"</p>
                </div>
              </div>
              <div class="running-footer">
                <span>© AgoraEuFalo • Professor Leonardo Leite</span>
                <span>Página 1 de 2</span>
              </div>
            </div>

            <div class="page">
              <div class="running-header">
                <span class="brand">Agora<span>EuFalo</span> • Dates & Times</span>
                <span class="pill">Workbook de Treino</span>
              </div>
              <div class="page-content">
                <div class="section-title">✍️ 2. Treino de Fala e Escrita de Anos:</div>

                <div class="exercise-item">
                  <div class="exercise-prompt">1. Escreva 1984 como o nativo fala (2 blocos):</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">2. Escreva 1908 (com o som "OH"):</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">3. Escreva 1900 (ano centenar):</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">4. Escreva o ano do seu nascimento em inglês:</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">5. Escreva 'nos anos 90' em inglês (the 90s):</div>
                  <div class="writing-line"></div>
                </div>

                <div class="card" style="margin-top: 15px; background-color: #f1f5f9;">
                  <p style="font-size: 8pt; color: #475569; margin: 0;"><b>Preposição Canônica:</b> Use <b>IN</b> com anos soltos (<i>in 1973, in 2026, in the 80s</i>).</p>
                </div>
              </div>
              <div class="running-footer">
                <span>© AgoraEuFalo • Professor Leonardo Leite</span>
                <span>Página 2 de 2</span>
              </div>
            </div>
            """
        ]
    },
    {
        "filename": "DTC_3_1_Datas_Meses_Dias_Parte_1.pdf",
        "title": "Dates & Times • 3.1 Datas e Meses (Parte 1)",
        "tag": "MÓDULO 04 • AULA 01",
        "heading": "Datas, Meses e Dias em Inglês (Parte 1)",
        "subtitle": "A ordem mês + dia no inglês americano e os 4 formatos de números ordinais.",
        "pages": [
            """
            <div class="page">
              <div class="running-header">
                <span class="brand">Agora<span>EuFalo</span> • Dates & Times</span>
                <span class="pill">Masterclass Didática</span>
              </div>
              <div class="page-content">
                <div class="lesson-header">
                  <div class="lesson-tag">MÓDULO 04 • AULA 01</div>
                  <h1 class="lesson-title">Datas, Meses e Dias (Parte 1)</h1>
                  <p class="lesson-subtitle">Ordem Mês + Dia e os sufixos ordinais: -st, -nd, -rd e -th.</p>
                </div>

                <div class="card card-concept">
                  <h2>🎯 O Sentimento da Estrutura:</h2>
                  <p>No inglês americano, o mês vem <b>antes do dia</b>, e o dia é sempre pronunciado como número ordinal (<i>primeiro, segundo, terceiro...</i>). Para datas com dia exato, a preposição obrigatória é <b>ON</b> (<i>on May 4th</i>).</p>
                </div>

                <div class="section-title">🗓️ 1. Os 4 Finais de Números Ordinais:</div>
                <table class="data-table">
                  <thead>
                    <tr>
                      <th style="width: 25%;">Terminação</th>
                      <th style="width: 35%;">Exemplo Falado</th>
                      <th style="width: 40%;">Como Pronunciar</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1º ➔ <b>-ST</b> (first)</td>
                      <td class="en-text">May 1st ➔ May first</td>
                      <td class="pt-spoken">Primeiro de maio</td>
                    </tr>
                    <tr>
                      <td>2º ➔ <b>-ND</b> (second)</td>
                      <td class="en-text">July 2nd ➔ July second</td>
                      <td class="pt-spoken">Dois de julho</td>
                    </tr>
                    <tr>
                      <td>3º ➔ <b>-RD</b> (third)</td>
                      <td class="en-text">Nov 3rd ➔ November third</td>
                      <td class="pt-spoken">Três de novembro</td>
                    </tr>
                    <tr>
                      <td>4º ao 31º ➔ <b>-TH</b></td>
                      <td class="en-text">Oct 12th ➔ October twelfth</td>
                      <td class="pt-spoken">Doze de outubro (som de TH soprado)</td>
                    </tr>
                  </tbody>
                </table>

                <div class="golden-tip-box">
                  <h3>💡 A Sacada de Ouro do Professor Leo:</h3>
                  <p>"Para fixar preposição de data: se tiver o dia exato no calendário, use sempre ON (on Monday, on May 4th). Se for o mês ou ano solto, use IN (in May, in 2026)."</p>
                </div>
              </div>
              <div class="running-footer">
                <span>© AgoraEuFalo • Professor Leonardo Leite</span>
                <span>Página 1 de 2</span>
              </div>
            </div>

            <div class="page">
              <div class="running-header">
                <span class="brand">Agora<span>EuFalo</span> • Dates & Times</span>
                <span class="pill">Workbook de Treino</span>
              </div>
              <div class="page-content">
                <div class="section-title">✍️ 2. Treino de Datas Completas:</div>

                <div class="exercise-item">
                  <div class="exercise-prompt">1. Escreva 4 de maio no padrão americano:</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">2. Escreva 1º de janeiro no padrão americano:</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">3. Escreva 25 de dezembro com preposição ON:</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">4. Escreva a data do seu aniversário completa:</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">5. Como dizer 'em julho' (mês solto, use IN):</div>
                  <div class="writing-line"></div>
                </div>

                <div class="card" style="margin-top: 15px; background-color: #f1f5f9;">
                  <p style="font-size: 8pt; color: #475569; margin: 0;"><b>Atenção aos números compostos:</b> 21st (twenty-first), 22nd (twenty-second), 23rd (twenty-third), 31st (thirty-first).</p>
                </div>
              </div>
              <div class="running-footer">
                <span>© AgoraEuFalo • Professor Leonardo Leite</span>
                <span>Página 2 de 2</span>
              </div>
            </div>
            """
        ]
    },
    {
        "filename": "DTC_3_2_Datas_Meses_Dias_Parte_2.pdf",
        "title": "Dates & Times • 3.2 Datas e Meses (Parte 2)",
        "tag": "MÓDULO 04 • AULA 02",
        "heading": "Datas, Meses e Dias em Inglês (Parte 2)",
        "subtitle": "Perguntas e respostas de datas, dias úteis vs fim de semana e ano bissexto.",
        "pages": [
            """
            <div class="page">
              <div class="running-header">
                <span class="brand">Agora<span>EuFalo</span> • Dates & Times</span>
                <span class="pill">Masterclass Didática</span>
              </div>
              <div class="page-content">
                <div class="lesson-header">
                  <div class="lesson-tag">MÓDULO 04 • AULA 02</div>
                  <h1 class="lesson-title">Datas, Meses e Dias (Parte 2)</h1>
                  <p class="lesson-subtitle">Estruturas automáticas de diálogo para marcar compromissos no dia a dia.</p>
                </div>

                <div class="card card-concept">
                  <h2>🎯 O Sentimento da Estrutura:</h2>
                  <p>Ao marcar reuniões ou voos, o nativo conecta o bloco de data e hora sem tropeços: <i>"See you on Thursday the 15th at four PM"</i>. Fale a frase como uma melodia contínua.</p>
                </div>

                <div class="section-title">💬 1. Perguntas & Respostas Frequentes:</div>
                <table class="data-table">
                  <thead>
                    <tr>
                      <th style="width: 35%;">Pergunta Comum</th>
                      <th style="width: 35%;">Resposta Natural</th>
                      <th style="width: 30%;">Português Falado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="en-text">When is your birthday?</td>
                      <td class="en-text">It's on July 1st.</td>
                      <td class="pt-spoken">É no dia 1º de julho.</td>
                    </tr>
                    <tr>
                      <td class="en-text">What's today's date?</td>
                      <td class="en-text">Today is March 15th.</td>
                      <td class="pt-spoken">Hoje é 15 de março.</td>
                    </tr>
                    <tr>
                      <td class="en-text">When does the flight leave?</td>
                      <td class="en-text">On Friday at 6:30 PM.</td>
                      <td class="pt-spoken">Na sexta às seis e meia.</td>
                    </tr>
                    <tr>
                      <td class="en-text">Is 2028 a leap year?</td>
                      <td class="en-text">Yes, February has 29 days.</td>
                      <td class="pt-spoken">Ano bissexto (leap year).</td>
                    </tr>
                  </tbody>
                </table>

                <div class="golden-tip-box">
                  <h3>💡 A Sacada de Ouro do Professor Leo:</h3>
                  <p>"Ao marcar compromissos em inglês, confirme sempre o bloco sonoro completo: 'See you on Thursday the 15th at four PM'. Fale a melodia inteira sem pausas picadas."</p>
                </div>
              </div>
              <div class="running-footer">
                <span>© AgoraEuFalo • Professor Leonardo Leite</span>
                <span>Página 1 de 2</span>
              </div>
            </div>

            <div class="page">
              <div class="running-header">
                <span class="brand">Agora<span>EuFalo</span> • Dates & Times</span>
                <span class="pill">Workbook de Treino</span>
              </div>
              <div class="page-content">
                <div class="section-title">✍️ 2. Treino de Diálogo e Ditado de Horários:</div>

                <div class="exercise-item">
                  <div class="exercise-prompt">1. Responda: 'When is your English class?' (Use ON + dia da semana):</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">2. Responda: 'What time do you usually wake up?' (Use AT):</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">3. Escreva: 'Te vejo no fim de semana' (on the weekend):</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">4. Escreva: 'A loja fecha às 9:30 da noite' (half past nine in the evening):</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">5. Escreva: 'O voo sai às vinte para a uma' (twenty to one):</div>
                  <div class="writing-line"></div>
                </div>

                <div class="card" style="margin-top: 15px; background-color: #f1f5f9;">
                  <p style="font-size: 8pt; color: #475569; margin: 0;"><b>Vocabulário Útil:</b> Weekdays (dias úteis de segunda a sexta), Weekend (fim de semana), Leap year (ano bissexto).</p>
                </div>
              </div>
              <div class="running-footer">
                <span>© AgoraEuFalo • Professor Leonardo Leite</span>
                <span>Página 2 de 2</span>
              </div>
            </div>
            """
        ]
    },
    {
        "filename": "DTC_3_3_Treino_Pratico_Magic_Story.pdf",
        "title": "Dates & Times • 3.3 Magic Story",
        "tag": "MÓDULO 04 • AULA 03",
        "heading": "Treino Prático • Magic Story de Datas & Horas",
        "subtitle": "A história de consolidação do Método Magic Stories para automatizar seu reflexo.",
        "pages": [
            """
            <div class="page">
              <div class="running-header">
                <span class="brand">Agora<span>EuFalo</span> • Dates & Times</span>
                <span class="pill">Magic Story de Fechamento</span>
              </div>
              <div class="page-content">
                <div class="lesson-header">
                  <div class="lesson-tag">MÓDULO 04 • AULA 03</div>
                  <h1 class="lesson-title">Magic Story de Datas & Horas</h1>
                  <p class="lesson-subtitle">Consolidação viva de horas, datas, anos e compromissos numa conversa real.</p>
                </div>

                <div class="card card-concept">
                  <h2>🎬 A Experiência Narrativa:</h2>
                  <p>Nesta aula final, você conecta tudo que estudou numa conversa viva entre dois amigos organizando uma viagem para Nova York e agendando reuniões. Ouça com extrema atenção aos blocos sonoros!</p>
                </div>

                <div class="section-title">🎧 1. Bloco Narrativo de Listen & Read:</div>
                <div class="card" style="background-color: #ffffff; border: 1.5px solid #d97706; padding: 12px 14px;">
                  <p style="font-size: 9pt; line-height: 1.6; color: #0a192f; margin: 0;">
                    <b>Liam:</b> "Hey Rodrigo! What's the plan for our trip to New York?"<br>
                    <b>Rodrigo:</b> "Our flight departs on <b>November 3rd at a quarter to eight in the morning</b>."<br>
                    <b>Liam:</b> "Great! And what about the meeting with our business partners?"<br>
                    <b>Rodrigo:</b> "It is scheduled for <b>Thursday, November 5th, exactly at half past two PM</b>."<br>
                    <b>Liam:</b> "Perfect. I was born in <b>1984</b>, and I haven't been to New York since <b>1999</b>!"<br>
                    <b>Rodrigo:</b> "Well, in <b>2026</b> everything is much faster. See you on Friday at noon!"
                  </p>
                </div>

                <div class="golden-tip-box">
                  <h3>💡 A Sacada de Ouro do Professor Leo:</h3>
                  <p>"A teoria te dá a chave, mas o reflexo só nasce no treino repetido. Não tente decorar regras: ouça a história e responda no bate-pronto até a fala sair sem pensar!"</p>
                </div>
              </div>
              <div class="running-footer">
                <span>© AgoraEuFalo • Professor Leonardo Leite</span>
                <span>Página 1 de 2</span>
              </div>
            </div>

            <div class="page">
              <div class="running-header">
                <span class="brand">Agora<span>EuFalo</span> • Dates & Times</span>
                <span class="pill">Workbook de Treino</span>
              </div>
              <div class="page-content">
                <div class="section-title">🗣️ 2. Listen & Answer • Perguntas de Reflexo (Sem Spoilers):</div>

                <div class="exercise-item">
                  <div class="exercise-prompt">1. When does their flight depart?</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">2. What time does the plane leave in the morning?</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">3. When is the business meeting scheduled?</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">4. What year was Liam born?</div>
                  <div class="writing-line"></div>
                </div>

                <div class="exercise-item">
                  <div class="exercise-prompt">5. When was the last time Liam was in New York?</div>
                  <div class="writing-line"></div>
                </div>

                <div class="card" style="margin-top: 15px; background-color: #f1f5f9;">
                  <p style="font-size: 8pt; color: #475569; margin: 0;"><b>Treino Canônico:</b> Não consulte respostas prontas. Ouça o áudio no Training Player e responda imediatamente com o inglês que você tem hoje!</p>
                </div>
              </div>
              <div class="running-footer">
                <span>© AgoraEuFalo • Professor Leonardo Leite</span>
                <span>Página 2 de 2</span>
              </div>
            </div>
            """
        ]
    }
]

for lesson in LESSONS:
    fname = lesson["filename"]
    pdf_path = os.path.join(OUTPUT_DIR, fname)
    html_content = HTML_TEMPLATE.format(
        title=lesson["title"],
        pages_html="".join(lesson["pages"])
    )
    
    tmp_html = f"/tmp/{fname}.html"
    with open(tmp_html, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    cmd = [
        CHROME_PATH,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        tmp_html
    ]
    
    subprocess.run(cmd, check=True)
    print(f"Generated PDF: {pdf_path}")

print("\nAll 6 Dates & Times PDFs successfully generated in Material-PDF/!")
