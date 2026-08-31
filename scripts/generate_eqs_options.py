#!/usr/bin/env python3
"""
AgoraEuFalo PDF Factory - Comparison Generator for EQS 1.2
Compiles two separate layout options:
- Option A: One-Pager (Theory + Practice combined on exactly 1 A4 page)
- Option B: Two-Pager Expanded (Theory + Practice separated, with expanded text, larger fonts, and notebook grids)
Then, converts their pages to PNG for user validation.
"""

import os, fitz
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.graphics.shapes import Drawing, Rect, Circle, Line
from reportlab.pdfgen import canvas

# Paleta Oficial AgoraEuFalo Prestige - Tema Foundation (Forest Green)
C_PRIMARY      = colors.HexColor("#064E3B") # Deep Forest Green
C_ACCENT       = colors.HexColor("#047857") # Emerald Green
C_NAVY_TEXT    = colors.HexColor("#0A192F") # Azul marinho profundo
C_TEXT_BODY    = colors.HexColor("#1E293B") # Corpo
C_SLATE_MUTED  = colors.HexColor("#64748B") # Cinza de apoio
C_BORDER_LINE  = colors.HexColor("#EAE5DC") # Borda sutil de tabelas

C_PASTEL_BG    = colors.HexColor("#FFFDF9") # Fundo de blocos didáticos
C_AMBER_BG     = colors.HexColor("#FEF3C7") # Fundo de Sacada de Ouro
C_AMBER_LINE   = colors.HexColor("#F59E0B") # Linha de destaque âmbar
C_AMBER_TEXT   = colors.HexColor("#78350F") # Texto âmbar escuro

# Vetores de suporte
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

# Master Canvas com Running Header & Footer
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
            
            # Running Head
            self.setFont("Helvetica-Bold", 7.5)
            self.setFillColor(C_SLATE_MUTED)
            self.drawString(15 * mm, 287 * mm, "AGORAEUFALO • ENGLISH QUICKSTART")
            self.drawRightString(195 * mm, 287 * mm, "MÓDULO 01 • AULA 1.2: VERBO TO BE")
            
            self.setStrokeColor(C_BORDER_LINE)
            self.setLineWidth(0.6)
            self.line(15 * mm, 284 * mm, 195 * mm, 284 * mm)
            
            # Footer
            self.line(15 * mm, 12 * mm, 195 * mm, 12 * mm)
            self.setFont("Helvetica", 8)
            self.drawString(15 * mm, 8 * mm, "(c) 2026 AgoraEuFalo • Professor Leonardo Leite — Ficha de Estudo Digital.")
            self.drawRightString(195 * mm, 8 * mm, f"Página {self._pageNumber} de {num_pages}")
            self.restoreState()
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

