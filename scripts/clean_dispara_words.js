import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();

// 1. Limpar em assets/js/aef-courses-registry.js
const regPath = path.join(ROOT_DIR, 'assets/js/aef-courses-registry.js');
let reg = fs.readFileSync(regPath, 'utf8');

const replacements = [
  ['Dispara: SHE', 'SHE'],
  ['Dispara: HE', 'HE'],
  ['Dispara: THEY', 'THEY'],
  ['Dispara: WE', 'WE'],
  ['Dispara: IT', 'IT'],
  ['deve disparar a pergunta sem passar pelo português', 'deve formular a pergunta sem passar pelo português'],
  ['precisa disparar o substituto correto', 'precisa ativar o substituto correto'],
  ['O cérebro dispara They sem hesitar', 'Vira They sem hesitar'],
  ['precisa disparar o \\"they\\" naturalmente', 'precisa usar o \\"they\\" naturalmente'],
  ['precisa disparar o "they" naturalmente', 'precisa usar o "they" naturalmente'],
  ['deixa o cérebro disparar o som certo sem pensar', 'deixa o som certo sair sem pensar'],
  ['um aviso que dispara na frente da frase', 'um aviso que entra na frente da frase'],
  ['Treino de Disparo Rápido (Prática Oral)', 'Treino de Prática Oral (Bate-Pronto)'],
  ['dispare a pergunta imediatamente', 'formule a pergunta imediatamente'],
  ['precisa disparar a estrutura invertida', 'precisa usar a estrutura invertida'],
  ['dispara imediatamente a pergunta', 'formula imediatamente a pergunta'],
  ['disparando a pergunta certa', 'formulando a pergunta certa'],
  ['faz a pergunta disparar sem você', 'faz a pergunta sair sem você'],
  ["passa a disparar 'gets up'", "passa a falar 'gets up'"],
  ['passa a disparar \\\'gets up\\\'', 'passa a falar \\\'gets up\\\''],
  ['comece agora a disparar suas perguntas', 'comece agora a fazer suas perguntas'],
  ['até disparar o som sem pensar', 'até soltar o som sem pensar'],
  ['num único disparo de ar', 'num único fluxo de ar'],
  ['sua boca disparar o som sem esforço mental', 'sua boca soltar o som sem esforço mental'],
  ['treina disparar perguntas com did', 'treina formular perguntas com did']
];

for (const [from, to] of replacements) {
  if (reg.includes(from)) {
    reg = reg.replaceAll(from, to);
    console.log(`✅ [Registry] Replaced: "${from}" -> "${to}"`);
  } else {
    console.log(`⚠️ [Registry] Pattern not found: "${from}"`);
  }
}

fs.writeFileSync(regPath, reg, 'utf8');

// 2. Limpar em assets/js/aef-pocket-course-ai.js
const pocketPath = path.join(ROOT_DIR, 'assets/js/aef-pocket-course-ai.js');
let pocket = fs.readFileSync(pocketPath, 'utf8');
if (pocket.includes("'Disparar um e-mail rápido.'")) {
  pocket = pocket.replace("'Disparar um e-mail rápido.'", "'Mandar um e-mail rápido.'");
  fs.writeFileSync(pocketPath, pocket, 'utf8');
  console.log('✅ [Pocket AI] Replaced "Disparar um e-mail rápido." -> "Mandar um e-mail rápido."');
}

// 3. Limpar em ebook.html
const ebookPath = path.join(ROOT_DIR, 'ebook.html');
let ebook = fs.readFileSync(ebookPath, 'utf8');
if (ebook.includes('disparar perguntas no reflexo')) {
  ebook = ebook.replace('disparar perguntas no reflexo', 'formular perguntas no reflexo');
  fs.writeFileSync(ebookPath, ebook, 'utf8');
  console.log('✅ [eBook] Replaced "disparar perguntas no reflexo" -> "formular perguntas no reflexo"');
}

// 4. Verificar se sobrou algum dispara em aef-courses-registry.js
const remainingReg = [];
reg.split('\n').forEach((line, idx) => {
  if (/[Dd]ispara/.test(line)) {
    remainingReg.push(`Linha ${idx + 1}: ${line.substring(0, 100)}`);
  }
});
console.log('--- Verificação Final ---');
if (remainingReg.length === 0) {
  console.log('🎉 100% LIMPO: Nenhuma ocorrência de "dispara" restante em aef-courses-registry.js!');
} else {
  console.warn('⚠️ Ocorrências restantes:', remainingReg);
}
