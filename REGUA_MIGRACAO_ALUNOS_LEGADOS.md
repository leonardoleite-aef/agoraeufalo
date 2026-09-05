# 🏛️ Régua de Migração & Comunicação: Alunos Legados de Magic Stories
**Ecossistema Digital & Plataforma SaaS EdTech — Professor Leonardo Leite**  
*Documento Estratégico & Copies de E-mail para Reativação da Base Histórica*

---

## 🧭 1. Princípio & Diretriz Comercial Inegociável

Por determinação direta do Professor Leonardo Leite:
> *"São muitos alunos que compraram Magic Stories vitalício. Portanto, para o Magic Stories Legacy eles têm que migrar sem pagar e ter acesso garantido para sempre. O que pode fazê-los assinar o AEF Club são os novos conteúdos e pocket courses que eu for postando depois."*

### ⚖️ A Matriz de Direitos:

| Conteúdo / Área | Aluno Legado Magic Stories | Membro AEF Club (Assinatura) |
| :--- | :--- | :--- |
| **Coleção Magic Stories (MS001 a MS030)** | **Acesso Vitalício Gratuito** (Vídeos + PDFs + Player) | Acesso Total Incluso |
| **Personal Training Player** | **Acesso Liberado** para todas as faixas de Magic Stories | Acesso Total Ilimitado (Todas as faixas + Minhas Coisas) |
| **Novos Pocket Courses (Viagem, Reuniões, etc.)** | Bloqueado / Vitrine com convite de Upgrade | **Acesso Total Ilimitado** ao catálogo crescente |
| **Novas Histórias & Ciclos Futuros** | Bloqueado / Vitrine com convite de Upgrade | **Acesso Total Ilimitado** |
| **AI Speech Coach & Mentor 24/7 (Roadmap)** | Degustação pontual | **Acesso Total Ilimitado** |

---

## 🔑 2. A Mecânica do Link Mágico de Resgate (1 Toque)

Para eliminar qualquer atrito de senhas esquecidas:
1. O e-mail de resgate contém o link parametrizado:
   `https://agoraeufalo.com.br/portal.html?resgate=ms_legacy&email={EMAIL}`
2. Ao clicar, o `aef-portal-auth.js` detecta o parâmetro `resgate=ms_legacy`:
   - Se o aluno já tem conta, autentica e garante `ms-legacy` em `enrolledProducts`.
   - Se o aluno não tem conta ativa no Firebase, cria o perfil automaticamente no Firestore (`users/{uid}`) com `tier: 'student_legacy'` e matricula em `ms-legacy`.
3. Ao entrar no Portal, o aluno vê o card especial de boas-vindas:
   > *"Hello, my dear friend! Sua coleção completa de Magic Stories está em casa nova, com o novo Training Player e áudios remasterizados. Aproveite!"*

---

## ✉️ 3. As 3 Copies Canônicas de E-mail para a Base Histórica

### 📩 E-mail 1: O Reencontro & Abertura da Casa Nova (Tom Pessoal & Afetivo)
* **Gatilho:** Primeiro disparo para toda a lista de compradores históricos de Magic Stories.
* **Assunto:** `Hello, my dear friend! Preparei uma casa nova para os seus Magic Stories`
* **Preheader:** `Seu acesso vitalício continua 100% gratuito e ganhou um app novo.`

```html
Hello, my dear friend!

Aqui é o Professor Leonardo Leite.

Estou te escrevendo hoje por um motivo muito especial. Se você está recebendo este e-mail, é porque em algum momento da nossa caminhada você confiou em mim e no método Magic Stories para destravar o seu inglês.

Eu nunca esqueci do compromisso que assumi com você: quem comprou o Magic Stories tem acesso vitalício. E compromisso, para mim, é sagrado.

Nos últimos meses, eu passei dias e noites no meu estúdio construindo uma plataforma totalmente nova para o AgoraEuFalo. Nós saímos daquelas áreas de membros antigas e complicadas e criamos algo feito sob medida para quem é adulto e tem a vida corrida:

1. Uma Sala de Aula cinematográfica, sem poluição visual e com as apostilas diagramadas em fontes grandes e confortáveis;
2. O nosso English Personal Training Player: agora você treina direto no celular com fone de ouvido, repete qualquer frase com um toque do polegar e pode treinar até com a tela apagada no trânsito ou caminhando;
3. Todas as 30 Magic Stories clássicas reunidas e organizadas em um só lugar.

Como você já era dono do curso, o seu acesso a toda essa tecnologia nova é 100% GRATUITO. Você não precisa pagar um centavo sequer.

Eu já deixei a sua sala destravada. Basta tocar no botão abaixo para entrar direto:

[ 👉 ENTRAR NA MINHA NOVA SALA AGORAEUFALO ]
(Link direto com 1 toque: sem precisar lembrar senhas antigas)

Dê uma olhada na sua nova sala, coloque os fones de ouvido e faça um treino rápido hoje. Você vai sentir na hora a diferença.

Um forte abraço e bem-vindo de volta à nossa casa,
Professor Leonardo Leite
AgoraEuFalo
```

