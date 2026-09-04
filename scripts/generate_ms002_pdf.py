"""
AgoraEuFalo Editorial Prestige Engine - Livro Oficial de Treino MS002 (Tom)
100% Padrão Institucional AgoraEuFalo (Sistema Canônico dos 3 Arquétipos)
Calibrado na faixa de 15 a 17pt para legibilidade e conforto 40+!
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
    canvas_obj.drawString(105 * mm, 175 * mm, "02")

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
        self.drawRightString(195 * mm, 287 * mm, "MÓDULO 02 • TOM: THE WORKAHOLIC CEO")
        
        self.setStrokeColor(C_BORDER_LINE)
        self.setLineWidth(0.6)
        self.line(15 * mm, 284 * mm, 195 * mm, 284 * mm)

        self.line(15 * mm, 14 * mm, 195 * mm, 14 * mm)
        self.setFont("Helvetica", 8)
        self.setFillColor(C_SLATE_MUTED)
        self.drawString(15 * mm, 9.5 * mm, "Professor Leonardo Leite • Suporte Direto: selexenglish@gmail.com")
        self.drawRightString(195 * mm, 9.5 * mm, f"Página {self._pageNumber} de {page_count}")
        self.restoreState()


def build_ms002_pdf(output_pdf_path):
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

    # Deep Dive Explainer Styles (Página 4: 14pt a 16pt)
    style_dive_h = ParagraphStyle('DiveH', fontName='Helvetica-Bold', fontSize=14, leading=17.5, textColor=C_NAVY_TEXT)
    style_dive_p = ParagraphStyle('DiveP', fontName='Helvetica', fontSize=12.5, leading=17, textColor=colors.HexColor("#1E293B"))
    style_dive_ex_h = ParagraphStyle('DiveExH', fontName='Helvetica-Bold', fontSize=12, leading=15, textColor=C_AMBER_TEXT)
    style_dive_ex = ParagraphStyle('DiveEx', fontName='Helvetica', fontSize=12, leading=16, textColor=C_BLUE_DARK)

    # Barras Laterais (Páginas 2 e 3)
    style_tip_h = ParagraphStyle('TipH', fontName='Helvetica-Bold', fontSize=10, leading=12, textColor=C_NAVY_TEXT)
    style_tip_b = ParagraphStyle('TipB', fontName='Helvetica', fontSize=9, leading=13, textColor=colors.HexColor("#334155"))
    style_pastel_b = ParagraphStyle('PastelB', fontName='Helvetica', fontSize=8.5, leading=12, textColor=C_PASTEL_TEXT)

    # Estilos do Workbook (Páginas 5 e 6: 14pt perguntas)
    style_wb_checklist = ParagraphStyle('WB_Check', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=colors.HexColor("#065F46"))
    style_q_text = ParagraphStyle('Q_Text', fontName='Helvetica-Bold', fontSize=13.5, leading=17, textColor=C_NAVY_TEXT)
    style_q_ans_line = ParagraphStyle('Q_AnsLine', fontName='Helvetica', fontSize=10.5, leading=14, textColor=colors.HexColor("#94A3B8"))
    style_quote = ParagraphStyle('Quote', fontName='Helvetica-BoldOblique', fontSize=12, leading=16, textColor=C_NAVY_TEXT)

    # Estilos de Tabela LASK (Página 7: 13.5pt)
    style_lask_th = ParagraphStyle('LASK_TH', fontName='Helvetica-Bold', fontSize=13.5, leading=16, textColor=C_NAVY_TEXT)
    style_lask_stim = ParagraphStyle('LASK_Stim', fontName='Helvetica', fontSize=13, leading=16.5, textColor=colors.HexColor("#334155"))
    style_lask_q = ParagraphStyle('LASK_Q', fontName='Helvetica-Bold', fontSize=13.5, leading=17, textColor=C_NAVY_TEXT)

    # Estilos de Pronúncia & Sacada (Página 8: 13.5pt a 15pt)
    style_pro_box_h = ParagraphStyle('PRO_BoxH', fontName='Helvetica-Bold', fontSize=13.5, leading=16.5, textColor=C_NAVY_TEXT)
    style_pro_box_b = ParagraphStyle('PRO_BoxB', fontName='Helvetica', fontSize=12.5, leading=17, textColor=colors.HexColor("#1E293B"))
    style_sacada_h = ParagraphStyle('SacadaH', fontName='Helvetica-Bold', fontSize=14, leading=17, textColor=C_AMBER_TEXT)
    style_sacada_b = ParagraphStyle('SacadaB', fontName='Helvetica-Oblique', fontSize=13, leading=18.5, textColor=colors.HexColor("#451A03"))

    story = []

    # =========================================================================
    # PÁGINA 1: ARQUÉTIPO 1 (CAPA DEEP NAVY • MODULE DIVIDER)
    # =========================================================================
    story.append(Spacer(1, 15 * mm))
    story.append(Paragraph("MÓDULO 02 • SÉRIE MAGIC STORIES LEGACY", style_cover_badge))
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph("Tom: The Workaholic CEO", style_cover_title))
    story.append(Spacer(1, 1.5 * mm))
    story.append(Paragraph("A História do Tom, Workaholics e o Segredo do Present Perfect Sem Regras", style_cover_sub))
    story.append(Spacer(1, 6 * mm))

    cover_art_path = "assets/images/cover-tom-session02.jpg"
    img_element = RLImage(cover_art_path, width=72 * mm, height=72 * mm) if os.path.exists(cover_art_path) else Paragraph("ARTE 1:1 TOM", style_cover_sub)

    meta_content = [
        Paragraph("FICHA TÉCNICA DO MÓDULO", style_cover_meta_h),
        Spacer(1, 1.5 * mm),
        Paragraph("<b>Nível Recomendado:</b> Intermediário / Conversação Ativa", style_cover_meta_b),
        Paragraph("<b>Tempo de Treino:</b> 35 a 45 minutos diários", style_cover_meta_b),
        Paragraph("<b>Foco Principal:</b> Present Perfect Contínuo (<i>have been married</i>) & Rotina de CEO", style_cover_meta_b),
        Paragraph("<b>Duração dos Áudios:</b> 28 minutos de imersão completa", style_cover_meta_b),
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
            "<i>\"Neste segundo módulo, conhecemos o Tom — um executivo de 50 anos de Cleveland, Ohio, que é CEO de uma farmacêutica multinacional em Brasília. Ele é casado com a Grazi há 18 anos, ama as filhas, mas vive o dilema de ser um autêntico workaholic. Através da história do Tom, seus ouvidos vão absorver a estrutura 'they have been married for 18 years' de forma natural e espontânea, sem que você precise decorar nenhuma regra de gramática. Repita a história até o diálogo virar reflexo!\"</i>",
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

    story.append(Paragraph("Acesse o Training Player Online: <b>agoraeufalo.com.br/player.html?track=andre_tom</b> • Suporte: <b>selexenglish@gmail.com</b>", style_cover_footer))
    story.append(PageBreak())

    # =========================================================================
    # PÁGINA 2: ARQUÉTIPO 2 (CONTENT & INSIGHTS • 1. LISTEN & READ • FONTE 16.5pt)
    # =========================================================================
    p2_main = [
        Paragraph("1. Listen & Read (LR)", style_h1),
        Paragraph("Imersão Sonora Pura • Foco nos Ouvidos", style_h2),
        Spacer(1, 4 * mm),
        Paragraph("Grazi is married to Tom.", style_story_lr),
        Spacer(1, 3.5 * mm),
        Paragraph("Tom is a 50-year-old business administrator from Cleveland, Ohio. He is the Chief Executive Officer of a multinational pharmaceutical company based in Brasília.", style_story_lr),
        Spacer(1, 3.5 * mm),
        Paragraph("Tom is a great guy. Very friendly and easygoing. But Tom is a workaholic. He works many hours a week and sometimes on weekends.", style_story_lr),
        Spacer(1, 3.5 * mm),
        Paragraph("Grazi and Tom have been married for 18 years. Yes, they both speak English and Portuguese.", style_story_lr),
        Spacer(1, 3.5 * mm),
        Paragraph("He travels a lot. He has to fly to USA and stay there for about a week every single month. He is a very important executive for the company with a lot of responsibilities.", style_story_lr),
        Spacer(1, 3.5 * mm),
        Paragraph("Tom loves his daughters and he tries to be the best father he can be. But he doesn't get to see them very often. He is always very busy.", style_story_lr),
        Spacer(1, 3.5 * mm),
        Paragraph("<b>The question, my friend, is: what does Grazi think of that?</b>", style_story_lr),
    ]

    p2_sidebar = [
        Spacer(1, 8 * mm),
        Table([[get_lightbulb_icon(), Paragraph("QUICK TIPS DO LEO", style_tip_h)]], colWidths=[6 * mm, 46 * mm]),
        Spacer(1, 2 * mm),
        Paragraph("<b>Três Informações em Uma:</b> Veja como o inglês condensa idade, profissão e origem em uma só melodia:<br/><i>'a 50-year-old business administrator from Cleveland'</i>.", style_tip_b),
        Spacer(1, 5 * mm),
        Table([[get_clock_icon(), Paragraph("ACÚMULO DE ESCUTA", style_tip_h)]], colWidths=[6 * mm, 46 * mm]),
        Spacer(1, 2 * mm),
        Paragraph("A fala é consequência tardia do excesso de escuta. Ouça esta história de 5 a 10 vezes antes de avançar para as perguntas.", style_tip_b),
        Spacer(1, 5 * mm),
        Table([[get_star_icon(), Paragraph("FOCO EM CHUNKS", style_tip_h)]], colWidths=[6 * mm, 46 * mm]),
        Spacer(1, 2 * mm),
        Paragraph("Observe a melodia contínua de <i>'have been married for 18 years'</i>. O cérebro grava blocos sonoros inteiros.", style_tip_b),
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
        Paragraph("Grazi is married to Tom.", style_story_voc),
        Paragraph("↳ A Grazi é casada com o Tom.", style_trans_voc),
        Spacer(1, 2.5 * mm),
        Paragraph("Tom is a 50-year-old business administrator from Cleveland, Ohio. He is the Chief Executive Officer of a multinational pharmaceutical company based in Brasília.", style_story_voc),
        Paragraph("↳ O Tom é um administrador de empresas de 50 anos, de Cleveland, Ohio. Ele é o CEO de uma farmacêutica multinacional sediada em Brasília.", style_trans_voc),
        Spacer(1, 2.5 * mm),
        Paragraph("Tom is a great guy. Very friendly and easygoing. But Tom is a workaholic. He works many hours a week and sometimes on weekends.", style_story_voc),
        Paragraph("↳ O Tom é um cara fantástico. Super amigável e tranquilo. Mas o Tom é um workaholic. Trabalha muitas horas por semana e às vezes nos fins de semana.", style_trans_voc),
        Spacer(1, 2.5 * mm),
        Paragraph("Grazi and Tom have been married for 18 years. Yes, they both speak English and Portuguese.", style_story_voc),
        Paragraph("↳ A Grazi e o Tom estão casados há 18 anos. Sim, os dois falam inglês e português.", style_trans_voc),
        Spacer(1, 2.5 * mm),
        Paragraph("He travels a lot. He has to fly to USA and stay there for about a week every single month. He is a very important executive for the company with a lot of responsibilities.", style_story_voc),
        Paragraph("↳ Ele viaja muito. Tem que voar para os EUA e ficar lá por cerca de uma semana todo santo mês. Ele é um executivo muito importante da empresa, com muitas responsabilidades.", style_trans_voc),
        Spacer(1, 2.5 * mm),
        Paragraph("Tom loves his daughters and he tries to be the best father he can be. But he doesn't get to see them very often. He is always very busy.", style_story_voc),
        Paragraph("↳ O Tom ama as filhas e tenta ser o melhor pai que pode. Mas não consegue vê-las com muita frequência. Está sempre super ocupado.", style_trans_voc)
    ]

    p3_sidebar = [
        Spacer(1, 6 * mm),
        Table([[get_star_icon(), Paragraph("CHUNKS ACÚSTICOS", style_tip_h)]], colWidths=[6 * mm, 46 * mm]),
        Spacer(1, 1.5 * mm),
        Paragraph("<b>a 50-year-old business administrator:</b> Bloco rítmico contínuo sem pausas no hífen.", style_tip_b),
        Spacer(1, 3 * mm),
        Paragraph("<b>Chief Executive Officer (CEO):</b> O cargo máximo de diretoria executiva.", style_tip_b),
        Spacer(1, 3 * mm),
        Paragraph("<b>have been married for:</b> Estão casados há (tempo decorrido contínuo).", style_tip_b),
        Spacer(1, 3 * mm),
        Paragraph("<b>every single month:</b> Todo santo mês (ênfase na constância).", style_tip_b),
        Spacer(1, 3 * mm),
        Paragraph("<b>doesn't get to see them:</b> Não tem a oportunidade de vê-las.", style_tip_b),
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
    # PÁGINA 4: ARQUÉTIPO 2 (VOCABULARY SESSION • PARTE 2 • DEEP DIVE • FONTE 12.5-14pt)
    # =========================================================================
    story.append(Paragraph("2. Vocabulary Session (VOC) • Parte 2: Deep Dive do Leo", style_h1))
    story.append(Paragraph("Curiosidades Linguísticas, O Sentimento da Estrutura & Aplicação Prática", style_h2))
    story.append(Spacer(1, 3.5 * mm))

    dive_cards = [
        ("1. O Sentimento da Estrutura: 'Have been married for 18 years'",
         "O brasileiro aprende que 'have' é 'ter', e quando ouve <i>'They have been married'</i>, o cérebro trava tentando traduzir 'eles têm sido casados'. <b>Esqueça essa tradução mental!</b><br/>Para o nativo, o <i>have been</i> funciona como uma <b>ponte temporal contínua</b>: uma linha de acontecimento que começou lá atrás (18 anos atrás) e continua viva e pulsando no Agora. É exatamente o nosso 'estão casados há 18 anos'.",
         "• 'I have lived in Brasília for 10 years.' (Moro em Brasília há 10 anos.)<br/>• 'How long have you been an engineer?' (Há quanto tempo você é engenheiro?)"),

        ("2. O Bloco Adjetivo de Idade: 'A 50-year-old business administrator'",
         "Em inglês, quando a idade vem <b>antes</b> do substantivo, ela funciona como uma qualidade descritiva (adjetivo) e <b>nunca vai para o plural</b>! Não existe 'a 50-years-old man'. É sempre no singular, conectado com hífens no ritmo falado de bloco único.",
         "• 'A 10-dollar bill' (Uma nota de 10 dólares) • 'A 2-hour flight' (Um voo de 2 horas)<br/>• 'A 3-week vacation' (Umas férias de 3 semanas)"),

        ("3. A Expressão do Dia a Dia: 'He doesn't get to see them very often'",
         "A expressão <i>get to</i> carrega o sentimento de 'ter a oportunidade', 'conseguir' ou 'ter o privilégio'. Quando o Tom diz que <i>doesn't get to see them</i>, significa que a rotina pesada o impede de curtir as filhas o quanto ele gostaria.",
         "• 'I don't get to travel much on weekends.' (Não consigo/não tenho chance de viajar.)<br/>• 'Did you get to talk to the director?' (Você conseguiu falar com o diretor?)")
    ]

    for title, exp, examples in dive_cards:
        card_content = [
            Paragraph(f"<b>{title}</b>", style_dive_h),
            Spacer(1, 1.5 * mm),
            Paragraph(exp, style_dive_p),
            Spacer(1, 2 * mm),
            Paragraph("💡 Exemplos para Aplicar na Sua Vida:", style_dive_ex_h),
            Spacer(1, 1 * mm),
            Paragraph(examples, style_dive_ex)
        ]
        t = Table([[card_content]], colWidths=[180 * mm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(t)
        story.append(Spacer(1, 3 * mm))

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
        "1. Who is Grazi married to?",
        "2. How old is Tom?",
        "3. What does Tom do for a living?",
        "4. Where is Tom from?",
        "5. Where does Tom work and live?",
        "6. What is Tom like?",
        "7. How much does Tom work?"
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
        "8. How long have Tom and Grazi been married?",
        "9. What languages do they speak?",
        "10. Where does Tom have to go every single month?",
        "11. How long does he have to stay there?",
        "12. Does Tom love his daughters?",
        "13. Does Tom get to see his daughters very often? Why not?",
        "14. In your opinion, what does Grazi think of Tom's busy routine?"
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
        [Paragraph("<b>🎙️ ETAPA 4: LOOK & RETELL + AI SPEECH COACH (O TESTE DO GRINGO)</b><br/>Use as 14 perguntas acima como seu roteiro visual para recontar a história com o seu inglês no Agora. Abra o Training Player, aperte o microfone radiante e grave seu áudio para receber a nota de compreensibilidade comunicativa (0 a 10).", style_quote)]
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
        [Paragraph("1. Grazi is not single.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("2. Tom is not 40 years old.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("3. Tom is not an architect.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("4. Tom is not from New York.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("5. He does not work for a local bank.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("6. They have not been married for 5 years.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("7. They do not speak Spanish.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("8. He does not fly to Europe every month.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("9. He does not stay there for a month.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("10. Tom does not hate his daughters.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)],
        [Paragraph("11. He does not see them all the time.", style_lask_stim), Paragraph("[  ] _________________________________________", style_lask_stim)]
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

    style_pro_story = ParagraphStyle(
        'ProStoryText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.0,
        leading=14.5,
        textColor=C_NAVY_TEXT
    )

    story_connected_markup = (
        "• Grazi is <font color='#1A56DB'><b>married_to</b></font> Tom.<br/>"
        "• Tom is a <font color='#1A56DB'><b>50-year-old</b></font> business administrator from Cleveland, Ohio. He is the <font color='#1A56DB'><b>Chief_Executive_Officer</b></font> of a multinational pharmaceutical company based in Brasília.<br/>"
        "• Tom is a great guy. Very friendly and easygoing. But Tom is a workaholic. He <font color='#1A56DB'><b>works_many</b></font> hours a week and sometimes on weekends.<br/>"
        "• Grazi and Tom <font color='#1A56DB'><b>have_been married</b></font> for 18 years. Yes, they both speak English and Portuguese.<br/>"
        "• He travels a lot. He has to <font color='#1A56DB'><b>fly_to</b></font> USA and stay there for <font color='#1A56DB'><b>about_a week</b></font> every single month. He is a very important executive for the company with a lot of responsibilities.<br/>"
        "• Tom loves his daughters and he <font color='#1A56DB'><b>tries_to be</b></font> the best father he can be. But he <font color='#1A56DB'><b>doesn't get_to see them</b></font> very often. He is always very busy.<br/>"
        "• The question, my friend, is: what does Grazi think of that?"
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
        [Paragraph("• <i>'married to'</i> -> <font color='#1A56DB'><b>/mérid tu/</b></font> • <i>'works for a'</i> -> <font color='#1A56DB'><b>/wêrks fôr-a/</b></font> • <i>'have been married'</i> -> <font color='#1A56DB'><b>/hæv bin mérid/</b></font> • <i>'fly to USA'</i> -> <font color='#1A56DB'><b>/flai tu iu-es-ei/</b></font><br/>"
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
        [Paragraph("<i>\"O Present Perfect 'have been married for 18 years' não é fórmula gramatical para fazer prova de colégio; é uma experiência viva que conecta uma ação iniciada no passado que continua verdadeira no Agora. Não tente traduzir 'have been' ao pé da letra. Absorva a melodia 'they have been married' como um bloco único e use para falar de qualquer coisa na sua vida: 'I have been a doctor for 10 years', 'I have lived here for 5 years'. A fala é consequência da escuta acumulada!\"</i>", style_sacada_b)]
    ], colWidths=[180 * mm], style=[
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEF3C7")),
        ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor("#F59E0B")),
        ('LEFTPADDING', (0,0), (-1,-1), 9),
        ('RIGHTPADDING', (0,0), (-1,-1), 9),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))

    doc.build(story, canvasmaker=NumberedCanvas, onFirstPage=draw_cover_background)
    print(f"Livro Oficial MS002 compilado com sucesso em: {output_pdf_path}")
    print(f"Tamanho do PDF: {os.path.getsize(output_pdf_path) // 1024} KB")

if __name__ == '__main__':
    out_pdf = "Material-PDF/MS002_Tom_workaholic_CEO_Apostila_Oficial.pdf"
    build_ms002_pdf(out_pdf)
