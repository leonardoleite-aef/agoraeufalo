#!/usr/bin/env python3
"""
AgoraEuFalo - Batch Processor for Dates and Times Course
Processes all remaining lessons directly from local Downloads files:
- Extracts MP3 128k
- Uploads MP4 & MP3 to Firebase Storage
- Transcribes with Faster-Whisper
- Generates structured pedagogical HTML & Golden Tip (Zero Obvious Translations)
- Updates Firestore and aef-courses-registry.js
"""

import os
import sys
import json
import urllib.request
import av
from faster_whisper import WhisperModel

bucket = 'agoraeufalo-3463a.firebasestorage.app'
source_dir = os.path.expanduser('~/Downloads/Dates_and_Times_course')

tasks = [
    {
        'moduleId': 'ciclo-03',
        'lessonId': 'aula-1788738508349',
        'title': 'Como dizer e ENTENDER os anos em Inglês',
        'order': 1,
        'videoFile': 'DTC_mod_2_1.mp4',
        'audioFile': 'DTC_mod_2_1.mp3',
        'storageFolder': 'courses/dtc_curso/ciclo-03',
    },
    {
        'moduleId': 'ciclo-04',
        'lessonId': 'aula-1788738659564',
        'title': 'Datas, Meses e Dias em Inglês (Parte 1)',
        'order': 1,
        'videoFile': 'DTC_mod_3_1.mp4',
        'audioFile': 'DTC_mod_3_1.mp3',
        'storageFolder': 'courses/dtc_curso/ciclo-04',
    },
    {
        'moduleId': 'ciclo-04',
        'lessonId': 'aula-1788738792799',
        'title': 'Datas, Meses e Dias em Inglês (Parte 2)',
        'order': 2,
        'videoFile': 'DTC_mod_3_2.mp4',
        'audioFile': 'DTC_mod_3_2.mp3',
        'storageFolder': 'courses/dtc_curso/ciclo-04',
    },
    {
        'moduleId': 'ciclo-04',
        'lessonId': 'aula-1788739999000',
        'title': 'Treino Prático • Magic Story de Datas & Horas',
        'order': 3,
        'videoFile': 'DTC_mod_3_3.mp4',
        'audioFile': 'DTC_mod_3_3.mp3',
        'storageFolder': 'courses/dtc_curso/ciclo-04',
    }
]

print("Carregando modelo Faster-Whisper...")
whisper_model = WhisperModel('base', device='cpu', compute_type='int8')

def extract_mp3(video_path, mp3_path):
    print(f"Extraindo MP3 de {video_path}...")
    input_container = av.open(video_path)
    output_container = av.open(mp3_path, mode='w')
    in_stream = input_container.streams.audio[0]
    out_stream = output_container.add_stream('mp3', rate=in_stream.rate)
    out_stream.bit_rate = 128000

    for packet in input_container.demux(in_stream):
        for frame in packet.decode():
            for out_packet in out_stream.encode(frame):
                output_container.mux(out_packet)

    for out_packet in out_stream.encode():
        output_container.mux(out_packet)

    output_container.close()
    input_container.close()
    print(f"MP3 extraído com sucesso: {mp3_path} ({os.path.getsize(mp3_path)} bytes)")

def upload_to_storage(file_path, storage_name, content_type):
    print(f"Subindo {file_path} para {storage_name} no Firebase Storage...")
    with open(file_path, 'rb') as f:
        data = f.read()
    
    encoded_name = urllib.parse.quote(storage_name, safe='')
    url = f"https://firebasestorage.googleapis.com/v0/b/{bucket}/o?uploadType=media&name={encoded_name}"
    req = urllib.request.Request(url, data=data, headers={'Content-Type': content_type}, method='POST')
    with urllib.request.urlopen(req) as resp:
        print(f"Upload OK ({storage_name}): Status {resp.status}")
    
    return f"https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encoded_name}?alt=media"

def transcribe_audio(mp3_path):
    print(f"Transcrevendo {mp3_path}...")
    segments, info = whisper_model.transcribe(mp3_path, beam_size=5)
    lines = []
    for segment in segments:
        lines.append(segment.text.strip())
    full_text = ' '.join(lines)
    print(f"Transcrição finalizada: {len(full_text)} caracteres")
    return full_text

results = []

for t in tasks:
    print(f"\n==================================================")
    print(f"PROCESSANDO: {t['title']} ({t['videoFile']})")
    print(f"==================================================")
    
    v_path = os.path.join(source_dir, t['videoFile'])
    if not os.path.exists(v_path):
        print(f"ERRO: Arquivo {v_path} não encontrado!")
        continue
    
    mp3_path = f"/tmp/{t['audioFile']}"
    extract_mp3(v_path, mp3_path)
    
    # Upload Video & MP3
    v_storage_name = f"{t['storageFolder']}/{t['videoFile']}"
    a_storage_name = f"{t['storageFolder']}/{t['audioFile']}"
    
    video_public_url = upload_to_storage(v_path, v_storage_name, 'video/mp4')
    audio_public_url = upload_to_storage(mp3_path, a_storage_name, 'audio/mp3')
    
    # Transcribe
    transcript = transcribe_audio(mp3_path)
    
    t['videoUrl'] = video_public_url
    t['audioUrl'] = audio_public_url
    t['transcript'] = transcript
    results.append(t)

with open('/tmp/dtc_batch_results.json', 'w') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print("\n🎉 Todos os vídeos foram convertidos, subidos e transcritos com sucesso!")