# =========================================================================
# GERADOR OPÇÃO A: ONE-PAGER (EXATAS 1 PÁGINA)
# =========================================================================
def build_option_a():
    pdf_path = "/Users/macbookpro/Desktop/agoraeufalo_site/Material-PDF/EQS_1_2_Option_A_One_Pager.pdf"
    doc = SimpleDocTemplate(pdf_path, pagesize=A4, leftMargin=15*mm, rightMargin=15*mm, topMargin=18*mm, bottomMargin=18*mm)
    story = []

    # Digital Header
    tag_p = Paragraph(f"<font color='#047857' size='8'><b>MÉTODO ENGLISH QUICKSTART • TRILHA FOUNDATION</b></font>", ParagraphStyle("TagPA", fontName="Helvetica-Bold", fontSize=8, leading=10))
    title_p = Paragraph(f"<font color='#0A192F' size='13'><b>AULA 1.2 • O REI DOS VERBOS \"TO BE\" (AFIRMATIVA)</b></font><br/><font color='#64748B' size='8'><i>Conecte o Sujeito para definir QUEM É e COMO ESTÁ o personagem.</i></font>", ParagraphStyle("TitlePA", fontName="Helvetica-Bold", fontSize=13, leading=15))
    header_table = Table([[tag_p, ""], [title_p, ""]], colWidths=[135 * mm, 45 * mm])
    header_table.setStyle(TableStyle([
        ("LINEBELOW", (0,1), (-1,1), 1.5, C_PRIMARY),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 2.5 * mm))

    # Coluna Esquerda (Teoria + Conjugação)
    col_left = []
    intro_txt = (
        "<font size='9' color='#1E293B'>"
        "<b>O Verbo To Be: SER ou ESTAR.</b> O verbo mais importante do inglês. Ele define "
        "identidade (SER) ou estado temporário/localização (ESTAR). "
        "Sempre que você o ouvir na história, o narrador está descrevendo a cena ou a pessoa."
        "</font>"
    )
    col_left.append(Paragraph(intro_txt, ParagraphStyle("IntroA", fontName="Helvetica", fontSize=9, leading=12)))
    col_left.append(Spacer(1, 2 * mm))

    # Tabela de conjugação compacta
    t_data = [
        [
            Paragraph("<b>Pronome</b>", ParagraphStyle("TH1", fontName="Helvetica-Bold", fontSize=7.5, textColor=colors.white)),
            Paragraph("<b>To Be</b>", ParagraphStyle("TH2", fontName="Helvetica-Bold", fontSize=7.5, textColor=colors.white)),
            Paragraph("<b>Contração</b>", ParagraphStyle("TH3", fontName="Helvetica-Bold", fontSize=7.5, textColor=colors.white)),
            Paragraph("<b>Significado Falado Real</b>", ParagraphStyle("TH4", fontName="Helvetica-Bold", fontSize=7.5, textColor=colors.white))
        ],
        [
            Paragraph("I", ParagraphStyle("TD", fontName="Helvetica", fontSize=7.5)),
            Paragraph("<b>AM</b>", ParagraphStyle("TD_B", fontName="Helvetica-Bold", fontSize=7.5, textColor=C_ACCENT)),
            Paragraph("<b>I'm</b>", ParagraphStyle("TD_C", fontName="Helvetica-Bold", fontSize=7.5, textColor=C_AMBER_TEXT)),
            Paragraph("Eu sou / Eu estou", ParagraphStyle("TD_T", fontName="Helvetica", fontSize=7.5, textColor=C_SLATE_MUTED))
        ],
        [
            Paragraph("He / She / It", ParagraphStyle("TD", fontName="Helvetica", fontSize=7.5)),
            Paragraph("<b>IS</b>", ParagraphStyle("TD_B", fontName="Helvetica-Bold", fontSize=7.5, textColor=C_ACCENT)),
            Paragraph("<b>He's/She's/It's</b>", ParagraphStyle("TD_C", fontName="Helvetica-Bold", fontSize=7.5, textColor=C_AMBER_TEXT)),
            Paragraph("Ele/Ela/Isso é ou está", ParagraphStyle("TD_T", fontName="Helvetica", fontSize=7.5, textColor=C_SLATE_MUTED))
        ],
        [
            Paragraph("You / We / They", ParagraphStyle("TD", fontName="Helvetica", fontSize=7.5)),
            Paragraph("<b>ARE</b>", ParagraphStyle("TD_B", fontName="Helvetica-Bold", fontSize=7.5, textColor=C_ACCENT)),
            Paragraph("<b>You're/We're/They're</b>", ParagraphStyle("TD_C", fontName="Helvetica-Bold", fontSize=7.5, textColor=C_AMBER_TEXT)),
            Paragraph("Você/Nós/Eles são/estão", ParagraphStyle("TD_T", fontName="Helvetica", fontSize=7.5, textColor=C_SLATE_MUTED))
        ]
    ]
    t_be = Table(t_data, colWidths=[20 * mm, 18 * mm, 32 * mm, 42 * mm])
    t_be.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), C_PRIMARY),
        ("ALIGN", (0,0), (-1,-1), "LEFT"),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("GRID", (0,0), (-1,-1), 0.5, C_BORDER_LINE),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, C_PASTEL_BG]),
        ("TOPPADDING", (0,0), (-1,-1), 3),
        ("BOTTOMPADDING", (0,0), (-1,-1), 3),
        ("LEFTPADDING", (0,0), (-1,-1), 4),
        ("RIGHTPADDING", (0,0), (-1,-1), 4),
    ]))
    col_left.append(t_be)
    col_left.append(Spacer(1, 2.5 * mm))

    contra_txt = (
        "<font size='8.5' color='#1E293B'>"
        "<b>A Importância das Contrações:</b> Nativos usam <i>'He's in the forest'</i> em vez de <i>'He is'</i>. "
        "Se o seu cérebro não capturar a contração de ouvido, você travará na Magic Story."
        "</font>"
    )
    col_left.append(Paragraph(contra_txt, ParagraphStyle("ContraA", fontName="Helvetica", fontSize=8.5, leading=12)))

    # Coluna Direita (Insights + Sacada)
    col_right = []
    col_right.append(Paragraph("<b>INSIGHTS DO PROF. LEO</b>", ParagraphStyle("VQTHA", fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=C_NAVY_TEXT, alignment=1)))
    col_right.append(Spacer(1, 2 * mm))
    
    t_ins1 = Table([[get_lightbulb_icon(), Paragraph("<font size='7.5' color='#1E293B'><b>Sem complicação:</b> <i>'I'm here'</i> (estou) e <i>'I'm a doctor'</i> (sou) funcionam igual.</font>", ParagraphStyle("VTP1A", fontName="Helvetica", fontSize=7.5, leading=10.5))]], colWidths=[5 * mm, 53 * mm])
    t_ins1.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0), ("BOTTOMPADDING", (0,0), (-1,-1), 2)]))
    col_right.append(t_ins1)

    t_ins2 = Table([[get_clock_icon(), Paragraph("<font size='7.5' color='#1E293B'><b>Sem ocultação:</b> No inglês o sujeito é obrigatório: <i>'É hora de ir'</i> = <b>'It's time to go'</b>.</font>", ParagraphStyle("VTP2A", fontName="Helvetica", fontSize=7.5, leading=10.5))]], colWidths=[5 * mm, 53 * mm])
    t_ins2.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0), ("BOTTOMPADDING", (0,0), (-1,-1), 2)]))
    col_right.append(t_ins2)
    col_right.append(Spacer(1, 3 * mm))

    golden_tip = (
        "<b>💡 SACADA DE OURO:</b><br/>"
        "<font size='7.5' color='#78350F'><i>\"Treine imitando a melodia das contrações no Player. A fala vem pela boca, não por regras decoradas no papel!\"</i></font>"
    )
    t_golden = Table([[Paragraph(golden_tip, ParagraphStyle("KHTxtA", fontName="Helvetica", fontSize=7.5, leading=11, textColor=C_AMBER_TEXT))]], colWidths=[58 * mm])
    t_golden.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), C_AMBER_BG),
        ("BOX", (0,0), (-1,-1), 0.8, C_AMBER_LINE),
        ("LEFTPADDING", (0,0), (-1,-1), 5),
        ("RIGHTPADDING", (0,0), (-1,-1), 5),
        ("TOPPADDING", (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ]))
    col_right.append(t_golden)

    main_layout = Table([[col_left, col_right]], colWidths=[118 * mm, 62 * mm])
    main_layout.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("RIGHTPADDING", (0,0), (0,0), 4),
        ("LEFTPADDING", (1,0), (1,0), 4),
        ("LINEBEFORE", (1,0), (1,0), 0.8, C_BORDER_LINE),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
    ]))
    story.append(main_layout)
    story.append(Spacer(1, 4 * mm))

    # Seção do Workbook na mesma página (Sem quebra!)
    ex_intro = Paragraph("<b>📝 PRÁTICA DE FIXAÇÃO: escreva a forma completa e a tradução falada real</b>", ParagraphStyle("ExIntroA", fontName="Helvetica-Bold", fontSize=8.5, leading=12, textColor=C_NAVY_TEXT))
    story.append(ex_intro)
    story.append(Spacer(1, 2 * mm))

    ex_data = [
        [
            Paragraph("<b>1. It's a strange noise.</b>", ParagraphStyle("ETDA", fontName="Helvetica", fontSize=8)),
            Paragraph("<font color='#64748B'>Forma completa: __________________ | Tradução: __________________</font>", ParagraphStyle("ETD_LA", fontName="Helvetica", fontSize=7.5))
        ],
        [
            Paragraph("<b>2. They're not home.</b>", ParagraphStyle("ETDA", fontName="Helvetica", fontSize=8)),
            Paragraph("<font color='#64748B'>Forma completa: __________________ | Tradução: __________________</font>", ParagraphStyle("ETD_LA", fontName="Helvetica", fontSize=7.5))
        ],
        [
            Paragraph("<b>3. We're late for the meeting.</b>", ParagraphStyle("ETDA", fontName="Helvetica", fontSize=8)),
            Paragraph("<font color='#64748B'>Forma completa: __________________ | Tradução: __________________</font>", ParagraphStyle("ETD_LA", fontName="Helvetica", fontSize=7.5))
        ]
    ]
    t_ex = Table(ex_data, colWidths=[55 * mm, 125 * mm])
    t_ex.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.5, C_BORDER_LINE),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING", (0,0), (-1,-1), 5),
        ("RIGHTPADDING", (0,0), (-1,-1), 5),
    ]))
    story.append(t_ex)

    doc.build(story, canvasmaker=MasterLuxuryCanvas)
    print("Option A (One-Pager) built successfully!")

