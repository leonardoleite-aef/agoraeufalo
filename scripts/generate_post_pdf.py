"""
AgoraEuFalo Editorial PDF Generator for Blog Posts & Magic Stories
Complies with AgoraEuFalo Design Rules (A4, 15mm margins, clear contrast boxes, page X of Y footer)
"""

import sys
import os
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(15 * mm, 285 * mm, "AgoraEuFalo • Professor Leonardo Leite — Material Didático")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(15 * mm, 282 * mm, 195 * mm, 282 * mm)
            
        # Footer
        footer_text = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(195 * mm, 10 * mm, footer_text)
        self.drawString(15 * mm, 10 * mm, "© 2026 AgoraEuFalo • Todos os direitos reservados.")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(15 * mm, 14 * mm, 195 * mm, 14 * mm)
        self.restoreState()


def create_post_1_pdf():
    pdf_path = "/Users/macbookpro/Desktop/agoraeufalo_site/Material-PDF/como-falar-ingles-com-personalidade.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0A192F'),
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10.5,
        leading=15,
        textColor=colors.HexColor('#475569'),
        spaceAfter=12
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#0A192F'),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=8
    )

    box_text = ParagraphStyle(
        'BoxText',
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#0F172A')
    )

    box_title = ParagraphStyle(
        'BoxTitle',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#78350F')
    )

    story = []

    # Title & Header
    story.append(Paragraph("✨ APOSTILA DIDÁTICA AGORAEUFALO", ParagraphStyle('Badge', fontName='Helvetica-Bold', fontSize=9, textColor=colors.HexColor('#D97706'), spaceAfter=4)))
    story.append(Paragraph("Como Falar Inglês com Personalidade: Chunks e Expressões que Tiram o Tom Robótico", title_style))
    story.append(Paragraph("Prof. Leonardo Leite • 35 anos de sala de aula e vivência real da língua inglesa.", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#F59E0B"), spaceAfter=12))

    # Takeaways Box
    takeaways_html = "<b>KEY TAKEAWAYS • PONTOS CHAVE DESTA AULA:</b><br/><br/>" \
                     "• <b>A Síndrome do Robô:</b> Por que traduzir mentalmente elimina seu humor e espontaneidade.<br/>" \
                     "• <b>Chunks de Transição:</b> Como usar <i>'To be completely honest...'</i> e <i>'Here’s the thing...'</i> para ganhar fluidez.<br/>" \
                     "• <b>Entonação Viva:</b> Como abaixar o tom de voz no final das frases projeta autoridade e elegância."
    
    t_box = Table([[Paragraph(takeaways_html, box_text)]], colWidths=[180 * mm])
    t_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FFFBEB')),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor('#FDE68A')),
        ('PADDING', (0,0), (-1,-1), 10),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    story.append(t_box)
    story.append(Spacer(1, 10))

    # Section 1
    story.append(Paragraph("1. O Segredo da Expressividade em Inglês", h2_style))
    story.append(Paragraph("Em português, você é articulado, tem bom humor e conecta pessoas rapidamente. Mas em inglês, muitos profissionais se sentem limitados a frases básicas como <i>'I think this is good. I agree.'</i> O segredo para quebrar esse tom robótico é treinar <b>Sound Chunks</b> com tempero emocional.", body_style))

    # Story Box
    story_html = "<b>📖 HISTÓRIA DE CONTEXTO: Conversa em Amsterdã</b><br/><br/>" \
                 "<b>Liam:</b> <i>'<b>To be completely honest with you</b>, the board loved the numbers, but <b>here’s the thing:</b> the approval will take longer.'</i><br/>" \
                 "<b>Rodrigo:</b> <i>'<b>I hear you loud and clear.</b> <b>As far as I’m concerned</b>, you’ve already won half the battle.'</i>"
    
    s_box = Table([[Paragraph(story_html, box_text)]], colWidths=[180 * mm])
    s_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(s_box)
    story.append(Spacer(1, 10))

    # Section 2: Chunks Table
    story.append(Paragraph("2. A Matriz dos Chunks de Personalidade", h2_style))
    
    chunks_data = [
        [Paragraph("<b>Chunk em Inglês</b>", box_title), Paragraph("<b>Uso Pedagógico & Tradução no Contexto</b>", box_title)],
        [Paragraph("<i>\"To be completely honest with you...\"</i>", box_text), Paragraph("Para demonstrar franqueza antes de dar uma opinião sincera.", box_text)],
        [Paragraph("<i>\"Here's the thing...\"</i>", box_text), Paragraph("O clássico 'a questão é a seguinte'. Prende a atenção imediata.", box_text)],
        [Paragraph("<i>\"Don't get me wrong, but...\"</i>", box_text), Paragraph("'Não me leve a mal, mas...'. Suaviza críticas e opiniões fortes.", box_text)],
        [Paragraph("<i>\"I hear you loud and clear.\"</i>", box_text), Paragraph("Demonstra escuta ativa e total concordância empática.", box_text)],
        [Paragraph("<i>\"As far as I'm concerned...\"</i>", box_text), Paragraph("'No que me diz respeito / Na minha visão'. Dá autoridade elegante.", box_text)],
        [Paragraph("<i>\"At the end of the day...\"</i>", box_text), Paragraph("O famoso 'no fim das contas'. Resume qualquer discussão com clareza.", box_text)],
    ]
    
    chunks_table = Table(chunks_data, colWidths=[70 * mm, 110 * mm])
    chunks_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#FEF3C7')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#F59E0B')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(chunks_table)
    story.append(Spacer(1, 12))

    # Sacada de Ouro
    golden_html = "<b>👑 SACADA DE OURO DO PROFESSOR LEO:</b><br/>" \
                  "<i>'A entonação é 70% da sua personalidade em inglês. Abaixe o tom suavemente no final do chunk e faça uma micro-pausa de meio segundo. Isso cria expectativa e carisma magnético.'</i>"
    
    g_box = Table([[Paragraph(golden_html, box_text)]], colWidths=[180 * mm])
    g_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEF9C3')),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor('#CA8A04')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(g_box)
    story.append(Spacer(1, 12))

    # CTA Projeto 2026
    cta_html = "<font color='#FFFFFF'><b>🏛️ PROJETO AEF 2026 • PROFESSOR LEONARDO LEITE</b><br/>" \
               "Treine o seu reflexo oral com os 30 Ciclos Magic Stories, Player Interativo Karaokê e Mentorias ao Vivo.<br/>" \
               "<b>Acesse: agoraeufalo.com.br/projeto-aef.html</b></font>"
    
    cta_box = Table([[Paragraph(cta_html, ParagraphStyle('CTA', fontName='Helvetica', fontSize=9, leading=13, textColor=colors.white))]], colWidths=[180 * mm])
    cta_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0A192F')),
        ('PADDING', (0,0), (-1,-1), 10),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    story.append(cta_box)

    doc.build(story, canvasmaker=NumberedCanvas)
    print("✅ PDF 1 gerado:", pdf_path)


def create_post_2_pdf():
    pdf_path = "/Users/macbookpro/Desktop/agoraeufalo_site/Material-PDF/expandindo-seu-vocabulario-em-ingles-sem-esquecer.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle2',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0A192F'),
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle2',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10.5,
        leading=15,
        textColor=colors.HexColor('#475569'),
        spaceAfter=12
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom2',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#0A192F'),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom2',
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=8
    )

    box_text = ParagraphStyle(
        'BoxText2',
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#0F172A')
    )

    box_title = ParagraphStyle(
        'BoxTitle2',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#78350F')
    )

    story = []

    # Title & Header
    story.append(Paragraph("✨ APOSTILA DIDÁTICA AGORAEUFALO", ParagraphStyle('Badge2', fontName='Helvetica-Bold', fontSize=9, textColor=colors.HexColor('#D97706'), spaceAfter=4)))
    story.append(Paragraph("Expandindo Seu Vocabulário Em Inglês: O Segredo dos Chunks", title_style))
    story.append(Paragraph("Prof. Leonardo Leite • Aula Prática de Fixação e Memória Auditiva.", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#F59E0B"), spaceAfter=12))

    # Takeaways Box
    takeaways_html = "<b>KEY TAKEAWAYS • PONTOS CHAVE DESTA AULA:</b><br/><br/>" \
                     "• <b>A Ilusão das Listas:</b> Por que anotar palavras soltas é esquecido em 48 horas.<br/>" \
                     "• <b>Blocos Sonoros (Collocations):</b> Aprender palavras coladas como <i>'run out of time'</i>.<br/>" \
                     "• <b>Fixação por Histórias:</b> O cérebro só retém vocabulário associado a contexto sonoro."
    
    t_box = Table([[Paragraph(takeaways_html, box_text)]], colWidths=[180 * mm])
    t_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FFFBEB')),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor('#FDE68A')),
        ('PADDING', (0,0), (-1,-1), 10),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    story.append(t_box)
    story.append(Spacer(1, 10))

    # Section 1
    story.append(Paragraph("1. O Mecanismo da Memória Auditiva", h2_style))
    story.append(Paragraph("O cérebro adulto apaga informações isoladas sem peso emocional ou acústico. Quando você estuda a palavra <i>'commute'</i> isolada, você a esquece rapidamente. Mas quando repete em voz alta <i>'My daily commute takes 45 minutes'</i>, a frase inteira fica ancorada no reflexo sonoro.", body_style))

    # Section 2: Chunks Table
    story.append(Paragraph("2. Matriz dos Chunks de Vocabulário de Alta Retenção", h2_style))
    
    chunks_data = [
        [Paragraph("<b>Bloco Sonoro</b>", box_title), Paragraph("<b>Significado & Exemplo no Contexto</b>", box_title)],
        [Paragraph("<i>\"Run out of [something]\"</i>", box_text), Paragraph("Ficar sem algo / Acabar o estoque.<br/><i>\"We're running out of time before the deadline.\"</i>", box_text)],
        [Paragraph("<i>\"Keep track of...\"</i>", box_text), Paragraph("Manter o controle / Acompanhar de perto.<br/><i>\"It's hard to keep track of all these expenses.\"</i>", box_text)],
        [Paragraph("<i>\"Come up with...\"</i>", box_text), Paragraph("Ter uma ideia / Elaborar uma solução.<br/><i>\"She came up with a brilliant marketing strategy.\"</i>", box_text)],
        [Paragraph("<i>\"Get rid of...\"</i>", box_text), Paragraph("Livrar-se de algo / Eliminar burocracia.<br/><i>\"We need to get rid of unnecessary paperwork.\"</i>", box_text)],
    ]
    
    chunks_table = Table(chunks_data, colWidths=[65 * mm, 115 * mm])
    chunks_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#FEF3C7')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#F59E0B')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(chunks_table)
    story.append(Spacer(1, 12))

    # Sacada de Ouro
    golden_html = "<b>👑 SACADA DE OURO DO PROFESSOR LEO:</b><br/>" \
                  "<i>'Você não fala palavras; você fala blocos acústicos inteiros. Treine o ouvido para capturar a música da frase e a sua língua reproduzirá no reflexo imediato sem tradução mental.'</i>"
    
    g_box = Table([[Paragraph(golden_html, box_text)]], colWidths=[180 * mm])
    g_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEF9C3')),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor('#CA8A04')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(g_box)
    story.append(Spacer(1, 12))

    # CTA Projeto 2026
    cta_html = "<font color='#FFFFFF'><b>🏛️ PROJETO AEF 2026 • PROFESSOR LEONARDO LEITE</b><br/>" \
               "Aprenda inglês com experiência viva e repetição sonora da mesma história até a fala virar reflexo.<br/>" \
               "<b>Acesse: agoraeufalo.com.br/projeto-aef.html</b></font>"
    
    cta_box = Table([[Paragraph(cta_html, ParagraphStyle('CTA2', fontName='Helvetica', fontSize=9, leading=13, textColor=colors.white))]], colWidths=[180 * mm])
    cta_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0A192F')),
        ('PADDING', (0,0), (-1,-1), 10),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    story.append(cta_box)

    doc.build(story, canvasmaker=NumberedCanvas)
    print("✅ PDF 2 gerado:", pdf_path)

if __name__ == "__main__":
    create_post_1_pdf()
    create_post_2_pdf()
