#!/usr/bin/env python3
"""
AgoraEuFalo - Batch Gemini TTS Studio Audio Generator for Blog Posts
Generates pristine MP3 128kbps audio files with Dual Speaker for Dialogues and Single Speaker for Chunks.
"""

import os
import sys
import json
import base64
import urllib.request
import lameenc

API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL = "gemini-2.5-flash-preview-tts"

POST_1_ITEMS = [
    {
        "type": "dual",
        "output": "assets/audio/blog/como-falar-ingles-com-personalidade/dialogue-amsterdam.mp3",
        "speakerA": ("Rodrigo", "Aoede"),
        "speakerB": ("Liam", "Puck"),
        "text": "Rodrigo: Hey Liam, how was your presentation with the board this morning? Liam: To be completely honest with you, it was a bit of a rollercoaster. Here's the thing: they loved the numbers, but don't get me wrong, the budget approval is going to take way longer than we expected. Rodrigo: I hear you loud and clear. As far as I'm concerned, if the core team is on board, you've already won half the battle."
    },
    {
        "type": "single",
        "output": "assets/audio/blog/como-falar-ingles-com-personalidade/chunk-01.mp3",
        "voice": "Aoede",
        "text": "To be completely honest with you, I didn't see that coming."
    },
    {
        "type": "single",
        "output": "assets/audio/blog/como-falar-ingles-com-personalidade/chunk-02.mp3",
        "voice": "Charon",
        "text": "Here's the thing: we have the talent, but we lack time."
    },
    {
        "type": "single",
        "output": "assets/audio/blog/como-falar-ingles-com-personalidade/chunk-03.mp3",
        "voice": "Kore",
        "text": "Don't get me wrong, but we need to rethink this approach."
    },
    {
        "type": "single",
        "output": "assets/audio/blog/como-falar-ingles-com-personalidade/chunk-04.mp3",
        "voice": "Puck",
        "text": "I hear you loud and clear, and I'll make sure it's done."
    },
    {
        "type": "single",
        "output": "assets/audio/blog/como-falar-ingles-com-personalidade/chunk-05.mp3",
        "voice": "Fenrir",
        "text": "As far as I'm concerned, this deal is already closed."
    },
    {
        "type": "single",
        "output": "assets/audio/blog/como-falar-ingles-com-personalidade/chunk-06.mp3",
        "voice": "Aoede",
        "text": "At the end of the day, results speak louder than words."
    }
]

POST_2_ITEMS = [
    {
        "type": "single",
        "output": "assets/audio/blog/expandindo-seu-vocabulario-em-ingles-sem-esquecer/chunk-01.mp3",
        "voice": "Puck",
        "text": "We're running out of time before the deadline."
    },
    {
        "type": "single",
        "output": "assets/audio/blog/expandindo-seu-vocabulario-em-ingles-sem-esquecer/chunk-02.mp3",
        "voice": "Aoede",
        "text": "It's hard to keep track of all these expenses."
    },
    {
        "type": "single",
        "output": "assets/audio/blog/expandindo-seu-vocabulario-em-ingles-sem-esquecer/chunk-03.mp3",
        "voice": "Charon",
        "text": "She came up with a brilliant marketing strategy."
    },
    {
        "type": "single",
        "output": "assets/audio/blog/expandindo-seu-vocabulario-em-ingles-sem-esquecer/chunk-04.mp3",
        "voice": "Kore",
        "text": "We need to get rid of unnecessary bureaucracy."
    },
    {
        "type": "single",
        "output": "assets/audio/blog/expandindo-seu-vocabulario-em-ingles-sem-esquecer/drill-01.mp3",
        "voice": "Puck",
        "text": "Do we have plenty of time left before the presentation? No, we don't. We're running out of time."
    },
    {
        "type": "single",
        "output": "assets/audio/blog/expandindo-seu-vocabulario-em-ingles-sem-esquecer/drill-02.mp3",
        "voice": "Aoede",
        "text": "Is it easy to follow all project updates manually? No, it's really hard to keep track of everything."
    }
]

def synthesize_item(item):
    print(f"🎙️ Gerando: {item['output']} ...")
    if item["type"] == "dual":
        spk_a_name, spk_a_voice = item["speakerA"]
        spk_b_name, spk_b_voice = item["speakerB"]
        payload = {
            "contents": [{"role": "user", "parts": [{"text": item["text"]}]}],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "multiSpeakerVoiceConfig": {
                        "speakerVoiceConfigs": [
                            {
                                "speaker": spk_a_name,
                                "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": spk_a_voice}}
                            },
                            {
                                "speaker": spk_b_name,
                                "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": spk_b_voice}}
                            }
                        ]
                    }
                }
            }
        }
    else:
        payload = {
            "contents": [{"role": "user", "parts": [{"text": item["text"]}]}],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "voiceConfig": {
                        "prebuiltVoiceConfig": {"voiceName": item["voice"]}
                    }
                }
            }
        }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
    
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))

    raw_pcm = base64.b64decode(res["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])

    # Encode to MP3 with lameenc
    encoder = lameenc.Encoder()
    encoder.set_bit_rate(128)
    encoder.set_in_sample_rate(24000)
    encoder.set_channels(1)
    encoder.set_quality(2)
    mp3_bytes = encoder.encode(raw_pcm)
    mp3_bytes += encoder.flush()

    out_path = os.path.join(os.path.dirname(__file__), "..", item["output"])
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "wb") as f:
        f.write(mp3_bytes)

    print(f"✅ Salvo ({len(mp3_bytes)} bytes): {item['output']}")

def main():
    print("🚀 Iniciando síntese de estúdio Gemini TTS para os posts do Blog...")
    all_items = POST_1_ITEMS + POST_2_ITEMS
    for item in all_items:
        synthesize_item(item)
    print("🎉 Todos os 13 arquivos MP3 de estúdio foram gerados com perfeição!")

if __name__ == "__main__":
    main()
