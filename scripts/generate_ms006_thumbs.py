#!/usr/bin/env python3
"""
Gerador Canônico do Kit de Thumbnails 16:9 para o Módulo MS006 (How They Met)
Utiliza a arte contextual de alta resolução encontrada na pasta (MS006_thumb_1.jpg)
Aplica o padrão cinematográfico com a diferenciação cromática oficial das 6 atividades:
- LR: Azul Cobalto (#1A56DB)
- VOC: Verde Esmeralda (#047857)
- LA: Ocre Dourado / Âmbar (#D97706)
- LRT: Rubi Quente / Coral (#E11D48)
- LASK: Índigo / Violeta (#6366F1)
- PRO: Ciano Elétrico / Teal (#0D9488)
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

MODULE_INFO = {
    "module_id": "ms006",
    "module_code": "MS006",
    "module_title": "How They Met",
    "base_art": "/Users/macbookpro/Downloads/MS_MIGRACAO/MS006_How_they_met/MS006_thumb_1.jpg",
    "output_dir": "assets/images/thumbs/ms006"
}

LESSONS_CONFIG = [
    {
        "id": "lr_4",
        "file_name": "thumb_lr_4.jpg",
        "order": 1,
        "badge": "MÓDULO MS006 • AULA 01.1",
        "title": "LISTEN & READ",
        "tag": "LR",
        "subtitle": "Imersão Sonora • Versão Original",
        "concept": "O primeiro encontro de Tom e Grazi no bar da conferência",
        "accent_color": (26, 86, 219),
        "icon_label": "🎧"
    },
    {
        "id": "lr_5",
        "file_name": "thumb_lr_5.jpg",
        "order": 2,
        "badge": "MÓDULO MS006 • AULA 01.2",
        "title": "LISTEN & READ",
        "tag": "LR",
        "subtitle": "Imersão Guiada • Foco em Ritmo",
        "concept": "Estruturas do passado e conexões de fala contínua",
        "accent_color": (26, 86, 219),
        "icon_label": "🎧"
    },
    {
        "id": "voc_7",
        "file_name": "thumb_voc_7.jpg",
        "order": 3,
        "badge": "MÓDULO MS006 • AULA 02",
        "title": "VOCABULARY SESSION",
        "tag": "VOC",
        "subtitle": "Dissecação Completa & Chunks",
        "concept": "By himself, loud friends, restroom e timing do passado",
        "accent_color": (4, 120, 87),
        "icon_label": "📖"
    },
    {
        "id": "la_2",
        "file_name": "thumb_la_2.jpg",
        "order": 4,
        "badge": "MÓDULO MS006 • AULA 03",
        "title": "LISTEN & ANSWER",
        "tag": "LA",
        "subtitle": "Reflexo & Velocidade de Resposta",
        "concept": "Perguntas de bate-pronto sobre o encontro de Tom e Grazi",
        "accent_color": (217, 119, 6),
        "icon_label": "⚡"
    },
    {
        "id": "lr_3",
        "file_name": "thumb_lr_3.jpg",
        "order": 5,
        "badge": "MÓDULO MS006 • AULA 04",
        "title": "LOOK & RETELL",
        "tag": "LRT",
        "subtitle": "Speaking Ativo & AI Coach",
        "concept": "Reconto da história no seu ritmo com o Teste do Gringo",
        "accent_color": (225, 29, 72),
        "icon_label": "🎙️"
    },
    {
        "id": "la_1",
        "file_name": "thumb_la_1.jpg",
        "order": 6,
        "badge": "MÓDULO MS006 • AULA 05",
        "title": "LISTEN & ASK",
        "tag": "LASK",
        "subtitle": "O Jogo de Formular Perguntas",
        "concept": "Ouça a negação e formule a pergunta imediatamente",
        "accent_color": (99, 102, 241),
        "icon_label": "❓"
    },
    {
        "id": "pro_6",
        "file_name": "thumb_pro_6.jpg",
        "order": 7,
        "badge": "MÓDULO MS006 • AULA 06",
        "title": "PRONUNCIATION PRACTICE",
        "tag": "PRO",
        "subtitle": "Regras Fonéticas do -ED & Ritmo",
        "concept": "Domínio dos 3 sons do -ED (/t/, /d/, /ɪd/) e conexões",
        "accent_color": (13, 148, 136),
        "icon_label": "🎵"
    }
]

def create_thumbnail(cfg, module_info):
    W, H = 1920, 1080
    img = Image.new("RGB", (W, H), (10, 25, 47))
    
    # Base art
    if os.path.exists(module_info["base_art"]):
        art = Image.open(module_info["base_art"]).convert("RGB")
        art = art.resize((1080, 1080), Image.Resampling.LANCZOS)
        art = art.filter(ImageFilter.GaussianBlur(1.2))
        enhancer = ImageEnhance.Contrast(art)
        art = enhancer.enhance(1.08)
        img.paste(art, (W - 1080, 0))
    
    # Cinematic Gradient Overlay
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

    draw = ImageDraw.Draw(img)

    # System Fonts
    font_badge = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 26)
    font_title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 68)
    font_sub = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 34)
    font_concept = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 26)
    font_story = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 30)
    font_author = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 26)
    font_brand = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 32)
    font_watermark = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 300)

    # Watermark Order
    watermark_text = f"{cfg['order']:02d}"
    draw.text((820, 370), watermark_text, font=font_watermark, fill=(18, 42, 75, 120))

    # Dot grid
    for r in range(6):
        for c in range(8):
            draw.ellipse([1450 + c * 30, 80 + r * 30, 1454 + c * 30, 84 + r * 30], fill=(255, 255, 255, 40))

    # Accent Line (Left Edge)
    accent_rgb = cfg["accent_color"]
    draw.rectangle([0, 0, 18, H], fill=accent_rgb)

    # Badge Pill
    badge_x, badge_y = 120, 140
    badge_text = f"  {cfg['badge']}  "
    bbox = font_badge.getbbox(badge_text)
    bw, bh = bbox[2] - bbox[0] + 30, bbox[3] - bbox[1] + 20
    draw.rounded_rectangle([badge_x, badge_y, badge_x + bw, badge_y + bh], radius=12, fill=(18, 40, 72), outline=accent_rgb, width=2)
    draw.text((badge_x + 15, badge_y + 10), cfg["badge"], font=font_badge, fill=accent_rgb)

    # Title
    title_y = badge_y + bh + 40
    draw.text((badge_x, title_y), cfg["title"], font=font_title, fill=(255, 255, 255))

    # Subtitle
    sub_y = title_y + 80
    draw.text((badge_x, sub_y), cfg["subtitle"], font=font_sub, fill=accent_rgb)

    # Line Separator
    line_y = sub_y + 60
    draw.line([(badge_x, line_y), (badge_x + 650, line_y)], fill=(50, 75, 110), width=2)

    # Story Box
    story_box_y = line_y + 30
    draw.rounded_rectangle([badge_x, story_box_y, badge_x + 780, story_box_y + 115], radius=16, fill=(15, 32, 60), outline=(35, 60, 95), width=1)
    draw.text((badge_x + 25, story_box_y + 18), f"História: {module_info['module_title']}", font=font_story, fill=(255, 255, 255))
    draw.text((badge_x + 25, story_box_y + 60), f"• {cfg['concept']}", font=font_concept, fill=(180, 195, 215))

    # Footer
    footer_y = H - 150
    draw.text((badge_x, footer_y), "AgoraEuFalo", font=font_brand, fill=(255, 255, 255))
    draw.text((badge_x + 205, footer_y), "•", font=font_brand, fill=(198, 138, 54))
    draw.text((badge_x + 235, footer_y), "Magic Stories Legacy", font=font_brand, fill=(198, 138, 54))
    draw.text((badge_x, footer_y + 42), "Professor Leonardo Leite • Método AgoraEuFalo", font=font_author, fill=(140, 160, 185))

    # Save
    os.makedirs(module_info["output_dir"], exist_ok=True)
    out_path = os.path.join(module_info["output_dir"], cfg["file_name"])
    img.save(out_path, format="JPEG", quality=90, optimize=True)
    print(f"Generated: {out_path} ({os.path.getsize(out_path) // 1024} KB)")
    return out_path

if __name__ == '__main__':
    for cfg in LESSONS_CONFIG:
        create_thumbnail(cfg, MODULE_INFO)
    print("Todas as 7 miniaturas cinematográficas 16:9 do MS006 foram geradas!")