---

### 📩 E-mail 2: O Treino no Celular (Foco no Player & Hábito dos Ouvidos)
* **Gatilho:** 3 dias após o E-mail 1 para quem abriu ou ainda não logou.
* **Assunto:** `Você já experimentou treinar seus Magic Stories com fone de ouvido?`
* **Preheader:** `Veja como escutar no carro ou caminhando sem precisar ficar na frente do computador.`

```html
Hello, my dear friend!

Você conseguiu entrar na sua nova sala de aula do AgoraEuFalo?

Quero te dar uma recomendação prática de quem tem mais de 35 anos de sala de aula:

Hoje ninguém mais tem paciência para ficar sentado na frente de um computador decorando regra de gramática. E a verdade é que para falar inglês com naturalidade, você nem deveria fazer isso.

Inglês se aprende pelos ouvidos.

Por isso, na nova plataforma, nós criamos o Training Player de Bolso. Você abre no seu celular, escolhe uma Magic Story (como a história da Graziella ou do Tom), coloca os fones de ouvido e deixa o áudio rolar enquanto faz sua caminhada, prepara o café ou dirige.

Quando ouvir uma frase marcante, basta dar 1 toque na tela para pausar ou repetir. É assim, pela repetição natural da experiência, que a fala vira reflexo.

O seu acesso ao curso clássico completo continua 100% liberado de presente na nova casa:

[ 👉 ABRIR MEU TRAINING PLAYER NO CELULAR ]

Experimente treinar 10 minutos hoje pelos ouvidos. Depois me conte o que achou!

Hello, my dear friend — vejo você no Player,
Professor Leonardo Leite
```

---

### 📩 E-mail 3: O Convite Suave para o AEF Club (Apresentação dos Novos Conteúdos)
* **Gatilho:** 10 a 14 dias após a reativação do aluno no Magic Stories Legacy.
* **Assunto:** `O que vem por aí no AgoraEuFalo (e um convite especial para você)`
* **Preheader:** `Novos pocket courses práticos para quem quer ir além das histórias clássicas.`

```html
Hello, my dear friend!

Espero que você esteja aproveitando a sua coleção de Magic Stories na nova plataforma. É muito bom ver você treinando com a gente de novo!

Como você sabe, o seu acesso ao acervo clássico das 30 histórias é seu para sempre.

Mas muitos alunos me perguntavam: *"Professor Leo, e depois que eu dominar as histórias clássicas? E quando eu precisar de um treino rápido para uma viagem no aeroporto, uma reunião de trabalho em inglês ou uma entrevista de emprego urgente?"*

Por isso, nós criamos o AgoraEuFalo Club.

O Club é a nossa comunidade viva por assinatura, onde eu publico semanalmente:
• Pocket Courses de situações reais (como sobreviver no aeroporto, pedir comida no restaurante sem passar vergonha, reuniões online sem travar);
• Novas histórias e ciclos de Connected Speech;
• E as novas ferramentas interativas que estamos desenvolvendo para você praticar conversação.

Para você que já é nosso aluno antigo e tem história com a gente, nós preparamos uma condição exclusiva de pioneiro para quando você quiser fazer parte do Club.

Se você quiser conhecer os novos conteúdos que estão saindo do forno:

[ 👉 CONHECER OS NOVOS CONTEÚDOS DO AEF CLUB ]

E lembre-se: independentemente do Club, as suas Magic Stories clássicas continuam com você para sempre na sua sala.

Seguimos firmes no reflexo oral!

Abraço carinhoso,
Professor Leonardo Leite
```

---

## 🛠️ 4. Fluxo de Importação da Base no CRM (`admin-alunos.html`)

No painel de Alunos ([`admin-alunos.html`](file:///Users/macbookpro/Desktop/agoraeufalo_site/admin-alunos.html)):
1. O Leo pode colar a lista de e-mails/nomes dos compradores antigos em lote (CSV ou texto puro).
2. O sistema gera automaticamente os documentos no Firestore com `tier: 'student_legacy'`, `enrolledProducts: ['ms-legacy']` e status `migrated_pending`.
3. O botão *"Disparar E-mail 1 de Resgate"* envia via Brevo o template `E1_WELCOME_ONBOARDING` personalizado com o Magic Link de 1 toque.
4. Conforme o aluno clica e acessa, o status muda automaticamente no CRM para `active_legacy`.
