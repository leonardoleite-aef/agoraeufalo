import os
import sys
import glob
import json
import urllib.request
import urllib.parse
from PIL import Image, ImageDraw, ImageFont
import av
from faster_whisper import WhisperModel
import pypdf

bucket = 'agoraeufalo-3463a.firebasestorage.app'
base_dir = '/Users/macbookpro/Downloads/MS_MIGRACAO'
site_dir = '/Users/macbookpro/Desktop/agoraeufalo_site'

modules_meta = [
    {
        'id': 'ms015-steve-and-anna',
        'code': '015',
        'num': 15,
        'title': 'MS015 - Steve and Anna',
        'shortTitle': 'Steve and Anna',
        'folder': 'MS015_Steve_Ana',
        'pdf_name': 'MS015_Steve_and_Anna_Apostila_Oficial.pdf'
    },
    {
        'id': 'ms016-talk-about-yourself',
        'code': '016',
        'num': 16,
        'title': 'MS016 - Talk About Yourself',
        'shortTitle': 'Talk About Yourself',
        'folder': 'MS016_Talk_about_your_self',
        'pdf_name': 'MS016_Talk_About_Yourself_Apostila_Oficial.pdf'
    },
    {
        'id': 'ms017-meet-josh',
        'code': '017',
        'num': 17,
        'title': 'MS017 - Meet Josh',
        'shortTitle': 'Meet Josh',
        'folder': 'MS017_Meet_Josh',
        'pdf_name': 'MS017_Meet_Josh_Apostila_Oficial.pdf'
    },
    {
        'id': 'ms018-meet-josh-part-2',
        'code': '018',
        'num': 18,
        'title': 'MS018 - Meet Josh (Part 2)',
        'shortTitle': 'Meet Josh Part 2',
        'folder': 'MS018_Meet_Josh_part_2',
        'pdf_name': 'MS018_Meet_Josh_Part_2_Apostila_Oficial.pdf'
    },
    {
        'id': 'ms019-meet-josh-part-3',
        'code': '019',
        'num': 19,
        'title': 'MS019 - Meet Josh (Part 3)',
        'shortTitle': 'Meet Josh Part 3',
        'folder': 'MS019_Meet_Josh_part_3',
        'pdf_name': 'MS019_Meet_Josh_Part_3_Apostila_Oficial.pdf'
    },
    {
        'id': 'ms020-lets-talk-about-amanda',
        'code': '020',
        'num': 20,
        'title': 'MS020 - Lets Talk About Amanda',
        'shortTitle': 'Lets Talk About Amanda',
        'folder': 'MS020_Lets_talk_about_amanda',
        'pdf_name': 'MS020_Lets_Talk_About_Amanda_Apostila_Oficial.pdf'
    },
    {
        'id': 'ms021-finding-your-way',
        'code': '021',
        'num': 21,
        'title': 'MS021 - Finding Your Way',
        'shortTitle': 'Finding Your Way',
        'folder': 'MS021_Finding_your_way',
        'pdf_name': 'MS021_Finding_Your_Way_Apostila_Oficial.pdf'
    },
    {
        'id': 'ms022-a-day-out-in-the-park-part-1',
        'code': '022',
        'num': 22,
        'title': 'MS022 - A Day Out in the Park (Part 1)',
        'shortTitle': 'A Day Out in the Park Part 1',
        'folder': 'MS022_A_day_out_in_the_park_part_1',
        'pdf_name': 'MS022_A_Day_Out_in_the_Park_Part_1_Apostila_Oficial.pdf'
    },
    {
        'id': 'ms023-a-day-out-in-the-park-part-2',
        'code': '023',
        'num': 23,
        'title': 'MS023 - A Day Out in the Park (Part 2)',
        'shortTitle': 'A Day Out in the Park Part 2',
        'folder': 'MS023_A_day_out_in_the_park_part_2',
        'pdf_name': 'MS023_A_Day_Out_in_the_Park_Part_2_Apostila_Oficial.pdf'
    },
    {
        'id': 'ms024-a-day-out-in-the-park-part-3',
        'code': '024',
        'num': 24,
        'title': 'MS024 - A Day Out in the Park (Part 3)',
        'shortTitle': 'A Day Out in the Park Part 3',
        'folder': 'MS024_A_day_out_in_the_park_part_3',
        'pdf_name': 'MS024_A_Day_Out_in_the_Park_Part_3_Apostila_Oficial.pdf'
    },
    {
        'id': 'ms025-a-trip-to-vegas',
        'code': '025',
        'num': 25,
        'title': 'MS025 - A Trip to Vegas',
        'shortTitle': 'A Trip to Vegas',
        'folder': 'MS025_A_trip_to_vegas',
        'pdf_name': 'MS025_A_Trip_to_Vegas_Apostila_Oficial.pdf'
    },
    {
        'id': 'ms026-jack-and-carol',
        'code': '026',
        'num': 26,
        'title': 'MS026 - Jack and Carol',
        'shortTitle': 'Jack and Carol',
        'folder': 'MS026_Jack_and_Carol',
        'pdf_name': 'MS026_Jack_and_Carol_Apostila_Oficial.pdf'
    },
    {
        'id': 'ms027-jack-and-carol-in-the-past',
        'code': '027',
        'num': 27,
        'title': 'MS027 - Jack and Carol in the Past',
        'shortTitle': 'Jack and Carol in the Past',
        'folder': 'MS027_Jack_and_carol_in_the_past',
        'pdf_name': 'MS027_Jack_and_Carol_in_the_Past_Apostila_Oficial.pdf'
    },
    {
        'id': 'ms028-jack-and-carol-in-the-future',
        'code': '028',
        'num': 28,
        'title': 'MS028 - Jack and Carol in the Future',
        'shortTitle': 'Jack and Carol in the Future',
        'folder': 'MS028_Jack_and_carol_in_the_future',
        'pdf_name': 'MS028_Jack_and_Carol_in_the_Future_Apostila_Oficial.pdf'
    },
    {
        'id': 'ms029-jack-and-carol-present-perfect',
        'code': '029',
        'num': 29,
        'title': 'MS029 - Jack and Carol (Present Perfect)',
        'shortTitle': 'Jack and Carol Present Perfect',
        'folder': 'MS029_Jack_and_carol_present_perfect',
        'pdf_name': 'MS029_Jack_and_Carol_Present_Perfect_Apostila_Oficial.pdf'
    },
    {
        'id': 'ms030-the-exchange-student',
        'code': '030',
        'num': 30,
        'title': 'MS030 - The Exchange Student',
        'shortTitle': 'The Exchange Student',
        'folder': 'MS030_The_exchange_student',
        'pdf_name': 'MS030_The_Exchange_Student_Apostila_Oficial.pdf'
    }
]

