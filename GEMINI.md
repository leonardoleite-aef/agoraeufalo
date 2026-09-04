# 🏛️ MANIFESTO PEDAGÓGICO & DIRETRIZES DO PROFESSOR LEO LEITE
**Ecossistema Digital & Plataforma SaaS EdTech — AgoraEuFalo**

Este documento define os princípios institucionais, tom de voz, matriz pedagógica e regras de experiência do usuário do ecossistema **AgoraEuFalo**.
Para especificações técnicas completas de schemas, squads e esteiras de engenharia, consulte a fonte mestre em [`AGENTS.md`](file:///Users/macbookpro/Desktop/agoraeufalo_site/AGENTS.md).

---

## 1. Identidade, Persona e Tom de Voz do Professor Leo Leite
- **Quem é:** Professor Leonardo Leite — mais de 35 anos de sala de aula e vivência diária da língua inglesa.
- **Tom de voz:** Autêntico, direto, acolhedor, espirituoso, sagaz, sem jargões corporativos e sem atalhos mágicos de internet.
- **Princípio Pedagógico Fundamental:** *"Inglês não é matéria de escola para passar em prova; inglês é experiência viva. Repetir a experiência da mesma história até a fala virar reflexo."*
- **Fidelidade 100% (Zero Alucinação):** Usar estritamente as histórias, personagens, vocabulário, diálogos e exercícios presentes no roteiro/transcrição fornecido pelo usuário.

---

## 2. Padrão Visual e Regras de Design
- **Proibição Absoluta de Caixas Escuras em Conteúdo Didático:** 
  - Todos os blocos pedagógicos (Key Takeaways, Texto da História, Chunks Grid, Listen & Answer, Look & Retell, Pronunciation Practice e Sacada de Ouro) devem ter **fundos claros de alto contraste** (`bg-amber-50/80`, `bg-white`, `border-2 border-amber-200`, `text-slate-900`, `text-amber-950`).
- **Navegação (Header):**
  - Links oficiais permitidos no menu superior: *Início*, *Blog*, *Guia Definitivo*, *Projeto AEF*, *Contato* e o botão *Garantir Vaga 2026*.
  - **NÃO adicionar "Magic Stories" no menu de navegação.**
- **Componentes Oficiais Obrigatórios em Todo Artigo de Blog:**
  - `#duvidas-box`: Avatar do Professor Leo com selo online verde, badge *"💬 Resposta Direta do Leo"*, formulário via `formsubmit.co/ajax/selexenglish@gmail.com` e botão direto para WhatsApp.
  - `#projeto-2026`: Card institucional azul-marinho com selo oficial, lista de benefícios e botão de matrícula para `projeto-aef.html` + WhatsApp.
  - Barra Social com botão de compartilhamento no WhatsApp e os 3 cards oficiais (YouTube, Instagram, Substack).

---

## 3. As 6 Atividades Canônicas do Método Magic Stories
Todas as aulas e treinos do ecossistema seguem a matriz pedagógica das 6 etapas:

1. **`1. Listen & Read (LR)` (Entrada & Imersão Auditiva Real):** Observar pelos ouvidos e não apenas pelos olhos. Sem tradução na tela.
2. **`2. Vocabulary Session (VOC)` (Matriz de Chunks & Ativação de Vocabulário):** Compreensão 100% do contexto com **Tradução Falada Real (`spokenTranslation`)** e matriz de Chunks sonoros com botões de áudio individual (`▶`).
3. **`3. Listen & Answer (LA)` (Reflexo & Velocidade de Resposta no Diálogo):** **Zero Respostas Reveladas** na tela/PDF para forçar o cérebro a responder no bate-pronto imediato.
4. **`4. Look & Retell (LRT)` + AI Speech Coach (Produção Própria & Speaking Ativo):** Reconto autônomo com gravação de microfone radiante e avaliação pelo *Teste do Gringo* (0 a 10). Perguntas-guia são **estritamente as mesmas de LA**.
5. **`5. Listen & Ask (LASK)` (Desafio de Formulação de Perguntas):** **Zero Perguntas Reveladas** na tela/PDF para treinar o cérebro a formular a pergunta correspondente ao estímulo.
6. **`6. Pronunciation & Connected Speech (PRO)` (Musicalidade, Boca & Ritmo):** Texto completo de LR com marcações visuais de conexões sonoras (*Linking Sounds*), treino em loop contínuo (`🔂`) e a monumental **Sacada de Ouro do Professor Leo**.

---

## 4. Filosofia Canônica de Avaliação de Fala (O Teste do Gringo)
- **A Lei Maior:** *"Escutar e Falar NÃO caminham juntas no tempo. A fala é consequência tardia do acúmulo de horas de escuta focada e curiosa. Ninguém é forçado a falar."*
- **O Teste do Gringo (Milestone Zero):** *"Uma pessoa falante de inglês que NÃO sabe português foi capaz de entender o aluno recontando a história? (SIM / NÃO)"*
- **Zero Cobrança Punitiva de Vocabulário:** Avalia-se a capacidade de se comunicar com o inglês que o aluno tem HOJE, no Agora. O uso de palavras novas é bônus, nunca requisito excludente.

---

## 5. Governança Ágil & Políticas de Engenharia
- **Deploy Direto & Ágil (Regra 14):** Quando o Professor Leo pedir "deploy", "publique" ou "finalize", o agente valida com `npm run build`, envia com `git push origin main` e entrega o relatório de sucesso em **1 turno direto**.
- **Proatividade em Capas (Regra 9):** O agente gera miniaturas 16:9 e capas automaticamente no padrão oficial, mantendo a esteira rodando e avisando ao Leo que ele pode substituir por foto própria quando desejar.
- **Parceria Consultiva (Regra 18):** O agente nunca bloqueia comandos por burocracia; emite alerta breve de 1 frase caso haja impacto técnico e executa a decisão do usuário com máxima velocidade.
- **Especificações Técnicas Completas:** Consulte [`AGENTS.md`](file:///Users/macbookpro/Desktop/agoraeufalo_site/AGENTS.md), [`MAPA_OFICIAL_DO_ECOSSISTEMA.md`](file:///Users/macbookpro/Desktop/agoraeufalo_site/MAPA_OFICIAL_DO_ECOSSISTEMA.md) e [`INTERFACES.md`](file:///Users/macbookpro/Desktop/agoraeufalo_site/INTERFACES.md).

---

## 6. Regra Permanente de Lançamento da Nova Homepage: Roteamento Inteligente de Aluno Logado
- **Compromisso Solene de Lançamento:**
  - Quando um usuário que **JÁ possui login salvo no navegador** acessar a Homepage (`index.html`), o sistema o reconhece imediatamente:
    1. **Header:** Saudação personalizada (*"Olá, [Nome] • Ir para Minha Sala ➔"*).
    2. **Hero Section:** Card de Boas-Vindas & Retorno Rápido (*"Bem-vindo de volta, [Nome]! [Continuar de Onde Parou ➔]"*).
    3. **Smartphone Teaser:** Carrega a última lição do aluno ou a recomendação do dia.
  - **Revisão Conjunta:** Validar a experiência de aluno logado vs. visitante novo antes de virar a chave de `nova-home.html` para `index.html`.




