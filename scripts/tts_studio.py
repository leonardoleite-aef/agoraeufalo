#!/usr/bin/env python3
"""
AgoraEuFalo - TTS Studio Audio Factory (CLI & Automation Engine)
Professor Leonardo Leite

Generates pristine MP3/WAV audios using Google Gemini TTS API with Single & Multi-Speaker support.

Usage:
  # Single Speaker Narration:
  python3 scripts/tts_studio.py --text "English is not a school subject; it's a living experience." --voice Puck --output assets/audio/narration.mp3

  # Dual Speaker Dialogue:
  python3 scripts/tts_studio.py --text "Leo: Did you practice today? Student: Yes, every single morning!" --speakerA "Leo:Kore" --speakerB "Student:Puck" --output assets/audio/dialogue.mp3

  # From a Text File:
  python3 scripts/tts_studio.py --file roteiro.txt --speakerA "Leo:Charon" --speakerB "Estevao:Fenrir" --output assets/audio/aula_estevao.mp3
"""

import os
import sys
import json
import argparse
import base64
import struct
import urllib.request
import urllib.error
import subprocess

GEMINI_DEFAULT_MODEL = "gemini-2.5-flash-preview-tts"

def get_api_key():
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("GEMINI_API_KEY="):
                        key = line.split("=", 1)[1].strip().strip('"').strip("'")
                        break
    return key