# =========================================================================
# GERADOR OPÇÃO B: TWO-PAGER EXPANDIDO (EXATAS 2 PÁGINAS PREENCHIDAS)
# =========================================================================
def build_option_b():
    pdf_path = "/Users/macbookpro/Desktop/agoraeufalo_site/Material-PDF/EQS_1_2_Option_B_Two_Pager.pdf"
    doc = SimpleDocTemplate(pdf_path, pagesize=A4, leftMargin=15*mm, rightMargin=15*mm, topMargin=18*mm, bottomMargin=18*mm)
    story = []

    # ------------------ PÁGINA 1 ------------------
    tag_p = Paragraph(f"<font color='#047857' size='9.5'><b>MÉTODO ENGLISH QUICKSTART • TRILHA FOUNDATION</b></font>", ParagraphStyle("TagPB", fontName="Helvetica-Bold", fontSize=9.5, leading=12))
    title_p = Paragraph(f"<font color='#0A192F' size='15'><b>AULA 1.2 • O REI DOS VERBOS \"TO BE\" (AFIRMATIVA)</b></font><br/><font color='#64748B' size='9'><i>Conecte o Sujeito para definir QUEM É e COMO ESTÁ o personagem.</i></font>", ParagraphStyle("TitlePB", fontName="Helvetica-Bold", fontSize=15, leading=18))
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

    # Coluna Esquerda
    col_left = []
    intro_txt = (
        "<font size='11' color='#1E293B'>"
        "<b>O Verbo To Be: SER ou ESTAR.</b> O verbo mais importante do inglês. Ele define "
        "identidade (SER) ou estado temporário/localização (ESTAR). "
        "Sempre que você o ouvir na história, o narrador está descrevendo a cena ou a pessoa."
        "</font>"
    )
    col_left.append(Paragraph(intro_txt, ParagraphStyle("IntroB", fontName="Helvetica", fontSize=11, leading=15.5)))
    col_left.append(Spacer(1, 4 * mm))

    # Tabela com linhas maiores
    t_data = [
        [
            Paragraph("<b>Pronome</b>", ParagraphStyle("TH1B", fontName="Helvetica-Bold", fontSize=9.5, textColor=colors.white)),
            Paragraph("<b>To Be</b>", ParagraphStyle("TH2B", fontName="Helvetica-Bold", fontSize=9.5, textColor=colors.white)),
            Paragraph("<b>Contração</b>", ParagraphStyle("TH3B", fontName="Helvetica-Bold", fontSize=9.5, textColor=colors.white)),
            Paragraph("<b>Significado Falado Real</b>", ParagraphStyle("TH4B", fontName="Helvetica-Bold", fontSize=9.5, textColor=colors.white))
        ],
        [
            Paragraph("I", ParagraphStyle("TDB", fontName="Helvetica", fontSize=9.5)),
            Paragraph("<b>AM</b>", ParagraphStyle("TDB_B", fontName="Helvetica-Bold", fontSize=9.5, textColor=C_ACCENT)),
            Paragraph("<b>I'm</b>", ParagraphStyle("TDB_C", fontName="Helvetica-Bold", fontSize=9.5, textColor=C_AMBER_TEXT)),
            Paragraph("Eu sou / Eu estou", ParagraphStyle("TDB_T", fontName="Helvetica", fontSize=9.5, textColor=C_SLATE_MUTED))
        ],
        [
            Paragraph("He / She / It", ParagraphStyle("TDB", fontName="Helvetica", fontSize=9.5)),
            Paragraph("<b>IS</b>", ParagraphStyle("TDB_B", fontName="Helvetica-Bold", fontSize=9.5, textColor=C_ACCENT)),
            Paragraph("<b>He's/She's/It's</b>", ParagraphStyle("TDB_C", fontName="Helvetica-Bold", fontSize=9.5, textColor=C_AMBER_TEXT)),
            Paragraph("Ele/Ela/Isso é ou está", ParagraphStyle("TDB_T", fontName="Helvetica", fontSize=9.5, textColor=C_SLATE_MUTED))
        ],
        [
            Paragraph("You / We / They", ParagraphStyle("TDB", fontName="Helvetica", fontSize=9.5)),
            Paragraph("<b>ARE</b>", ParagraphStyle("TDB_B", fontName="Helvetica-Bold", fontSize=9.5, textColor=C_ACCENT)),
            Paragraph("<b>You're/We're/They're</b>", ParagraphStyle("TDB_C", fontName="Helvetica-Bold", fontSize=9.5, textColor=C_AMBER_TEXT)),
            Paragraph("Você/Nós/Eles são/estão", ParagraphStyle("TDB_T", fontName="Helvetica", fontSize=9.5, textColor=C_SLATE_MUTED))
        ]
    ]
    t_be = Table(t_data, colWidths=[20 * mm, 18 * mm, 34 * mm, 42 * mm])
    t_be.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), C_PRIMARY),
        ("ALIGN", (0,0), (-1,-1), "LEFT"),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("GRID", (0,0), (-1,-1), 0.5, C_BORDER_LINE),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, C_PASTEL_BG]),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
    ]))
    col_left.append(t_be)
    col_left.append(Spacer(1, 4 * mm))

    # Exemplos Extras de preenchimento (Nova adição para matar espaço)
    ex_list = (
        "<b>Exemplos de Aplicação Real:</b><br/>"
        "• <b>I'm at home.</b> (Eu estou em casa. - Estado/Local)<br/>"
        "• <b>She's a designer.</b> (Ela é designer. - Identidade)<br/>"
        "• <b>They're ready.</b> (Eles estão prontos. - Estado)"
    )
    col_left.append(Paragraph(ex_list, ParagraphStyle("ExList", fontName="Helvetica", fontSize=9.5, leading=14)))

    # Coluna Direita
    col_right = []
    col_right.append(Paragraph("<b>INSIGHTS DO PROF. LEO</b>", ParagraphStyle("VQTHB", fontName="Helvetica-Bold", fontSize=9, leading=11, textColor=C_NAVY_TEXT, alignment=1)))
    col_right.append(Spacer(1, 3 * mm))
    
    t_ins1 = Table([[get_lightbulb_icon(), Paragraph("<font size='8.5' color='#1E293B'><b>Mesma Forma:</b> O inglês simplifica. <i>'I'm here'</i> (estou) e <i>'I'm a lawyer'</i> (sou) usam a mesma conjugação.</font>", ParagraphStyle("VTP1B", fontName="Helvetica", fontSize=8.5, leading=12.5))]], colWidths=[6 * mm, 52 * mm])
    t_ins1.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0), ("BOTTOMPADDING", (0,0), (-1,-1), 4)]))
    col_right.append(t_ins1)

    t_ins2 = Table([[get_clock_icon(), Paragraph("<font size='8.5' color='#1E293B'><b>O 'It's' Curinga:</b> Lembre-se, inglês não tem sujeito oculto. <i>'É um dia bonito'</i> = <b>'It's a beautiful day'</b>.</font>", ParagraphStyle("VTP2B", fontName="Helvetica", fontSize=8.5, leading=12.5))]], colWidths=[6 * mm, 52 * mm])
    t_ins2.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0), ("BOTTOMPADDING", (0,0), (-1,-1), 4)]))
    col_right.append(t_ins2)
    col_right.append(Spacer(1, 4 * mm))

    golden_tip = (
        "<b>💡 SACADA DE OURO DO LEO:</b><br/>"
        "<font size='8.5' color='#78350F'><i>\"Não gaste energia decorando tabelas! Vá para o Training Player, ouça as frases e repita imitando a melodia das contrações. A fala vem pela boca, não por regras de papel!\"</i></font>"
    )
    t_golden = Table([[Paragraph(golden_tip, ParagraphStyle("KHTxtB", fontName="Helvetica", fontSize=8.5, leading=12.5, textColor=C_AMBER_TEXT))]], colWidths=[58 * mm])
    t_golden.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), C_AMBER_BG),
        ("BOX", (0,0), (-1,-1), 1.2, C_AMBER_LINE),
        ("LEFTPADDING", (0,0), (-1,-1), 7),
        ("RIGHTPADDING", (0,0), (-1,-1), 7),
        ("TOPPADDING", (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
    ]))
    col_right.append(t_golden)

    main_layout = Table([[col_left, col_right]], colWidths=[118 * mm, 62 * mm])
    main_layout.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("RIGHTPADDING", (0,0), (0,0), 6),
        ("LEFTPADDING", (1,0), (1,0), 6),
        ("LINEBEFORE", (1,0), (1,0), 0.8, C_BORDER_LINE),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
    ]))
    story.append(main_layout)

    # ------------------ PÁGINA 2 ------------------
    story.append(PageBreak())
    
    wb_tag = Paragraph(f"<font color='#047857' size='9.5'><b>ENGLISH QUICKSTART • WORKBOOK DE PRÁTICA</b></font>", ParagraphStyle("WTagPB", fontName="Helvetica-Bold", fontSize=9.5, leading=12))
    wb_title = Paragraph(f"<font color='#0A192F' size='15'><b>AULA 1.2 • PRÁTICA DE REFLEXO E TRADUÇÃO REAL</b></font><br/><font color='#64748B' size='9'><i>Responda as questões de contexto para testar seu reflexo imediato.</i></font>", ParagraphStyle("WTitlePB", fontName="Helvetica-Bold", fontSize=15, leading=18))
    wb_header_table = Table([[wb_tag, ""], [wb_title, ""]], colWidths=[135 * mm, 45 * mm])
    wb_header_table.setStyle(TableStyle([
        ("LINEBELOW", (0,1), (-1,1), 1.5, C_PRIMARY),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ]))
    story.append(wb_header_table)
    story.append(Spacer(1, 4 * mm))

    # Tabela de Exercícios com espaçamento expandido
    ex_intro = (
        "<font size='10' color='#1E293B'>"
        "<b>Desafio de Reconhecimento de Contrações:</b> Escreva a forma completa de cada frase "
        "e seu significado falado real."
        "</font>"
    )
    story.append(Paragraph(ex_intro, ParagraphStyle("ExIntroB", fontName="Helvetica", fontSize=10, leading=14)))
    story.append(Spacer(1, 3 * mm))

    ex_data = [
        [
            Paragraph("<b>Frase Contraída</b>", ParagraphStyle("ETH1B", fontName="Helvetica-Bold", fontSize=9)),
            Paragraph("<b>Escreva a Forma Completa e a Tradução Falada Real</b>", ParagraphStyle("ETH2B", fontName="Helvetica-Bold", fontSize=9))
        ],
        [
            Paragraph("<b>1. It's a strange noise.</b>", ParagraphStyle("ETDB", fontName="Helvetica", fontSize=9.5)),
            Paragraph("<font color='#64748B'>Forma completa: _____________________<br/>Tradução: ___________________________</font>", ParagraphStyle("ETD_LB", fontName="Helvetica", fontSize=9))
        ],
        [
            Paragraph("<b>2. They're not home.</b>", ParagraphStyle("ETDB", fontName="Helvetica", fontSize=9.5)),
            Paragraph("<font color='#64748B'>Forma completa: _____________________<br/>Tradução: ___________________________</font>", ParagraphStyle("ETD_LB", fontName="Helvetica", fontSize=9))
        ],
        [
            Paragraph("<b>3. We're late for the meeting.</b>", ParagraphStyle("ETDB", fontName="Helvetica", fontSize=9.5)),
            Paragraph("<font color='#64748B'>Forma completa: _____________________<br/>Tradução: ___________________________</font>", ParagraphStyle("ETD_LB", fontName="Helvetica", fontSize=9))
        ],
        [
            Paragraph("<b>4. He's a good pilot.</b>", ParagraphStyle("ETDB", fontName="Helvetica", fontSize=9.5)),
            Paragraph("<font color='#64748B'>Forma completa: _____________________<br/>Tradução: ___________________________</font>", ParagraphStyle("ETD_LB", fontName="Helvetica", fontSize=9))
        ]
    ]
    t_ex = Table(ex_data, colWidths=[65 * mm, 115 * mm])
    t_ex.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#F8FAFC")),
        ("ALIGN", (0,0), (-1,-1), "LEFT"),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("GRID", (0,0), (-1,-1), 0.8, C_BORDER_LINE),
        ("TOPPADDING", (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ]))
    story.append(t_ex)
    story.append(Spacer(1, 4 * mm))

    # Box de Anotações do Estudante ampliado (Preenchimento de restinho de página)
    notes_box = (
        "<b>📝 CADERNO DE ANOTAÇÕES DE ESCUTA (SOUND PATTERNS):</b><br/>"
        "<font size='9' color='#64748B'>Registre aqui o que ouviu de conexões sonoras no vídeo de apoio.<br/>"
        "• ____________________________________________________________________________________<br/>"
        "• ____________________________________________________________________________________<br/>"
        "• ____________________________________________________________________________________<br/>"
        "• ____________________________________________________________________________________</font>"
    )
    t_notes = Table([[Paragraph(notes_box, ParagraphStyle("NotesTxtB", fontName="Helvetica", fontSize=9.5, leading=14.5))]], colWidths=[180 * mm])
    t_notes.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#FAF8F5")),
        ("BOX", (0,0), (-1,-1), 0.8, C_BORDER_LINE),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
    ]))
    story.append(t_notes)

    doc.build(story, canvasmaker=MasterLuxuryCanvas)
    print("Option B (Two-Pager Expanded) built successfully!")

