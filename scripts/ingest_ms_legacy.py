#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Decupador e Gerenciador de Alunos Legados • AgoraEuFalo
Extrai Nome, Email, Telefone, Transação, Data e armazena de forma unificada e deduplicada
como produto 'ms-legacy' (tier: student_legacy).
"""

import os
import re
import csv
import json
from datetime import datetime

DATABASE_JSON = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'alunos_ms_legacy.json'))
DATABASE_CSV = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'alunos_ms_legacy.csv'))

def normalize_name(name):
    if not name:
        return ""
    name = name.strip().strip('"').strip("'")
    words = name.split()
    cleaned = []
    lowercase_connectors = {'de', 'da', 'do', 'dos', 'das', 'e'}
    for i, w in enumerate(words):
        lw = w.lower()
        if i > 0 and lw in lowercase_connectors:
            cleaned.append(lw)
        else:
            cleaned.append(w.capitalize())
    return " ".join(cleaned)

def normalize_email(email):
    if not email:
        return ""
    return email.strip().lower()

def normalize_phone(ddd, phone):
    ddd = str(ddd or '').strip().replace('"', '')
    phone = str(phone or '').strip().replace('"', '')
    
    if not phone and not ddd:
        return ""
    
    digits = re.sub(r'\D', '', phone)
    ddd_digits = re.sub(r'\D', '', ddd)
    
    if not digits:
        return ""
    
    if digits.startswith('55') and len(digits) >= 12:
        return f"+{digits}"
    
    if ddd_digits and not digits.startswith(ddd_digits) and len(digits) <= 9:
        digits = f"55{ddd_digits}{digits}"
    elif len(digits) in [10, 11]:
        digits = f"55{digits}"
    elif not digits.startswith('55') and len(digits) > 9:
        digits = f"+{digits}"
        return digits

    return f"+{digits}" if not digits.startswith('+') else digits

def load_existing_database():
    if os.path.exists(DATABASE_JSON):
        try:
            with open(DATABASE_JSON, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️ Erro ao ler JSON existente: {e}")
    return {"total": 0, "students": {}, "updatedAt": None}

def save_database(db):
    os.makedirs(os.path.dirname(DATABASE_JSON), exist_ok=True)
    db["total"] = len(db["students"])
    db["updatedAt"] = datetime.now().isoformat()
    
    # Save JSON
    with open(DATABASE_JSON, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
        
    # Save CSV
    fieldnames = ["nome", "email", "telefone", "produto", "origem", "transacao", "data_venda", "status"]
    with open(DATABASE_CSV, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
        writer.writeheader()
        sorted_students = sorted(db["students"].values(), key=lambda s: s["nome"].lower())
        for s in sorted_students:
            writer.writerow({
                "nome": s["nome"],
                "email": s["email"],
                "telefone": s.get("telefone", ""),
                "produto": s.get("produto", "ms-legacy"),
                "origem": s.get("origem", "hotmart_import"),
                "transacao": s.get("transacao", ""),
                "data_venda": s.get("data_venda", ""),
                "status": s.get("status", "Completo")
            })

def process_raw_csv_content(csv_text, batch_name="batch"):
    db = load_existing_database()
    students_map = db["students"]
    
    lines = [l.strip() for l in csv_text.splitlines() if l.strip()]
    reader = csv.reader(lines, delimiter=';')
    
    imported_count = 0
    updated_count = 0
    
    name_idx = 19
    email_idx = 21
    ddd_idx = 22
    phone_idx = 23
    tx_idx = 4
    date_idx = 16
    status_idx = 18
    
    for row in reader:
        if not row:
            continue
        
        # Check if header row
        if "Nome do Produto" in row[0] or "Nome" in row[0]:
            header = row
            try:
                if "Nome" in header: name_idx = header.index("Nome")
                if "Email" in header: email_idx = header.index("Email")
                if "DDD" in header: ddd_idx = header.index("DDD")
                if "Telefone" in header: phone_idx = header.index("Telefone")
                if "Transação" in header: tx_idx = header.index("Transação")
                if "Data de Venda" in header: date_idx = header.index("Data de Venda")
                if "Status" in header: status_idx = header.index("Status")
            except ValueError:
                pass
            continue
            
        if len(row) <= max(name_idx, email_idx):
            continue
            
        raw_name = row[name_idx]
        raw_email = row[email_idx]
        raw_ddd = row[ddd_idx] if ddd_idx >= 0 and ddd_idx < len(row) else ""
        raw_phone = row[phone_idx] if phone_idx >= 0 and phone_idx < len(row) else ""
        raw_tx = row[tx_idx] if tx_idx >= 0 and tx_idx < len(row) else ""
        raw_date = row[date_idx] if date_idx >= 0 and date_idx < len(row) else ""
        raw_status = row[status_idx] if status_idx >= 0 and status_idx < len(row) else "Completo"
        
        name = normalize_name(raw_name)
        email = normalize_email(raw_email)
        phone = normalize_phone(raw_ddd, raw_phone)
        
        if not email or "@" not in email:
            continue
            
        is_new = email not in students_map
        
        student_record = {
            "nome": name,
            "email": email,
            "telefone": phone,
            "produto": "ms-legacy",
            "tier": "student_legacy",
            "enrolledProducts": ["ms-legacy"],
            "origem": "hotmart_import",
            "transacao": raw_tx.strip(),
            "data_venda": raw_date.strip(),
            "status": raw_status.strip() or "Completo",
            "batch": batch_name
        }
        
        if is_new:
            students_map[email] = student_record
            imported_count += 1
        else:
            if phone and not students_map[email].get("telefone"):
                students_map[email]["telefone"] = phone
            if raw_tx and not students_map[email].get("transacao"):
                students_map[email]["transacao"] = raw_tx.strip()
            updated_count += 1
            
    save_database(db)
    return imported_count, updated_count, len(db["students"])

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        filepath = sys.argv[1]
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        imp, upd, total = process_raw_csv_content(content, batch_name=os.path.basename(filepath))
        print(f"✅ Concluído: {imp} novos importados, {upd} atualizados. Total na base: {total}")
    else:
        print("Uso: python ingest_ms_legacy.py <arquivo.csv>")
