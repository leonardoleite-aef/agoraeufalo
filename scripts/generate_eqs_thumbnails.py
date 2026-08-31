#!/usr/bin/env python3
"""
AgoraEuFalo Thumbnail Engine - English QuickStart Module 1
Generates 1920x1080 video thumbnails for the 4 lessons of EQS Module 1.
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

MODULE_INFO = {
    "course_id": "eqs",
    "course_title": "English QuickStart",
    "base_art": "assets/images/cover-default-aef.jpg",
    "output_dir": "assets/images/thumbs/eqs"
}

LESSONS_CONFIG = [
    {
        "id": "eqs_0_1",
        "order": 0,
        "badge": "QUICKSTART • INTRODUÇÃO",
        "title": "COMO ESTUDAR O QUICKSTART",
        "subtitle": "Boas-Vindas & Método AEF",
        "concept": "Entenda a metodologia de repetição ativa e fluência viva.",
        "accent_color": (13, 148, 136),   # Teal / Ciano #0D9488
        "icon_label": "🚀"
    },
    {
        "id": "eqs_1_1",
        "order": 1,
        "badge": "QUICKSTART • AULA 1.1",
        "title": "OS PRONOMES SUJEITO",
        "subtitle": "Quem está agindo na frase?",
        "concept": "A regra de ouro do sujeito obrigatório e o IT curinga.",
        "accent_color": (4, 120, 87),     # Verde Esmeralda #047857 (Foundation)
        "icon_label": "👤"
    },
    {
        "id": "eqs_1_2",
        "order": 2,
        "badge": "QUICKSTART • AULA 1.2",
        "title": "O REI DO \"TO BE\" (AFIRMATIVA)",
        "subtitle": "A dupla identidade: Ser ou Estar",
        "concept": "Melodia das contrações faladas e as 3 formas básicas.",
        "accent_color": (26, 86, 219),    # Azul Cobalto #1A56DB
        "icon_label": "👑"
    },
    {
        "id": "eqs_1_3",
        "order": 3,
        "badge": "QUICKSTART • AULA 1.3",
        "title": "O REI DO \"TO BE\" (NEGATIVA)",
        "subtitle": "Como negar no reflexo rápido",
        "concept": "A regra do NOT e o uso real de Isn't e Aren't.",
        "accent_color": (217, 119, 6),    # Âmbar / Ocre #D97706
        "icon_label": "🚫"
    },
    {
        "id": "eqs_1_4",
        "order": 4,
        "badge": "QUICKSTART • AULA 1.4",
        "title": "ADJETIVOS ESSENCIAIS",
        "subtitle": "Qualificando personagens e cenários",
        "concept": "Adjetivos invariáveis e a regra de inversão da frase.",
        "accent_color": (225, 29, 72),    # Coral / Rubi #E11D48
        "icon_label": "🎨"
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

    # 3. Desenhar elementos gráficos
    draw = ImageDraw.Draw(img)

    # Fontes
    font_badge = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 28)
    font_title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 68)
    font_sub = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 34)
    font_concept = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
    font_story = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 32)
    font_author = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 26)
    font_brand = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 32)
    font_watermark = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 320)

    # 3.1 Marca d'água monumental do número da aula
    watermark_text = "0.1" if cfg["order"] == 0 else f"1.{cfg['order']}"
    draw.text((760, 360), watermark_text, font=font_watermark, fill=(18, 42, 75, 120))

    # 3.2 Grid de micro-pontos decorativos
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

    # 3.5 Título
    title_y = badge_y + bh + 45
    draw.text((badge_x, title_y), cfg["title"], font=font_title, fill=(255, 255, 255))

    # 3.6 Subtítulo
    sub_y = title_y + 85
    draw.text((badge_x, sub_y), cfg["subtitle"], font=font_sub, fill=accent_rgb)

    # 3.7 Linha divisória
    line_y = sub_y + 65
    draw.line([(badge_x, line_y), (badge_x + 650, line_y)], fill=(50, 75, 110), width=2)

    # 3.8 Card de Contexto
    story_box_y = line_y + 35
    draw.rounded_rectangle([badge_x, story_box_y, badge_x + 780, story_box_y + 120], radius=16, fill=(15, 32, 60), outline=(35, 60, 95), width=1)
    
    # Texto de Contexto
    draw.text((badge_x + 25, story_box_y + 20), f"{cfg['icon_label']} Curso: {module_info['course_title']}", font=font_story, fill=(255, 255, 255))
    draw.text((badge_x + 25, story_box_y + 65), f"• {cfg['concept']}", font=font_concept, fill=(180, 195, 215))

    # 3.9 Rodapé
    footer_y = H - 160
    
    # Brand AgoraEuFalo
    draw.text((badge_x, footer_y), "AgoraEuFalo", font=font_brand, fill=(255, 255, 255))
    draw.text((badge_x + 205, footer_y), "•", font=font_brand, fill=(198, 138, 54))
    draw.text((badge_x + 235, footer_y), "English QuickStart", font=font_brand, fill=(198, 138, 54))

    draw.text((badge_x, footer_y + 45), "Professor Leonardo Leite • Método AgoraEuFalo", font=font_author, fill=(140, 160, 185))

    # Salvar
    os.makedirs(module_info["output_dir"], exist_ok=True)
    out_path = os.path.join(module_info["output_dir"], f"thumb_{cfg['id']}.jpg")
    img.save(out_path, format="JPEG", quality=70, optimize=True)
    print(f"Generated: {out_path} ({os.path.getsize(out_path) // 1024} KB)")

if __name__ == '__main__':
    for cfg in LESSONS_CONFIG:
        create_thumbnail(cfg, MODULE_INFO)
    print("All 4 English QuickStart thumbnails successfully created!")
