#!/usr/bin/env python3
"""
AgoraEuFalo Editorial Prestige Engine - Digital Flow Layout (EQS 1.2)
Generates a dense, highly professional 2-page digital PDF for validation.
- No waste of paper or screen space.
- Page 1: Digital Header Banner + Explanations + Bicolour Table + Golden Tip.
- Page 2: Practical Workbook (Drills & Context Questions).
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.graphics.shapes import Drawing, Rect, Circle, Line
from reportlab.pdfgen import canvas

# Paleta Oficial AgoraEuFalo Prestige - Tema Foundation (Forest Green)
C_PRIMARY      = colors.HexColor("#064E3B") # Deep Forest Green
C_ACCENT       = colors.HexColor("#047857") # Emerald Green
C_NAVY_TEXT    = colors.HexColor("#0A192F") # Azul marinho profundo para títulos
C_TEXT_BODY    = colors.HexColor("#1E293B") # Cinza escuro para corpo
C_SLATE_MUTED  = colors.HexColor("#64748B") # Cinza de apoio
C_BORDER_LINE  = colors.HexColor("#EAE5DC") # Borda sutil de tabelas

C_PASTEL_BG    = colors.HexColor("#FFFDF9") # Fundo de blocos didáticos
C_AMBER_BG     = colors.HexColor("#FEF3C7") # Fundo de Sacada de Ouro
C_AMBER_LINE   = colors.HexColor("#F59E0B") # Linha de destaque âmbar
C_AMBER_TEXT   = colors.HexColor("#78350F") # Texto âmbar escuro

def get_lightbulb_icon():
    d = Drawing(14, 14)
    d.add(Circle(7, 8, 4.5, fillColor=colors.HexColor("#FEF08A"), strokeColor=colors.HexColor("#CA8A04"), strokeWidth=0.8))
    d.add(Rect(5.5, 2, 3, 2, fillColor=colors.HexColor("#CA8A04"), strokeColor=None))
    return d

def get_clock_icon():
    d = Drawing(14, 14)
    d.add(Circle(7, 7, 5.5, fillColor=colors.HexColor("#F1F5F9"), strokeColor=colors.HexColor("#475569"), strokeWidth=0.8))
    d.add(Line(7, 7, 7, 10, strokeColor=colors.HexColor("#0F172A"), strokeWidth=1))
    d.add(Line(7, 7, 9.5, 7, strokeColor=colors.HexColor("#0F172A"), strokeWidth=1))
    return d

class MasterLuxuryCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(MasterLuxuryCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.saveState()
            
            # Running Head (Cabeçalho da página interna)
            self.setFont("Helvetica-Bold", 7.5)
            self.setFillColor(C_SLATE_MUTED)
            self.drawString(15 * mm, 287 * mm, "AGORAEUFALO • ENGLISH QUICKSTART")
            self.drawRightString(195 * mm, 287 * mm, "MÓDULO 01 • AULA 1.2: VERBO TO BE")
            
            self.setStrokeColor(C_BORDER_LINE)
            self.setLineWidth(0.6)
            self.line(15 * mm, 284 * mm, 195 * mm, 284 * mm)
            
            # Rodapé Oficial na Base
            self.line(15 * mm, 12 * mm, 195 * mm, 12 * mm)
            self.setFont("Helvetica", 8)
            self.drawString(15 * mm, 8 * mm, "(c) 2026 AgoraEuFalo • Professor Leonardo Leite — Ficha Oficial de Estudo Digital.")
            self.drawRightString(195 * mm, 8 * mm, f"Página {self._pageNumber} de {num_pages}")
            self.restoreState()
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

def generate_sample_pdf():
    pdf_path = "/Users/macbookpro/Desktop/agoraeufalo_site/Material-PDF/EQS_1_2_O_Rei_dos_Verbos_To_Be_Sample.pdf"
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
    
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm
    )

    story = []

    # =========================================================================
    # PÁGINA 1: CABEÇALHO DIGITAL + EXPLICATIVOS + TABELAS (Aulas 1.2)
    # =========================================================================
    
    # 1. Header Banner Digital no topo da Página 1
    tag_p = Paragraph(f"<font color='#047857' size='9'><b>MÉTODO ENGLISH QUICKSTART • TRILHA FOUNDATION</b></font>", ParagraphStyle("TagP", fontName="Helvetica-Bold", fontSize=9, leading=12))
    title_p = Paragraph(f"<font color='#0A192F' size='14'><b>AULA 1.2 • O REI DOS VERBOS \"TO BE\" (AFIRMATIVA)</b></font><br/><font color='#64748B' size='8.5'><i>Conecte o Sujeito para definir QUEM É e COMO ESTÁ o personagem ou objeto da história.</i></font>", ParagraphStyle("TitleP", fontName="Helvetica-Bold", fontSize=14, leading=17))
    header_table = Table([[tag_p, ""], [title_p, ""]], colWidths=[135 * mm, 45 * mm])
    header_table.setStyle(TableStyle([
        ("LINEBELOW", (0,1), (-1,1), 1.5, C_PRIMARY),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 4 * mm))

    # Conteúdo Principal da Página 1 (Tabela + Textos)
    col_left_flowables = []
    
    intro_txt = (
        "<font size='10' color='#1E293B'>"
        "<b>Por que o \"To Be\" é o Rei dos Verbos?</b><br/>"
        "O verbo To Be significa <b>SER</b> (identidade permanente) ou <b>ESTAR</b> (estado temporário). "
        "Ele conecta o sujeito ao seu estado ou identidade. Quando você o escuta na história, "
        "o narrador está pintando o cenário ou descrevendo o personagem."
        "</font>"
    )
    col_left_flowables.append(Paragraph(intro_txt, ParagraphStyle("Intro", fontName="Helvetica", fontSize=10, leading=14.5)))
    col_left_flowables.append(Spacer(1, 3.5 * mm))

    # Tabela Bicolor de Conjugação
    t_data = [
        [
            Paragraph("<b>Pronome</b>", ParagraphStyle("TH1", fontName="Helvetica-Bold", fontSize=8.2, textColor=colors.white)),
            Paragraph("<b>To Be</b>", ParagraphStyle("TH2", fontName="Helvetica-Bold", fontSize=8.2, textColor=colors.white)),
            Paragraph("<b>Contração</b>", ParagraphStyle("TH3", fontName="Helvetica-Bold", fontSize=8.2, textColor=colors.white)),
            Paragraph("<b>Significado Falado Real</b>", ParagraphStyle("TH4", fontName="Helvetica-Bold", fontSize=8.2, textColor=colors.white))
        ],
        [
            Paragraph("I", ParagraphStyle("TD", fontName="Helvetica", fontSize=8.2)),
            Paragraph("<b>AM</b>", ParagraphStyle("TD_B", fontName="Helvetica-Bold", fontSize=8.2, textColor=C_ACCENT)),
            Paragraph("<b>I'm</b>", ParagraphStyle("TD_C", fontName="Helvetica-Bold", fontSize=8.2, textColor=C_AMBER_TEXT)),
            Paragraph("Eu sou / Eu estou", ParagraphStyle("TD_T", fontName="Helvetica", fontSize=8.2, textColor=C_SLATE_MUTED))
        ],
        [
            Paragraph("He / She / It", ParagraphStyle("TD", fontName="Helvetica", fontSize=8.2)),
            Paragraph("<b>IS</b>", ParagraphStyle("TD_B", fontName="Helvetica-Bold", fontSize=8.2, textColor=C_ACCENT)),
            Paragraph("<b>He's / She's / It's</b>", ParagraphStyle("TD_C", fontName="Helvetica-Bold", fontSize=8.2, textColor=C_AMBER_TEXT)),
            Paragraph("Ele/Ela/Isso é ou está", ParagraphStyle("TD_T", fontName="Helvetica", fontSize=8.2, textColor=C_SLATE_MUTED))
        ],
        [
            Paragraph("You / We / They", ParagraphStyle("TD", fontName="Helvetica", fontSize=8.2)),
            Paragraph("<b>ARE</b>", ParagraphStyle("TD_B", fontName="Helvetica-Bold", fontSize=8.2, textColor=C_ACCENT)),
            Paragraph("<b>You're/We're/They're</b>", ParagraphStyle("TD_C", fontName="Helvetica-Bold", fontSize=8.2, textColor=C_AMBER_TEXT)),
            Paragraph("Você/Nós/Eles são ou estão", ParagraphStyle("TD_T", fontName="Helvetica", fontSize=8.2, textColor=C_SLATE_MUTED))
        ]
    ]

    t_be = Table(t_data, colWidths=[22 * mm, 20 * mm, 34 * mm, 42 * mm])
    t_be.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), C_PRIMARY),
        ("ALIGN", (0,0), (-1,-1), "LEFT"),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("GRID", (0,0), (-1,-1), 0.5, C_BORDER_LINE),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, C_PASTEL_BG]),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING", (0,0), (-1,-1), 5),
        ("RIGHTPADDING", (0,0), (-1,-1), 5),
    ]))
    col_left_flowables.append(t_be)
    col_left_flowables.append(Spacer(1, 3.5 * mm))

    contra_txt = (
        "<font size='9.2' color='#1E293B'>"
        "<b>A Melodia das Contrações na Fala Real:</b><br/>"
        "Os nativos contraem o To Be em 99% das vezes. Eles não pronunciam <i>'He is early'</i>, mas sim <b>'He's early'</b>. "
        "Treinar o ouvido para pescar essa fusão de som é vital para não travar nas Magic Stories."
        "</font>"
    )
    col_left_flowables.append(Paragraph(contra_txt, ParagraphStyle("Contra", fontName="Helvetica", fontSize=9.2, leading=13.5)))

    # Coluna da Direita (Insights & Sacada de Ouro)
    col_right_flowables = []
    col_right_flowables.append(Paragraph("<b>INSIGHTS DO PROF. LEO</b>", ParagraphStyle("VQTH", fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=C_NAVY_TEXT, alignment=1)))
    col_right_flowables.append(Spacer(1, 2.5 * mm))
    
    t_ins1 = Table([[
        get_lightbulb_icon(), 
        Paragraph("<font size='8' color='#1E293B'><b>Mesma Forma:</b> O inglês simplifica. <i>'I'm here'</i> (estou) e <i>'I'm a lawyer'</i> (sou) usam a mesma forma.</font>", ParagraphStyle("VTP1", fontName="Helvetica", fontSize=8, leading=11.5))
    ]], colWidths=[6 * mm, 52 * mm])
    t_ins1.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0), ("BOTTOMPADDING", (0,0), (-1,-1), 3)]))
    col_right_flowables.append(t_ins1)

    t_ins2 = Table([[
        get_clock_icon(), 
        Paragraph("<font size='8' color='#1E293B'><b>O 'It's' Obrigatório:</b> Como o sujeito nunca é oculto, <i>'É um barulho estranho'</i> vira <b>'It's a strange noise'</b>.</font>", ParagraphStyle("VTP2", fontName="Helvetica", fontSize=8, leading=11.5))
    ]], colWidths=[6 * mm, 52 * mm])
    t_ins2.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0), ("BOTTOMPADDING", (0,0), (-1,-1), 3)]))
    col_right_flowables.append(t_ins2)
    col_right_flowables.append(Spacer(1, 3.5 * mm))

    golden_tip = (
        "<b>💡 SACADA DE OURO DO LEO:</b><br/>"
        "<font size='8' color='#78350F'><i>\"Não decore tabelas! Vá para o Training Player, ouça as frases e repita imitando a melodia das contrações. A fala vem pela boca, não pelos olhos!\"</i></font>"
    )
    t_golden = Table([[Paragraph(golden_tip, ParagraphStyle("KHTxt", fontName="Helvetica", fontSize=8, leading=11.5, textColor=C_AMBER_TEXT))]], colWidths=[58 * mm])
    t_golden.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), C_AMBER_BG),
        ("BOX", (0,0), (-1,-1), 1, C_AMBER_LINE),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ]))
    col_right_flowables.append(t_golden)

    # Grid da Página 1
    main_layout = Table([[col_left_flowables, col_right_flowables]], colWidths=[118 * mm, 62 * mm])
    main_layout.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("RIGHTPADDING", (0,0), (0,0), 6),
        ("LEFTPADDING", (1,0), (1,0), 6),
        ("LINEBEFORE", (1,0), (1,0), 0.8, C_BORDER_LINE),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
    ]))
    story.append(main_layout)

    # =========================================================================
    # PÁGINA 2: WORKBOOK PRÁTICO (Focado em Exercícios de Contexto)
    # =========================================================================
    story.append(PageBreak())
    
    wb_tag = Paragraph(f"<font color='#047857' size='9'><b>ENGLISH QUICKSTART • WORKBOOK DE PRÁTICA</b></font>", ParagraphStyle("WTagP", fontName="Helvetica-Bold", fontSize=9, leading=12))
    wb_title = Paragraph(f"<font color='#0A192F' size='14'><b>AULA 1.2 • PRÁTICA DE REFLEXO E TRADUÇÃO REAL</b></font><br/><font color='#64748B' size='8.5'><i>Responda as questões de contexto para testar seu reflexo imediato.</i></font>", ParagraphStyle("WTitleP", fontName="Helvetica-Bold", fontSize=14, leading=17))
    wb_header_table = Table([[wb_tag, ""], [wb_title, ""]], colWidths=[135 * mm, 45 * mm])
    wb_header_table.setStyle(TableStyle([
        ("LINEBELOW", (0,1), (-1,1), 1.5, C_PRIMARY),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ]))
    story.append(wb_header_table)
    story.append(Spacer(1, 5 * mm))

    # Exercícios
    exercises_flow = []
    ex_intro = (
        "<font size='10' color='#1E293B'>"
        "<b>Desafio de Reconhecimento de Contrações:</b><br/>"
        "Com base nas contrações que estudamos, escreva ao lado a forma completa de cada frase "
        "e o seu significado em português falado real."
        "</font>"
    )
    exercises_flow.append(Paragraph(ex_intro, ParagraphStyle("ExIntro", fontName="Helvetica", fontSize=10, leading=14)))
    exercises_flow.append(Spacer(1, 4 * mm))

    # Tabela de Exercícios
    ex_data = [
        [
            Paragraph("<b>Frase Contraída</b>", ParagraphStyle("ETH1", fontName="Helvetica-Bold", fontSize=8.5)),
            Paragraph("<b>Escreva a Forma Completa e a Tradução Falada Real</b>", ParagraphStyle("ETH2", fontName="Helvetica-Bold", fontSize=8.5))
        ],
        [
            Paragraph("<b>1. It's a strange noise.</b>", ParagraphStyle("ETD", fontName="Helvetica", fontSize=9)),
            Paragraph("<font color='#64748B'>Forma completa: _____________________<br/>Tradução: ___________________________</font>", ParagraphStyle("ETD_L", fontName="Helvetica", fontSize=8.5))
        ],
        [
            Paragraph("<b>2. They're not home.</b>", ParagraphStyle("ETD", fontName="Helvetica", fontSize=9)),
            Paragraph("<font color='#64748B'>Forma completa: _____________________<br/>Tradução: ___________________________</font>", ParagraphStyle("ETD_L", fontName="Helvetica", fontSize=8.5))
        ],
        [
            Paragraph("<b>3. We're late for the meeting.</b>", ParagraphStyle("ETD", fontName="Helvetica", fontSize=9)),
            Paragraph("<font color='#64748B'>Forma completa: _____________________<br/>Tradução: ___________________________</font>", ParagraphStyle("ETD_L", fontName="Helvetica", fontSize=8.5))
        ],
        [
            Paragraph("<b>4. He's a good pilot.</b>", ParagraphStyle("ETD", fontName="Helvetica", fontSize=9)),
            Paragraph("<font color='#64748B'>Forma completa: _____________________<br/>Tradução: ___________________________</font>", ParagraphStyle("ETD_L", fontName="Helvetica", fontSize=8.5))
        ]
    ]

    t_ex = Table(ex_data, colWidths=[65 * mm, 115 * mm])
    t_ex.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#F8FAFC")),
        ("ALIGN", (0,0), (-1,-1), "LEFT"),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("GRID", (0,0), (-1,-1), 0.8, C_BORDER_LINE),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ]))
    exercises_flow.append(t_ex)
    exercises_flow.append(Spacer(1, 6 * mm))

    # Box de Anotações do Estudante
    notes_box = (
        "<b>📝 MINHAS ANOTAÇÕES DE ESCUTA (SOUND PATTERNS):</b><br/>"
        "<font size='8.5' color='#64748B'>Use este espaço para anotar as palavras em que você percebeu maior diferença "
        "entre a grafia e o som falado real pelo Professor Leo no vídeo de apoio.</font><br/><br/><br/><br/>"
    )
    t_notes = Table([[Paragraph(notes_box, ParagraphStyle("NotesTxt", fontName="Helvetica", fontSize=9, leading=13))]], colWidths=[180 * mm])
    t_notes.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#FAF8F5")),
        ("BOX", (0,0), (-1,-1), 0.8, C_BORDER_LINE),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
    ]))
    exercises_flow.append(t_notes)

    story.extend(exercises_flow)

    # Build PDF
    doc.build(story, canvasmaker=MasterLuxuryCanvas)
    print("New dense PDF generated successfully!")

if __name__ == "__main__":
    generate_sample_pdf()
