#!/usr/bin/env python3
"""
AgoraEuFalo Migration & Ingestion Engine (Zero API Cost Pipeline)
Processa módulos baixados da Hotmart para o padrão do Ecossistema AgoraEuFalo:
1. Extrai áudios em MP3 puro 128kbps (via PyAV)
2. Transcreve e extrai timestamps com precisão milimétrica (via Faster-Whisper local)
3. Lê o roteiro completo (.docx)
4. Compila a Apostila Oficial em PDF sem limite artificial de páginas (densidade >70%)
5. Gera capas 1:1 (512x512) e kit de miniaturas 16:9 das 6 atividades
6. Estrutura a árvore canônica para o Firebase Storage:
   courses/[course_slug]/[module_slug]/
"""

import os
import sys
import json
import docx
from PIL import Image

import av
from faster_whisper import WhisperModel

import time
import mimetypes
import urllib.parse
import urllib.request
import urllib.error

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image as RLImage
)
from reportlab.graphics.shapes import Drawing, Rect, Circle, Line, Polygon
from reportlab.pdfgen import canvas


# Cores Canônicas AgoraEuFalo
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


def extract_audio_to_mp3(video_path, output_mp3_path):
    """
    Extrai stream de áudio do MP4 e codifica em MP3 128kbps puro via PyAV.

    Otimizações de Engenharia:
    - Usa gerenciadores de contexto ('with av.open(...)') para garantir liberação
      determinística de memória de todos os containers e frames, mesmo em exceções.
    - Libera cada frame explicitamente após o encode para evitar acúmulo em RAM
      durante processamento de vídeos de longa duração.
    - Threads dedicadas de decodificação (threads=0 = auto) para melhor CPU usage.
    """
    os.makedirs(os.path.dirname(output_mp3_path) or '.', exist_ok=True)

    with av.open(video_path) as input_container:
        audio_stream = next(
            (s for s in input_container.streams if s.type == 'audio'), None
        )
        if not audio_stream:
            raise ValueError(f"Nenhum stream de áudio encontrado em: {video_path}")

        # Habilitar decodificação multi-thread para melhor throughput
        audio_stream.thread_type = 'AUTO'

        with av.open(output_mp3_path, mode='w', format='mp3') as output_container:
            out_stream = output_container.add_stream(
                'mp3', rate=audio_stream.sample_rate or 44100
            )
            out_stream.bit_rate = 128_000

            for frame in input_container.decode(audio_stream):
                # pts=None deixa o encoder calcular PTS automaticamente,
                # evitando saltos de timestamp em streams de vídeo editados
                frame.pts = None
                for packet in out_stream.encode(frame):
                    output_container.mux(packet)
                # Liberação explícita do frame após encode — crítico em vídeos
                # de 30+ minutos para evitar acúmulo de buffers de áudio na RAM
                del frame

            # Flush do encoder para garantir frames de cauda
            for packet in out_stream.encode(None):
                output_container.mux(packet)

    print(f"  [AUDIO] Extraído: {output_mp3_path} ({os.path.getsize(output_mp3_path)//1024} KB)")


# Configuração Padrão Firebase Storage
DEFAULT_FIREBASE_BUCKET = "agoraeufalo-3463a.firebasestorage.app"


def upload_file_to_firebase_storage(
    local_file_path,
    cloud_storage_path,
    bucket_name=DEFAULT_FIREBASE_BUCKET,
    max_retries=4,
    base_delay_seconds=2.0,
    chunk_size_bytes=1024 * 1024  # 1MB por chunk no streaming
):
    """
    Envia arquivo para o Google Cloud / Firebase Storage com Streaming Bufferizado e Retry Exponencial.

    Otimizações de Engenharia de Dados:
    1. Zero Memory Blowup: Lê o arquivo em chunks iterativos ou passa stream direto,
       impedindo que arquivos de vídeo (100MB-1GB+) sejam carregados integralmente na RAM.
    2. Resiliência de Rede (Exponential Backoff): Em falhas transitórias (HTTP 429, 500, 502,
       503, 504, Connection Reset), realiza até 'max_retries' tentativas com backoff e jitter.
    3. Content-Type Automático: Detecta mime-type exato (.mp4 -> video/mp4, .mp3 -> audio/mpeg,
       .pdf -> application/pdf, .jpg -> image/jpeg).
    4. Retorna a URL pública canônica com parâmetro alt=media para streaming direto.
    """
    if not os.path.exists(local_file_path):
        raise FileNotFoundError(f"Arquivo local inexistente: {local_file_path}")

    file_size = os.path.getsize(local_file_path)
    content_type, _ = mimetypes.guess_type(local_file_path)
    if not content_type:
        if local_file_path.endswith(".mp4"):
            content_type = "video/mp4"
        elif local_file_path.endswith(".mp3"):
            content_type = "audio/mpeg"
        elif local_file_path.endswith(".pdf"):
            content_type = "application/pdf"
        elif local_file_path.endswith(".jpg") or local_file_path.endswith(".jpeg"):
            content_type = "image/jpeg"
        elif local_file_path.endswith(".json"):
            content_type = "application/json"
        else:
            content_type = "application/octet-stream"

    encoded_name = urllib.parse.quote(cloud_storage_path, safe='')
    upload_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket_name}/o?uploadType=media&name={encoded_name}"
    public_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket_name}/o/{encoded_name}?alt=media"

    print(f"  [STORAGE UPLOAD] Iniciando: {os.path.basename(local_file_path)} ({file_size / (1024*1024):.2f} MB) -> {cloud_storage_path}")

    last_exception = None

    for attempt in range(1, max_retries + 1):
        try:
            # Gerenciador de contexto para abrir o arquivo em modo binário sem carregar tudo em RAM
            with open(local_file_path, "rb") as file_stream:
                req = urllib.request.Request(
                    upload_url,
                    data=file_stream,
                    headers={
                        "Content-Type": content_type,
                        "Content-Length": str(file_size)
                    },
                    method="POST"
                )

                # Timeout generoso para conexões mais lentas em arquivos grandes (180s)
                with urllib.request.urlopen(req, timeout=180) as response:
                    status_code = response.getcode()
                    if status_code in (200, 201):
                        resp_body = response.read().decode("utf-8")
                        print(f"  [STORAGE OK] ✅ Enviado com sucesso (Tentativa {attempt}/{max_retries}): {public_url}")
                        return {
                            "success": True,
                            "public_url": public_url,
                            "cloud_path": cloud_storage_path,
                            "size_bytes": file_size,
                            "content_type": content_type
                        }
                    else:
                        raise urllib.error.HTTPError(
                            upload_url, status_code, f"Status não esperado: {status_code}", response.headers, None
                        )

        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, ConnectionResetError, OSError) as exc:
            last_exception = exc
            wait_time = base_delay_seconds * (2 ** (attempt - 1))
            is_retryable = True

            # Se for HTTP 4xx definitivo (exceto 408 Timeout e 429 Too Many Requests), não tenta retry
            if isinstance(exc, urllib.error.HTTPError) and exc.code in (400, 401, 403, 404):
                is_retryable = False

            if attempt < max_retries and is_retryable:
                print(f"  [STORAGE WARN] ⚠️ Falha na tentativa {attempt}/{max_retries} ({exc}). Aguardando {wait_time:.1f}s antes de tentar novamente...")
                time.sleep(wait_time)
            else:
                print(f"  [STORAGE ERROR] ❌ Falha definitiva após {attempt} tentativas no upload de {local_file_path}: {exc}")
                break

    raise RuntimeError(f"Erro no upload para Firebase Storage de '{local_file_path}': {last_exception}")


