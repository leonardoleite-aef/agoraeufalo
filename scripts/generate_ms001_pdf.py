"""
AgoraEuFalo Editorial Prestige Engine - Livro Oficial de Treino MS001
100% Padrão Institucional AgoraEuFalo (Zero Resquícios de Textos do Template)
100% Visual de Alta Fidelidade (Capa Deep Navy, Content 2-Col, Workbook)
100% Preenchimento Vertical da Folha A4 com Tipografia Confortável para Alunos 40+
"""

import os, subprocess, pypdf
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.graphics.shapes import Drawing, Rect, Circle, Line, Polygon
from reportlab.pdfgen import canvas

# Paleta Oficial AgoraEuFalo Prestige
C_NAVY_BG      = colors.HexColor("#0D223F") # Deep Navy para a Capa
C_NAVY_WATER   = colors.HexColor("#1A3860") # Marca d'água 01
C_LINE_SUBTLE  = colors.HexColor("#1E3F6D") # Wireframes da capa
C_DOTS         = colors.HexColor("#1A3860") # Micro-pontos da capa

C_NAVY_TEXT    = colors.HexColor("#0A192F") # Azul marinho profundo de texto
C_BLUE_ACCENT  = colors.HexColor("#1A56DB") # Azul de destaque
C_BLUE_DARK    = colors.HexColor("#1E40AF") # Azul institucional
C_SLATE_MUTED  = colors.HexColor("#64748B") # Cinza de apoio
C_BORDER_LIGHT = colors.HexColor("#CBD5E1") # Borda de campos
C_BORDER_LINE  = colors.HexColor("#E2E8F0") # Linha separadora

C_PASTEL_BG    = colors.HexColor("#D1F4EB") # Balão Mint pastel
C_PASTEL_LINE  = colors.HexColor("#A7E8D7")
C_PASTEL_TEXT  = colors.HexColor("#065F46")

C_GREEN_TRANSL = colors.HexColor("#047857") # Tradução em Português Falado Real
C_AMBER_TEXT   = colors.HexColor("#78350F") # Chunks sonoros

# Ícones Vetoriais Feitos à Mão (Zero Emojis Quebrados)
def get_lightbulb_icon():
    d = Drawing(20, 20)
    d.add(Circle(10, 12, 6, fillColor=colors.HexColor("#FEF08A"), strokeColor=colors.HexColor("#CA8A04"), strokeWidth=1))
    d.add(Rect(8, 3, 4, 4, fillColor=colors.HexColor("#CA8A04"), strokeColor=None))
    d.add(Line(10, 19, 10, 21, strokeColor=colors.HexColor("#CA8A04"), strokeWidth=1.2))
    d.add(Line(3, 12, 1, 12, strokeColor=colors.HexColor("#CA8A04"), strokeWidth=1.2))
    d.add(Line(17, 12, 19, 12, strokeColor=colors.HexColor("#CA8A04"), strokeWidth=1.2))
    return d

def get_clock_icon():
    d = Drawing(20, 20)
    d.add(Circle(10, 10, 8, fillColor=colors.HexColor("#F1F5F9"), strokeColor=colors.HexColor("#475569"), strokeWidth=1.2))
    d.add(Line(10, 10, 10, 15, strokeColor=colors.HexColor("#0F172A"), strokeWidth=1.4))
    d.add(Line(10, 10, 14, 10, strokeColor=colors.HexColor("#0F172A"), strokeWidth=1.4))
    return d

def get_checkmark_icon():
    d = Drawing(20, 20)
    d.add(Circle(10, 10, 8, fillColor=colors.HexColor("#DCFCE7"), strokeColor=colors.HexColor("#16A34A"), strokeWidth=1.2))
    d.add(Line(6, 10, 9, 6.5, strokeColor=colors.HexColor("#15803D"), strokeWidth=1.8))
    d.add(Line(9, 6.5, 15, 13.5, strokeColor=colors.HexColor("#15803D"), strokeWidth=1.8))
    return d

def get_pencil_icon():
    d = Drawing(20, 20)
    d.add(Polygon([4, 13, 13, 4, 16, 7, 7, 16], fillColor=colors.HexColor("#CBD5E1"), strokeColor=colors.HexColor("#475569"), strokeWidth=1.2))
    d.add(Polygon([4, 13, 7, 16, 1, 18], fillColor=colors.HexColor("#0F172A"), strokeColor=None))
    return d

def get_notepad_icon():
    d = Drawing(20, 20)
    d.add(Rect(3, 1, 13, 17, fillColor=colors.HexColor("#FFFFFF"), strokeColor=colors.HexColor("#475569"), strokeWidth=1.2))
    d.add(Line(6, 14, 13, 14, strokeColor=colors.HexColor("#94A3B8"), strokeWidth=1))
    d.add(Line(6, 10, 13, 10, strokeColor=colors.HexColor("#94A3B8"), strokeWidth=1))
    d.add(Line(6, 6, 11, 6, strokeColor=colors.HexColor("#94A3B8"), strokeWidth=1))
    return d

def get_star_icon():
    d = Drawing(20, 20)
    points = [10,18, 12,12, 18,12, 13,9, 15,3, 10,7, 5,3, 7,9, 2,12, 8,12]
    d.add(Polygon(points, fillColor=colors.HexColor("#FEF08A"), strokeColor=colors.HexColor("#CA8A04"), strokeWidth=1))
    return d