# =========================================================================
# PROGRAMA PRINCIPAL: COMPILA E RENDERIZA EM PNG
# =========================================================================
if __name__ == "__main__":
    # 1. Compila os PDFs
    build_option_a()
    build_option_b()

    # 2. Converte em Imagens PNG na pasta de Artefatos
    out_dir = "/Users/macbookpro/.gemini/antigravity/brain/a4b916ca-1ea8-4168-ad1a-721fbe772a0c"
    
    # Renderiza Opção A (One-Pager, 1 página)
    doc_a = fitz.open("/Users/macbookpro/Desktop/agoraeufalo_site/Material-PDF/EQS_1_2_Option_A_One_Pager.pdf")
    pix_a = doc_a[0].get_pixmap(dpi=150)
    pix_a.save(f"{out_dir}/option_a_page1.png")
    print("Rendered Option A Page 1 to PNG.")

    # Renderiza Opção B (Two-Pager, 2 páginas)
    doc_b = fitz.open("/Users/macbookpro/Desktop/agoraeufalo_site/Material-PDF/EQS_1_2_Option_B_Two_Pager.pdf")
    pix_b1 = doc_b[0].get_pixmap(dpi=150)
    pix_b1.save(f"{out_dir}/option_b_page1.png")
    pix_b2 = doc_b[1].get_pixmap(dpi=150)
    pix_b2.save(f"{out_dir}/option_b_page2.png")
    print("Rendered Option B Page 1 & 2 to PNG.")
