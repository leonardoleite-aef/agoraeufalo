import os
from PIL import Image, ImageDraw, ImageFont

output_dir = '/Users/macbookpro/Desktop/agoraeufalo_site/assets/images/thumbs/ms011'
os.makedirs(output_dir, exist_ok=True)

source_img_path = '/Users/macbookpro/Downloads/MS_MIGRACAO/MS011_Meet_Jeremy/MS011_1.jpeg'
base_img = Image.open(source_img_path).convert('RGB')

target_w, target_h = 1280, 720
orig_w, orig_h = base_img.size

aspect_ratio = target_w / target_h
orig_ratio = orig_w / orig_h

if orig_ratio > aspect_ratio:
    new_w = int(orig_h * aspect_ratio)
    left = (orig_w - new_w) // 2
    cropped = base_img.crop((left, 0, left + new_w, orig_h))
else:
    new_h = int(orig_w / aspect_ratio)
    top = (orig_h - new_h) // 2
    cropped = base_img.crop((0, top, orig_w, top + new_h))

resized_base = cropped.resize((target_w, target_h), Image.LANCZOS)

activities = [
    {
        'key': 'lr',
        'code': 'LR',
        'badge': 'LISTEN & READ',
        'color': '#1A56DB', # Azul Cobalto
        'title': 'Aula 01 • Listen & Read (LR)',
        'sub': 'Imersão Sonora • Meet Jeremy (16 y/o, Des Moines WA)'
    },
    {
        'key': 'voc',
        'code': 'VOC',
        'badge': 'VOCABULARY SESSION',
        'color': '#047857', # Verde Esmeralda
        'title': 'Aula 02 • Vocabulary Session (VOC)',
        'sub': 'Rotina de High School, JV Team & Família Thompson'
    },
    {
        'key': 'la',
        'code': 'LA',
        'badge': 'LISTEN & ANSWER',
        'color': '#D97706', # Âmbar / Ocre
        'title': 'Aula 03 • Listen & Answer (LA)',
        'sub': '22 Perguntas de Reflexo Rápido sobre Jeremy'
    },
    {
        'key': 'lrt',
        'code': 'LRT',
        'badge': 'LOOK & RETELL',
        'color': '#E11D48', # Rubi Quente
        'title': 'Aula 04 • Look & Retell (LRT)',
        'sub': 'Speaking Ativo • A Vida do Típico Teenager Americano'
    },
    {
        'key': 'lask',
        'code': 'LASK',
        'badge': 'LISTEN & ASK',
        'color': '#6366F1', # Índigo
        'title': 'Aula 05 • Listen & Ask (LASK)',
        'sub': 'Desafio de Formulação de Perguntas sobre Jeremy'
    },
    {
        'key': 'pro',
        'code': 'PRO',
        'badge': 'PRONUNCIATION PRACTICE',
        'color': '#0D9488', # Teal Ciano
        'title': 'Aula 06 • Pronunciation & Connected Speech',
        'sub': 'Linking Sounds de Rotina (picks him up, gets dressed)'
    }
]

font_paths = [
    "/System/Library/Fonts/SFNSDisplay.ttf",
    "/System/Library/Fonts/HelveticaNeue.ttc",
    "/Library/Fonts/Arial.ttf"
]
def get_font(size, bold=False):
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size, index=1 if bold and 'ttc' in fp else 0)
            except:
                pass
    return ImageFont.load_default()

badge_font = get_font(20, bold=True)
title_font = get_font(38, bold=True)
sub_font = get_font(22, bold=False)

for act in activities:
    img = resized_base.copy()
    overlay = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    for y in range(target_h - 260, target_h):
        alpha = int(220 * ((y - (target_h - 260)) / 260))
        draw.line([(0, y), (target_w, y)], fill=(10, 25, 47, alpha))
        
    draw.rectangle([0, 0, 16, target_h], fill=act['color'])
    
    badge_text = f"MS011 • {act['badge']}"
    draw.rounded_rectangle([target_w - 380, 32, target_w - 32, 74], radius=8, fill=act['color'])
    draw.text((target_w - 365, 42), badge_text, font=badge_font, fill='#FFFFFF')
    
    draw.text((45, target_h - 140), act['title'], font=title_font, fill='#FFFFFF')
    draw.text((45, target_h - 85), act['sub'], font=sub_font, fill='#E2E8F0')
    
    draw.text((target_w - 240, target_h - 55), "AgoraEuFalo • LMS", font=sub_font, fill='#94A3B8')

    final_img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
    out_file = os.path.join(output_dir, f"thumb_ms011_{act['key']}.jpg")
    final_img.save(out_file, 'JPEG', quality=90, optimize=True)
    print(f"Gerada thumb: {out_file}")

cover_1_1 = base_img.resize((512, 512), Image.LANCZOS)
cover_1_1_path = '/Users/macbookpro/Desktop/agoraeufalo_site/assets/images/cover-ms011-meet-jeremy.jpg'
cover_1_1.save(cover_1_1_path, 'JPEG', quality=88, optimize=True)
print(f"Gerada capa 1:1 Player: {cover_1_1_path}")
