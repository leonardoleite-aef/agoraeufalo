import os, glob, pypdf

base_dir = "/Users/macbookpro/Downloads/MS_MIGRACAO"
folders = sorted([d for d in glob.glob(f"{base_dir}/MS*") if os.path.isdir(d)])

print(f"Total de pastas encontradas: {len(folders)}")

target_folders = [f for f in folders if any(f"MS0{i}" in f or f"MS{i}" in f for i in range(15, 31))]

print(f"Módulos alvo (MS015 a MS030): {len(target_folders)}")
for f in target_folders:
    name = os.path.basename(f)
    files = os.listdir(f)
    mp4s = [x for x in files if x.endswith('.mp4')]
    jpegs = [x for x in files if x.endswith('.jpeg') or x.endswith('.jpg') or x.endswith('.png')]
    pdfs = [x for x in files if x.endswith('.pdf')]
    print(f"\n📂 {name}:")
    print(f"   🎬 Vídeos MP4 ({len(mp4s)}): {mp4s}")
    print(f"   🖼️ Imagens ({len(jpegs)}): {jpegs}")
    print(f"   📄 PDFs ({len(pdfs)}): {pdfs}")
