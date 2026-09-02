import os
import urllib.request
import urllib.parse
import json
import av
from faster_whisper import WhisperModel

bucket = 'agoraeufalo-3463a.firebasestorage.app'
source_dir = '/Users/macbookpro/Downloads/MS_MIGRACAO/MS010_An_english_student'

lessons = [
    {
        'id': 'ms010-lr-1',
        'title': 'Aula 01.1 • Listen & Read (LR Legacy)',
        'activity': 'listen_read',
        'file': 'MS010_LR_1.mp4',
        'cloud_mp4': 'courses/magic-stories-legacy/MS010/MS010_LR_1.mp4',
        'cloud_mp3': 'courses/ms-legacy/MS010/audio_ms010_lr_1.mp3',
        'cloud_thumb': 'courses/ms-legacy/MS010/thumb_ms010_lr_1.jpg',
        'local_thumb': '/Users/macbookpro/Desktop/agoraeufalo_site/assets/images/thumbs/ms010/thumb_ms010_lr_1.jpg'
    },
    {
        'id': 'ms010-lr-2',
        'title': 'Aula 01.2 • Listen & Read (LR Extended)',
        'activity': 'listen_read',
        'file': 'MS010_LR_2.mp4',
        'cloud_mp4': 'courses/magic-stories-legacy/MS010/MS010_LR_2.mp4',
        'cloud_mp3': 'courses/ms-legacy/MS010/audio_ms010_lr_2.mp3',
        'cloud_thumb': 'courses/ms-legacy/MS010/thumb_ms010_lr_2.jpg',
        'local_thumb': '/Users/macbookpro/Desktop/agoraeufalo_site/assets/images/thumbs/ms010/thumb_ms010_lr_2.jpg'
    },
    {
        'id': 'ms010-voc',
        'title': 'Aula 02 • Vocabulary Session (VOC)',
        'activity': 'vocab',
        'file': 'MS010_VOC_1.mp4',
        'cloud_mp4': 'courses/magic-stories-legacy/MS010/MS010_VOC_1.mp4',
        'cloud_mp3': 'courses/ms-legacy/MS010/audio_ms010_voc.mp3',
        'cloud_thumb': 'courses/ms-legacy/MS010/thumb_ms010_voc.jpg',
        'local_thumb': '/Users/macbookpro/Desktop/agoraeufalo_site/assets/images/thumbs/ms010/thumb_ms010_voc.jpg'
    },
    {
        'id': 'ms010-la',
        'title': 'Aula 03 • Listen & Answer (LA)',
        'activity': 'listen_answer',
        'file': 'MS010_LA_1.mp4',
        'cloud_mp4': 'courses/magic-stories-legacy/MS010/MS010_LA_1.mp4',
        'cloud_mp3': 'courses/ms-legacy/MS010/audio_ms010_la.mp3',
        'cloud_thumb': 'courses/ms-legacy/MS010/thumb_ms010_la.jpg',
        'local_thumb': '/Users/macbookpro/Desktop/agoraeufalo_site/assets/images/thumbs/ms010/thumb_ms010_la.jpg'
    },
    {
        'id': 'ms010-lrt',
        'title': 'Aula 04 • Look & Retell (LRT)',
        'activity': 'look_retell',
        'file': 'MS010_LRT_1.mp4',
        'cloud_mp4': 'courses/magic-stories-legacy/MS010/MS010_LRT_1.mp4',
        'cloud_mp3': 'courses/ms-legacy/MS010/audio_ms010_lrt.mp3',
        'cloud_thumb': 'courses/ms-legacy/MS010/thumb_ms010_lrt.jpg',
        'local_thumb': '/Users/macbookpro/Desktop/agoraeufalo_site/assets/images/thumbs/ms010/thumb_ms010_lrt.jpg'
    },
    {
        'id': 'ms010-lask',
        'title': 'Aula 05 • Listen & Ask (LASK)',
        'activity': 'listen_ask',
        'file': 'MS010_LASK_1.mp4',
        'cloud_mp4': 'courses/magic-stories-legacy/MS010/MS010_LASK_1.mp4',
        'cloud_mp3': 'courses/ms-legacy/MS010/audio_ms010_lask.mp3',
        'cloud_thumb': 'courses/ms-legacy/MS010/thumb_ms010_lask.jpg',
        'local_thumb': '/Users/macbookpro/Desktop/agoraeufalo_site/assets/images/thumbs/ms010/thumb_ms010_lask.jpg'
    },
    {
        'id': 'ms010-pro',
        'title': 'Aula 06 • Pronunciation & Connected Speech',
        'activity': 'pronunciation',
        'file': 'MS010_PRO_1.mp4',
        'cloud_mp4': 'courses/magic-stories-legacy/MS010/MS010_PRO_1.mp4',
        'cloud_mp3': 'courses/ms-legacy/MS010/audio_ms010_pro.mp3',
        'cloud_thumb': 'courses/ms-legacy/MS010/thumb_ms010_pro.jpg',
        'local_thumb': '/Users/macbookpro/Desktop/agoraeufalo_site/assets/images/thumbs/ms010/thumb_ms010_pro.jpg'
    }
]