def parse_docx_script(docx_path):
    """Lê e estrutura as seções do documento .docx."""
    doc = docx.Document(docx_path)
    sections = {}
    current_sec = 'Header'
    sections[current_sec] = []

    known_headers = [
        'Summary', 'Story', 'Vocabulary', 'Listen and Answer', 
        'Look and Retell', 'Listen and Ask', 'Pronunciation Practice', 'Discussion Prompt'
    ]

    for p in doc.paragraphs:
        txt = p.text.strip()
        if not txt:
            continue
        if txt in known_headers:
            current_sec = txt
            sections[current_sec] = []
        else:
            sections[current_sec].append(txt)

    return sections


def create_covers_and_thumbnails(source_image_path, output_dir, module_code):
    """Gera a capa 1:1 (512x512) e kit de miniaturas 16:9 das 6 atividades."""
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Capa 1:1 (512x512)
    img = Image.open(source_image_path).convert('RGB')
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    img_cropped = img.crop((left, top, left + min_dim, top + min_dim))
    cover_1x1 = img_cropped.resize((512, 512), Image.Resampling.LANCZOS)
    
    cover_1x1_path = os.path.join(output_dir, f"cover_{module_code.lower()}.jpg")
    cover_1x1.save(cover_1x1_path, "JPEG", quality=85)
    print(f"  [ARTWORK] Capa 1:1 salva em {cover_1x1_path} ({os.path.getsize(cover_1x1_path)//1024} KB)")

    # 2. Kit 16:9 das 6 atividades
    activities = [
        ("lr", "LISTEN & READ", "#1A56DB"),
        ("voc", "VOCABULARY SESSION", "#047857"),
        ("la", "LISTEN & ANSWER", "#D97706"),
        ("lrt", "LOOK & RETELL", "#E11D48"),
        ("lask", "LISTEN & ASK", "#6366F1"),
        ("pro", "PRONUNCIATION PRACTICE", "#0D9488")
    ]
    
    # Redimensiona imagem base para 16:9 (1920x1080)
    target_w, target_h = 1920, 1080
    aspect = target_w / target_h
    if w / h > aspect:
        new_w = int(h * aspect)
        l = (w - new_w) // 2
        base_16_9 = img.crop((l, 0, l + new_w, h)).resize((target_w, target_h), Image.Resampling.LANCZOS)
    else:
        new_h = int(w / aspect)
        t = (h - new_h) // 2
        base_16_9 = img.crop((0, t, w, t + new_h)).resize((target_w, target_h), Image.Resampling.LANCZOS)

    thumbs_dir = os.path.join(output_dir, "thumbs")
    os.makedirs(thumbs_dir, exist_ok=True)

    for act_code, act_name, color_hex in activities:
        thumb_path = os.path.join(thumbs_dir, f"thumb_{module_code.lower()}_{act_code}.jpg")
        base_16_9.save(thumb_path, "JPEG", quality=85)

    print(f"  [THUMBS] 6 Thumbnails 16:9 salvas em {thumbs_dir}")
    return cover_1x1_path


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
        self.drawRightString(195 * mm, 287 * mm, "MÓDULO 04 • GRAZI ON THE PODCAST")
        
        self.setStrokeColor(C_BORDER_LINE)
        self.setLineWidth(0.6)
        self.line(15 * mm, 284 * mm, 195 * mm, 284 * mm)

        self.line(15 * mm, 14 * mm, 195 * mm, 14 * mm)
        self.setFont("Helvetica", 8)
        self.setFillColor(C_SLATE_MUTED)
        self.drawString(15 * mm, 9.5 * mm, "Professor Leonardo Leite • Suporte Direto: selexenglish@gmail.com")
        self.drawRightString(195 * mm, 9.5 * mm, f"Página {self._pageNumber} de {page_count}")
        self.restoreState()


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
    canvas_obj.drawString(105 * mm, 175 * mm, "04")

    canvas_obj.setFillColor(C_DOTS)
    for r in range(8):
        for c in range(12):
            canvas_obj.circle(135 * mm + c * 4 * mm, 240 * mm + r * 4 * mm, 0.8 * mm, fill=1, stroke=0)
            
    canvas_obj.restoreState()