print(f"Total de módulos mapeados para execução sequencial: {len(modules_meta)}")

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

def generate_thumbs(mod):
    folder_path = os.path.join(base_dir, mod['folder'])
    out_dir = os.path.join(site_dir, 'assets/images/thumbs', f"ms{mod['code']}")
    os.makedirs(out_dir, exist_ok=True)
    
    imgs = [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpeg', '.jpg', '.png'))]
    if not imgs:
        print(f"⚠️ Sem imagem em {folder_path}")
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
        'lr': {'badge': 'LISTEN & READ', 'color': '#1A56DB', 'title': 'Aula 01 • Listen & Read (LR)'},
        'lr_1': {'badge': 'LISTEN & READ (PART 1)', 'color': '#1A56DB', 'title': 'Aula 01.1 • Listen & Read (Part 1)'},
        'lr_2': {'badge': 'LISTEN & READ (PART 2)', 'color': '#1E40AF', 'title': 'Aula 01.2 • Listen & Read (Part 2)'},
        'lr_3': {'badge': 'LISTEN & READ (PART 3)', 'color': '#2563EB', 'title': 'Aula 01.3 • Listen & Read (Part 3)'},
        'lr_4': {'badge': 'LISTEN & READ (PART 4)', 'color': '#3B82F6', 'title': 'Aula 01.4 • Listen & Read (Part 4)'},
        'voc': {'badge': 'VOCABULARY SESSION', 'color': '#047857', 'title': 'Aula 02 • Vocabulary Session (VOC)'},
        'la': {'badge': 'LISTEN & ANSWER', 'color': '#D97706', 'title': 'Aula 03 • Listen & Answer (LA)'},
        'lrt': {'badge': 'LOOK & RETELL', 'color': '#E11D48', 'title': 'Aula 04 • Look & Retell (LRT)'},
        'lask': {'badge': 'LISTEN & ASK', 'color': '#6366F1', 'title': 'Aula 05 • Listen & Ask (LASK)'},
        'lask_1': {'badge': 'LISTEN & ASK (PART 1)', 'color': '#6366F1', 'title': 'Aula 05.1 • Listen & Ask (Part 1)'},
        'lask_2': {'badge': 'LISTEN & ASK (PART 2)', 'color': '#4F46E5', 'title': 'Aula 05.2 • Listen & Ask (Part 2)'},
        'pro': {'badge': 'PRONUNCIATION PRACTICE', 'color': '#0D9488', 'title': 'Aula 06 • Pronunciation Practice (PRO)'},
        'pro_1': {'badge': 'PRONUNCIATION (PART 1)', 'color': '#0D9488', 'title': 'Aula 06.1 • Pronunciation (Part 1)'},
        'pro_2': {'badge': 'PRONUNCIATION (PART 2)', 'color': '#0F766E', 'title': 'Aula 06.2 • Pronunciation (Part 2)'}
    }
    
    generated = {}
    for k, act in act_configs.items():
        img = resized_base.copy()
        overlay = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        for y in range(target_h - 260, target_h):
            alpha = int(220 * ((y - (target_h - 260)) / 260))
            draw.line([(0, y), (target_w, y)], fill=(10, 25, 47, alpha))
        draw.rectangle([0, 0, 16, target_h], fill=act['color'])
        badge_text = f"MS{mod['code']} • {act['badge']}"
        draw.rounded_rectangle([target_w - 410, 32, target_w - 32, 74], radius=8, fill=act['color'])
        draw.text((target_w - 395, 42), badge_text, font=badge_font, fill='#FFFFFF')
        draw.text((45, target_h - 140), act['title'], font=title_font, fill='#FFFFFF')
        draw.text((45, target_h - 85), f"Imersão & Prática Ativa • {mod['shortTitle']}", font=sub_font, fill='#E2E8F0')
        draw.text((target_w - 240, target_h - 55), "AgoraEuFalo • LMS", font=sub_font, fill='#94A3B8')

        final_img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
        out_file = os.path.join(out_dir, f"thumb_ms{mod['code']}_{k}.jpg")
        final_img.save(out_file, 'JPEG', quality=90, optimize=True)
        generated[k] = out_file
        
    cover_1_1 = base_img.resize((512, 512), Image.LANCZOS)
    slug = mod['shortTitle'].lower().replace(' ', '-').replace("'", '').replace('&', 'and').replace('(', '').replace(')', '')
    cover_1_1_path = os.path.join(site_dir, f"assets/images/cover-ms{mod['code']}-{slug}.jpg")
    cover_1_1.save(cover_1_1_path, 'JPEG', quality=88, optimize=True)
    generated['cover_1_1'] = cover_1_1_path
    return generated

