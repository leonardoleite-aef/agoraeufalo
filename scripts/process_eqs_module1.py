import os
import urllib.request
import urllib.parse
import json
import av
from faster_whisper import WhisperModel

bucket = 'agoraeufalo-3463a.firebasestorage.app'
source_dir = '/Users/macbookpro/Downloads/EQS_m0_m1'

lessons = [
    {
        'id': 'eqs-1-1',
        'lessonId': 'eqs11',
        'title': 'Aula 1.1 • Os Pronomes Sujeito',
        'file': 'EQS_1_1.mp4',
        'cloud_mp3': 'courses/english-quickstart/EQS_1_1.mp3'
    },
    {
        'id': 'eqs-1-2',
        'lessonId': 'eqs12',
        'title': 'Aula 1.2 • O Rei dos Verbos "To Be" (Afirmativa)',
        'file': 'EQS_mod_1_2_to_be.mp4',
        'cloud_mp3': 'courses/english-quickstart/EQS_mod_1_2_to_be.mp3'
    },
    {
        'id': 'eqs-1-3',
        'lessonId': 'eqs13',
        'title': 'Aula 1.3 • O Rei dos Verbos "To Be" (Negativa)',
        'file': 'EQS_1_3_tobe_negtive.mp4',
        'cloud_mp3': 'courses/english-quickstart/EQS_1_3_tobe_negtive.mp3'
    },
    {
        'id': 'eqs-1-4',
        'lessonId': 'eqs14',
        'title': 'Aula 1.4 • Adjetivos Essenciais',
        'file': 'EQS_1_4_adjectives.mp4',
        'cloud_mp3': 'courses/english-quickstart/EQS_1_4_adjectives.mp3'
    }
]

print("=== INICIANDO PIPELINE LOCAL EQS MÓDULO 1 (PyAV + Whisper Local - ZERO Tokens de API) ===")

print("Carregando modelo Whisper local...")
model = WhisperModel("base", device="cpu", compute_type="int8")

all_tracks_data = []

for item in lessons:
    video_path = os.path.join(source_dir, item['file'])
    temp_mp3 = f"/tmp/{item['id']}.mp3"
    
    print(f"\n--- Processando: {item['title']} ---")
    print(f"1. Extraindo áudio via PyAV: {item['file']}")
    with av.open(video_path) as in_container:
        in_audio = in_container.streams.audio[0]
        with av.open(temp_mp3, 'w', format='mp3') as out_container:
            out_audio = out_container.add_stream('libmp3lame', rate=in_audio.rate)
            out_audio.bit_rate = 128000
            for frame in in_container.decode(in_audio):
                for packet in out_audio.encode(frame):
                    out_container.mux(packet)
                del frame
            for packet in out_audio.encode(None):
                out_container.mux(packet)
                
    print(f"Áudio extraído: {os.path.getsize(temp_mp3)/1024:.1f} KB")
    
    print("2. Upload do MP3 para Firebase Storage via REST...")
    encoded_name = urllib.parse.quote(item['cloud_mp3'], safe='')
    upload_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket}/o?uploadType=media&name={encoded_name}"
    with open(temp_mp3, 'rb') as f:
        mp3_bytes = f.read()
    req = urllib.request.Request(upload_url, data=mp3_bytes, headers={'Content-Type': 'audio/mpeg'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        print(f"Upload OK: {item['cloud_mp3']} - Status {resp.status}")
        
    audio_public_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encoded_name}?alt=media"
    
    print("3. Transcrevendo localmente e gerando timestamps com VAD...")
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
        
    print(f"Total de {len(sentences)} frases sincronizadas localmente.")
    
    all_tracks_data.append({
        'id': item['id'],
        'lessonId': item['lessonId'],
        'title': item['title'],
        'audioUrl': audio_public_url,
        'sentences': sentences
    })

with open('/tmp/eqs_module1_tracks.json', 'w', encoding='utf-8') as f:
    json.dump(all_tracks_data, f, indent=2, ensure_ascii=False)

print("\n=== PIPELINE LOCAL EQS CONCLUÍDO COM SUCESSO ===")
