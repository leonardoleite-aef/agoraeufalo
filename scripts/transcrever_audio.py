#!/usr/bin/env python3
"""
AgoraEuFalo - Automated Transcription & Sound-Chunk Calibrator
Professor Leonardo Leite

Usage:
  python3 scripts/transcrever_audio.py --audio assets/audio/alunos/estevao/audio.mp3 --aluno estevao --titulo "Session 01: Keynote Speech"
"""

import os
import sys
import json
import argparse
import time

def transcribe_audio(audio_path, student_id, title="VIP Spoken Session", summary="Personalized audio training coached by Prof. Leonardo Leite."):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("Error: faster-whisper is not installed. Run: pip install faster-whisper")
        sys.exit(1)

    if not os.path.exists(audio_path):
        print(f"Error: Audio file not found: {audio_path}")
        sys.exit(1)

    print(f"🎙️ Loading transcription model for: {audio_path}")
    t0 = time.time()
    model = WhisperModel("small", device="cpu", compute_type="int8")
    
    print("⏳ Transcribing and calibrating millimetric timestamps...")
    segments, info = model.transcribe(
        audio_path,
        beam_size=5,
        word_timestamps=True,
        vad_filter=True
    )

    sentences = []
    idx = 1
    for seg in segments:
        text = seg.text.strip()
        if not text:
            continue
        sentences.append({
            "id": idx,
            "start": round(seg.start, 2),
            "end": round(seg.end, 2),
            "text": text,
            "notes": ""
        })
        idx += 1

    mins = int(info.duration // 60)
    secs = int(info.duration % 60)
    duration_str = f"{mins:02d}:{secs:02d}"

    js_var_name = f"AEF_STUDENT_{student_id.upper()}"
    student_name = student_id.capitalize()
    
    output_js = f"treino/data/{student_id}.js"
    os.makedirs(os.path.dirname(output_js), exist_ok=True)

    js_content = f"""/**
 * Student Session: {student_name}
 * Mentorship VIP - Prof. Leonardo Leite
 * Generated on {time.strftime('%Y-%m-%d %H:%M')}
 */
window.{js_var_name} = {{
  id: "{student_id}",
  name: "{student_name}",
  badge: "VIP Mentee",
  tracks: [
    {{
      id: "{student_id}-01",
      title: "{title}",
      duration: "{duration_str}",
      audioUrl: "/{audio_path}",
      summary: "{summary}",
      goldenTip: "Breathe naturally at pause markers and link sound chunks smoothly.",
      sentences: {json.dumps(sentences, indent=8, ensure_ascii=False)}
    }}
  ]
}};
"""
    with open(output_js, "w", encoding="utf-8") as f:
        f.write(js_content)

    print(f"✅ Transcription completed successfully in {time.time() - t0:.1f}s!")
    print(f"📄 Output saved to: {output_js} ({len(sentences)} sound patterns mapped)")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Transcribe audio for AgoraEuFalo VIP Training Suite")
    parser.add_argument("--audio", required=True, help="Path to audio file (mp3, wav, m4a)")
    parser.add_argument("--aluno", required=True, help="Student ID (e.g. estevao, marcos, patricia, carlos)")
    parser.add_argument("--titulo", default="VIP Spoken Session", help="Session title")
    parser.add_argument("--resumo", default="Personalized audio training coached by Prof. Leonardo Leite.", help="Pedagogical overview")
    
    args = parser.parse_args()
    transcribe_audio(args.audio, args.aluno, args.titulo, args.resumo)