def upload_file_to_storage(local_path, cloud_path, content_type):
    enc_path = urllib.parse.quote(cloud_path, safe='')
    with open(local_path, 'rb') as f:
        data = f.read()
    url = f"https://firebasestorage.googleapis.com/v0/b/{bucket}/o?uploadType=media&name={enc_path}"
    req = urllib.request.Request(url, data=data, headers={'Content-Type': content_type}, method='POST')
    with urllib.request.urlopen(req) as resp:
        pass
    return f"https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{enc_path}?alt=media"

def format_duration(seconds):
    m = int(seconds // 60)
    s = int(seconds % 60)
    return f"{m:02d}:{s:02d}"

print("Carregando modelo Faster-Whisper...")
whisper = WhisperModel("base", device="cpu", compute_type="int8")

all_modules_results = []

for mod in modules_meta:
    folder_path = os.path.join(base_dir, mod['folder'])
    print(f"\n=======================================================")
    print(f"🚀 PROCESSANDO MÓDULO MS{mod['code']} • {mod['title']}")
    print(f"=======================================================")
    
    # 1. Thumbs
    thumbs_map = generate_thumbs(mod)
    print(f"✅ Thumbs e Capa 1:1 geradas")
    
    # 2. PDF
    pdf_files = [f for f in os.listdir(folder_path) if f.lower().endswith('.pdf')]
    pdf_text_full = ""
    local_pdf_dest = os.path.join(site_dir, 'Material-PDF', mod['pdf_name'])
    if pdf_files:
        orig_pdf = os.path.join(folder_path, pdf_files[0])
        with open(orig_pdf, 'rb') as f_in, open(local_pdf_dest, 'wb') as f_out:
            f_out.write(f_in.read())
        try:
            reader = pypdf.PdfReader(orig_pdf)
            pdf_text_full = "\n".join([page.extract_text() or "" for page in reader.pages])
        except Exception as e:
            print(f"Aviso ao ler texto do PDF: {e}")
        cloud_pdf_path = f"courses/ms-legacy/MS{mod['code']}/{mod['pdf_name']}"
        upload_file_to_storage(local_pdf_dest, cloud_pdf_path, 'application/pdf')
        print(f"✅ PDF Oficial copiado e enviado para Storage")
    
    # 3. Lista e Ordena vídeos MP4
    mp4_files = sorted([f for f in os.listdir(folder_path) if f.lower().endswith('.mp4')])
    
    # Mapeia atividades
    processed_lessons = []
    
    for idx, mp4_name in enumerate(mp4_files):
        name_lower = mp4_name.lower()
        
        # Identifica tipo
        if 'lr_1' in name_lower or 'lr.mp4' in name_lower or ('lr' in name_lower and 'lr_2' not in name_lower and 'lr_3' not in name_lower and 'lr_4' not in name_lower):
            act_key = 'lr' if len([x for x in mp4_files if 'lr' in x.lower()]) == 1 else 'lr_1'
            act_type = 'listen_read'
            lesson_title = "Aula 01 • Listen & Read (LR)" if act_key == 'lr' else "Aula 01.1 • Listen & Read (Part 1)"
        elif 'lr_2' in name_lower:
            act_key = 'lr_2'
            act_type = 'listen_read'
            lesson_title = "Aula 01.2 • Listen & Read (Part 2)"
        elif 'lr_3' in name_lower:
            act_key = 'lr_3'
            act_type = 'listen_read'
            lesson_title = "Aula 01.3 • Listen & Read (Part 3)"
        elif 'lr_4' in name_lower:
            act_key = 'lr_4'
            act_type = 'listen_read'
            lesson_title = "Aula 01.4 • Listen & Read (Part 4)"
        elif 'voc' in name_lower:
            act_key = 'voc'
            act_type = 'vocab'
            lesson_title = "Aula 02 • Vocabulary Session (VOC)"
        elif 'la' in name_lower and 'lask' not in name_lower:
            act_key = 'la'
            act_type = 'listen_answer'
            lesson_title = "Aula 03 • Listen & Answer (LA)"
        elif 'lrt' in name_lower:
            act_key = 'lrt'
            act_type = 'look_retell'
            lesson_title = "Aula 04 • Look & Retell (LRT)"
        elif 'lask_1' in name_lower:
            act_key = 'lask_1'
            act_type = 'listen_ask'
            lesson_title = "Aula 05.1 • Listen & Ask (Part 1)"
        elif 'lask_2' in name_lower:
            act_key = 'lask_2'
            act_type = 'listen_ask'
            lesson_title = "Aula 05.2 • Listen & Ask (Part 2)"
        elif 'lask' in name_lower:
            act_key = 'lask'
            act_type = 'listen_ask'
            lesson_title = "Aula 05 • Listen & Ask (LASK)"
        elif 'pro_1' in name_lower or ('pro' in name_lower and 'pro_2' not in name_lower):
            act_key = 'pro' if len([x for x in mp4_files if 'pro' in x.lower()]) == 1 else 'pro_1'
            act_type = 'pronunciation'
            lesson_title = "Aula 06 • Pronunciation & Connected Speech" if act_key == 'pro' else "Aula 06.1 • Pronunciation (Part 1)"
        elif 'pro_2' in name_lower:
            act_key = 'pro_2'
            act_type = 'pronunciation'
            lesson_title = "Aula 06.2 • Pronunciation Deep Dive"
        else:
            act_key = f"extra_{idx+1}"
            act_type = 'practice'
            lesson_title = f"Aula {idx+1:02d} • Prática Ativa"
            
        lesson_id = f"ms{mod['code']}-{act_key.replace('_', '-')}"
        v_path = os.path.join(folder_path, mp4_name)
        temp_mp3 = f"/tmp/{lesson_id}.mp3"
        
        print(f"  🎬 [{idx+1}/{len(mp4_files)}] Extraindo MP3: {lesson_title} ({mp4_name})...")
        total_duration_sec = 0
        with av.open(v_path) as in_c:
            in_a = in_c.streams.audio[0]
            if in_c.duration:
                total_duration_sec = float(in_c.duration / av.time_base)
            with av.open(temp_mp3, 'w', format='mp3') as out_c:
                out_a = out_c.add_stream('libmp3lame', rate=in_a.rate)
                out_a.bit_rate = 128000
                for frame in in_c.decode(in_a):
                    for packet in out_a.encode(frame):
                        out_c.mux(packet)
                    del frame
                for packet in out_a.encode(None):
                    out_c.mux(packet)
                    
        dur_str = format_duration(total_duration_sec) if total_duration_sec > 0 else "05:00"
        
        # Uploads
        cloud_mp3_path = f"courses/ms-legacy/MS{mod['code']}/audio_ms{mod['code']}_{act_key}.mp3"
        mp3_url = upload_file_to_storage(temp_mp3, cloud_mp3_path, 'audio/mpeg')
        
        cloud_mp4_path = f"courses/magic-stories-legacy/MS{mod['code']}/{mp4_name}"
        mp4_url = upload_file_to_storage(v_path, cloud_mp4_path, 'video/mp4')
        
        local_thumb = thumbs_map.get(act_key, thumbs_map.get('lr'))
        cloud_thumb_path = f"courses/ms-legacy/MS{mod['code']}/thumb_ms{mod['code']}_{act_key}.jpg"
        thumb_url = upload_file_to_storage(local_thumb, cloud_thumb_path, 'image/jpeg')
        
        print(f"     🎙️ Transcrevendo e sincronizando Karaokê...")
        segments, info = whisper.transcribe(temp_mp3, beam_size=5, vad_filter=True, vad_parameters=dict(min_silence_duration_ms=600))
        sentences = []
        for s_idx, seg in enumerate(segments):
            txt = seg.text.strip()
            if not txt: continue
            sentences.append({
                'id': s_idx + 1,
                'start': round(seg.start, 2),
                'end': round(seg.end, 2),
                'text': txt,
                'spokenTranslation': ''
            })
        print(f"     ✨ {len(sentences)} frases sincronizadas ({dur_str})")
        
        processed_lessons.append({
            'id': lesson_id,
            'title': lesson_title,
            'order': idx + 1,
            'duration': dur_str,
            'activity': act_type,
            'videoUrl': mp4_url,
            'audioUrl': mp3_url,
            'thumbnailUrl': f"assets/images/thumbs/ms{mod['code']}/thumb_ms{mod['code']}_{act_key}.jpg",
            'pdfUrl': f"Material-PDF/{mod['pdf_name']}",
            'sentences': sentences
        })
        
    all_modules_results.append({
        'mod': mod,
        'lessons': processed_lessons,
        'pdf_text': pdf_text_full
    })
    print(f"🎉 MÓDULO MS{mod['code']} PROCESSADO COM SUCESSO!\n")

with open('/tmp/batch_ms15_to_30_data.json', 'w', encoding='utf-8') as f:
    json.dump(all_modules_results, f, indent=2, ensure_ascii=False)

print("=== TODOS OS 16 MÓDULOS (MS015 A MS030) PROCESSADOS COM SUCESSO! ===")
