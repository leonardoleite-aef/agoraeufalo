"""
AgoraEuFalo Editorial Prestige Engine - Livro Oficial de Treino MS003 (Saturday Morning)
100% Padrão Institucional AgoraEuFalo (Sistema Canônico dos 3 Arquétipos)
Tabela Canônica de Fontes Travadas (13.5 a 17pt) com Seção de Estações do Ano e Adjetivos de Clima/Temperatura na P4!
"""

import os, subprocess, pypdf
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image as RLImage
)
from reportlab.graphics.shapes import Drawing, Rect, Circle, Line, Polygon
from reportlab.pdfgen import canvas

# Paleta Oficial AgoraEuFalo Prestige
C_NAVY_BG      = colors.HexColor("#0D223F")
C_NAVY_WATER   = colors.HexColor("#1A3860")
C_LINE_SUBTLE  = colors.HexColor("#1E3F6D")
C_DOTS         = colors.HexColor("#1A3860")

C_NAVY_TEXT    = colors.HexColor("#0A192F")
C_BLUE_ACCENT  = colors.HexColor("#1A56DB")
C_BLUE_DARK    = colors.HexColor("#1E40AF")
C_SLATE_MUTED  = colors.HexColor("#64748B")
C_BORDER_LINE  = colors.HexColor("#CBD5E1")

C_PASTEL_BG    = colors.HexColor("#D1F4EB")
C_PASTEL_LINE  = colors.HexColor("#A7E8D7")
C_PASTEL_TEXT  = colors.HexColor("#065F46")

C_GREEN_TRANSL = colors.HexColor("#047857")
C_AMBER_TEXT   = colors.HexColor("#78350F")

def get_lightbulb_icon():
    d = Drawing(20, 20)
    d.add(Circle(10, 12, 6, fillColor=colors.HexColor("#FEF08A"), strokeColor=colors.HexColor("#CA8A04"), strokeWidth=1.2))
    d.add(Rect(8, 3, 4, 4, fillColor=colors.HexColor("#CA8A04"), strokeColor=None))
    return d

def get_clock_icon():
    d = Drawing(20, 20)
    d.add(Circle(10, 10, 8, fillColor=colors.HexColor("#F1F5F9"), strokeColor=colors.HexColor("#475569"), strokeWidth=1.2))
    d.add(Line(10, 10, 10, 15, strokeColor=colors.HexColor("#0F172A"), strokeWidth=1.4))
    d.add(Line(10, 10, 14, 10, strokeColor=colors.HexColor("#0F172A"), strokeWidth=1.4))
    return d

def get_star_icon():
    d = Drawing(20, 20)
    points = [10,18, 12,12, 18,12, 13,9, 15,3, 10,7, 5,3, 7,9, 2,12, 8,12]
    d.add(Polygon(points, fillColor=colors.HexColor("#FEF08A"), strokeColor=colors.HexColor("#CA8A04"), strokeWidth=1.2))
    return d


def draw_cover_background(canvas_obj, doc_obj):
    canvas_obj.saveState()
    canvas_obj.setFillColor(C_NAVY_BG)
    canvas_obj.rect(0, 0, 210 * mm, 297 * mm, fill=1, stroke=0)
    
    canvas_obj.setStrokeColor(C_LINE_SUBTLE)
    canvas_obj.setLineWidth(1)
    
    path = canvas_obj.beginPath()
    path.moveTo(15 * mm, 280 * mm)
    path.lineTo(45 * mm, 270 * mm)
    path.lineTo(35 * mm, 240 * mm)
    path.lineTo(10 * mm, 250 * mm)
    path.close()
    canvas_obj.drawPath(path, stroke=1, fill=0)

    canvas_obj.circle(20 * mm, 40 * mm, 25 * mm, stroke=1, fill=0)
    canvas_obj.circle(20 * mm, 40 * mm, 40 * mm, stroke=1, fill=0)
    canvas_obj.circle(20 * mm, 40 * mm, 55 * mm, stroke=1, fill=0)

    canvas_obj.setFont("Helvetica-Bold", 145)
    canvas_obj.setFillColor(C_NAVY_WATER)
    canvas_obj.drawString(105 * mm, 175 * mm, "03")

    canvas_obj.setFillColor(C_DOTS)
    for r in range(8):
        for c in range(12):
            canvas_obj.circle(135 * mm + c * 4 * mm, 240 * mm + r * 4 * mm, 0.8 * mm, fill=1, stroke=0)
            
    canvas_obj.restoreState()


class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(C_SLATE_MUTED)
        self.drawString(15 * mm, 287 * mm, "AGORAEUFALO • MÉTODO MAGIC STORIES")
        
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(C_BLUE_ACCENT)
        self.drawRightString(195 * mm, 287 * mm, "MÓDULO 03 • SATURDAY MORNING")
        
        self.setStrokeColor(C_BORDER_LINE)
        self.setLineWidth(0.6)
        self.line(15 * mm, 284 * mm, 195 * mm, 284 * mm)

        self.line(15 * mm, 14 * mm, 195 * mm, 14 * mm)
        self.setFont("Helvetica", 8)
        self.setFillColor(C_SLATE_MUTED)
        self.drawString(15 * mm, 9.5 * mm, "Professor Leonardo Leite • Suporte Direto: selexenglish@gmail.com")
        self.drawRightString(195 * mm, 9.5 * mm, f"Página {self._pageNumber} de {page_count}")
        self.restoreState()