def draw_cover_background(canvas_obj, doc_obj):
    """Capa Oficial Monumental: Deep Navy, 01 Watermark, Wireframes e Dot Matrix"""
    canvas_obj.saveState()
    canvas_obj.setFillColor(C_NAVY_BG)
    canvas_obj.rect(0, 0, 210 * mm, 297 * mm, fill=1, stroke=0)
    
    # Wireframe curves no topo
    canvas_obj.setStrokeColor(C_LINE_SUBTLE)
    canvas_obj.setLineWidth(1)
    
    path = canvas_obj.beginPath()
    path.moveTo(15 * mm, 280 * mm)
    path.lineTo(45 * mm, 270 * mm)
    path.lineTo(35 * mm, 240 * mm)
    path.lineTo(10 * mm, 250 * mm)
    path.close()
    canvas_obj.drawPath(path, stroke=1, fill=0)
    
    path2 = canvas_obj.beginPath()
    path2.moveTo(25 * mm, 285 * mm)
    path2.lineTo(60 * mm, 275 * mm)
    path2.lineTo(50 * mm, 235 * mm)
    path2.lineTo(15 * mm, 245 * mm)
    path2.close()
    canvas_obj.drawPath(path2, stroke=1, fill=0)

    # Círculos concêntricos na base esquerda
    canvas_obj.circle(20 * mm, 40 * mm, 25 * mm, stroke=1, fill=0)
    canvas_obj.circle(20 * mm, 40 * mm, 40 * mm, stroke=1, fill=0)
    canvas_obj.circle(20 * mm, 40 * mm, 55 * mm, stroke=1, fill=0)

    # Marca d'água monumental "01"
    canvas_obj.setFont("Helvetica-Bold", 145)
    canvas_obj.setFillColor(C_NAVY_WATER)
    canvas_obj.drawString(105 * mm, 175 * mm, "01")

    # Grid de micro-pontos (dot matrix)
    canvas_obj.setFillColor(C_DOTS)
    start_x = 160 * mm
    start_y = 100 * mm
    for row in range(8):
        for col in range(6):
            canvas_obj.circle(start_x + col * 4.5 * mm, start_y + row * 4.5 * mm, 0.6 * mm, fill=1, stroke=0)

    # Wireframe na base direita
    path3 = canvas_obj.beginPath()
    path3.moveTo(130 * mm, 30 * mm)
    path3.lineTo(170 * mm, 20 * mm)
    path3.lineTo(195 * mm, 50 * mm)
    path3.lineTo(165 * mm, 70 * mm)
    path3.close()
    canvas_obj.drawPath(path3, stroke=1, fill=0)

    canvas_obj.restoreState()


def draw_inner_page_decorations(canvas_obj, doc_obj):
    """Decorações vetoriais elegantes nas páginas internas"""
    canvas_obj.saveState()
    # Micro-pontos no canto direito (abaixo da linha do header)
    canvas_obj.setFillColor(colors.HexColor("#CBD5E1"))
    start_x = 175 * mm
    start_y = 260 * mm
    for row in range(5):
        for col in range(6):
            canvas_obj.circle(start_x + col * 3.5 * mm, start_y + row * 3.5 * mm, 0.5 * mm, fill=1, stroke=0)

    # Listras diagonais na base direita
    canvas_obj.setStrokeColor(colors.HexColor("#E2E8F0"))
    canvas_obj.setLineWidth(1.5)
    for i in range(8):
        canvas_obj.line(175 * mm + i * 4 * mm, 10 * mm, 195 * mm + i * 4 * mm, 30 * mm)
        
    canvas_obj.restoreState()


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
            if self._pageNumber > 1:
                self.saveState()
                # Cabeçalho Oficial no Topo (Running Head)
                self.setFont("Helvetica-Bold", 7.5)
                self.setFillColor(C_SLATE_MUTED)
                self.drawString(15 * mm, 287 * mm, "AGORAEUFALO • MAGIC STORIES LEGACY")
                self.drawRightString(195 * mm, 287 * mm, "MÓDULO MS001: GRAZIELLA")
                
                self.setStrokeColor(C_BORDER_LINE)
                self.setLineWidth(0.6)
                self.line(15 * mm, 284 * mm, 195 * mm, 284 * mm)
                
                # Rodapé Oficial na Base
                self.line(15 * mm, 12 * mm, 195 * mm, 12 * mm)
                self.setFont("Helvetica", 8)
                self.drawString(15 * mm, 8 * mm, "(c) 2026 AgoraEuFalo • Professor Leonardo Leite — Livro Oficial de Fluência Viva.")
                self.drawRightString(195 * mm, 8 * mm, f"Página {self._pageNumber} de {num_pages}")
                self.restoreState()
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)


# Cabeçalho Oficial das Páginas de Conteúdo (LR e VOC)
def make_activity_header_content(activity_code, activity_name, subtitle_context):
    tag_p = Paragraph(f"<font color='#1A56DB' size='9'><b>MÉTODO MAGIC STORIES • {activity_code.upper()}</b></font>", ParagraphStyle("TagP", fontName="Helvetica-Bold", fontSize=9, leading=12))
    title_p = Paragraph(f"<font color='#0D223F' size='14'><b>{activity_name.upper()}</b></font><br/><font color='#64748B' size='8.5'><i>{subtitle_context}</i></font>", ParagraphStyle("TitleP", fontName="Helvetica-Bold", fontSize=14, leading=17))
    t = Table([[tag_p, ""], [title_p, ""]], colWidths=[135 * mm, 45 * mm])
    t.setStyle(TableStyle([
        ("LINEBELOW", (0,1), (-1,1), 1.2, C_NAVY_TEXT),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ]))
    return t


# Cabeçalho Oficial das Páginas de Treino & Workbook (LA, LRT, LASK, PRO)
def make_activity_header_workbook(activity_code, activity_name, subtitle_context):
    title_p = Paragraph(
        f"<font color='#0D223F' size='13.5'><b>{activity_name.upper()}</b></font><br/>"
        f"<font color='#1A56DB' size='9'><b>MÓDULO MS001 • {activity_code.upper()}</b></font> — <font color='#64748B' size='8.5'><i>{subtitle_context}</i></font>",
        ParagraphStyle("WTitleP", fontName="Helvetica-Bold", fontSize=13.5, leading=16.5)
    )
    t = Table([[title_p, ""]], colWidths=[135 * mm, 45 * mm])
    t.setStyle(TableStyle([
        ("LINEBELOW", (0,0), (-1,0), 1.2, C_NAVY_TEXT),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ]))
    return t


# Box de Citação Monumental com Aspas 66 e 99
def make_prominent_quote_box(quote_text, author_name="PROFESSOR LEONARDO LEITE"):
    q_left = Paragraph("<font color='#0D223F' size='30'><b>“</b></font>", ParagraphStyle("Q66", fontName="Helvetica-Bold", fontSize=30, leading=22, alignment=1))
    q_text = Paragraph(
        f"<i>&quot;{quote_text}&quot;</i><br/>"
        f"<font color='#64748B' size='8'>— <b>{author_name.upper()}</b></font>",
        ParagraphStyle("QBodyTxt", fontName="Helvetica", fontSize=9.5, leading=14, alignment=1, textColor=C_NAVY_TEXT)
    )
    q_right = Paragraph("<font color='#0D223F' size='30'><b>”</b></font>", ParagraphStyle("Q99", fontName="Helvetica-Bold", fontSize=30, leading=22, alignment=1))
    
    t = Table([[q_left, q_text, q_right]], colWidths=[14 * mm, 152 * mm, 14 * mm])
    t.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ("BOX", (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ]))
    return t


