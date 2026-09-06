import urllib.request
import urllib.parse
import json
import os

bucket = 'agoraeufalo-3463a.firebasestorage.app'
temp_mp3 = '/tmp/dtc_intro_1.mp3'
cloud_path = 'courses/dtc_curso/ciclo-01/DTC_intro_1.mp3'

print('1. Fazendo upload do MP3 extraído para o Firebase Storage...')
encoded_name = urllib.parse.quote(cloud_path, safe='')
upload_url = f'https://firebasestorage.googleapis.com/v0/b/{bucket}/o?uploadType=media&name={encoded_name}'

with open(temp_mp3, 'rb') as f:
    mp3_bytes = f.read()

req = urllib.request.Request(upload_url, data=mp3_bytes, headers={'Content-Type': 'audio/mpeg'}, method='POST')
with urllib.request.urlopen(req) as resp:
    print(f'Upload MP3 OK: Status {resp.status}')

audio_public_url = f'https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encoded_name}?alt=media'

transcript = """Hello, my dear friends and welcome to Dates and Times Practice!

Aqui no AgoraEuFalo, um curso rápido onde você vai aprender o uso de números, datas, horas, períodos e preposições para usar com dates, times e períodos.

Neste curso rápido você vai aprender:
1. As Horas em Inglês: Como dizer e escutar as horas no dia a dia, a diferença entre o sistema de 12 horas e o horário militar (18 horas vs 6 PM), e o uso correto de AM e PM (3 AM, 12 PM - meio-dia).
2. Como dizer os Anos em Inglês: Falar anos em inglês é muito diferente do português (ex: 1973 não é 'mil novecentos e setenta e três', mas sim 'nineteen seventy-three').
3. Os Meses e Dias da Semana: A pronúncia correta de cada mês, as preposições exatas usadas com datas e meses (IN vs ON), e vocabulário chave como 'ano bissexto' (leap year).
4. Como falar as Datas: Primeiro de janeiro, 30 de abril, 18 de fevereiro e a ordem mês-dia no inglês americano.

Ao final deste curso rápido, teremos uma Magic Story completa para você treinar e automatizar tudo o que aprendeu até a fala virar reflexo!

Você está pronto? Let's do this!"""

golden_tip = "Em inglês, anos e horas funcionam por blocos sonoros (ex: 1973 = nineteen seventy-three; 6:30 = six thirty). Treine a escuta até o cérebro reconhecer a melodia sem fazer contas mentais!"

processed_html = """<div class="space-y-6">
  <!-- BOX 1: MAPA GERAL DO CURSO -->
  <div class="p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-200 text-slate-900 space-y-3">
    <div class="flex items-center gap-2">
      <span class="text-xl">📅</span>
      <h3 class="font-black text-sm uppercase tracking-wider text-amber-950 font-sans">O Que Você Vai Dominar Neste Curso Rápido:</h3>
    </div>
    <ul class="space-y-2 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
      <li class="flex items-start gap-2">
        <span class="text-amber-600 font-bold">1.</span>
        <span><b>As Horas no Piloto Automático:</b> Sistema de 12 horas (AM/PM), horas cheias, meias horas e por que não usamos 18h na fala comum.</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-amber-600 font-bold">2.</span>
        <span><b>Como Falar os Anos:</b> Divisão em pares de dígitos (1973 ➔ <i>nineteen seventy-three</i>) e anos dos anos 2000.</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-amber-600 font-bold">3.</span>
        <span><b>Datas, Meses e Dias da Semana:</b> Números ordinais (1st, 2nd, 3rd) e as preposições canônicas (<b>IN</b> para meses/anos, <b>ON</b> para datas completas e dias).</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-amber-600 font-bold">4.</span>
        <span><b>Magic Story Final de Consolidação:</b> História viva para treinar escuta e resposta no bate-pronto.</span>
      </li>
    </ul>
  </div>

  <!-- BOX 2: REGRA DE OURO DE PREPOSIÇÕES -->
  <div class="p-4 sm:p-5 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-2">
    <h4 class="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
      <span>💡 A Regra Prática de Preposições de Tempo:</span>
    </h4>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
      <div class="p-3 bg-amber-50 rounded-xl border border-amber-200">
        <p class="font-black text-amber-900">AT</p>
        <p class="text-[11px] text-slate-700">Horas e momentos exatos</p>
        <p class="font-mono text-[10px] text-amber-700 font-bold mt-1">at 3:00 PM • at noon</p>
      </div>
      <div class="p-3 bg-amber-50 rounded-xl border border-amber-200">
        <p class="font-black text-amber-900">ON</p>
        <p class="text-[11px] text-slate-700">Dias e datas específicas</p>
        <p class="font-mono text-[10px] text-amber-700 font-bold mt-1">on Monday • on May 4th</p>
      </div>
      <div class="p-3 bg-amber-50 rounded-xl border border-amber-200">
        <p class="font-black text-amber-900">IN</p>
        <p class="text-[11px] text-slate-700">Meses, anos e estações</p>
        <p class="font-mono text-[10px] text-amber-700 font-bold mt-1">in July • in 1973</p>
      </div>
    </div>
  </div>
</div>"""

print('2. Atualizando Firestore com transcrição, áudio MP3 e HTML didático...')
patch_url = 'https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/courses/dtc_curso/modules/ciclo-01/lessons/aula-1788730082287'
fields = {
    'audioUrl': {'stringValue': audio_public_url},
    'rawScript': {'stringValue': transcript},
    'processedContentHtml': {'stringValue': processed_html},
    'goldenTip': {'stringValue': golden_tip},
    'aiStatus': {'stringValue': 'ai_reviewed'},
    'updatedAt': {'stringValue': '2026-09-06T22:35:00.000Z'}
}

mask_params = '&'.join([f'updateMask.fieldPaths={k}' for k in fields.keys()])
final_url = f'{patch_url}?{mask_params}'

req = urllib.request.Request(final_url, data=json.dumps({'fields': fields}).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='PATCH')
with urllib.request.urlopen(req) as resp:
    print(f'Firestore Aula Atualizada OK: Status {resp.status}')
