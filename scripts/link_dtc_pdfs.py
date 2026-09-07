#!/usr/bin/env python3
import json
import os
import urllib.request

pdf_mapping = {
    # Module 1 (Comece Aqui) -> NO PDF
    'aula-1788730082287': {'mid': 'ciclo-01', 'pdf': ''},
    # Module 2 (Horas)
    'aula-1788736026295': {'mid': 'ciclo-02', 'pdf': 'Material-PDF/DTC_1_1_Horas_em_Ingles.pdf'},
    'aula-1788737843118': {'mid': 'ciclo-02', 'pdf': 'Material-PDF/DTC_1_2_AM_ou_PM_Quando_Usar.pdf'},
    # Module 3 (Anos)
    'aula-1788738508349': {'mid': 'ciclo-03', 'pdf': 'Material-PDF/DTC_2_1_Como_Dizer_os_Anos.pdf'},
    # Module 4 (Datas, Meses, Dias)
    'aula-1788738659564': {'mid': 'ciclo-04', 'pdf': 'Material-PDF/DTC_3_1_Datas_Meses_Dias_Parte_1.pdf'},
    'aula-1788738792799': {'mid': 'ciclo-04', 'pdf': 'Material-PDF/DTC_3_2_Datas_Meses_Dias_Parte_2.pdf'},
    'aula-1788739999000': {'mid': 'ciclo-04', 'pdf': 'Material-PDF/DTC_3_3_Treino_Pratico_Magic_Story.pdf'}
}

# 1. Update Firestore
base_fs = 'https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/courses/dtc_curso/modules'
for lid, info in pdf_mapping.items():
    mid = info['mid']
    pdf = info['pdf']
    url = f'{base_fs}/{mid}/lessons/{lid}?updateMask.fieldPaths=pdfUrl'
    body = json.dumps({'fields': {'pdfUrl': {'stringValue': pdf}}}).encode('utf-8')
    req = urllib.request.Request(url, data=body, headers={'Content-Type': 'application/json'}, method='PATCH')
    try:
        with urllib.request.urlopen(req) as resp:
            print(f'Firestore PDF linked for {lid} ({mid}): {pdf} [Status {resp.status}]')
    except Exception as e:
        print(f'Error updating Firestore for {lid}: {e}')

# 2. Update aef-courses-registry.js
# Read the file
with open('assets/js/aef-courses-registry.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Parse JSON inside AEF_COURSES_DATA
# Load via node to guarantee clean JS
print("Syncing registry...")