print("=== INICIANDO ESTEIRA MS010 (An English Student) ===")

pdf_path = os.path.join(source_dir, 'MS 010 An English Student PDF.pdf')
local_pdf_dest = '/Users/macbookpro/Desktop/agoraeufalo_site/Material-PDF/MS010_An_English_Student_Apostila_Oficial.pdf'
with open(pdf_path, 'rb') as f_in, open(local_pdf_dest, 'wb') as f_out:
    f_out.write(f_in.read())
print(f"PDF copiado para: {local_pdf_dest}")

cloud_pdf = 'courses/ms-legacy/MS010/MS010_An_English_Student_Apostila_Oficial.pdf'
enc_pdf = urllib.parse.quote(cloud_pdf, safe='')
with open(local_pdf_dest, 'rb') as f:
    pdf_bytes = f.read()
req = urllib.request.Request(f"https://firebasestorage.googleapis.com/v0/b/{bucket}/o?uploadType=media&name={enc_pdf}", data=pdf_bytes, headers={'Content-Type': 'application/pdf'}, method='POST')
with urllib.request.urlopen(req) as resp:
    print(f"PDF Upload OK: {cloud_pdf} - Status {resp.status}")

print("Carregando Faster-Whisper local...")
model = WhisperModel("base", device="cpu", compute_type="int8")

ms010_results = []

for item in lessons:
    v_path = os.path.join(source_dir, item['file'])
    temp_mp3 = f"/tmp/{item['id']}.mp3"
    
    print(f"\n--- Processando: {item['title']} ---")
    
    with av.open(v_path) as in_c:
        in_a = in_c.streams.audio[0]
        with av.open(temp_mp3, 'w', format='mp3') as out_c:
            out_a = out_c.add_stream('libmp3lame', rate=in_a.rate)
            out_a.bit_rate = 128000
            for frame in in_c.decode(in_a):
                for packet in out_a.encode(frame):
                    out_c.mux(packet)
                del frame
            for packet in out_a.encode(None):
                out_c.mux(packet)
    print(f"MP3 Extraído: {os.path.getsize(temp_mp3)/1024:.1f} KB")
    
    enc_mp3 = urllib.parse.quote(item['cloud_mp3'], safe='')
    with open(temp_mp3, 'rb') as f:
        data_mp3 = f.read()
    req = urllib.request.Request(f"https://firebasestorage.googleapis.com/v0/b/{bucket}/o?uploadType=media&name={enc_mp3}", data=data_mp3, headers={'Content-Type': 'audio/mpeg'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        print(f"Upload MP3 OK: {item['cloud_mp3']} - Status {resp.status}")
    mp3_public_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{enc_mp3}?alt=media"
    
    enc_mp4 = urllib.parse.quote(item['cloud_mp4'], safe='')
    with open(v_path, 'rb') as f:
        data_mp4 = f.read()
    req = urllib.request.Request(f"https://firebasestorage.googleapis.com/v0/b/{bucket}/o?uploadType=media&name={enc_mp4}", data=data_mp4, headers={'Content-Type': 'video/mp4'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        print(f"Upload MP4 OK: {item['cloud_mp4']} ({len(data_mp4)//1024//1024} MB) - Status {resp.status}")
    mp4_public_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{enc_mp4}?alt=media"
    
    enc_thumb = urllib.parse.quote(item['cloud_thumb'], safe='')
    with open(item['local_thumb'], 'rb') as f:
        data_thumb = f.read()
    req = urllib.request.Request(f"https://firebasestorage.googleapis.com/v0/b/{bucket}/o?uploadType=media&name={enc_thumb}", data=data_thumb, headers={'Content-Type': 'image/jpeg'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        print(f"Upload Thumb OK: {item['cloud_thumb']} - Status {resp.status}")
    thumb_public_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{enc_thumb}?alt=media"
    
    print("Transcrevendo e gerando timestamps...")
    segments, info = model.transcribe(temp_mp3, beam_size=5, vad_filter=True, vad_parameters=dict(min_silence_duration_ms=600))
    sentences = []
    for idx, seg in enumerate(segments):
        txt = seg.text.strip()
        if not txt: continue
        sentences.append({
            'id': idx + 1,
            'start': round(seg.start, 2),
            'end': round(seg.end, 2),
            'text': txt,
            'spokenTranslation': ''
        })
    print(f"Total: {len(sentences)} frases sincronizadas.")
    
    ms010_results.append({
        'id': item['id'],
        'title': item['title'],
        'activity': item['activity'],
        'videoUrl': mp4_public_url,
        'audioUrl': mp3_public_url,
        'thumbnailUrl': thumb_public_url,
        'localThumbnail': f"assets/images/thumbs/ms010/thumb_{item['id'].replace('-', '_')}.jpg",
        'pdfUrl': "Material-PDF/MS010_An_English_Student_Apostila_Oficial.pdf",
        'sentences': sentences
    })

with open('/tmp/ms010_processed_data.json', 'w', encoding='utf-8') as f:
    json.dump(ms010_results, f, indent=2, ensure_ascii=False)

print("\n=== TODAS AS 7 AULAS DO MS010 PROCESSADAS COM SUCESSO! ===")
