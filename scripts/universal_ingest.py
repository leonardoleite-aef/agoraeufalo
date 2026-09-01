import os
import sys
import argparse
import tempfile
import json
import time
import mimetypes
import urllib.parse
import urllib.request
import urllib.error
from pathlib import Path
from PIL import Image, ImageDraw

# 3rd party
import av
from faster_whisper import WhisperModel

DEFAULT_FIREBASE_BUCKET = "agoraeufalo-3463a.firebasestorage.app"

def log_event(level, message, **kwargs):
    payload = {"level": level, "message": message}
    if kwargs:
        payload["data"] = kwargs
    print(json.dumps(payload), flush=True)

def generate_fallback_thumbnail(module_title, activity_label, theme_color, output_path):
    width, height = 1920, 1080
    img = Image.new('RGB', (width, height), color=theme_color)
    d = ImageDraw.Draw(img)
    text = f"{module_title}\n{activity_label}"
    d.text((120, height // 2 - 50), text, fill=(255, 255, 255))
    img.save(output_path, quality=90)
    return output_path

def extract_audio(video_path, audio_path):
    log_event("INFO", f"Extraindo áudio MP3 (128kbps) de {os.path.basename(video_path)} via PyAV...")
    with av.open(video_path) as container:
        audio_stream = next((s for s in container.streams if s.type == 'audio'), None)
        if not audio_stream:
            raise ValueError(f"Nenhum stream de áudio encontrado em {video_path}")
            
        with av.open(audio_path, 'w', format='mp3') as out_container:
            out_stream = out_container.add_stream('mp3', rate=44100)
            out_stream.bit_rate = 128000
            for frame in container.decode(audio_stream):
                frame.pts = None
                for packet in out_stream.encode(frame):
                    out_container.mux(packet)
                del frame
            for packet in out_stream.encode(None):
                out_container.mux(packet)

def transcribe_audio(audio_path, model):
    log_event("INFO", f"Transcrevendo áudio via Faster-Whisper (VAD ativo): {os.path.basename(audio_path)}...")
    segments, info = model.transcribe(
        audio_path, 
        beam_size=5, 
        vad_filter=True, 
        vad_parameters=dict(min_silence_duration_ms=500)
    )
    transcript = []
    for segment in segments:
        transcript.append({
            "start": round(segment.start, 2),
            "end": round(segment.end, 2),
            "text": segment.text.strip()
        })
    return transcript

def upload_file_to_firebase_storage(
    local_file_path,
    cloud_storage_path,
    bucket_name=DEFAULT_FIREBASE_BUCKET,
    max_retries=4,
    base_delay_seconds=2.0
):
    """
    Envia arquivo para o Firebase Storage via REST API direta (urllib.request)
    com streaming binário iterativo e retry exponencial (sem dependência de SDK ou credenciais locais).
    """
    if not os.path.exists(local_file_path):
        raise FileNotFoundError(f"Arquivo local inexistente: {local_file_path}")

    file_size = os.path.getsize(local_file_path)
    content_type, _ = mimetypes.guess_type(local_file_path)
    if not content_type:
        if local_file_path.endswith(".mp4"):
            content_type = "video/mp4"
        elif local_file_path.endswith(".mp3"):
            content_type = "audio/mpeg"
        elif local_file_path.endswith(".pdf"):
            content_type = "application/pdf"
        elif local_file_path.endswith(".jpg") or local_file_path.endswith(".jpeg"):
            content_type = "image/jpeg"
        elif local_file_path.endswith(".json"):
            content_type = "application/json"
        else:
            content_type = "application/octet-stream"

    encoded_name = urllib.parse.quote(cloud_storage_path, safe='')
    upload_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket_name}/o?uploadType=media&name={encoded_name}"
    public_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket_name}/o/{encoded_name}?alt=media"

    log_event("INFO", f"Iniciando upload REST: {os.path.basename(local_file_path)} ({file_size / (1024*1024):.2f} MB) -> {cloud_storage_path}")

    last_exception = None

    for attempt in range(1, max_retries + 1):
        try:
            with open(local_file_path, "rb") as file_stream:
                req = urllib.request.Request(
                    upload_url,
                    data=file_stream,
                    headers={
                        "Content-Type": content_type,
                        "Content-Length": str(file_size)
                    },
                    method="POST"
                )

                with urllib.request.urlopen(req, timeout=180) as response:
                    status_code = response.getcode()
                    if status_code in (200, 201):
                        log_event("INFO", f"✅ Upload concluído com sucesso: {public_url}")
                        return public_url
                    else:
                        raise urllib.error.HTTPError(
                            upload_url, status_code, f"Status não esperado: {status_code}", response.headers, None
                        )

        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, ConnectionResetError, OSError) as exc:
            last_exception = exc
            wait_time = base_delay_seconds * (2 ** (attempt - 1))
            is_retryable = True

            if isinstance(exc, urllib.error.HTTPError) and exc.code in (400, 401, 403, 404):
                is_retryable = False

            if attempt < max_retries and is_retryable:
                log_event("WARNING", f"⚠️ Tentativa {attempt}/{max_retries} falhou ({exc}). Aguardando {wait_time:.1f}s...")
                time.sleep(wait_time)
            else:
                log_event("ERROR", f"❌ Falha definitiva após {attempt} tentativas no upload de {local_file_path}: {exc}")
                break

    raise RuntimeError(f"Erro no upload para Firebase Storage de '{local_file_path}': {last_exception}")