# Box Guiado de Passos (Passo 1 & Passo 2)
def make_step_timeline_box(step1_title, step1_desc, step2_title, step2_desc, links_url=None):
    links_line = f"<br/>• <b>Acesso Direto no Player:</b> <font color='#1A56DB'><u>{links_url}</u></font>" if links_url else ""
    s1_h = Paragraph(f"<b>● PASSO 1 &nbsp; {step1_title.upper()}</b>", ParagraphStyle("S1H", fontName="Helvetica-Bold", fontSize=9.5, leading=13, textColor=C_NAVY_TEXT))
    s1_lines = Paragraph(f"{step1_desc}{links_line}", ParagraphStyle("S1L", fontName="Helvetica", fontSize=9, leading=14, textColor=C_NAVY_TEXT))
    
    s2_h = Paragraph(f"<b>● PASSO 2 &nbsp; {step2_title.upper()}</b>", ParagraphStyle("S2H", fontName="Helvetica-Bold", fontSize=9.5, leading=13, textColor=C_NAVY_TEXT))
    s2_lines = Paragraph(f"{step2_desc}<br/>• <b>Tira-Dúvidas Direto com o Professor Leo:</b> <b>selexenglish@gmail.com</b>", ParagraphStyle("S2L", fontName="Helvetica", fontSize=9, leading=14, textColor=C_NAVY_TEXT))

    t = Table([
        [s1_h, get_notepad_icon()],
        [s1_lines, ""],
        [Spacer(1, 3 * mm), ""],
        [s2_h, get_star_icon()],
        [s2_lines, ""]
    ], colWidths=[155 * mm, 25 * mm])
    t.setStyle(TableStyle([
        ("SPAN", (0,1), (1,1)),
        ("SPAN", (0,4), (1,4)),
        ("LINEBEFORE", (0,0), (0,-1), 1.5, C_BLUE_ACCENT),
        ("LEFTPADDING", (0,0), (-1,-1), 10),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ("TOPPADDING", (0,0), (-1,-1), 3),
        ("BOTTOMPADDING", (0,0), (-1,-1), 3),
    ]))
    return t


