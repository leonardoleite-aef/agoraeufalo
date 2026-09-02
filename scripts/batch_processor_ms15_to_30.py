import os
import sys
import glob
import json
import urllib.request
import urllib.parse
from PIL import Image, ImageDraw, ImageFont
import av
from faster_whisper import WhisperModel

bucket = 'agoraeufalo-3463a.firebasestorage.app'
base_dir = '/Users/macbookpro/Downloads/MS_MIGRACAO'
site_dir = '/Users/macbookpro/Desktop/agoraeufalo_site'

print("=== INICIANDO MOTOR DE PROCESSAMENTO AUTOMATIZADO (MS015 A MS030) ===")
print("Carregando Faster-Whisper local...")
whisper_model = WhisperModel("base", device="cpu", compute_type="int8")

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

def generate_thumbs_for_module(mod_num_str, folder_path, title_short):
    out_dir = os.path.join(site_dir, 'assets/images/thumbs', f"ms{mod_num_str.lower()}")
    os.makedirs(out_dir, exist_ok=True)
    
    # Procura imagem jpeg/png
    imgs = [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpeg', '.jpg', '.png'))]
    if not imgs:
        print(f"⚠️ Nenhuma imagem encontrada em {folder_path}")
        return {}
    
    base_img_path = os.path.join(folder_path, sorted(imgs)[0])
    base_img = Image.open(base_img_path).convert('RGB')
    
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
    
    act_configs = {
        'lr': {'code': 'LR', 'badge': 'LISTEN & READ', 'color': '#1A56DB', 'title': 'Aula 01 • Listen & Read (LR)', 'sub': f'Imersão Sonora • {title_short}'},
        'lr_1': {'code': 'LR', 'badge': 'LISTEN & READ (PART 1)', 'color': '#1A56DB', 'title': 'Aula 01.1 • Listen & Read (Part 1)', 'sub': f'Imersão Sonora • {title_short}'},
        'lr_2': {'code': 'LR', 'badge': 'LISTEN & READ (PART 2)', 'color': '#1E40AF', 'title': 'Aula 01.2 • Listen & Read (Part 2)', 'sub': f'Imersão Sonora • {title_short}'},
        'lr_3': {'code': 'LR', 'badge': 'LISTEN & READ (PART 3)', 'color': '#2563EB', 'title': 'Aula 01.3 • Listen & Read (Part 3)', 'sub': f'Imersão Sonora • {title_short}'},
        'lr_4': {'code': 'LR', 'badge': 'LISTEN & READ (PART 4)', 'color': '#3B82F6', 'title': 'Aula 01.4 • Listen & Read (Part 4)', 'sub': f'Imersão Sonora • {title_short}'},
        'voc': {'code': 'VOC', 'badge': 'VOCABULARY SESSION', 'color': '#047857', 'title': 'Aula 02 • Vocabulary Session (VOC)', 'sub': f'Matriz de Chunks & Estruturas • {title_short}'},
        'la': {'code': 'LA', 'badge': 'LISTEN & ANSWER', 'color': '#D97706', 'title': 'Aula 03 • Listen & Answer (LA)', 'sub': f'Reflexo & Bate-Pronto • {title_short}'},
        'lrt': {'code': 'LRT', 'badge': 'LOOK & RETELL', 'color': '#E11D48', 'title': 'Aula 04 • Look & Retell (LRT)', 'sub': f'Speaking Ativo & Reconto • {title_short}'},
        'lask': {'code': 'LASK', 'badge': 'LISTEN & ASK', 'color': '#6366F1', 'title': 'Aula 05 • Listen & Ask (LASK)', 'sub': f'Formulação Rápida de Perguntas • {title_short}'},
        'lask_1': {'code': 'LASK', 'badge': 'LISTEN & ASK (PART 1)', 'color': '#6366F1', 'title': 'Aula 05.1 • Listen & Ask (Part 1)', 'sub': f'Formulação Rápida de Perguntas • {title_short}'},
        'lask_2': {'code': 'LASK', 'badge': 'LISTEN & ASK (PART 2)', 'color': '#4F46E5', 'title': 'Aula 05.2 • Listen & Ask (Part 2)', 'sub': f'Formulação Rápida de Perguntas • {title_short}'},
        'pro': {'code': 'PRO', 'badge': 'PRONUNCIATION PRACTICE', 'color': '#0D9488', 'title': 'Aula 06 • Pronunciation Practice (PRO)', 'sub': f'Musicalidade & Sacada de Ouro • {title_short}'},
        'pro_1': {'code': 'PRO', 'badge': 'PRONUNCIATION (PART 1)', 'color': '#0D9488', 'title': 'Aula 06.1 • Pronunciation (Part 1)', 'sub': f'Musicalidade & Sacada de Ouro • {title_short}'},
        'pro_2': {'code': 'PRO', 'badge': 'PRONUNCIATION (PART 2)', 'color': '#0F766E', 'title': 'Aula 06.2 • Pronunciation (Part 2)', 'sub': f'Musicalidade & Sacada de Ouro • {title_short}'}
    }
    
    generated_thumbs = {}
    for key, act in act_configs.items():
        img = resized_base.copy()
        overlay = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        for y in range(target_h - 260, target_h):
            alpha = int(220 * ((y - (target_h - 260)) / 260))
            draw.line([(0, y), (target_w, y)], fill=(10, 25, 47, alpha))
            
        draw.rectangle([0, 0, 16, target_h], fill=act['color'])
        
        badge_text = f"MS{mod_num_str} • {act['badge']}"
        draw.rounded_rectangle([target_w - 410, 32, target_w - 32, 74], radius=8, fill=act['color'])
        draw.text((target_w - 395, 42), badge_text, font=badge_font, fill='#FFFFFF')
        
        draw.text((45, target_h - 140), act['title'], font=title_font, fill='#FFFFFF')
        draw.text((45, target_h - 85), act['sub'], font=sub_font, fill='#E2E8F0')
        draw.text((target_w - 240, target_h - 55), "AgoraEuFalo • LMS", font=sub_font, fill='#94A3B8')

        final_img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
        out_file = os.path.join(out_dir, f"thumb_ms{mod_num_str.lower()}_{key}.jpg")
        final_img.save(out_file, 'JPEG', quality=90, optimize=True)
        generated_thumbs[key] = out_file

    cover_1_1 = base_img.resize((512, 512), Image.LANCZOS)
    slug = title_short.lower().replace(' ', '-').replace("'", '').replace('&', 'and')
    cover_1_1_path = os.path.join(site_dir, f"assets/images/cover-ms{mod_num_str.lower()}-{slug}.jpg")
    cover_1_1.save(cover_1_1_path, 'JPEG', quality=88, optimize=True)
    generated_thumbs['cover_1_1'] = cover_1_1_path
    
    return generated_thumbs

print("Função geradora de miniaturas pronta.")