def build_ms003_pdf(output_pdf_path):
    os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)
    
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=A4,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm
    )

    styles = getSampleStyleSheet()

    # Estilos Capa (Página 1)
    style_cover_badge = ParagraphStyle('CoverBadge', fontName='Helvetica-Bold', fontSize=11, leading=13, textColor=colors.HexColor("#FEF08A"))
    style_cover_title = ParagraphStyle('CoverTitle', fontName='Helvetica-Bold', fontSize=26, leading=30, textColor=colors.white)
    style_cover_sub = ParagraphStyle('CoverSub', fontName='Helvetica-Bold', fontSize=13, leading=16, textColor=colors.HexColor("#93C5FD"))
    style_cover_meta_h = ParagraphStyle('CoverMetaH', fontName='Helvetica-Bold', fontSize=10.5, leading=13.5, textColor=colors.HexColor("#FEF08A"))
    style_cover_meta_b = ParagraphStyle('CoverMetaB', fontName='Helvetica', fontSize=9.5, leading=13.5, textColor=colors.HexColor("#E2E8F0"))
    style_cover_synopsis_h = ParagraphStyle('CoverSynH', fontName='Helvetica-Bold', fontSize=11, leading=14, textColor=colors.HexColor("#93C5FD"))
    style_cover_synopsis_b = ParagraphStyle('CoverSynB', fontName='Helvetica', fontSize=9.5, leading=14, textColor=colors.HexColor("#CBD5E1"))
    style_cover_footer = ParagraphStyle('CoverFooter', fontName='Helvetica', fontSize=8.5, leading=12, textColor=colors.HexColor("#64748B"))

    # Títulos Universais das Páginas
    style_h1 = ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=16.5, leading=19.5, textColor=C_NAVY_TEXT)
    style_h2 = ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=11, leading=14, textColor=C_BLUE_DARK)
    
    # Listen & Read Story Font (Página 2: 16.5pt)
    style_story_lr = ParagraphStyle('StoryLR', fontName='Helvetica', fontSize=16.5, leading=23.5, textColor=colors.HexColor("#0F172A"))
    
    # Vocabulary Text Font (Página 3: 14.5pt / 12.5pt)
    style_story_voc = ParagraphStyle('StoryVOC', fontName='Helvetica-Bold', fontSize=14.5, leading=18.5, textColor=colors.HexColor("#0A192F"))
    style_trans_voc = ParagraphStyle('TransVOC', fontName='Helvetica-Oblique', fontSize=12.5, leading=16.5, textColor=C_GREEN_TRANSL)

    # Deep Dive Explainer Styles (Página 4: 12.5pt a 14pt)
    style_dive_h = ParagraphStyle('DiveH', fontName='Helvetica-Bold', fontSize=13.5, leading=17, textColor=C_NAVY_TEXT)
    style_dive_p = ParagraphStyle('DiveP', fontName='Helvetica', fontSize=12, leading=16, textColor=colors.HexColor("#1E293B"))
    style_dive_ex_h = ParagraphStyle('DiveExH', fontName='Helvetica-Bold', fontSize=11.5, leading=14.5, textColor=C_AMBER_TEXT)
    style_dive_ex = ParagraphStyle('DiveEx', fontName='Helvetica', fontSize=11.5, leading=15.5, textColor=C_BLUE_DARK)

    # Barras Laterais (Páginas 2 e 3)
    style_tip_h = ParagraphStyle('TipH', fontName='Helvetica-Bold', fontSize=10, leading=12, textColor=C_NAVY_TEXT)
    style_tip_b = ParagraphStyle('TipB', fontName='Helvetica', fontSize=9, leading=13, textColor=colors.HexColor("#334155"))
    style_pastel_b = ParagraphStyle('PastelB', fontName='Helvetica', fontSize=8.5, leading=12, textColor=C_PASTEL_TEXT)

    # Estilos do Workbook (Páginas 5 e 6: 13.5pt perguntas)
    style_wb_checklist = ParagraphStyle('WB_Check', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=colors.HexColor("#065F46"))
    style_q_text = ParagraphStyle('Q_Text', fontName='Helvetica-Bold', fontSize=13.5, leading=17, textColor=C_NAVY_TEXT)
    style_q_ans_line = ParagraphStyle('Q_AnsLine', fontName='Helvetica', fontSize=10.5, leading=14, textColor=colors.HexColor("#94A3B8"))
    style_quote = ParagraphStyle('Quote', fontName='Helvetica-BoldOblique', fontSize=12, leading=16, textColor=C_NAVY_TEXT)

    # Estilos de Tabela LASK (Página 7: 13.5pt)
    style_lask_th = ParagraphStyle('LASK_TH', fontName='Helvetica-Bold', fontSize=13.5, leading=16, textColor=C_NAVY_TEXT)
    style_lask_stim = ParagraphStyle('LASK_Stim', fontName='Helvetica', fontSize=13, leading=16.5, textColor=colors.HexColor("#334155"))
    style_lask_q = ParagraphStyle('LASK_Q', fontName='Helvetica-Bold', fontSize=13.5, leading=17, textColor=C_NAVY_TEXT)

    # Estilos de Pronúncia & Sacada (Página 8: 12.5pt a 14pt)
    style_pro_box_h = ParagraphStyle('PRO_BoxH', fontName='Helvetica-Bold', fontSize=13.5, leading=16.5, textColor=C_NAVY_TEXT)
    style_pro_box_b = ParagraphStyle('PRO_BoxB', fontName='Helvetica', fontSize=12.5, leading=17, textColor=colors.HexColor("#1E293B"))
    style_sacada_h = ParagraphStyle('SacadaH', fontName='Helvetica-Bold', fontSize=14, leading=17, textColor=C_AMBER_TEXT)
    style_sacada_b = ParagraphStyle('SacadaB', fontName='Helvetica-Oblique', fontSize=13, leading=18.5, textColor=colors.HexColor("#451A03"))

    story = []

    # =========================================================================
    # PÁGINA 1: ARQUÉTIPO 1 (CAPA DEEP NAVY • MODULE DIVIDER)
    # =========================================================================
    story.append(Spacer(1, 15 * mm))
    story.append(Paragraph("MÓDULO 03 • SÉRIE MAGIC STORIES LEGACY", style_cover_badge))
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph("Saturday Morning", style_cover_title))
    story.append(Spacer(1, 1.5 * mm))
    story.append(Paragraph("A Manhã da Grazi em Brasília, Estações do Ano, Clima e a Pergunta: Onde Está o Tom?", style_cover_sub))
    story.append(Spacer(1, 6 * mm))

    cover_art_path = "assets/images/cover-grazi-session03.jpg"
    img_element = RLImage(cover_art_path, width=72 * mm, height=72 * mm) if os.path.exists(cover_art_path) else Paragraph("ARTE 1:1 GRAZI", style_cover_sub)

    meta_content = [
        Paragraph("FICHA TÉCNICA DO MÓDULO", style_cover_meta_h),
        Spacer(1, 1.5 * mm),
        Paragraph("<b>Nível Recomendado:</b> Básico a Intermediário / Conversação Ativa", style_cover_meta_b),
        Paragraph("<b>Tempo de Treino:</b> 35 a 45 minutos diários", style_cover_meta_b),
        Paragraph("<b>Foco Principal:</b> Rotina Matinal, Estações do Ano, Clima & Movimentação (Upstairs/Downstairs)", style_cover_meta_b),
        Paragraph("<b>Duração dos Áudios:</b> 25 minutos de imersão completa", style_cover_meta_b),
        Paragraph("<b>Mentor do Treino:</b> Professor Leonardo Leite (35+ anos de sala de aula)", style_cover_meta_b),
        Spacer(1, 1.5 * mm),
        Paragraph("<b>Mecanismo de Ativação:</b> Listen & Read ➔ Chunks ➔ Listen & Answer ➔ Look & Retell ➔ Listen & Ask ➔ Connected Speech", style_cover_meta_b)
    ]

    table_cover_grid = Table([[img_element, meta_content]], colWidths=[76 * mm, 104 * mm])
    table_cover_grid.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(table_cover_grid)
    story.append(Spacer(1, 6 * mm))

    synopsis_data = [
        [Paragraph("💬 SINOPSE PEDAGÓGICA DO PROFESSOR LEO LEITE", style_cover_synopsis_h)],
        [Paragraph(
            "<i>\"É uma linda manhã de sábado em Brasília no início do outono. A Grazi acorda cedo, prepara a mesa de café para as filhas com capricho e se veste para uma corrida matinal. Mas uma dúvida fica no ar: onde diabos está o Tom? Nesta história rica em ritmo do dia a dia, você vai absorver vocabulário de estações do ano, adjetivos de clima, itens de café da manhã e a fluidez de expressões de movimento sem pensar em regras. Repita a história até o reflexo falar por você!\"</i>",
            style_cover_synopsis_b
        )]
    ]
    table_synopsis = Table(synopsis_data, colWidths=[180 * mm])
    table_synopsis.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#132A4A")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#1E3F6D")),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(table_synopsis)
    story.append(Spacer(1, 5 * mm))

    story.append(Paragraph("Acesse o Training Player Online: <b>agoraeufalo.com.br/player.html?track=saturday_morning</b> • Suporte: <b>selexenglish@gmail.com</b>", style_cover_footer))
    story.append(PageBreak())

    # =========================================================================
    # PÁGINA 2: ARQUÉTIPO 2 (CONTENT & INSIGHTS • 1. LISTEN & READ • FONTE 16.5pt)
    # =========================================================================
    p2_main = [
        Paragraph("1. Listen & Read (LR)", style_h1),
        Paragraph("Imersão Sonora Pura • Foco nos Ouvidos", style_h2),
        Spacer(1, 4 * mm),
        Paragraph("It's a beautiful Saturday morning in Brasília.", style_story_lr),
        Spacer(1, 3.5 * mm),
        Paragraph("It's the beginning of the fall and the weather is really nice. It's not so dry and not so hot.", style_story_lr),
        Spacer(1, 3.5 * mm),
        Paragraph("Grazi wakes up early and goes downstairs to the kitchen to make some breakfast.", style_story_lr),
        Spacer(1, 3.5 * mm),
        Paragraph("She makes some coffee. She likes it black. She makes some toasts and eggs.", style_story_lr),
        Spacer(1, 3.5 * mm),
        Paragraph("She picks up a bottle of orange juice and a carton of milk out of the fridge. She sets up the table for breakfast with some plates, cups, glasses, forks, knives and spoons.", style_story_lr),
        Spacer(1, 3.5 * mm),
        Paragraph("It's 8:00 AM and the girls are still in their bedrooms. Are they awake? Are they still asleep? Grazi is not sure.", style_story_lr),
        Spacer(1, 3.5 * mm),
        Paragraph("Grazi goes back upstairs, puts on her running shoes, knocks on the girls' doors and yells: <i>\"Breakfast is ready! I'm going for a run!\"</i>", style_story_lr),
        Spacer(1, 3.5 * mm),
        Paragraph("Grazi goes downstairs, picks up her bottle of water and runs out the door.", style_story_lr),
        Spacer(1, 3.5 * mm),
        Paragraph("<b>You tell me: where in the world is Tom?</b>", style_story_lr),
    ]

    p2_sidebar = [
        Spacer(1, 8 * mm),
        Table([[get_lightbulb_icon(), Paragraph("QUICK TIPS DO LEO", style_tip_h)]], colWidths=[6 * mm, 46 * mm]),
        Spacer(1, 2 * mm),
        Paragraph("<b>Clima & Estações:</b> Veja como o inglês fala de clima de forma leve: <i>'the weather is really nice • not so dry and not so hot'</i>.", style_tip_b),
        Spacer(1, 5 * mm),
        Table([[get_clock_icon(), Paragraph("DIREÇÃO SEM PREPOSIÇÃO", style_tip_h)]], colWidths=[6 * mm, 46 * mm]),
        Spacer(1, 2 * mm),
        Paragraph("<i>'Goes downstairs'</i> (desce) e <i>'goes upstairs'</i> (sobe). O inglês não usa 'go down the stairs' no dia a dia.", style_tip_b),
        Spacer(1, 5 * mm),
        Table([[get_star_icon(), Paragraph("LISTA DE LOUÇAS", style_tip_h)]], colWidths=[6 * mm, 46 * mm]),
        Spacer(1, 2 * mm),
        Paragraph("Fixe o ritmo melódico: <i>'plates, cups, glasses, forks, knives and spoons'</i> tudo emendado no mesmo fôlego.", style_tip_b),
        Spacer(1, 6 * mm),
        Table([
            [Paragraph("<b>🎧 TREINO ATIVO NO PLAYER:</b><br/>Abra a aba <b>Listen & Read</b> no Training Player com áudio contínuo e auto-scroll sincronizado.", style_pastel_b)]
        ], colWidths=[52 * mm], style=[
            ('BACKGROUND', (0,0), (-1,-1), C_PASTEL_BG),
            ('BOX', (0,0), (-1,-1), 1, C_PASTEL_LINE),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ])
    ]

    table_p2 = Table([[p2_main, p2_sidebar]], colWidths=[124 * mm, 56 * mm])
    table_p2.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (0,0), 6 * mm),
    ]))
    story.append(table_p2)
    story.append(PageBreak())

    # =========================================================================
    # PÁGINA 3: ARQUÉTIPO 2 (VOCABULARY SESSION • PARTE 1 • FONTE 14.5pt / 12.5pt)
    # =========================================================================
    p3_main = [
        Paragraph("2. Vocabulary Session (VOC) • Parte 1", style_h1),
        Paragraph("Texto da História com Tradução Falada Real (Português Brasileiro)", style_h2),
        Spacer(1, 3 * mm),
        Paragraph("It's a beautiful Saturday morning in Brasília.", style_story_voc),
        Paragraph("↳ É uma linda manhã de sábado em Brasília.", style_trans_voc),
        Spacer(1, 2.5 * mm),
        Paragraph("It's the beginning of the fall and the weather is really nice. It's not so dry and not so hot.", style_story_voc),
        Paragraph("↳ É comecinho de outono e o tempo tá uma delícia. Não tá tão seco e nem tão quente.", style_trans_voc),
        Spacer(1, 2.5 * mm),
        Paragraph("Grazi wakes up early and goes downstairs to the kitchen to make some breakfast.", style_story_voc),
        Paragraph("↳ A Grazi acorda cedinho e desce pra cozinha pra preparar o café da manhã.", style_trans_voc),
        Spacer(1, 2.5 * mm),
        Paragraph("She makes some coffee. She likes it black. She makes some toasts and eggs.", style_story_voc),
        Paragraph("↳ Ela passa um café. Ela gosta de café puro/preto. Faz umas torradas e ovos mexidos.", style_trans_voc),
        Spacer(1, 2.5 * mm),
        Paragraph("She picks up a bottle of orange juice and a carton of milk out of the fridge.", style_story_voc),
        Paragraph("↳ Pega uma garrafa de suco de laranja e uma caixinha de leite na geladeira.", style_trans_voc),
        Spacer(1, 2.5 * mm),
        Paragraph("She sets up the table with plates, cups, glasses, forks, knives and spoons.", style_story_voc),
        Paragraph("↳ Arruma a mesa com pratos, xícaras, copos, garfos, facas e colheres.", style_trans_voc),
        Spacer(1, 2.5 * mm),
        Paragraph("Grazi goes back upstairs, puts on her running shoes, knocks on the doors and yells: <i>\"Breakfast is ready! I'm going for a run!\"</i>", style_story_voc),
        Paragraph("↳ A Grazi sobe de volta, calça o tênis, bate na porta e grita: <i>\"Café tá pronto! Tô indo correr!\"</i>", style_trans_voc),
        Spacer(1, 2.5 * mm),
        Paragraph("Grazi goes downstairs, picks up her water and runs out the door. Where in the world is Tom?", style_story_voc),
        Paragraph("↳ Ela desce, pega a água e sai voada pela porta. Onde diabos foi parar o Tom?", style_trans_voc)
    ]

    p3_sidebar = [
        Spacer(1, 6 * mm),
        Table([[get_star_icon(), Paragraph("CHUNKS ACÚSTICOS", style_tip_h)]], colWidths=[6 * mm, 46 * mm]),
        Spacer(1, 1.5 * mm),
        Paragraph("<b>the beginning of the fall:</b> O início do outono (bloco temporal).", style_tip_b),
        Spacer(1, 2.5 * mm),
        Paragraph("<b>wakes up early / goes downstairs:</b> Acorda cedo / desce as escadas.", style_tip_b),
        Spacer(1, 2.5 * mm),
        Paragraph("<b>likes it black:</b> Gosta de café puro (sem açúcar/leite).", style_tip_b),
        Spacer(1, 2.5 * mm),
        Paragraph("<b>a carton of milk:</b> Uma caixa de leite (tipo longa vida).", style_tip_b),
        Spacer(1, 2.5 * mm),
        Paragraph("<b>sets up the table:</b> Põe / arruma a mesa da refeição.", style_tip_b),
        Spacer(1, 2.5 * mm),
        Paragraph("<b>puts on her running shoes:</b> Calça os tênis de corrida.", style_tip_b),
        Spacer(1, 2.5 * mm),
        Paragraph("<b>where in the world:</b> Onde no mundo / onde diabos.", style_tip_b),
        Spacer(1, 5 * mm),
        Table([
            [Paragraph("<b>💡 ZERO DECOREBA:</b> Compreenda 100% do contexto para treinar com foco total no inglês falado nas próximas etapas.", style_pastel_b)]
        ], colWidths=[52 * mm], style=[
            ('BACKGROUND', (0,0), (-1,-1), C_PASTEL_BG),
            ('BOX', (0,0), (-1,-1), 1, C_PASTEL_LINE),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ])
    ]

    table_p3 = Table([[p3_main, p3_sidebar]], colWidths=[124 * mm, 56 * mm])
    table_p3.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (0,0), 6 * mm),
    ]))
    story.append(table_p3)
    story.append(PageBreak())

    # =========================================================================
    # PÁGINA 4: ARQUÉTIPO 2 (VOCABULARY SESSION • PARTE 2 • DEEP DIVE • FONTE 12-14pt)
    # =========================================================================
    story.append(Paragraph("2. Vocabulary Session (VOC) • Parte 2: Deep Dive do Leo", style_h1))
    story.append(Paragraph("Estações do Ano, Adjetivos de Clima/Temperatura & O Sentimento da Estrutura", style_h2))
    story.append(Spacer(1, 3 * mm))

    dive_cards = [
        ("1. As 4 Estações do Ano & Sensação Térmica (Weather Adjectives)",
         "Na história, é o início do outono (<i>the beginning of the fall</i>). No hemisfério norte usam <i>Fall</i> (EUA) ou <i>Autumn</i> (UK).<br/>"
         "• <b>As 4 Estações:</b> <i>Spring</i> (Primavera) • <i>Summer</i> (Verão) • <i>Fall/Autumn</i> (Outono) • <i>Winter</i> (Inverno).<br/>"
         "• <b>Termômetro Falado:</b> <i>Hot</i> (muito quente) ➔ <i>Warm</i> (quentinho agradável) ➔ <i>Mild / Nice</i> (ameno/gostoso) ➔ <i>Cool</i> (fresquinho) ➔ <i>Chilly</i> (friozinho) ➔ <i>Cold</i> (frio) ➔ <i>Freezing</i> (congelando).<br/>"
         "• <b>Umidade:</b> <i>Dry</i> (seco, típico de Brasília) vs. <i>Humid / Wet</i> (úmido/chuvoso).",
         "• 'The weather in Brasília is very dry in August.' (O tempo em Brasília é super seco em agosto.)<br/>• 'It's a bit chilly tonight, grab a jacket.' (Tá um friozinho hoje à noite, pega uma jaqueta.)"),

        ("2. Movimentação na Casa sem Preposição: 'Go downstairs' & 'Go upstairs'",
         "Em português dizemos 'descer para a cozinha' ou 'subir as escadas'. Em inglês, <b>downstairs</b> (andar de baixo) e <b>upstairs</b> (andar de cima) funcionam direto como direção, sem preposição!<br/>"
         "• <i>Grazi goes downstairs</i> (A Grazi desce para o térreo/cozinha).<br/>"
         "• <i>She goes back upstairs</i> (Ela sobe de volta para o andar dos quartos).",
         "• 'I left my phone upstairs.' (Deixei meu celular lá em cima.)<br/>• 'Let's go downstairs and have lunch.' (Vamos descer lá embaixo e almoçar.)"),

        ("3. O Uso Natural de 'Some' com Alimentos & A Expressão 'Where in the world...?'",
         "• <b>'Some' com comida e bebida:</b> <i>make some coffee, make some toasts, make some breakfast</i>. Em inglês falado, o <i>some</i> dá a sensação acolhedora de 'fazer um cafezinho / umas torradas', sem soar robótico.<br/>"
         "• <b>'Where in the world is Tom?':</b> Expressão coloquial de ênfase para demonstrar surpresa ou curiosidade ('Onde no mundo / Onde diabos está o Tom?').",
         "• 'Would you like some coffee or some water?' (Gostaria de um café ou uma água?)<br/>• 'Where in the world did you find this old photo?' (Onde diabos você achou essa foto antiga?)")
    ]

    for title, exp, examples in dive_cards:
        card_content = [
            Paragraph(f"<b>{title}</b>", style_dive_h),
            Spacer(1, 1 * mm),
            Paragraph(exp, style_dive_p),
            Spacer(1, 1.5 * mm),
            Paragraph("💡 Exemplos para Aplicar na Sua Vida:", style_dive_ex_h),
            Spacer(1, 0.8 * mm),
            Paragraph(examples, style_dive_ex)
        ]
        t = Table([[card_content]], colWidths=[180 * mm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 5.5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5.5),
        ]))
        story.append(t)
        story.append(Spacer(1, 2.5 * mm))

    story.append(PageBreak())

    # =========================================================================
    # PÁGINA 5: ARQUÉTIPO 3 (PRACTICE WORKBOOK • 3. LISTEN & ANSWER • PARTE 1 • FONTE 13.5pt)
    # =========================================================================
    story.append(Paragraph("3. Listen & Answer (LA) • Parte 1", style_h1))
    story.append(Paragraph("Arena de Reflexo & Velocidade de Resposta no Diálogo (Perguntas 1 a 7)", style_h2))
    story.append(Spacer(1, 2.5 * mm))

    story.append(Table([
        [Paragraph("<b>[  ] PASSO 1:</b> Ouça a pergunta na gravação • <b>[  ] PASSO 2:</b> Responda em voz alta na micro-pausa • <b>[  ] PASSO 3:</b> Escreva sua resposta abaixo", style_wb_checklist)]
    ], colWidths=[180 * mm], style=[
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FDF4")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#86EFAC")),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(Spacer(1, 3 * mm))

    questions_p5 = [
        "1. What day of the week is it?",
        "2. What season of the year is it?",
        "3. What is the weather like in Brasília?",
        "4. Does Grazi wake up late on Saturdays?",
        "5. Where does Grazi go to make breakfast?",
        "6. How does Grazi like her coffee?",
        "7. What does she make to eat for breakfast?"
    ]

    for q in questions_p5:
        q_table = Table([
            [Paragraph(q, style_q_text)],
            [Paragraph("↳ Resposta: __________________________________________________________________________", style_q_ans_line)]
        ], colWidths=[180 * mm])
        q_table.setStyle(TableStyle([
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ]))
        story.append(q_table)
        story.append(Spacer(1, 3 * mm))

    story.append(Spacer(1, 2 * mm))
    story.append(Table([
        [Paragraph("“", ParagraphStyle('LargeQuote', fontName='Helvetica-Bold', fontSize=32, leading=20, textColor=C_BLUE_ACCENT)),
         Paragraph("<b>Zero obrigação de falar bonito ou longo:</b> Responda curto, direto e rápido. O que vale é a velocidade de reflexo antes do áudio revelar a resposta!", style_quote)]
    ], colWidths=[12 * mm, 168 * mm], style=[
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(PageBreak())

    # =========================================================================
    # PÁGINA 6: ARQUÉTIPO 3 (PRACTICE WORKBOOK • 3. LA PARTE 2 & 4. LOOK & RETELL • FONTE 13.5pt)
    # =========================================================================
    story.append(Paragraph("3. Listen & Answer (LA) • Parte 2 & 4. Look & Retell (LRT)", style_h1))
    story.append(Paragraph("Perguntas 8 a 14 de Reflexo + Palco de Speaking Ativo & O Teste do Gringo", style_h2))
    story.append(Spacer(1, 2.5 * mm))

    questions_p6 = [
        "8. What does she pick up out of the fridge?",
        "9. What does she put on the table to set it up for breakfast?",
        "10. Where are Anna and Flavia at 8:00 AM?",
        "11. Why does Grazi go back upstairs?",
        "12. What does Grazi yell to the girls when knocking on their doors?",
        "13. What does Grazi pick up before running out the door?",
        "14. In your opinion: where in the world is Tom?"
    ]

    for q in questions_p6:
        q_table = Table([
            [Paragraph(q, style_q_text)],
            [Paragraph("↳ Resposta: __________________________________________________________________________", style_q_ans_line)]
        ], colWidths=[180 * mm])
        q_table.setStyle(TableStyle([
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ]))
        story.append(q_table)
        story.append(Spacer(1, 3 * mm))

    story.append(Spacer(1, 2 * mm))
    story.append(Table([
        [Paragraph("<b>🎙️ ETAPA 4: LOOK & RETELL + AI SPEECH COACH (O TESTE DO GRINGO)</b><br/>Use as 14 perguntas acima como seu roteiro visual para recontar a manhã da Grazi com o seu inglês no Agora. Abra o Training Player, aperte o microfone radiante e grave seu áudio para receber a nota de compreensibilidade comunicativa (0 a 10).", style_quote)]
    ], colWidths=[180 * mm], style=[
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEF2F2")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#FECACA")),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(PageBreak())

    # =========================================================================
    # PÁGINA 7: ARQUÉTIPO 3 (PRACTICE WORKBOOK • 5. LISTEN & ASK • FONTE 13.5pt)
    # REGRA CANÔNICA: NÃO MOSTRAR AS PERGUNTAS (ESTÍMULO + LINHA DE FORMULAÇÃO)
    # =========================================================================
    story.append(Paragraph("5. Listen & Ask (LASK)", style_h1))
    story.append(Paragraph("O Desafio de Formulação Rápida de Perguntas • Lidere a Conversa (Sem Perguntas Reveladas)", style_h2))
    story.append(Spacer(1, 2.5 * mm))

    story.append(Table([
        [Paragraph("<b>[  ] MECÂNICA DE TREINO:</b> Ouça a frase de provocação na gravação ➔ Formule imediatamente a pergunta correspondente no reflexo antes do áudio responder ➔ Use o espaço ao lado para praticar.", style_wb_checklist)]
    ], colWidths=[180 * mm], style=[
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EEF2FF")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#C7D2FE")),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(Spacer(1, 3.5 * mm))

    lask_data = [
        [Paragraph("<b>Frase Estímulo (Ouça a Afirmação / Negação)</b>", style_lask_th), Paragraph("<b>Sua Pergunta Formulada (Treino Ativo no Reflexo)</b>", style_lask_th)],
        [Paragraph("1. It is not Sunday morning.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("2. It is not summer or winter.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("3. The weather is not terrible.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("4. Grazi does not wake up late.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("5. She does not stay upstairs.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("6. She does not like milk in her coffee.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("7. She does not make pancakes.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("8. She does not leave the juice outside.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("9. The girls are not in the kitchen.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("10. She does not whisper to the girls.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("11. Grazi is not going to sleep.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("12. Tom is not at the breakfast table.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)]
    ]

    table_lask = Table(lask_data, colWidths=[90 * mm, 90 * mm])
    table_lask.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('GRID', (0,0), (-1,-1), 0.8, colors.HexColor("#CBD5E1")),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
        ('TOPPADDING', (0,0), (-1,-1), 5.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(table_lask)
    story.append(PageBreak())

    # =========================================================================
    # PÁGINA 8: ARQUÉTIPO 3 (PRACTICE WORKBOOK • 6. PRONUNCIATION & SACADA DE OURO)
    # REGRA CANÔNICA: TEXTO COMPLETO DO LR COM CONNECTED SPEECH + LOOP DRILL + SACADA DE OURO
    # =========================================================================
    story.append(Paragraph("6. Pronunciation & Connected Speech (PRO)", style_h1))
    story.append(Paragraph("Texto Integral da História com Conexões Sonoras & A Sacada de Ouro", style_h2))
    story.append(Spacer(1, 2 * mm))

    # Bloco 1: Texto Integral de Listen & Read com marcações de Connected Speech
    style_pro_story = ParagraphStyle(
        'ProStoryText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.0,
        leading=14.5,
        textColor=C_NAVY_TEXT
    )

    story_connected_markup = (
        "• It's a beautiful Saturday morning in Brasília.<br/>"
        "• It's <font color='#1A56DB'><b>the beginning_of</b></font> the fall and the weather is really nice. It's <font color='#1A56DB'><b>not_so</b></font> dry and <font color='#1A56DB'><b>not_so</b></font> hot.<br/>"
        "• Grazi <font color='#1A56DB'><b>wakes_up</b></font> early and <font color='#1A56DB'><b>goes_downstairs</b></font> to the kitchen to <font color='#1A56DB'><b>make_some</b></font> breakfast.<br/>"
        "• She <font color='#1A56DB'><b>makes_some</b></font> coffee. She <font color='#1A56DB'><b>likes_it</b></font> black. She <font color='#1A56DB'><b>makes_some</b></font> <font color='#1A56DB'><b>toasts_and_eggs</b></font>.<br/>"
        "• She <font color='#1A56DB'><b>picks_up</b></font> a <font color='#1A56DB'><b>bottle_of_orange</b></font> juice and a <font color='#1A56DB'><b>carton_of</b></font> milk <font color='#1A56DB'><b>out_of the</b></font> fridge.<br/>"
        "• She <font color='#1A56DB'><b>sets_up</b></font> the table with plates, cups, glasses, <font color='#1A56DB'><b>forks, knives_and_spoons</b></font>.<br/>"
        "• It's 8:00 AM and the <font color='#1A56DB'><b>girls_are</b></font> still in their bedrooms. Are they awake? Are they <font color='#1A56DB'><b>still_asleep</b></font>? Grazi is not sure.<br/>"
        "• Grazi <font color='#1A56DB'><b>goes_back upstairs</b></font>, <font color='#1A56DB'><b>puts_on_her</b></font> running shoes, <font color='#1A56DB'><b>knocks_on</b></font> the doors and yells: <i>\"Breakfast_is ready! I'm going for_a run!\"</i><br/>"
        "• Grazi <font color='#1A56DB'><b>goes_downstairs</b></font>, <font color='#1A56DB'><b>picks_up_her</b></font> water and <font color='#1A56DB'><b>runs_out the</b></font> door. <font color='#1A56DB'><b>Where_in the world_is</b></font> Tom?"
    )

    story.append(Table([
        [Paragraph("<b>TEXTO INTEGRAL DA HISTÓRIA COM CONEXÕES CONSOANTE-VOGAL (LINKING SOUNDS)</b>", style_pro_box_h)],
        [Spacer(1, 0.8 * mm)],
        [Paragraph(story_connected_markup, style_pro_story)]
    ], colWidths=[180 * mm], style=[
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(Spacer(1, 2.5 * mm))

    # Bloco 2: Chave Fonética & Treino de Loop
    story.append(Table([
        [Paragraph("<b>CHAVE FONÉTICA DOS PRINCIPAIS LINKINGS & REPETIÇÃO EM LOOP</b>", style_pro_box_h)],
        [Spacer(1, 0.8 * mm)],
        [Paragraph("• <i>'wakes up'</i> -> <font color='#1A56DB'><b>/wêiks âp/</b></font> • <i>'out of the fridge'</i> -> <font color='#1A56DB'><b>/aut-ov dâ fridj/</b></font> • <i>'puts on her'</i> -> <font color='#1A56DB'><b>/puts ôn-er/</b></font> • <i>'runs out the door'</i> -> <font color='#1A56DB'><b>/rânz aut dâ dôr/</b></font><br/>"
                   "• <b>Treino de Loop:</b> No Training Player na aba <b>Pronunciation</b>, use a repetição contínua para travar cada frase até a boca falar conectada sem pensar!", style_pro_box_b)]
    ], colWidths=[180 * mm], style=[
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 4.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4.5),
    ]))
    story.append(Spacer(1, 2.5 * mm))

    # Bloco 3: A Sacada de Ouro do Leo
    story.append(Table([
        [Paragraph("A SACADA DE OURO DO PROFESSOR LEO LEITE", style_sacada_h)],
        [Spacer(1, 0.8 * mm)],
        [Paragraph("<i>\"O vocabulário da rotina da casa ('upstairs', 'downstairs', 'puts on', 'out of') não deve ser traduzido palavra por palavra na sua cabeça. Trate o verbo e a direção como uma única palavra musical: 'wakes-up', 'goes-downstairs', 'runs-out'. Ao treinar no Player repetindo a melodia da história, sua boca molda as conexões sonoras automaticamente. Inglês falado é reflexo mecânico!\"</i>", style_sacada_b)]
    ], colWidths=[180 * mm], style=[
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEF3C7")),
        ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor("#F59E0B")),
        ('LEFTPADDING', (0,0), (-1,-1), 9),
        ('RIGHTPADDING', (0,0), (-1,-1), 9),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))

    doc.build(story, canvasmaker=NumberedCanvas, onFirstPage=draw_cover_background)
    print(f"Livro Oficial MS003 compilado com sucesso em: {output_pdf_path}")
    print(f"Tamanho do PDF: {os.path.getsize(output_pdf_path) // 1024} KB")

if __name__ == '__main__':
    out_pdf = "Material-PDF/MS003_Saturday_Morning_Apostila_Oficial.pdf"
    build_ms003_pdf(out_pdf)