def create_wav_header(pcm_bytes, sample_rate=24000, channels=1, bits_per_sample=16):
    """Encapsulates raw PCM bytes with a standard RIFF/WAVE header."""
    data_size = len(pcm_bytes)
    byte_rate = sample_rate * channels * (bits_per_sample // 8)
    block_align = channels * (bits_per_sample // 8)
    
    header = struct.pack(
        '<4sI4s4sIHHIIHH4sI',
        b'RIFF',
        36 + data_size,
        b'WAVE',
        b'fmt ',
        16,              # fmt chunk length
        1,               # PCM format
        channels,
        sample_rate,
        byte_rate,
        block_align,
        bits_per_sample,
        b'data',
        data_size
    )
    return header + pcm_bytes

def convert_wav_to_mp3(wav_path, mp3_path):
    """Converts WAV file to high quality MP3 using ffmpeg if available."""
    try:
        cmd = ["ffmpeg", "-y", "-i", wav_path, "-codec:a", "libmp3lame", "-qscale:a", "2", mp3_path]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        return True
    except Exception:
        # If ffmpeg is not available, we keep the audio as is or notify user
        return False

def generate_tts(text, output_path, model=GEMINI_DEFAULT_MODEL, voice="Puck", speaker_a=None, speaker_b=None, api_key=None):
    if not api_key:
        api_key = get_api_key()
    
    if not api_key:
        print("❌ Erro: GEMINI_API_KEY não encontrada.")
        print("Defina a variável de ambiente: export GEMINI_API_KEY='sua_chave' ou passe --api-key.")
        sys.exit(1)

    print(f"🎙️ [TTS Studio] Preparando síntese com modelo {model}...")
    
    # Configure generation payload
    if speaker_a and speaker_b:
        # Dual Speaker Mode
        name_a, voice_a = speaker_a.split(":", 1) if ":" in speaker_a else ("Speaker A", speaker_a)
        name_b, voice_b = speaker_b.split(":", 1) if ":" in speaker_b else ("Speaker B", speaker_b)
        
        print(f"👥 Modo Dual Speaker: {name_a} ({voice_a}) & {name_b} ({voice_b})")
        
        payload = {
            "contents": [{"role": "user", "parts": [{"text": text}]}],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "multiSpeakerVoiceConfig": {
                        "speakerVoiceConfigs": [
                            {
                                "speaker": name_a.strip(),
                                "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice_a.strip()}}
                            },
                            {
                                "speaker": name_b.strip(),
                                "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice_b.strip()}}
                            }
                        ]
                    }
                }
            }
        }
    else:
        # Single Speaker Mode
        print(f"👤 Modo Single Speaker: Voz {voice}")
        payload = {
            "contents": [{"role": "user", "parts": [{"text": text}]}],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "voiceConfig": {
                        "prebuiltVoiceConfig": {"voiceName": voice.strip()}
                    }
                }
            }
        }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "x-goog-api-key": api_key}
    )

    try:
        print("⏳ Chamando Gemini API...")
        with urllib.request.urlopen(req) as resp:
            resp_body = resp.read().decode("utf-8")
            result = json.loads(resp_body)
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode("utf-8")
        print(f"❌ Erro na API do Gemini (HTTP {e.code}): {error_msg}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Erro de conexão: {str(e)}")
        sys.exit(1)

    # Extract audio bytes
    try:
        candidate = result["candidates"][0]
        audio_part = None
        for part in candidate["content"]["parts"]:
            if "inlineData" in part:
                audio_part = part["inlineData"]
                break
        
        if not audio_part:
            print("❌ Nenhum dado de áudio encontrado na resposta.")
            sys.exit(1)

        raw_base64 = audio_part["data"]
        raw_bytes = base64.b64decode(raw_base64)
        
        # Check if already has RIFF WAV header or needs PCM wrapping
        if len(raw_bytes) > 12 and raw_bytes[:4] == b'RIFF' and raw_bytes[8:12] == b'WAVE':
            wav_bytes = raw_bytes
        else:
            wav_bytes = create_wav_header(raw_bytes, sample_rate=24000)

        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

        # Handle MP3 vs WAV output
        if output_path.lower().endswith(".mp3"):
            temp_wav = output_path + ".temp.wav"
            with open(temp_wav, "wb") as f:
                f.write(wav_bytes)
            
            if convert_wav_to_mp3(temp_wav, output_path):
                if os.path.exists(temp_wav):
                    os.remove(temp_wav)
                print(f"✅ Áudio MP3 exportado com sucesso: {output_path}")
            else:
                # Fallback to WAV with user note
                os.rename(temp_wav, output_path.replace(".mp3", ".wav"))
                print(f"⚠️ ffmpeg não disponível no PATH. Áudio salvo em formato WAV: {output_path.replace('.mp3', '.wav')}")
        else:
            with open(output_path, "wb") as f:
                f.write(wav_bytes)
            print(f"✅ Áudio WAV exportado com sucesso: {output_path}")

    except KeyError as e:
        print(f"❌ Resposta inesperada da API: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="TTS Studio - Fábrica de Áudios MP3 AgoraEuFalo")
    parser.add_argument("--text", help="Texto ou diálogo para sintetizar")
    parser.add_argument("--file", help="Arquivo .txt contendo o roteiro")
    parser.add_argument("--output", required=True, help="Caminho do arquivo final (ex: assets/audio/meu_audio.mp3)")
    parser.add_argument("--voice", default="Puck", help="Voz principal para Single Speaker (default: Puck)")
    parser.add_argument("--speakerA", help="Speaker A no formato 'Nome:Voz' (ex: 'Leo:Kore')")
    parser.add_argument("--speakerB", help="Speaker B no formato 'Nome:Voz' (ex: 'Student:Puck')")
    parser.add_argument("--model", default=GEMINI_DEFAULT_MODEL, help="Modelo Gemini (default: gemini-3.6-flash)")
    parser.add_argument("--api-key", help="Gemini API Key")

    args = parser.parse_args()

    content = ""
    if args.file:
        if not os.path.exists(args.file):
            print(f"❌ Arquivo não encontrado: {args.file}")
            sys.exit(1)
        with open(args.file, "r", encoding="utf-8") as f:
            content = f.read()
    elif args.text:
        content = args.text
    else:
        print("❌ Informe --text ou --file para gerar o áudio.")
        sys.exit(1)

    generate_tts(
        text=content,
        output_path=args.output,
        model=args.model,
        voice=args.voice,
        speaker_a=args.speakerA,
        speaker_b=args.speakerB,
        api_key=args.api_key
    )

if __name__ == "__main__":
    main()