def scan_module_folder(folder_path):
    if not os.path.isdir(folder_path):
        raise ValueError(f"O caminho informado não é um diretório válido: {folder_path}")
        
    files = os.listdir(folder_path)
    
    # 1. Busca DOCX
    docx_file = next((os.path.join(folder_path, f) for f in files if f.lower().endswith('.docx')), None)
    
    # 2. Busca Imagem Base (Capa)
    image_file = next((os.path.join(folder_path, f) for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png'))), None)
    
    # 3. Categorização das 6 atividades canônicas
    activity_patterns = {
        "lr": ["listen_and_read", "_lr", "listen & read", "listen and read"],
        "voc": ["vocabulary", "_voc", "vocab"],
        "la": ["listen_and_answer", "_la", "listen & answer", "listen and answer"],
        "lrt": ["look_and_retell", "_lrt", "look & retell", "look and retell"],
        "lask": ["listen_and_ask", "_lask", "listen & ask", "listen and ask"],
        "pro": ["pronunciation", "_pro", "connected_speech"]
    }
    
    matched_videos = []
    for f in sorted(files):
        if not f.lower().endswith(('.mp4', '.mov', '.mkv')):
            continue
        full_path = os.path.join(folder_path, f)
        f_lower = f.lower()
        
        detected_act = "outros"
        for act_key, patterns in activity_patterns.items():
            if any(pat in f_lower for pat in patterns):
                detected_act = act_key
                break
                
        matched_videos.append({
            "filename": f,
            "path": full_path,
            "activity": detected_act
        })
        
    return {
        "docx": docx_file,
        "image": image_file,
        "videos": matched_videos
    }

def main():
    parser = argparse.ArgumentParser(description="Motor Universal de Ingestão de Módulos (AEF)")
    parser.add_argument("--course-id", required=True, help="ID do curso (ex: ms-legacy)")
    parser.add_argument("--module-code", required=True, help="Código do módulo (ex: MS006)")
    parser.add_argument("--module-title", required=True, help="Título do módulo (ex: The Coffee Shop)")
    parser.add_argument("--theme-color", default="#1A56DB", help="Cor do tema para assets")
    parser.add_argument("--module-folder", required=True, help="Caminho da pasta do módulo")
    
    args = parser.parse_args()
    
    log_event("INFO", f"Iniciando escaneamento da pasta do módulo: {args.module_folder}")
    
    scan_results = scan_module_folder(args.module_folder)
    videos = scan_results["videos"]
    
    log_event("INFO", f"Encontrados: {len(videos)} vídeos, DOCX: {bool(scan_results['docx'])}, Imagem: {bool(scan_results['image'])}")
    
    if not videos:
        log_event("ERROR", "Nenhum arquivo de vídeo encontrado na pasta especificada.")
        sys.exit(1)

    log_event("INFO", "Carregando modelo Faster-Whisper local...")
    whisper_model = WhisperModel("small", device="cpu", compute_type="int8")
    
    processed_lessons = []
    
    with tempfile.TemporaryDirectory() as tmpdir:
        for idx, item in enumerate(videos, 1):
            v_name = item["filename"]
            v_path = item["path"]
            act = item["activity"]
            base_slug = f"{args.module_code.lower()}_{act}_{idx}"
            
            log_event("INFO", f"[{idx}/{len(videos)}] Processando: {v_name} ({act.upper()})")
            
            audio_tmp = os.path.join(tmpdir, f"{base_slug}.mp3")
            thumb_tmp = os.path.join(tmpdir, f"{base_slug}_thumb.jpg")
            
            # 1. Extração de Áudio PyAV
            extract_audio(v_path, audio_tmp)
            
            # 2. Transcrição Whisper
            transcript = transcribe_audio(audio_tmp, whisper_model)
            
            # 3. Geração / Otimização de Thumbnail
            if scan_results["image"] and os.path.exists(scan_results["image"]):
                img = Image.open(scan_results["image"])
                img.convert('RGB').save(thumb_tmp, quality=90)
            else:
                generate_fallback_thumbnail(args.module_title, act.upper(), args.theme_color, thumb_tmp)
                
            # 4. Upload REST direto via urllib.request (Zero SDK / Zero Local Credentials)
            audio_remote = f"courses/{args.course_id}/{args.module_code}/audio_{act}_{idx}.mp3"
            thumb_remote = f"courses/{args.course_id}/{args.module_code}/thumb_{act}_{idx}.jpg"
            
            audio_url = upload_file_to_firebase_storage(audio_tmp, audio_remote)
            thumb_url = upload_file_to_firebase_storage(thumb_tmp, thumb_remote)
            
            processed_lessons.append({
                "id": f"{args.module_code.lower()}-{act}-{idx}",
                "order": idx,
                "title": f"Aula {idx:02d}: {act.upper()} - {args.module_title}",
                "activity": act,
                "audioUrl": audio_url,
                "thumbnailUrl": thumb_url,
                "transcript": transcript
            })
            
    log_event("SUCCESS", f"Ingestão do módulo {args.module_code} finalizada com sucesso!", lessons=processed_lessons)

if __name__ == "__main__":
    main()