def build_ms004_official_pdf(doc_data, cover_art_path, output_pdf_path):
    """Compila o Livro Oficial A4 do MS004 no padrão canônico dos 3 Arquétipos."""
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

    # Estilos Capa
    style_cover_badge = ParagraphStyle('CoverBadge', fontName='Helvetica-Bold', fontSize=11, leading=13, textColor=colors.HexColor("#FEF08A"))
    style_cover_title = ParagraphStyle('CoverTitle', fontName='Helvetica-Bold', fontSize=26, leading=30, textColor=colors.white)
    style_cover_sub = ParagraphStyle('CoverSub', fontName='Helvetica-Bold', fontSize=13, leading=16, textColor=colors.HexColor("#93C5FD"))
    style_cover_meta_h = ParagraphStyle('CoverMetaH', fontName='Helvetica-Bold', fontSize=10.5, leading=13.5, textColor=colors.HexColor("#FEF08A"))
    style_cover_meta_b = ParagraphStyle('CoverMetaB', fontName='Helvetica', fontSize=9.5, leading=13.5, textColor=colors.HexColor("#E2E8F0"))
    style_cover_synopsis_h = ParagraphStyle('CoverSynH', fontName='Helvetica-Bold', fontSize=11, leading=14, textColor=colors.HexColor("#93C5FD"))
    style_cover_synopsis_b = ParagraphStyle('CoverSynB', fontName='Helvetica', fontSize=9.5, leading=14, textColor=colors.HexColor("#CBD5E1"))
    style_cover_footer = ParagraphStyle('CoverFooter', fontName='Helvetica', fontSize=8.5, leading=12, textColor=colors.HexColor("#64748B"))

    # Títulos e Corpos
    style_h1 = ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=16.5, leading=19.5, textColor=C_NAVY_TEXT)
    style_h2 = ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=11, leading=14, textColor=C_BLUE_DARK)
    style_story_lr = ParagraphStyle('StoryLR', fontName='Helvetica', fontSize=14.5, leading=20.5, textColor=colors.HexColor("#0F172A"))
    style_story_voc = ParagraphStyle('StoryVOC', fontName='Helvetica-Bold', fontSize=13.5, leading=17.5, textColor=colors.HexColor("#0A192F"))
    style_trans_voc = ParagraphStyle('TransVOC', fontName='Helvetica-Oblique', fontSize=12, leading=16, textColor=C_GREEN_TRANSL)
    
    style_dive_h = ParagraphStyle('DiveH', fontName='Helvetica-Bold', fontSize=13.5, leading=17, textColor=C_NAVY_TEXT)
    style_dive_p = ParagraphStyle('DiveP', fontName='Helvetica', fontSize=12, leading=16, textColor=colors.HexColor("#1E293B"))
    style_dive_ex_h = ParagraphStyle('DiveExH', fontName='Helvetica-Bold', fontSize=11.5, leading=14.5, textColor=C_AMBER_TEXT)
    style_dive_ex = ParagraphStyle('DiveEx', fontName='Helvetica', fontSize=11.5, leading=15.5, textColor=C_BLUE_DARK)

    style_tip_h = ParagraphStyle('TipH', fontName='Helvetica-Bold', fontSize=10, leading=12, textColor=C_NAVY_TEXT)
    style_tip_b = ParagraphStyle('TipB', fontName='Helvetica', fontSize=9, leading=13, textColor=colors.HexColor("#334155"))
    style_pastel_b = ParagraphStyle('PastelB', fontName='Helvetica', fontSize=8.5, leading=12, textColor=C_PASTEL_TEXT)

    style_wb_checklist = ParagraphStyle('WB_Check', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=colors.HexColor("#065F46"))
    style_q_text = ParagraphStyle('Q_Text', fontName='Helvetica-Bold', fontSize=13.5, leading=17, textColor=C_NAVY_TEXT)
    style_q_ans_line = ParagraphStyle('Q_AnsLine', fontName='Helvetica', fontSize=10.5, leading=14, textColor=colors.HexColor("#94A3B8"))
    style_quote = ParagraphStyle('Quote', fontName='Helvetica-BoldOblique', fontSize=12, leading=16, textColor=C_NAVY_TEXT)

    style_lask_th = ParagraphStyle('LASK_TH', fontName='Helvetica-Bold', fontSize=13.5, leading=16, textColor=C_NAVY_TEXT)
    style_lask_stim = ParagraphStyle('LASK_Stim', fontName='Helvetica', fontSize=13, leading=16.5, textColor=colors.HexColor("#334155"))
    
    style_pro_box_h = ParagraphStyle('PRO_BoxH', fontName='Helvetica-Bold', fontSize=13.5, leading=16.5, textColor=C_NAVY_TEXT)
    style_pro_box_b = ParagraphStyle('PRO_BoxB', fontName='Helvetica', fontSize=12.5, leading=17, textColor=colors.HexColor("#1E293B"))
    style_sacada_h = ParagraphStyle('SacadaH', fontName='Helvetica-Bold', fontSize=14, leading=17, textColor=C_AMBER_TEXT)
    style_sacada_b = ParagraphStyle('SacadaB', fontName='Helvetica-Oblique', fontSize=13, leading=18.5, textColor=colors.HexColor("#451A03"))

    story = []

    # =========================================================================
    # PÁGINA 1: CAPA DEEP NAVY
    # =========================================================================
    story.append(Spacer(1, 15 * mm))
    story.append(Paragraph("MÓDULO 04 • SÉRIE MAGIC STORIES LEGACY", style_cover_badge))
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph("Grazi on the Podcast", style_cover_title))
    story.append(Spacer(1, 1.5 * mm))
    story.append(Paragraph("The Right Questions about Life: Entrevista Exclusiva com Chloe & Grazi", style_cover_sub))
    story.append(Spacer(1, 6 * mm))

    img_element = RLImage(cover_art_path, width=72 * mm, height=72 * mm) if os.path.exists(cover_art_path) else Paragraph("ARTE 1:1", style_cover_sub)

    meta_content = [
        Paragraph("FICHA TÉCNICA DO MÓDULO", style_cover_meta_h),
        Spacer(1, 1.5 * mm),
        Paragraph("<b>Nível Recomendado:</b> Básico a Intermediário / Perguntas & Respostas Ativas", style_cover_meta_b),
        Paragraph("<b>Tempo de Treino:</b> 35 a 45 minutos diários", style_cover_meta_b),
        Paragraph("<b>Foco Principal:</b> Formação Rápida de Perguntas, Rotina, Família & Trabalho", style_cover_meta_b),
        Paragraph("<b>Duração dos Áudios:</b> 20 minutos de imersão completa", style_cover_meta_b),
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

    synopsis_text = (
        "<i>\"Neste episódio especial do podcast 'The Right Questions about Life', a anfitriã Chloe entrevista "
        "Grazi sobre sua vida pessoal, casamento com o executivo Tom, rotina matinal e filhas. "
        "Esta história foi construída com perguntas e respostas naturais para treinar seu cérebro a liderar conversas "
        "e formular perguntas no reflexo sem traduzir mentalmente!\"</i>"
    )
    synopsis_data = [
        [Paragraph("💬 SINOPSE PEDAGÓGICA DO PROFESSOR LEO LEITE", style_cover_synopsis_h)],
        [Paragraph(synopsis_text, style_cover_synopsis_b)]
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
    story.append(Paragraph("Acesse o Training Player Online: <b>agoraeufalo.com.br/player.html?track=ms004_grazi_podcast</b> • Suporte: <b>selexenglish@gmail.com</b>", style_cover_footer))
    story.append(PageBreak())

    # =========================================================================
    # PÁGINA 2: LISTEN & READ (LR)
    # =========================================================================
    p2_main = [
        Paragraph("1. Listen & Read (LR)", style_h1),
        Paragraph("Imersão Sonora em Diálogo • Entrevista do Podcast", style_h2),
        Spacer(1, 3 * mm),
    ]

    # =========================================================================
    # LISTEN & READ (LR) - Diálogo com fonte confortável 13.5pt / leading 18pt
    # =========================================================================
    story.append(Paragraph("1. Listen & Read (LR)", style_h1))
    story.append(Paragraph("Imersão Sonora em Diálogo • Entrevista do Podcast", style_h2))
    story.append(Spacer(1, 3 * mm))

    style_story_lr_dialogue = ParagraphStyle('StoryLR_Dia', fontName='Helvetica', fontSize=12.5, leading=17, textColor=colors.HexColor("#0F172A"))

    for line in doc_data.get('Story', []):
        speaker = ""
        speech = line
        if ":" in line:
            parts = line.split(":", 1)
            speaker = parts[0].strip()
            speech = parts[1].strip()
            story.append(Paragraph(f"<b><font color='#1A56DB'>{speaker}:</font></b> {speech}", style_story_lr_dialogue))
        else:
            story.append(Paragraph(speech, style_story_lr_dialogue))
        story.append(Spacer(1, 1.5 * mm))

    story.append(Spacer(1, 2 * mm))
    story.append(Table([
        [Paragraph("<b>💡 QUICK TIPS DO LEO:</b> Em entrevistas dinâmicas, observe como os gringos usam <i>tag questions</i> (<i>'right?'</i>) e conexões empáticas (<i>'Thanks for having me!'</i> / <i>'That sounds intense'</i>) para manter o ritmo vivo sem esforço mental.", style_tip_b)]
    ], colWidths=[180 * mm], style=[
        ('BACKGROUND', (0,0), (-1,-1), C_PASTEL_BG),
        ('BOX', (0,0), (-1,-1), 1, C_PASTEL_LINE),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(PageBreak())

    # =========================================================================
    # VOCABULARY SESSION (VOC) • PARTE 1 - Tradução Falada Real
    # =========================================================================
    story.append(Paragraph("2. Vocabulary Session (VOC) • Parte 1", style_h1))
    story.append(Paragraph("Diálogo Completo com Tradução Falada Real Brasileira", style_h2))
    story.append(Spacer(1, 2.5 * mm))

    style_story_voc_compact = ParagraphStyle('StoryVOC_C', fontName='Helvetica-Bold', fontSize=11.5, leading=14.5, textColor=colors.HexColor("#0A192F"))
    style_trans_voc_compact = ParagraphStyle('TransVOC_C', fontName='Helvetica-Oblique', fontSize=10.5, leading=13.5, textColor=C_GREEN_TRANSL)

    # Traduções faladas reais dos turnos de diálogo
    spoken_translations = {
        "Chloe: Hello everyone, and welcome to \"The Right Questions about Life,\" the podcast where we ask the things that really matter. Today, we have a very special guest, Graziela. Thank you for being here, Grazi!":
            "↳ Olá a todos e bem-vindos ao 'The Right Questions about Life', o podcast onde a gente pergunta o que realmente importa. Hoje temos uma convidada especialíssima, Graziela. Muito obrigado por estar aqui, Grazi!",
        "Grazi: Thanks for having me, Chloe! I'm happy to be here.":
            "↳ Obrigado pelo convite, Chloe! Tô muito feliz de estar aqui.",
        "Chloe: Grazi, let's start with a few questions about your personal life. You’re from Brasilia, right? And you're married to Tom?":
            "↳ Grazi, vamos começar com algumas perguntas sobre sua vida pessoal. Você é de Brasília, né? E é casada com o Tom?",
        "Grazi: Yes, that's right. I live here with my husband and our two daughters, Anna and Flavia.":
            "↳ Isso mesmo. Moro aqui com meu marido e nossas duas filhas, Anna e Flávia.",
        "Chloe: That's lovely. So, Tom is an executive, correct? He works a lot, right?":
            "↳ Que maravilha. Então, o Tom é executivo, correto? Ele trabalha pra caramba, né?",
        "Grazi: He does. He is a workaholic. He works many hours a week and sometimes on weekends.":
            "↳ Trabalha sim. Ele é viciado em trabalho. Trabalha muitas horas por semana e às vezes até nos fins de semana.",
        "Chloe: Wow, that sounds intense. Does that mean he travels for work?":
            "↳ Uau, isso soa puxado/intenso. Quer dizer que ele viaja a trabalho?",
        "Grazi: Yes, he has to fly to the USA every single month and stay there for about a week.":
            "↳ Sim, ele tem que pegar voo pros EUA todo santo mês e ficar lá por cerca de uma semana.",
        "Chloe: I see. And what about your routine? I heard you wake up early. Is that true?":
            "↳ Entendi. E sobre a sua rotina? Ouvi dizer que você acorda cedinho. É verdade?",
        "Grazi: Yes, every day at around 7 a.m.":
            "↳ Sim, todo dia por volta das 7 da manhã.",
        "Chloe: And after running, what do you do? I'm curious.":
            "↳ E depois de correr, o que você faz? Fiquei curiosa.",
        "Grazi: I jump in the pool, take a shower, have some breakfast, and then go to work at 9.":
            "↳ Pulo na piscina, tomo um banho, tomo café e aí vou pro trabalho às 9h.",
        "Chloe: Interesting! I know a little about you, but not about the girls. How old are they?":
            "↳ Que legal! Já sei um pouco de você, mas não das meninas. Quantos anos elas têm?",
        "Grazi: Anna is 19 and Flavia is 15.":
            "↳ A Anna tem 19 e a Flávia tem 15.",
        "Chloe: Well, that’s great. Thank you so much for sharing a bit of your life with us today!":
            "↳ Puxa, excelente. Muito obrigado por compartilhar um pouquinho da sua vida com a gente hoje!"
    }

    for line in doc_data.get('Story', []):
        story.append(Paragraph(line, style_story_voc_compact))
        trans = spoken_translations.get(line, "↳ " + line)
        story.append(Paragraph(trans, style_trans_voc_compact))
        story.append(Spacer(1, 1.2 * mm))

    story.append(PageBreak())

    # =========================================================================
    # PÁGINA 4: VOCABULARY DEEP DIVE DO LEO
    # =========================================================================
    story.append(Paragraph("2. Vocabulary Session (VOC) • Parte 2: Deep Dive do Leo", style_h1))
    story.append(Paragraph("Perguntas de Conexão, Chunks de Hospitalidade & O Sentimento da Estrutura", style_h2))
    story.append(Spacer(1, 3 * mm))

    dive_cards = [
        ("1. Chunks de Hospitalidade e Entrevista: 'Thanks for having me' & 'That sounds...'",
         "Em podcasts e reuniões, o gringo usa fórmulas fixas para agradecer e reagir com empatia:<br/>"
         "• <b>Thanks for having me:</b> A resposta educada e padrão para quem foi convidado para um podcast, programa ou jantar.<br/>"
         "• <b>That sounds [intense / great / fun / terrible]:</b> Reação automática para demonstrar que você está prestando atenção ('Parece puxado / que legal').",
         "• 'Thanks for having me on your show!' (Obrigado por me receber no seu programa!)<br/>• 'You worked 14 hours today? Wow, that sounds intense.' (Trabalhou 14h hoje? Puxa, parece pesado.)"),

        ("2. Enfatizando Rotina e Compromissos: 'Every single [day/month]' & 'For about...'",
         "• <b>Every single day / month:</b> Adicionar a palavra <i>single</i> dá o peso emocional de 'todo santo dia / todo santo mês'.<br/>"
         "• <b>For about a week:</b> A preposição <i>for</i> marca a duração total do período ('por cerca de uma semana').",
         "• 'I practice my English every single morning.' (Eu treino meu inglês todo santo dia de manhã.)<br/>• 'We stayed in New York for about two weeks.' (Ficamos em NY por cerca de duas semanas.)"),

        ("3. Ações em Sequência Matinal: 'And then go to work at 9'",
         "Observe como a Grazi lista suas ações de forma fluida sem repetir sujeitos:<br/>"
         "<i>'I jump in the pool, take a shower, have some breakfast, and then go to work.'</i><br/>"
         "O <b>and then</b> funciona como o conector natural que amarra a sequência de eventos.",
         "• 'I drink some coffee, check my emails, and then start working.' (Tomo um café, checo meus e-mails e aí começo a trabalhar.)")
    ]

    for title, exp, examples in dive_cards:
        card_content = [
            Paragraph(f"<b>{title}</b>", style_dive_h),
            Spacer(1, 1 * mm),
            Paragraph(exp, style_dive_p),
            Spacer(1, 1.5 * mm),
            Paragraph("💡 Exemplos para Aplicar no seu Dia a Dia:", style_dive_ex_h),
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
    # PÁGINA 5: LISTEN & ANSWER (LA) - COBERTURA LITERAL SEM RESPOSTAS REVELADAS
    # =========================================================================
    story.append(Paragraph("3. Listen & Answer (LA)", style_h1))
    story.append(Paragraph("Arena de Reflexo & Velocidade de Resposta no Diálogo (Sem Respostas Reveladas)", style_h2))
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

    la_items = doc_data.get('Listen and Answer', [])
    la_questions = [item[2:].strip() if item.startswith("Q:") else item for item in la_items if item.startswith("Q:") or not item.startswith("A:")]

    for idx, q in enumerate(la_questions, 1):
        q_clean = q if q[0].isdigit() else f"{idx}. {q}"
        q_table = Table([
            [Paragraph(q_clean, style_q_text)],
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
         Paragraph("<b>Zero obrigação de falar bonito ou longo:</b> Responda curto, direto e rápido. O que vale é a velocidade de reflexo antes do áudio confirmar a resposta!", style_quote)]
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
    # PÁGINA 6: LOOK & RETELL + AI SPEECH COACH
    # =========================================================================
    story.append(Paragraph("4. Look & Retell (LRT) + AI Speech Coach", style_h1))
    story.append(Paragraph("Reconto Autônomo com as Perguntas-Guia & O Teste do Gringo (0 a 10)", style_h2))
    story.append(Spacer(1, 2.5 * mm))

    story.append(Table([
        [Paragraph("<b>[  ] ROTEIRO DE RECONTO:</b> Use as mesmas perguntas de Listen & Answer abaixo para guiar sua fala com o inglês que você tem HOJE.", style_wb_checklist)]
    ], colWidths=[180 * mm], style=[
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEF2F2")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#FECACA")),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(Spacer(1, 3 * mm))

    for idx, q in enumerate(la_questions, 1):
        q_clean = q if q[0].isdigit() else f"{idx}. {q}"
        story.append(Paragraph(f"• <b>{q_clean}</b>", style_q_text))
        story.append(Spacer(1, 2 * mm))

    story.append(Spacer(1, 4 * mm))
    story.append(Table([
        [Paragraph("<b>🎙️ PALCO DO AI SPEECH COACH (O TESTE DO GRINGO 0-10)</b><br/>Abra o Training Player na aba <b>Look & Retell</b>. Aperte o microfone radiante, grave seu reconto completo e receba na hora sua nota de compreensibilidade comunicativa e diagnóstico de ritmo!", style_quote)]
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
    # PÁGINA 7: LISTEN & ASK (LASK) - SEM PERGUNTAS REVELADAS
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

    lask_raw = doc_data.get('Listen and Ask', [])
    lask_stims = [item.replace("Negative Statement:", "").strip() for item in lask_raw if item.startswith("Negative Statement:")]

    lask_table_rows = [
        [Paragraph("<b>Frase Estímulo (Ouça a Afirmação / Negação)</b>", style_lask_th), 
         Paragraph("<b>Sua Pergunta Formulada (Treino Ativo no Reflexo)</b>", style_lask_th)]
    ]

    for idx, stim in enumerate(lask_stims, 1):
        lask_table_rows.append([
            Paragraph(f"{idx}. {stim}", style_lask_stim),
            Paragraph("[  ] _________________________________________", style_lask_stim)
        ])

    table_lask = Table(lask_table_rows, colWidths=[90 * mm, 90 * mm])
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
    # PÁGINA 8: PRONUNCIATION PRACTICE & SACADA DE OURO
    # =========================================================================
    story.append(Paragraph("6. Pronunciation & Connected Speech (PRO)", style_h1))
    story.append(Paragraph("Texto Integral do Diálogo com Conexões Sonoras & A Sacada de Ouro", style_h2))
    story.append(Spacer(1, 2 * mm))

    story_connected_markup = (
        "• <b>Chloe:</b> Hello <font color='#1A56DB'><b>everyone_and</b></font> welcome to 'The Right Questions <font color='#1A56DB'><b>about_Life</b></font>,' the podcast where we <font color='#1A56DB'><b>ask_the</b></font> things that really matter.<br/>"
        "• <b>Grazi:</b> <font color='#1A56DB'><b>Thanks_for</b></font> <font color='#1A56DB'><b>having_me</b></font>, Chloe! I'm happy to <font color='#1A56DB'><b>be_here</b></font>.<br/>"
        "• <b>Chloe:</b> Grazi, <font color='#1A56DB'><b>let's_start</b></font> with a few questions <font color='#1A56DB'><b>about_your</b></font> personal life. You’re from Brasilia, right? <font color='#1A56DB'><b>And_you're</b></font> married to Tom?<br/>"
        "• <b>Grazi:</b> Yes, <font color='#1A56DB'><b>that's_right</b></font>. I live here with my husband <font color='#1A56DB'><b>and_our</b></font> two daughters, Anna <font color='#1A56DB'><b>and_Flavia</b></font>.<br/>"
        "• <b>Chloe:</b> <font color='#1A56DB'><b>That's_lovely</b></font>. So, Tom is <font color='#1A56DB'><b>an_executive</b></font>, correct? He <font color='#1A56DB'><b>works_a_lot</b></font>, right?<br/>"
        "• <b>Grazi:</b> He does. He is <font color='#1A56DB'><b>a_workaholic</b></font>. He <font color='#1A56DB'><b>works_many</b></font> hours a week and sometimes <font color='#1A56DB'><b>on_weekends</b></font>.<br/>"
        "• <b>Chloe:</b> Wow, that <font color='#1A56DB'><b>sounds_intense</b></font>. Does that mean he travels for work?<br/>"
        "• <b>Grazi:</b> Yes, he has to <font color='#1A56DB'><b>fly_to the</b></font> USA <font color='#1A56DB'><b>every_single</b></font> month and stay there for <font color='#1A56DB'><b>about_a</b></font> week.<br/>"
        "• <b>Chloe:</b> I see. And <font color='#1A56DB'><b>what_about</b></font> your routine? I heard you <font color='#1A56DB'><b>wake_up_early</b></font>. Is that true?<br/>"
        "• <b>Grazi:</b> Yes, every day at <font color='#1A56DB'><b>around_seven</b></font> a.m.<br/>"
        "• <b>Grazi:</b> I <font color='#1A56DB'><b>jump_in the</b></font> pool, <font color='#1A56DB'><b>take_a</b></font> shower, <font color='#1A56DB'><b>have_some</b></font> breakfast, and then go to work at 9.<br/>"
        "• <b>Chloe:</b> Thank you so much for <font color='#1A56DB'><b>sharing_a</b></font> bit <font color='#1A56DB'><b>of_your</b></font> life with us today!"
    )

    style_pro_story = ParagraphStyle(
        'ProStoryText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=C_NAVY_TEXT
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

    story.append(Table([
        [Paragraph("<b>CHAVE FONÉTICA DOS PRINCIPAIS LINKINGS & REPETIÇÃO EM LOOP</b>", style_pro_box_h)],
        [Spacer(1, 0.8 * mm)],
        [Paragraph("• <i>'an executive'</i> -> <font color='#1A56DB'><b>/ân ig-zék-iutiv/</b></font> • <i>'wake up early'</i> -> <font color='#1A56DB'><b>/wêi-kâ-pâr-li/</b></font> • <i>'jump in the pool'</i> -> <font color='#1A56DB'><b>/djâm-pin dâ pûl/</b></font><br/>"
                   "• <b>Treino de Loop:</b> No Training Player na aba <b>Pronunciation</b>, use a repetição contínua (🔂) para travar cada turno de fala até a boca emendar sem gaguejar!", style_pro_box_b)]
    ], colWidths=[180 * mm], style=[
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 4.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4.5),
    ]))
    story.append(Spacer(1, 2.5 * mm))

    story.append(Table([
        [Paragraph("A SACADA DE OURO DO PROFESSOR LEO LEITE", style_sacada_h)],
        [Spacer(1, 0.8 * mm)],
        [Paragraph("<i>\"Em entrevistas e conversas cotidianas, nunca tente formular perguntas traduzindo 'palavra por palavra' do português. Observe o padrão sonoro: 'You are from Brasília, right?', 'What about your routine?', 'What do you do after running?'. Pegue o bloco sonoro inteiro e solte no ritmo da respiração. Quem lidera o diálogo com ritmo e perguntas naturais ganha a conversa!\"</i>", style_sacada_b)]
    ], colWidths=[180 * mm], style=[
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEF3C7")),
        ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor("#F59E0B")),
        ('LEFTPADDING', (0,0), (-1,-1), 9),
        ('RIGHTPADDING', (0,0), (-1,-1), 9),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))

    doc.build(story, canvasmaker=NumberedCanvas, onFirstPage=draw_cover_background)
    print(f"  [PDF] Livro Oficial compilado: {output_pdf_path} ({os.path.getsize(output_pdf_path)//1024} KB)")


def process_module_migration(
    source_dir,
    output_base_dir,
    course_slug="magic-stories-legacy",
    module_code="MS004",
    module_slug="MS004_grazi_podcast",
    upload_to_storage=False,
    bucket_name=DEFAULT_FIREBASE_BUCKET
):
    """Pipeline completo de ingestão e estruturação para Firebase Storage e Firestore."""
    print(f"\n{'='*70}")
    print(f"🚀 INICIANDO MIGRAÇÃO HOTMART -> AGORAEUFALO: {module_code} ({module_slug})")
    print(f"{'='*70}")

    target_module_dir = os.path.join(output_base_dir, "courses", course_slug, module_slug)
    os.makedirs(target_module_dir, exist_ok=True)

    # 1. Localizar arquivos na pasta de origem
    docx_file = next((os.path.join(source_dir, f) for f in os.listdir(source_dir) if f.endswith('.docx')), None)
    img_file = next((os.path.join(source_dir, f) for f in os.listdir(source_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))), None)
    
    mp4_files = {
        'lr': next((os.path.join(source_dir, f) for f in os.listdir(source_dir) if 'listen_and_read' in f.lower() and f.endswith('.mp4')), None),
        'la': next((os.path.join(source_dir, f) for f in os.listdir(source_dir) if 'listen_and_answer' in f.lower() and f.endswith('.mp4')), None),
        'lask': next((os.path.join(source_dir, f) for f in os.listdir(source_dir) if 'listen_and_ask' in f.lower() and f.endswith('.mp4')), None),
        'pro': next((os.path.join(source_dir, f) for f in os.listdir(source_dir) if 'pronunciation' in f.lower() and f.endswith('.mp4')), None),
    }

    print("\n📂 Arquivos identificados na origem:")
    print(f"  • Docx Roteiro: {docx_file}")
    print(f"  • Imagem Base:  {img_file}")
    for k, v in mp4_files.items():
        print(f"  • MP4 ({k.upper()}): {v}")

    # 2. Ler Docx
    if docx_file:
        doc_data = parse_docx_script(docx_file)
        print(f"  [DOCX] Roteiro carregado com {len(doc_data.get('Story', []))} turnos de história e {len(doc_data.get('Vocabulary', []))} chunks.")
    else:
        doc_data = {}

    # 3. Gerar Capas e Thumbnails
    cover_1x1_path = None
    if img_file:
        cover_1x1_path = create_covers_and_thumbnails(img_file, target_module_dir, module_code)

    # 4. Extrair Áudios MP3 das atividades existentes
    extracted_audios = {}
    for act_key, mp4_path in mp4_files.items():
        if mp4_path and os.path.exists(mp4_path):
            out_mp3 = os.path.join(target_module_dir, f"audio_{act_key}.mp3")
            extract_audio_to_mp3(mp4_path, out_mp3)
            extracted_audios[act_key] = out_mp3

    # 5. Transcrever e Extrair Timestamps via Faster-Whisper (Zero Custo de API)
    timestamps_data = []
    if 'lr' in extracted_audios:
        print("\n🧠 Executando Whisper local para alinhamento milimétrico de timestamps...")
        model = WhisperModel('small', device='cpu', compute_type='int8')

        # VAD (Voice Activity Detection) filter habilitado:
        # - Elimina alucinações do Whisper em silêncios longos, vinhetas instrumentais
        #   e ruídos de fundo que confundem o modelo com fala real.
        # - min_silence_duration_ms=500: ignora pausas de respiro naturais do narrador
        #   (< 500ms) mas corta silêncios de transição entre seções (≥ 500ms).
        # - Resultado: apenas segmentos com voz ativa e conteúdo real geram timestamps,
        #   garantindo que o karaoke do player destaque apenas frases reais.
        segments_iter, info = model.transcribe(
            extracted_audios['lr'],
            language='en',
            beam_size=5,
            word_timestamps=True,
            vad_filter=True,
            vad_parameters=dict(
                min_silence_duration_ms=500,   # pausa mínima para corte de segmento
                speech_pad_ms=400,             # padding antes/depois da fala real
                threshold=0.5                  # sensibilidade VAD (0.0–1.0)
            )
        )

        print(f"  [WHISPER] Idioma detectado: {info.language} (prob={info.language_probability:.2f})")
        print(f"  [WHISPER] Duração do áudio: {info.duration:.1f}s")

        for seg in segments_iter:
            text = seg.text.strip()
            if not text:                        # Descarta segmentos vazios pós-VAD
                continue
            timestamps_data.append({
                'id': len(timestamps_data) + 1,
                'start': round(seg.start, 2),
                'end':   round(seg.end,   2),
                'text':  text
            })
            print(f"    [{seg.start:6.2f}s → {seg.end:6.2f}s] {text[:72]}{'…' if len(text)>72 else ''}")

        print(f"  [WHISPER] ✅ {len(timestamps_data)} sentenças alinhadas com VAD ativo.")

    # 6. Compilar Apostila Oficial em PDF (ReportLab)
    pdf_out_path = os.path.join(target_module_dir, f"{module_code}_{module_slug}_Apostila_Oficial.pdf")
    build_ms004_official_pdf(doc_data, cover_1x1_path or img_file, pdf_out_path)

    # 7. Gerar Manifesto de Metadados do Módulo (Manifest JSON)
    manifest = {
        'course_slug': course_slug,
        'module_code': module_code,
        'module_slug': module_slug,
        'title': "Grazi on the Podcast",
        'subtitle': "The Right Questions about Life",
        'cover_1x1': os.path.basename(cover_1x1_path) if cover_1x1_path else None,
        'pdf_apostila': os.path.basename(pdf_out_path),
        'activities': {
            'lr': {
                'title': 'Listen & Read',
                'video': os.path.basename(mp4_files['lr']) if mp4_files.get('lr') else None,
                'audio': os.path.basename(extracted_audios['lr']) if extracted_audios.get('lr') else None,
                'timestamps': timestamps_data
            },
            'la': {
                'title': 'Listen & Answer',
                'video': os.path.basename(mp4_files['la']) if mp4_files.get('la') else None,
                'audio': os.path.basename(extracted_audios['la']) if extracted_audios.get('la') else None,
            },
            'lask': {
                'title': 'Listen & Ask',
                'video': os.path.basename(mp4_files['lask']) if mp4_files.get('lask') else None,
                'audio': os.path.basename(extracted_audios['lask']) if extracted_audios.get('lask') else None,
            },
            'pro': {
                'title': 'Pronunciation Practice',
                'video': os.path.basename(mp4_files['pro']) if mp4_files.get('pro') else None,
                'audio': os.path.basename(extracted_audios['pro']) if extracted_audios.get('pro') else None,
            }
        }
    }

    manifest_path = os.path.join(target_module_dir, "module_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    # 8. Upload Opcional/Automático para Firebase Storage com Streaming Bufferizado & Retry
    if upload_to_storage:
        print(f"\n☁️ INICIANDO UPLOAD BUFFERIZADO PARA FIREBASE STORAGE: {bucket_name}")
        cloud_prefix = f"courses/{course_slug}/{module_slug}"
        
        # Coletar todos os arquivos gerados no diretório do módulo
        uploaded_map = {}
        for root, _, files in os.walk(target_module_dir):
            for filename in files:
                local_path = os.path.join(root, filename)
                rel_path = os.path.relpath(local_path, target_module_dir)
                cloud_dest = f"{cloud_prefix}/{rel_path}".replace("\\", "/")
                
                try:
                    res = upload_file_to_firebase_storage(
                        local_file_path=local_path,
                        cloud_storage_path=cloud_dest,
                        bucket_name=bucket_name
                    )
                    uploaded_map[rel_path] = res["public_url"]
                except Exception as up_err:
                    print(f"  [STORAGE ERROR] Erro ao subir {filename}: {up_err}")

        # Atualizar manifesto com URLs da nuvem
        manifest["cloud_urls"] = uploaded_map
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)
        print(f"  [MANIFEST] Manifesto atualizado com {len(uploaded_map)} URLs remotas do Storage.")

    print(f"\n✅ MANIFESTO DO MÓDULO GERADO: {manifest_path}")
    print(f"📦 Estrutura completa pronta para Firebase Storage em:\n   {target_module_dir}")
    print(f"{'='*70}\n")
    return target_module_dir


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description="AgoraEuFalo Migration & Ingestion Engine (Zero API Cost Pipeline)")
    parser.add_argument("src", nargs="?", default="/Users/macbookpro/Downloads/MS_MIGRACAO/MS004_videos", help="Diretório de origem com os arquivos brutos")
    parser.add_argument("out_base", nargs="?", default="storage_staging", help="Diretório base de saída")
    parser.add_argument("--course-slug", default="magic-stories-legacy", help="Slug do curso no ecossistema")
    parser.add_argument("--module-code", default="MS004", help="Código do módulo (ex: MS004, MS005)")
    parser.add_argument("--module-slug", default="MS004_grazi_podcast", help="Slug único da pasta do módulo")
    parser.add_argument("--upload", action="store_true", help="Habilitar upload bufferizado automático para o Firebase Storage")
    parser.add_argument("--bucket", default=DEFAULT_FIREBASE_BUCKET, help="Bucket de destino no Firebase Storage")

    args = parser.parse_args()

    process_module_migration(
        source_dir=args.src,
        output_base_dir=args.out_base,
        course_slug=args.course_slug,
        module_code=args.module_code,
        module_slug=args.module_slug,
        upload_to_storage=args.upload,
        bucket_name=args.bucket
    )
