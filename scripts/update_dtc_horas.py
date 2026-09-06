import urllib.request
import urllib.parse
import json
import os

bucket = 'agoraeufalo-3463a.firebasestorage.app'
audio_public_url = f'https://firebasestorage.googleapis.com/v0/b/{bucket}/o/courses%2Fdtc_curso%2Fciclo-02%2FDTC_mod_1_1.mp3?alt=media'

transcript = """A primeira coisa que nós vamos rever, revisitar, aprender ou reaprender são as horas. E as horas é uma coisa muito simples, basta você saber os números.

Em inglês, o mais básico que tem:
• 9:30 ➔ Nine thirty (9 das horas, 30 dos minutos).
• 9:34 ➔ Nine thirty-four.
• Horas cheias zeradas ➔ Sempre O'CLOCK (ex: 10:00 = ten o'clock; 1:00 = one o'clock). O'clock é só na hora zerada!

Por que aprender outras formas?
Para falar, o jeito direto (9:30 = nine thirty) é super fácil. Mas no mundo real, você vai escutar nativos falando de outras formas. É daqui que nasce o problema: "Eu consigo falar, mas não consigo entender o gringo!".

Dividindo o Relógio em 4 Partes:

1. Na primeira metade (0 a 30 minutos) ➔ Minutes PAST the hour (ou AFTER):
• 3:17 ➔ Seventeen past three (17 minutos passados das 3).
• 5:10 ➔ Ten past five (ou five ten, ou ten after five).
• 4:15 ➔ A quarter past four (a quarta parte da hora / 15 minutos).

2. Nos 30 minutos exatos ➔ HALF PAST:
• 3:30 ➔ Half past three.
• 5:30 ➔ Half past five.
• 12:30 ➔ Half past twelve.

3. Na segunda metade (31 a 59 minutos) ➔ Minutes TO the next hour (minutos para a próxima hora):
• 8:40 ➔ Twenty to nine (20 para as 9).
• 8:50 ➔ Ten to nine (10 para as 9).
• 8:55 ➔ Five to nine (5 para as 9).
• 9:45 ➔ A quarter to ten (15 para as 10).

Você é obrigado a falar 'a quarter past' ou 'twenty to'? Não! Mas é 100% obrigado a entender quando o gringo falar."""

golden_tip = "Você não é obrigado a falar no formato complexo ('a quarter to' ou 'twenty past'), mas é 100% OBRIGADO a entender quando os outros falam! Para falar, adote a ordem direta (9:30 = nine thirty) e pronto."

processed_html = """<div class="space-y-6">
  <!-- BOX 1: REGRA BÁSICA DE HORAS -->
  <div class="p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-200 text-slate-900 space-y-3">
    <div class="flex items-center gap-2">
      <span class="text-xl">⏰</span>
      <h3 class="font-black text-sm uppercase tracking-wider text-amber-950 font-sans">1. A Forma Direta & O Uso do O'Clock:</h3>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
      <div class="p-3 bg-white rounded-xl border border-amber-200">
        <p class="font-black text-amber-900">Hora Direta (Horas + Minutos)</p>
        <p class="text-[11px] text-slate-700">9:30 ➔ <b>nine thirty</b></p>
        <p class="text-[11px] text-slate-700">9:34 ➔ <b>nine thirty-four</b></p>
      </div>
      <div class="p-3 bg-white rounded-xl border border-amber-200">
        <p class="font-black text-amber-900">Hora Zerada (O'Clock)</p>
        <p class="text-[11px] text-slate-700">10:00 ➔ <b>ten o'clock</b></p>
        <p class="text-[11px] text-slate-700">1:00 ➔ <b>one o'clock</b></p>
        <p class="text-[10px] text-amber-700 font-bold mt-1">O'clock é usado SOMENTE em horas cheias!</p>
      </div>
    </div>
  </div>

  <!-- BOX 2: OS 4 QUADRANTES DO RELÓGIO (COMO O GRINGO FALA) -->
  <div class="p-5 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-3">
    <h4 class="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
      <span>🧭 2. Os 4 Quadrantes do Relógio (Para Entender Nativos):</span>
    </h4>
    <div class="space-y-2 text-xs">
      <div class="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
        <p class="font-bold text-amber-950">A. Minutos de 0 a 30 ➔ <i>Minutes PAST the hour</i></p>
        <p class="text-slate-700 mt-1">• 5:10 ➔ <b>ten past five</b> (ou <i>ten after five</i>)</p>
        <p class="text-slate-700">• 4:15 ➔ <b>a quarter past four</b> (1 quarto de hora / 15 min passados das 4)</p>
      </div>
      <div class="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
        <p class="font-bold text-amber-950">B. Nos 30 Minutos Exatos ➔ <i>HALF PAST</i></p>
        <p class="text-slate-700 mt-1">• 3:30 ➔ <b>half past three</b></p>
        <p class="text-slate-700">• 12:30 ➔ <b>half past twelve</b></p>
      </div>
      <div class="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
        <p class="font-bold text-amber-950">C. Minutos de 31 a 59 ➔ <i>Minutes TO the next hour</i></p>
        <p class="text-slate-700 mt-1">• 8:40 ➔ <b>twenty to nine</b> (20 minutos para as 9)</p>
        <p class="text-slate-700">• 8:55 ➔ <b>five to nine</b> (5 minutos para as 9)</p>
        <p class="text-slate-700">• 9:45 ➔ <b>a quarter to ten</b> (15 minutos para as 10)</p>
      </div>
    </div>
  </div>
</div>"""

print("Atualizando Firestore para a aula HORAS (aula-1788736026295)...")
patch_url = 'https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/courses/dtc_curso/modules/ciclo-02/lessons/aula-1788736026295'
fields = {
    'audioUrl': {'stringValue': audio_public_url},
    'rawScript': {'stringValue': transcript},
    'processedContentHtml': {'stringValue': processed_html},
    'goldenTip': {'stringValue': golden_tip},
    'aiStatus': {'stringValue': 'ai_reviewed'},
    'thumbnailUrl': {'stringValue': 'assets/images/thumbs/dtc_intro_thumb.jpg'},
    'artworkUrl': {'stringValue': 'assets/images/cover-dates-and-times-square.jpg'},
    'updatedAt': {'stringValue': '2026-09-06T23:12:00.000Z'}
}

mask_params = '&'.join([f'updateMask.fieldPaths={k}' for k in fields.keys()])
final_url = f'{patch_url}?{mask_params}'

req = urllib.request.Request(final_url, data=json.dumps({'fields': fields}).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='PATCH')
with urllib.request.urlopen(req) as resp:
    print(f'Firestore Aula HORAS Atualizada OK: Status {resp.status}')
