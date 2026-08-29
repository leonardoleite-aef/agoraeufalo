"""
AgoraEuFalo Master Thumbnail Engine (16:9 Video Covers)
Generates cinema-grade 1920x1080 thumbnails for Magic Stories video lessons.
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

MODULE_INFO = {
    "module_id": "ms001",
    "module_code": "MS001",
    "module_title": "Graziella Wants to Change Her Life",
    "base_art": "assets/images/cover-andre-graziela.jpg",
    "output_dir": "assets/images/thumbs/ms001"
}

LESSONS_CONFIG = [
    {
        "id": "ms001_lr",
        "order": 1,
        "badge": "MÓDULO MS001 • AULA 01",
        "title": "LISTEN & READ",
        "tag": "LR",
        "subtitle": "Imersão Sonora Pura • Foco nos Ouvidos",
        "concept": "Entrada auditiva real sem tradução mental",
        "accent_color": (26, 86, 219),    # Azul Cobalto #1A56DB
        "accent_hex": "#1A56DB",
        "icon_label": "🎧"
    },
    {
        "id": "ms001_voc",
        "order": 2,
        "badge": "MÓDULO MS001 • AULA 02",
        "title": "VOCABULARY SESSION",
        "tag": "VOC",
        "subtitle": "Matriz de Chunks & Sentido Real",
        "concept": "Compreensão da história & chunks com áudio",
        "accent_color": (4, 120, 87),     # Verde Esmeralda #047857
        "accent_hex": "#047857",
        "icon_label": "📖"
    },
    {
        "id": "ms001_la",
        "order": 3,
        "badge": "MÓDULO MS001 • AULA 03",
        "title": "LISTEN & ANSWER",
        "tag": "LA",
        "subtitle": "Reflexo & Velocidade de Resposta",
        "concept": "15 perguntas de bate-pronto na micro-pausa",
        "accent_color": (217, 119, 6),    # Âmbar / Ocre #D97706
        "accent_hex": "#D97706",
        "icon_label": "⚡"
    },
    {
        "id": "ms001_lrt",
        "order": 4,
        "badge": "MÓDULO MS001 • AULA 04",
        "title": "LOOK & RETELL",
        "tag": "LRT",
        "subtitle": "Speaking Ativo & O Teste do Gringo",
        "concept": "Reconto livre avaliado pelo AI Speech Coach",
        "accent_color": (225, 29, 72),    # Coral / Rubi #E11D48
        "accent_hex": "#E11D48",
        "icon_label": "🎙️"
    },
    {
        "id": "ms001_lask",
        "order": 5,
        "badge": "MÓDULO MS001 • AULA 05",
        "title": "LISTEN & ASK",
        "tag": "LASK",
        "subtitle": "O Jogo de Formular Perguntas",
        "concept": "Desafio de reflexo rápido e liderança no diálogo",
        "accent_color": (99, 102, 241),   # Índigo #6366F1
        "accent_hex": "#6366F1",
        "icon_label": "❓"
    },
    {
        "id": "ms001_pro",
        "order": 6,
        "badge": "MÓDULO MS001 • AULA 06",
        "title": "PRONUNCIATION & RHYTHM",
        "tag": "PRO",
        "subtitle": "Connected Speech & Musicalidade",
        "concept": "Conexões consoante-vogal e loop contínuo",
        "accent_color": (13, 148, 136),   # Teal / Ciano #0D9488
        "accent_hex": "#0D9488",
        "icon_label": "🎵"
    }
]

def create_thumbnail(cfg, module_info):
    W, H = 1920, 1080
    img = Image.new("RGB", (W, H), (10, 25, 47)) # Base Deep Navy
    
    # 1. Carregar arte base cinematográfica na metade direita
    if os.path.exists(module_info["base_art"]):
        art = Image.open(module_info["base_art"]).convert("RGB")
        art = art.resize((1080, 1080), Image.Resampling.LANCZOS)
        
        # Leve blur e aumento de contraste
        art = art.filter(ImageFilter.GaussianBlur(1.5))
        enhancer = ImageEnhance.Contrast(art)
        art = enhancer.enhance(1.15)
        
        # Colar na lateral direita
        img.paste(art, (W - 1080, 0))
    
    # 2. Criar overlay de gradiente suave (Navy escuro da esquerda para a direita)
    gradient = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(gradient)
    
    for x in range(W):
        if x < 850:
            alpha = 255
        elif x < 1450:
            ratio = (x - 850) / 600.0
            alpha = int(255 * (1.0 - (ratio ** 1.3) * 0.75))
        else:
            alpha = int(255 * 0.25)
        g_draw.line([(x, 0), (x, H)], fill=(10, 25, 47, alpha))
        
    img.paste(gradient, (0, 0), gradient)

    # 3. Desenhar elementos gráficos de Prestige
    draw = ImageDraw.Draw(img)

    # Fontes
    font_badge = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 28)
    font_title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 72)
    font_sub = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 36)
    font_concept = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
    font_story = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 32)
    font_author = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 26)
    font_brand = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 32)
    font_watermark = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 320)

    # 3.1 Marca d'água monumental do número da aula ao fundo
    watermark_text = f"0{cfg['order']}"
    draw.text((820, 360), watermark_text, font=font_watermark, fill=(18, 42, 75, 120))

    # 3.2 Linhas decorativas e Grid de micro-pontos
    for r in range(6):
        for c in range(8):
            draw.ellipse([1450 + c * 30, 80 + r * 30, 1454 + c * 30, 84 + r * 30], fill=(255, 255, 255, 40))

    # 3.3 Barra Lateral de Acento Cromático
    accent_rgb = cfg["accent_color"]
    draw.rectangle([0, 0, 18, H], fill=accent_rgb)

    # 3.4 Pílula Superior de Identificação (Badge)
    badge_x, badge_y = 120, 140
    badge_text = f"  {cfg['badge']}  "
    bbox = font_badge.getbbox(badge_text)
    bw, bh = bbox[2] - bbox[0] + 30, bbox[3] - bbox[1] + 20
    
    # Fundo do badge
    draw.rounded_rectangle([badge_x, badge_y, badge_x + bw, badge_y + bh], radius=12, fill=(18, 40, 72), outline=accent_rgb, width=2)
    draw.text((badge_x + 15, badge_y + 10), cfg["badge"], font=font_badge, fill=accent_rgb)

    # 3.5 Título Monumental da Atividade
    title_y = badge_y + bh + 45
    draw.text((badge_x, title_y), cfg["title"], font=font_title, fill=(255, 255, 255))

    # 3.6 Subtítulo de Impacto (Propósito Canônico)
    sub_y = title_y + 85
    draw.text((badge_x, sub_y), cfg["subtitle"], font=font_sub, fill=accent_rgb)

    # 3.7 Linha divisória sutil
    line_y = sub_y + 65
    draw.line([(badge_x, line_y), (badge_x + 650, line_y)], fill=(50, 75, 110), width=2)

    # 3.8 Card de Contexto da História
    story_box_y = line_y + 35
    draw.rounded_rectangle([badge_x, story_box_y, badge_x + 780, story_box_y + 120], radius=16, fill=(15, 32, 60), outline=(35, 60, 95), width=1)
    
    # Texto de Contexto
    draw.text((badge_x + 25, story_box_y + 20), f"História: {module_info['module_title']}", font=font_story, fill=(255, 255, 255))
    draw.text((badge_x + 25, story_box_y + 65), f"• {cfg['concept']}", font=font_concept, fill=(180, 195, 215))

    # 3.9 Rodapé com Assinatura e Logo Oficial
    footer_y = H - 160
    
    # Brand AgoraEuFalo
    draw.text((badge_x, footer_y), "AgoraEuFalo", font=font_brand, fill=(255, 255, 255))
    draw.text((badge_x + 205, footer_y), "•", font=font_brand, fill=(198, 138, 54))
    draw.text((badge_x + 235, footer_y), "Magic Stories Legacy", font=font_brand, fill=(198, 138, 54))

    draw.text((badge_x, footer_y + 45), "Professor Leonardo Leite • Método AgoraEuFalo", font=font_author, fill=(140, 160, 185))

    # Salvar Thumbnail em Alta Definição (<120 KB)
    os.makedirs(module_info["output_dir"], exist_ok=True)
    out_path = os.path.join(module_info["output_dir"], f"thumb_{cfg['id']}.jpg")
    img.save(out_path, format="JPEG", quality=90, optimize=True)
    print(f"Generated: {out_path} ({os.path.getsize(out_path) // 1024} KB)")
    return out_path

if __name__ == '__main__':
    for cfg in LESSONS_CONFIG:
        create_thumbnail(cfg, MODULE_INFO)
    print("All 6 lesson thumbnails successfully created!")
