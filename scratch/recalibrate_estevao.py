#!/usr/bin/env python3
"""
Optimal Pedagogical Clause Segmentation (3-8 seconds per card)
"""

import os
import json
import time
from faster_whisper import WhisperModel

audio_path = "assets/audio/alunos/estevao/Estevao_presentation_leo.mp3"
model = WhisperModel("small", device="cpu", compute_type="int8")

segments, info = model.transcribe(
    audio_path,
    beam_size=5,
    word_timestamps=True,
    vad_filter=True
)

raw_segments = list(segments)

# Break and merge into optimal pedagogical chunks (each between 2.5s and 8.0s)
cards = []
curr = None

for seg in raw_segments:
    t = seg.text.strip()
    if not t:
        continue
    
    st = round(seg.start, 2)
    en = round(seg.end, 2)
    
    if curr is None:
        curr = {"start": st, "end": en, "text": t, "notes": ""}
    else:
        dur = curr["end"] - curr["start"]
        seg_dur = en - st
        prev_text = curr["text"]
        
        # Conditions to keep merging:
        # 1. Previous block is very short (< 2.5s)
        # 2. Total combined duration will be under 8.0s AND previous didn't end with strong punctuation
        if (dur < 2.5) or (dur + seg_dur <= 7.5 and not prev_text.endswith((".", "?", "!"))):
            curr["end"] = en
            curr["text"] = f"{curr['text']} {t}".strip()
        else:
            cards.append(curr)
            curr = {"start": st, "end": en, "text": t, "notes": ""}

if curr:
    cards.append(curr)

for idx, c in enumerate(cards, 1):
    c["id"] = idx
    c["text"] = c["text"].replace("Estevan", "Estevao").replace("Estêvão", "Estevao").replace("Estevão", "Estevao").replace("MGO", "NGO")

print(f"✅ Total optimal pedagogical cards: {len(cards)}")
durations = [c["end"] - c["start"] for c in cards]
print(f"Average duration: {sum(durations)/len(durations):.1f}s (Min: {min(durations):.1f}s, Max: {max(durations):.1f}s)")

mins = int(info.duration // 60)
secs = int(info.duration % 60)
duration_str = f"{mins:02d}:{secs:02d}"

js_content = f"""/**
 * Student Session: Estevao
 * Mentorship VIP - Prof. Leonardo Leite
 * Audio: Estevao_presentation_leo.mp3 (Duration: {duration_str})
 * Precision Calibrated on {time.strftime('%Y-%m-%d %H:%M')}
 */
window.AEF_STUDENT_ESTEVAO = {{
  id: "estevao",
  name: "Estevao",
  badge: "VIP Mentee",
  tracks: [
    {{
      id: "estevao-01",
      title: "Session 01: UK International Keynote Presentation",
      duration: "{duration_str}",
      coverImage: "../assets/images/cover-carlos-session01.jpg",
      audioUrl: "/assets/audio/alunos/estevao/Estevao_presentation_leo.mp3",
      summary: "High-impact keynote speech coaching by Prof. Leo Leite focusing on public education policy, the Pororoca implementation model, and systemic feedback loops.",
      goldenTip: "Breathe naturally at comma pauses. Speech clarity comes from linking sound chunks together, not from rushing speed.",
      sentences: {json.dumps(cards, indent=8, ensure_ascii=False)}
    }}
  ]
}};
"""

with open("treino/data/estevao.js", "w", encoding="utf-8") as f:
    f.write(js_content)

print("📄 Saved optimal cards to treino/data/estevao.js")