def generate_ms001_book_pdf():
    pdf_path = "/Users/macbookpro/Desktop/agoraeufalo_site/Material-PDF/MS001_Grazi_wants_to_change_Apostila_Oficial.pdf"
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
    
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=14 * mm,
        bottomMargin=14 * mm
    )

    story = []

    # =========================================================================
    # 1. PÁGINA 1: CAPA PURA MONUMENTAL (MÓDULO 01 - PROFESSOR LEO LEITE)
    # =========================================================================
    story.append(Spacer(1, 110 * mm))
    story.append(Paragraph("<font color='#F59E0B' size='10'><b>MAGIC STORIES LEGACY • VOLUME 1</b></font>", ParagraphStyle("CT0", fontName="Helvetica-Bold", fontSize=10, leading=14)))
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph("<font color='#FFFFFF' size='26'><b>MÓDULO 01:</b></font>", ParagraphStyle("CT1", fontName="Helvetica-Bold", fontSize=26, leading=30)))
    story.append(Spacer(1, 1.5 * mm))
    story.append(Paragraph("<font color='#FFFFFF' size='30'><b>GRAZIELLA WANTS<br/>TO CHANGE HER LIFE</b></font>", ParagraphStyle("CT2", fontName="Helvetica-Bold", fontSize=30, leading=35)))
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph(
        "<font color='#94A3B8' size='11'><i>&quot;Inglês não é matéria de escola para passar em prova; inglês é experiência viva. Repetir a experiência da mesma história até a fala virar reflexo.&quot;</i><br/><br/>"
        "<b>Professor Leonardo Leite • Método AgoraEuFalo</b></font>",
        ParagraphStyle("CT3", fontName="Helvetica", fontSize=11, leading=16)
    ))

    # =========================================================================
    # 2. PÁGINA 2: ATIVIDADE 01 • LISTEN & READ (LR) — IMERSÃO AUDITIVA PURA
    # =========================================================================
    story.append(PageBreak())
    story.append(make_activity_header_content(
        "Atividade 01 • LR",
        "Listen & Read (LR) — Imersão Auditiva Pura",
        "Observe com extrema atenção muito mais pelos ouvidos do que pelos olhos"
    ))
    story.append(Spacer(1, 5 * mm))

    lr_story_p = Paragraph(
        "<font size='11' color='#0D223F'>"
        "<b>Graziela is a 45-year-old woman who wants to change her life.</b> She lives in Brasília, the capital of Brazil, with her husband and two kids. She's a lawyer and she works for the federal government. She lives in a big house near the lake with a beautiful view to the waterfront.<br/><br/>"
        "<b>She's a very friendly and outgoing person.</b> She loves talking to people although she sees herself as a very shy woman. Grazi doesn't like to stand out and she gets embarrassed very easily.<br/><br/>"
        "<b>Grazi loves outdoor activities</b> like biking, hiking, swimming and taking walks with her daughters Anna and Flavia. Grazi is crazy about her daughters!<br/><br/>"
        "<b>Every day she gets up early, about 7:00.</b> She goes running in the park for about 50 minutes. Then, she gets back home, jumps in the pool, takes a shower, has some breakfast and goes to work at 9:00. She works until 5:00 PM.<br/><br/>"
        "<b>In the evening, she sits in the backyard,</b> puts her headphones on and listens to English lessons on her iPad.<br/><br/>"
        "<b>The question, my friend, is: why does Grazi want to change her life?</b>"
        "</font>",
        ParagraphStyle("LRStoryText", fontName="Helvetica", fontSize=11, leading=17)
    )

    lr_sidebar = [
        Paragraph("<b>SACADA &amp; PROPÓSITO DO LEO</b>", ParagraphStyle("QTH", fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=C_NAVY_TEXT, alignment=1)),
        Spacer(1, 3.5 * mm),
        Table([[get_lightbulb_icon(), Paragraph("<font size='8.5' color='#0D223F'><b>Escuta Pelos Ouvidos:</b> Ao ler e ouvir juntos, o cérebro foca na escrita. Mude o foco: ouça os sons reais!</font>", ParagraphStyle("TP1", fontName="Helvetica", fontSize=8.5, leading=12))]], colWidths=[9 * mm, 49 * mm], style=[("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0), ("TOPPADDING", (0,0), (-1,-1), 1), ("BOTTOMPADDING", (0,0), (-1,-1), 4)]),
        Spacer(1, 3.5 * mm),
        Table([[get_clock_icon(), Paragraph("<font size='8.5' color='#0D223F'><b>Grafia vs. Som Real:</b> Sinta a diferença brutal entre a palavra escrita e a melodia conectada da frase.</font>", ParagraphStyle("TP2", fontName="Helvetica", fontSize=8.5, leading=12))]], colWidths=[9 * mm, 49 * mm], style=[("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0), ("TOPPADDING", (0,0), (-1,-1), 1), ("BOTTOMPADDING", (0,0), (-1,-1), 4)]),
        Spacer(1, 3.5 * mm),
        Table([[get_checkmark_icon(), Paragraph("<font size='8.5' color='#0D223F'><b>Repetição Diária:</b> Ouvir uma única vez não funciona. A escuta precisa virar reflexo automático!</font>", ParagraphStyle("TP3", fontName="Helvetica", fontSize=8.5, leading=12))]], colWidths=[9 * mm, 49 * mm], style=[("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0), ("TOPPADDING", (0,0), (-1,-1), 1), ("BOTTOMPADDING", (0,0), (-1,-1), 4)]),
        Spacer(1, 6 * mm),
        Table([[Paragraph("<b>SACADA DE OURO</b><br/><font size='8.5' color='#065F46'>Observe como as palavras se fundem (<i>wants to</i>, <i>lives in</i>, <i>gets up</i>). Treine no Training Player para fixar a melodia sonora!</font>", ParagraphStyle("KHTxt", fontName="Helvetica", fontSize=8.5, leading=12, textColor=C_PASTEL_TEXT))]], colWidths=[58 * mm], style=[("BACKGROUND", (0,0), (-1,-1), C_PASTEL_BG), ("BOX", (0,0), (-1,-1), 1, C_PASTEL_LINE), ("LEFTPADDING", (0,0), (-1,-1), 6), ("RIGHTPADDING", (0,0), (-1,-1), 6), ("TOPPADDING", (0,0), (-1,-1), 6), ("BOTTOMPADDING", (0,0), (-1,-1), 6)])
    ]

    t_lr_page = Table([[lr_story_p, lr_sidebar]], colWidths=[118 * mm, 62 * mm])
    t_lr_page.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("RIGHTPADDING", (0,0), (0,0), 6),
        ("LEFTPADDING", (1,0), (1,0), 6),
        ("LINEBEFORE", (1,0), (1,0), 0.8, C_BORDER_LINE),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
    ]))
    story.append(t_lr_page)

    # =========================================================================
    # 3. PÁGINA 3: ATIVIDADE 02 • VOCABULARY SESSION (VOC) — MATRIZ DE CHUNKS
    # =========================================================================
    story.append(PageBreak())
    story.append(make_activity_header_content(
        "Atividade 02 • VOC",
        "Vocabulary Session (VOC) — Matriz de Chunks & Compreensão",
        "Garanta 100% do contexto sem neurose de decorar: vocabulário ativo só ativa no treino"
    ))
    story.append(Spacer(1, 4 * mm))

    voc_bilingual_text = (
        "<font size='10' color='#0D223F'><b>Graziela is a 45-year-old woman who wants to change her life. She lives in Brasília, the capital of Brazil, with her husband and two kids. She's a lawyer and she works for the federal government. She lives in a big house near the lake with a beautiful view to the waterfront.</b></font><br/>"
        "<font size='8.5' color='#047857'><i>&gt;&gt; Tradução Falada Real: A Graziela é uma mulher de 45 anos que quer mudar de vida. Ela mora em Brasília com o marido e dois filhos. É advogada e trabalha para o governo federal. Mora numa casa grande perto do lago, com vista linda para a orla.</i></font><br/><br/>"
        "<font size='10' color='#0D223F'><b>She's a very friendly and outgoing person. She loves talking to people although she sees herself as a very shy woman. Grazi doesn't like to stand out and she gets embarrassed very easily.</b></font><br/>"
        "<font size='8.5' color='#047857'><i>&gt;&gt; Tradução Falada Real: Ela é muito amigável e comunicativa. Adora conversar com as pessoas, apesar de se achar muito tímida. A Grazi não gosta de chamar atenção e fica com vergonha muito fácil.</i></font><br/><br/>"
        "<font size='10' color='#0D223F'><b>Grazi loves outdoor activities like biking, hiking, swimming and taking walks with her daughters Anna and Flavia. Grazi is crazy about her daughters!</b></font><br/>"
        "<font size='8.5' color='#047857'><i>&gt;&gt; Tradução Falada Real: A Grazi adora atividades ao ar livre como pedalar, fazer trilha, nadar e caminhar com as filhas. Ela é louca pelas filhas!</i></font><br/><br/>"
        "<font size='10' color='#0D223F'><b>Every day she gets up early, about 7:00. She goes running in the park for about 50 minutes. Then, she gets back home, jumps in the pool, takes a shower, has some breakfast and goes to work at 9:00. She works until 5:00 PM.</b></font><br/>"
        "<font size='8.5' color='#047857'><i>&gt;&gt; Tradução Falada Real: Todo dia ela acorda cedo, por volta das 7h. Corre no parque por 50 minutos, volta para casa, pula na piscina, toma banho, toma café e vai trabalhar às 9h. Trabalha até as 17h.</i></font><br/><br/>"
        "<font size='10' color='#0D223F'><b>In the evening, she sits in the backyard, puts her headphones on and listens to English lessons on her iPad. The question, my friend, is: why does Grazi want to change her life?</b></font><br/>"
        "<font size='8.5' color='#047857'><i>&gt;&gt; Tradução Falada Real: À noite, senta no quintal, coloca os fones de ouvido e escuta lições de inglês no iPad. A grande pergunta é: por que a Grazi quer mudar de vida?</i></font>"
    )
    voc_bilingual_p = Paragraph(voc_bilingual_text, ParagraphStyle("VocBilingual", fontName="Helvetica", fontSize=9.5, leading=13.5))

    t_vchunks = Table([
        [Paragraph("<b>Chunk Sonoro</b>", ParagraphStyle("TCH1", fontName="Helvetica-Bold", fontSize=8)), Paragraph("<b>Português Falado Real</b>", ParagraphStyle("TCH2", fontName="Helvetica-Bold", fontSize=8))],
        [Paragraph("• <b>45-year-old woman</b>", ParagraphStyle("TC1", fontName="Helvetica", fontSize=8)), Paragraph("Mulher de 45 anos", ParagraphStyle("TC2", fontName="Helvetica-Bold", fontSize=8, textColor=colors.HexColor("#78350F")))],
        [Paragraph("• <b>Waterfront / Near lake</b>", ParagraphStyle("TC1", fontName="Helvetica", fontSize=8)), Paragraph("Orla / Perto do lago", ParagraphStyle("TC2", fontName="Helvetica-Bold", fontSize=8, textColor=colors.HexColor("#78350F")))],
        [Paragraph("• <b>Outgoing vs. Shy</b>", ParagraphStyle("TC1", fontName="Helvetica", fontSize=8)), Paragraph("Extrovertida vs. Tímida", ParagraphStyle("TC2", fontName="Helvetica-Bold", fontSize=8, textColor=colors.HexColor("#78350F")))],
        [Paragraph("• <b>Stand out &amp; Embarrassed</b>", ParagraphStyle("TC1", fontName="Helvetica", fontSize=8)), Paragraph("Chamar atenção / Ter vergonha", ParagraphStyle("TC2", fontName="Helvetica-Bold", fontSize=8, textColor=colors.HexColor("#78350F")))],
        [Paragraph("• <b>Crazy about her daughters</b>", ParagraphStyle("TC1", fontName="Helvetica", fontSize=8)), Paragraph("Louca pelas filhas", ParagraphStyle("TC2", fontName="Helvetica-Bold", fontSize=8, textColor=colors.HexColor("#78350F")))],
        [Paragraph("• <b>Gets up early (7:00)</b>", ParagraphStyle("TC1", fontName="Helvetica", fontSize=8)), Paragraph("Acorda cedo", ParagraphStyle("TC2", fontName="Helvetica-Bold", fontSize=8, textColor=colors.HexColor("#78350F")))],
    ], colWidths=[58 * mm, 58 * mm], style=[
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#F8FAFC")),
        ("BOX", (0,0), (-1,-1), 0.8, C_BORDER_LINE),
        ("INNERGRID", (0,0), (-1,-1), 0.4, C_BORDER_LINE),
        ("LEFTPADDING", (0,0), (-1,-1), 4),
        ("RIGHTPADDING", (0,0), (-1,-1), 4),
        ("TOPPADDING", (0,0), (-1,-1), 2),
        ("BOTTOMPADDING", (0,0), (-1,-1), 2),
    ])

    voc_left_flowables = [voc_bilingual_p, Spacer(1, 3 * mm), t_vchunks]

    voc_sidebar = [
        Paragraph("<b>SACADA &amp; PROPÓSITO DO LEO</b>", ParagraphStyle("VQTH", fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=C_NAVY_TEXT, alignment=1)),
        Spacer(1, 3.5 * mm),
        Table([[get_lightbulb_icon(), Paragraph("<font size='8.5' color='#0D223F'><b>Zero Neurose:</b> Você NÃO vai decorar nada aqui agora. O cérebro armazena no vocabulário passivo.</font>", ParagraphStyle("VTP1", fontName="Helvetica", fontSize=8.5, leading=12))]], colWidths=[9 * mm, 49 * mm], style=[("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0), ("TOPPADDING", (0,0), (-1,-1), 1), ("BOTTOMPADDING", (0,0), (-1,-1), 4)]),
        Spacer(1, 3.5 * mm),
        Table([[get_clock_icon(), Paragraph("<font size='8.5' color='#0D223F'><b>Ativação no Treino:</b> Vocabulário ativo sai no piloto automático através dos treinos de LA e LRT.</font>", ParagraphStyle("VTP2", fontName="Helvetica", fontSize=8.5, leading=12))]], colWidths=[9 * mm, 49 * mm], style=[("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0), ("TOPPADDING", (0,0), (-1,-1), 1), ("BOTTOMPADDING", (0,0), (-1,-1), 4)]),
        Spacer(1, 3.5 * mm),
        Table([[get_checkmark_icon(), Paragraph("<font size='8.5' color='#0D223F'><b>Compreensão 100%:</b> Garanta a compreensão da história para seguir focado 100% no inglês.</font>", ParagraphStyle("VTP3", fontName="Helvetica", fontSize=8.5, leading=12))]], colWidths=[9 * mm, 49 * mm], style=[("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0), ("TOPPADDING", (0,0), (-1,-1), 1), ("BOTTOMPADDING", (0,0), (-1,-1), 4)]),
        Spacer(1, 6 * mm),
        Table([[Paragraph("<b>SACADA DE OURO</b><br/><font size='8.5' color='#065F46'>No Player, cada chunk sonoro possui um botão individual [Play] para fixar o som isolado antes do speaking.</font>", ParagraphStyle("VKHTxt", fontName="Helvetica", fontSize=8.5, leading=12, textColor=C_PASTEL_TEXT))]], colWidths=[58 * mm], style=[("BACKGROUND", (0,0), (-1,-1), C_PASTEL_BG), ("BOX", (0,0), (-1,-1), 1, C_PASTEL_LINE), ("LEFTPADDING", (0,0), (-1,-1), 6), ("RIGHTPADDING", (0,0), (-1,-1), 6), ("TOPPADDING", (0,0), (-1,-1), 6), ("BOTTOMPADDING", (0,0), (-1,-1), 6)])
    ]

    t_voc_page = Table([[voc_left_flowables, voc_sidebar]], colWidths=[118 * mm, 62 * mm])
    t_voc_page.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("RIGHTPADDING", (0,0), (0,0), 6),
        ("LEFTPADDING", (1,0), (1,0), 6),
        ("LINEBEFORE", (1,0), (1,0), 0.8, C_BORDER_LINE),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
    ]))
    story.append(t_voc_page)

    # =========================================================================
    # 4. PÁGINA 4: ATIVIDADE 03 • LISTEN & ANSWER (PARTE 1 • PERGUNTAS 1 A 8)
    # =========================================================================
    story.append(PageBreak())
    story.append(make_activity_header_workbook(
        "Atividade 03 • LA (Parte 1)",
        "Listen & Answer (LA) — Reflexo & Velocidade de Resposta",
        "Treino de bate-pronto: responda curto com o que souber durante a micro-pausa"
    ))
    story.append(Spacer(1, 4 * mm))

    chk_header_t = Table([[Paragraph("<b>PERGUNTAS DE BATE-PRONTO &amp; RESPOSTA ESCRITA</b>", ParagraphStyle("CKTitle", fontName="Helvetica-Bold", fontSize=10, leading=13, textColor=C_NAVY_TEXT)), get_pencil_icon()]], colWidths=[155 * mm, 25 * mm])
    chk_header_t.setStyle(TableStyle([("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0), ("TOPPADDING", (0,0), (-1,-1), 0), ("BOTTOMPADDING", (0,0), (-1,-1), 3)]))
    story.append(chk_header_t)

    la_p1_items = [
        ("[ ]", "1. How old is Grazi?"),
        ("[✓]", "2. Where is she from?"),
        ("[ ]", "3. What does Grazi do for a living?"),
        ("[✓]", "4. Where does she live — in a house or an apartment?"),
        ("[✓]", "5. Who does she live with?"),
        ("[ ]", "6. What is Grazi like?"),
        ("[✓]", "7. What does she like doing in her free time?"),
        ("[ ]", "8. How does she feel about her daughters?"),
    ]
    la_p1_rows = []
    for box, q in la_p1_items:
        la_p1_rows.append([
            Paragraph(f"<font color='#1A56DB'><b>{box}</b></font> <font color='#0D223F' size='9.5'><b>{q}</b></font>", ParagraphStyle("CQ", fontName="Helvetica", fontSize=9.5, leading=13)),
            Paragraph("________________________________________________", ParagraphStyle("CLine", fontName="Helvetica", fontSize=9.5, leading=13, textColor=colors.HexColor("#CBD5E1")))
        ])
    t_la_p1 = Table(la_p1_rows, colWidths=[90 * mm, 90 * mm])
    t_la_p1.setStyle(TableStyle([("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0), ("TOPPADDING", (0,0), (-1,-1), 4), ("BOTTOMPADDING", (0,0), (-1,-1), 4)]))
    story.append(t_la_p1)
    story.append(Spacer(1, 6 * mm))

    story.append(make_prominent_quote_box(
        "Primeira arena de escuta e fala ativa. Zero obrigação de falar imediatamente: o que vale é o reflexo de responder em bate-pronto!"
    ))
    story.append(Spacer(1, 6 * mm))

    story.append(make_step_timeline_box(
        "Treino Call & Response no Training Player",
        "• Solte a resposta em voz alta durante a micro-pausa de 2 a 4 segundos antes do narrador nativo.",
        "Automação & Repetição Diária",
        "• Repita diariamente até responder no piloto automático sem pensar em português.",
        "https://agoraeufalo.com.br/player.html?track=andre_graziela&tab=la"
    ))

    # =========================================================================
    # 5. PÁGINA 5: ATIVIDADE 03 • LISTEN & ANSWER (PARTE 2 • PERGUNTAS 9 A 15)
    # =========================================================================
    story.append(PageBreak())
    story.append(make_activity_header_workbook(
        "Atividade 03 • LA (Parte 2)",
        "Listen & Answer (LA) — Reflexo & Velocidade de Resposta",
        "Continuação da dissecação completa da rotina diária da história"
    ))
    story.append(Spacer(1, 4 * mm))

    chk_header_t2 = Table([[Paragraph("<b>PERGUNTAS DE BATE-PRONTO &amp; RESPOSTA ESCRITA</b>", ParagraphStyle("CKTitle2", fontName="Helvetica-Bold", fontSize=10, leading=13, textColor=C_NAVY_TEXT)), get_pencil_icon()]], colWidths=[155 * mm, 25 * mm])
    chk_header_t2.setStyle(TableStyle([("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0), ("TOPPADDING", (0,0), (-1,-1), 0), ("BOTTOMPADDING", (0,0), (-1,-1), 3)]))
    story.append(chk_header_t2)

    la_p2_items = [
        ("[ ]", "9. What time does she get up every day?"),
        ("[✓]", "10. What does she do in the morning before work?"),
        ("[ ]", "11. What does she do after running in the park?"),
        ("[✓]", "12. What time does she go to work?"),
        ("[ ]", "13. How late does she stay at work?"),
        ("[✓]", "14. What does she do in the evening in her backyard?"),
        ("[ ]", "15. In your opinion, why does Grazi want to change her life?"),
    ]
    la_p2_rows = []
    for box, q in la_p2_items:
        la_p2_rows.append([
            Paragraph(f"<font color='#1A56DB'><b>{box}</b></font> <font color='#0D223F' size='9.5'><b>{q}</b></font>", ParagraphStyle("CQ2", fontName="Helvetica", fontSize=9.5, leading=13)),
            Paragraph("________________________________________________", ParagraphStyle("CLine2", fontName="Helvetica", fontSize=9.5, leading=13, textColor=colors.HexColor("#CBD5E1")))
        ])
    t_la_p2 = Table(la_p2_rows, colWidths=[90 * mm, 90 * mm])
    t_la_p2.setStyle(TableStyle([("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0), ("TOPPADDING", (0,0), (-1,-1), 4.5), ("BOTTOMPADDING", (0,0), (-1,-1), 4.5)]))
    story.append(t_la_p2)
    story.append(Spacer(1, 6 * mm))

    story.append(make_prominent_quote_box(
        "Responda curto, do jeito que souber ou diga 'I don't know'. O cérebro precisa se acostumar a responder sem hesitar e sem medo de errar!"
    ))
    story.append(Spacer(1, 6 * mm))

    story.append(make_step_timeline_box(
        "Reflexo e Velocidade de Resposta",
        "• Não pense na gramática: solte a informação principal de imediato.",
        "Fixação de Padrões Verbais",
        "• Acelere o tempo de resposta até soar instantâneo como um diálogo real.",
        "https://agoraeufalo.com.br/player.html?track=andre_graziela&tab=la"
    ))

    # =========================================================================
    # 6. PÁGINA 6: ATIVIDADE 04 • LOOK & RETELL (LRT) — SPEAKING ATIVO
    # =========================================================================
    story.append(PageBreak())
    story.append(make_activity_header_workbook(
        "Atividade 04 • LRT",
        "Look & Retell (LRT) — Speaking Ativo & O Teste do Gringo",
        "Reconte a história com as suas palavras usando as 15 perguntas-guia visuais de LA"
    ))
    story.append(Spacer(1, 4 * mm))

    lrt_c1_p = Paragraph(
        "<b>[ ] 1. How old is Grazi?</b><br/>"
        "<b>[✓] 2. Where is she from?</b><br/>"
        "<b>[ ] 3. What does Grazi do for a living?</b><br/>"
        "<b>[✓] 4. Where does she live — in a house or an apartment?</b><br/>"
        "<b>[✓] 5. Who does she live with?</b><br/>"
        "<b>[ ] 6. What is Grazi like?</b><br/>"
        "<b>[✓] 7. What does she like doing in her free time?</b><br/>"
        "<b>[ ] 8. How does she feel about her daughters?</b>",
        ParagraphStyle("LRTCol1P", fontName="Helvetica", fontSize=9, leading=14, textColor=C_NAVY_TEXT)
    )
    lrt_c2_p = Paragraph(
        "<b>[ ] 9. What time does she get up every day?</b><br/>"
        "<b>[✓] 10. What does she do in the morning before work?</b><br/>"
        "<b>[ ] 11. What does she do after running in the park?</b><br/>"
        "<b>[✓] 12. What time does she go to work?</b><br/>"
        "<b>[ ] 13. How late does she stay at work?</b><br/>"
        "<b>[✓] 14. What does she do in the evening in her backyard?</b><br/>"
        "<b>[ ] 15. In your opinion, why does Grazi want to change life?</b>",
        ParagraphStyle("LRTCol2P", fontName="Helvetica", fontSize=9, leading=14, textColor=C_NAVY_TEXT)
    )

    t_lrt_q = Table([
        [Paragraph("<b>ROTEIRO VISUAL DE RECONTO (AS MESMAS 15 PERGUNTAS DE LISTEN &amp; ANSWER)</b>", ParagraphStyle("LRTH", fontName="Helvetica-Bold", fontSize=9.5, textColor=C_NAVY_TEXT)), ""],
        [lrt_c1_p, lrt_c2_p]
    ], colWidths=[90 * mm, 90 * mm])
    t_lrt_q.setStyle(TableStyle([
        ("SPAN", (0,0), (1,0)),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ("TOPPADDING", (0,0), (-1,-1), 2),
        ("BOTTOMPADDING", (0,0), (-1,-1), 3),
    ]))
    story.append(t_lrt_q)
    story.append(Spacer(1, 4 * mm))

    # Espaço para Palavras-Chave
    t_notes = Table([
        [Paragraph("<b>PALAVRAS-CHAVE DO SEU RECONTO (KEYWORDS):</b>", ParagraphStyle("NTH", fontName="Helvetica-Bold", fontSize=9, textColor=C_NAVY_TEXT))],
        [Paragraph("• Key Point 1: _______________________________________________________________________________", ParagraphStyle("NTR", fontName="Helvetica", fontSize=9, textColor=C_SLATE_MUTED))],
        [Paragraph("• Key Point 2: _______________________________________________________________________________", ParagraphStyle("NTR", fontName="Helvetica", fontSize=9, textColor=C_SLATE_MUTED))],
        [Paragraph("• Key Point 3: _______________________________________________________________________________", ParagraphStyle("NTR", fontName="Helvetica", fontSize=9, textColor=C_SLATE_MUTED))],
    ], colWidths=[180 * mm], style=[
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ("TOPPADDING", (0,0), (-1,-1), 2),
        ("BOTTOMPADDING", (0,0), (-1,-1), 2),
    ])
    story.append(t_notes)
    story.append(Spacer(1, 5 * mm))

    story.append(make_prominent_quote_box(
        "Mesma filosofia: sem forçar e sem prova de memória. É o treino para falar do que você já sabe com o inglês que você tem HOJE, no Agora!"
    ))
    story.append(Spacer(1, 5 * mm))

    story.append(make_step_timeline_box(
        "Grave seu Reconto no Training Player",
        "• Abra a aba Look & Retell, aperte o microfone radiante e reconte a história livremente.",
        "O Teste do Gringo no AI Speech Coach",
        "• Avaliação 0 a 10 de inteligibilidade: o gringo entendeu a sua história do início ao fim?",
        "https://agoraeufalo.com.br/player.html?track=andre_graziela&tab=lrt"
    ))

    # =========================================================================
    # 7. PÁGINA 7: ATIVIDADE 05 • LISTEN & ASK (LASK) — FORMULAÇÃO RÁPIDA
    # REGRA CANÔNICA: NÃO MOSTRAR AS PERGUNTAS (ESTÍMULO + LINHA DE FORMULAÇÃO)
    # =========================================================================
    story.append(PageBreak())
    story.append(make_activity_header_workbook(
        "Atividade 05 • LASK",
        "Listen & Ask (LASK) — O Jogo de Formular Perguntas (Sem Perguntas Reveladas)",
        "Quem lidera conversas vivas em inglês é quem sabe perguntar com rapidez e ritmo"
    ))
    story.append(Spacer(1, 4 * mm))

    lask_rows = [
        [Paragraph("<b>FRASE DE ESTÍMULO (PROVOCAÇÃO)</b>", ParagraphStyle("LK1", fontName="Helvetica-Bold", fontSize=9, textColor=C_NAVY_TEXT)),
         Paragraph("<b>SUA PERGUNTA FORMULADA (TREINO NO REFLEXO)</b>", ParagraphStyle("LK2", fontName="Helvetica-Bold", fontSize=9, textColor=C_NAVY_TEXT))],
        [Paragraph("1. Grazi is not 30 years old.", ParagraphStyle("L1", fontName="Helvetica", fontSize=9)), Paragraph("[  ] _________________________________________", ParagraphStyle("L2", fontName="Helvetica", fontSize=9, textColor=C_SLATE_MUTED))],
        [Paragraph("2. She does not live in São Paulo.", ParagraphStyle("L1", fontName="Helvetica", fontSize=9)), Paragraph("[  ] _________________________________________", ParagraphStyle("L2", fontName="Helvetica", fontSize=9, textColor=C_SLATE_MUTED))],
        [Paragraph("3. She is not an architect.", ParagraphStyle("L1", fontName="Helvetica", fontSize=9)), Paragraph("[  ] _________________________________________", ParagraphStyle("L2", fontName="Helvetica", fontSize=9, textColor=C_SLATE_MUTED))],
        [Paragraph("4. She does not live in an apartment.", ParagraphStyle("L1", fontName="Helvetica", fontSize=9)), Paragraph("[  ] _________________________________________", ParagraphStyle("L2", fontName="Helvetica", fontSize=9, textColor=C_SLATE_MUTED))],
        [Paragraph("5. She does not live alone.", ParagraphStyle("L1", fontName="Helvetica", fontSize=9)), Paragraph("[  ] _________________________________________", ParagraphStyle("L2", fontName="Helvetica", fontSize=9, textColor=C_SLATE_MUTED))],
        [Paragraph("6. She does not wake up late at 10:00.", ParagraphStyle("L1", fontName="Helvetica", fontSize=9)), Paragraph("[  ] _________________________________________", ParagraphStyle("L2", fontName="Helvetica", fontSize=9, textColor=C_SLATE_MUTED))],
        [Paragraph("7. She does not want the same life.", ParagraphStyle("L1", fontName="Helvetica", fontSize=9)), Paragraph("[  ] _________________________________________", ParagraphStyle("L2", fontName="Helvetica", fontSize=9, textColor=C_SLATE_MUTED))],
    ]
    t_lask = Table(lask_rows, colWidths=[90 * mm, 90 * mm])
    t_lask.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#F8FAFC")),
        ("BOX", (0,0), (-1,-1), 1, C_BORDER_LINE),
        ("INNERGRID", (0,0), (-1,-1), 0.5, C_BORDER_LINE),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING", (0,0), (-1,-1), 4.5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4.5),
    ]))
    story.append(t_lask)
    story.append(Spacer(1, 6 * mm))

    story.append(make_prominent_quote_box(
        "Quem lidera e mantém conversas vivas em inglês é quem sabe perguntar com rapidez e ritmo. Formule a pergunta de imediato no reflexo!"
    ))
    story.append(Spacer(1, 6 * mm))

    story.append(make_step_timeline_box(
        "Desafio de Bate-Pronto no Training Player",
        "• Ouça a frase na negativa e dispare a pergunta em inglês com convicção.",
        "Automação de Diálogo",
        "• Se travar, ouça a gravação e aplique na próxima repetição.",
        "https://agoraeufalo.com.br/player.html?track=andre_graziela&tab=lask"
    ))

    # =========================================================================
    # 8. PÁGINA 8: ATIVIDADE 06 • PRONUNCIATION (PRO) — CONNECTED SPEECH
    # REGRA CANÔNICA: TEXTO COMPLETO DO LR COM CONNECTED SPEECH + LOOP DRILL + SACADA DE OURO
    # =========================================================================
    story.append(PageBreak())
    story.append(make_activity_header_workbook(
        "Atividade 06 • PRO",
        "Pronunciation & Connected Speech (PRO) — Musicalidade & Ritmo",
        "Treino mecânico de moldar a boca, entonação e ligação entre as palavras"
    ))
    story.append(Spacer(1, 3 * mm))

    ms001_story_connected = (
        "• Graziela is a <font color='#1A56DB'><b>45-year-old</b></font> woman who <font color='#1A56DB'><b>wants_to</b></font> change her life.<br/>"
        "• She <font color='#1A56DB'><b>lives_in</b></font> Brasília, the capital of Brazil, with her husband and two kids. She's a lawyer and she <font color='#1A56DB'><b>works_for_the</b></font> federal government. She <font color='#1A56DB'><b>lives_in_a</b></font> big house near the lake with a beautiful view to the waterfront.<br/>"
        "• She's a very friendly and outgoing person. She <font color='#1A56DB'><b>loves_talking_to</b></font> people although she sees herself as a very shy woman. Grazi doesn't like to <font color='#1A56DB'><b>stand_out</b></font> and she <font color='#1A56DB'><b>gets_embarrassed</b></font> very easily.<br/>"
        "• Grazi loves outdoor activities like biking, hiking, swimming and <font color='#1A56DB'><b>taking_walks</b></font> with her daughters Anna and Flavia. Grazi is <font color='#1A56DB'><b>crazy_about_her</b></font> daughters!<br/>"
        "• Every day she <font color='#1A56DB'><b>gets_up_early</b></font>, about 7:00. She goes running in the park for about 50 minutes. Then, she <font color='#1A56DB'><b>gets_back</b></font> home, <font color='#1A56DB'><b>jumps_in_the</b></font> pool, <font color='#1A56DB'><b>takes_a</b></font> shower, <font color='#1A56DB'><b>has_some</b></font> breakfast and goes to work at 9:00. She works until 5:00 PM.<br/>"
        "• In the evening, she sits in the backyard, <font color='#1A56DB'><b>puts_her_headphones_on</b></font> and listens to English lessons on her iPad.<br/>"
        "• The question, my friend, is: why does Grazi want to change her life?"
    )

    t_story_pro = Table([[Paragraph("<b>TEXTO INTEGRAL COM MARCAÇÕES DE LINKING SOUNDS:</b>", ParagraphStyle("ProH", fontName="Helvetica-Bold", fontSize=9, textColor=C_NAVY_TEXT))],
                         [Paragraph(ms001_story_connected, ParagraphStyle("ProB", fontName="Helvetica", fontSize=8.5, leading=12.5, textColor=C_NAVY_TEXT))]], colWidths=[180 * mm])
    t_story_pro.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ("BOX", (0,0), (-1,-1), 1, C_BORDER_LINE),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ]))
    story.append(t_story_pro)
    story.append(Spacer(1, 2.5 * mm))

    pro_card_text = (
        "<b>CHAVE FONÉTICA DOS PRINCIPAIS LINKINGS:</b><br/>"
        "• <i>\"lives in\"</i> -> <b>/liv-zin/</b> • <i>\"works for the\"</i> -> <b>/wërks fër dhë/</b> • <i>\"gets up early\"</i> -> <b>/gét-sa-përli/</b><br/>"
        "• <i>\"jumps in the pool\"</i> -> <b>/djâmps in dhë pul/</b> • <i>\"takes a shower\"</i> -> <b>/teik-sa-shauer/</b> • <i>\"puts her headphones on\"</i> -> <b>/puts rër rédfounz on/</b>"
    )
    t_pro_box = Table([[Paragraph(pro_card_text, ParagraphStyle("ProCardP", fontName="Helvetica", fontSize=8.5, leading=12.5, textColor=C_NAVY_TEXT))]], colWidths=[180 * mm])
    t_pro_box.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ("BOX", (0,0), (-1,-1), 1, C_BORDER_LINE),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ]))
    story.append(t_pro_box)
    story.append(Spacer(1, 2.5 * mm))

    story.append(make_prominent_quote_box(
        "Fluência não é falar rápido feito uma máquina; é falar conectado, com balanço e sem tropeçar. Respeite a música da língua!",
        "SACADA DE OURO DO PROFESSOR LEO LEITE"
    ))
    story.append(Spacer(1, 6 * mm))

    story.append(make_step_timeline_box(
        "Treino em Loop Contínuo no Training Player",
        "• Toque no botão [ Loop ] no card do Player para travar a repetição da frase.",
        "Conclusão do Módulo MS001 & Tira-Dúvidas",
        "• Parabéns por concluir o ciclo MS001! Repita diariamente.",
        "https://agoraeufalo.com.br/player.html?track=andre_graziela&tab=pro"
    ))

    doc.build(story, canvasmaker=MasterLuxuryCanvas, onFirstPage=draw_cover_background, onLaterPages=draw_inner_page_decorations)
    print(f"Official Book PDF successfully generated at: {pdf_path}")

if __name__ == '__main__':
    generate_ms001_book_pdf()
