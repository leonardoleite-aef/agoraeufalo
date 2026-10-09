# 🏛️ PLANO ARQUITETURAL: LANDING PAGE BUILDER V2 & GEMINI AI ENGINE

Este documento propõe a evolução do recém-criado `admin-landing-pages.html` de um simples injetor de ofertas para um **Construtor Modular de Páginas de Vendas (Sales Pages)**, impulsionado por um Motor de IA Generativa.

---

## 1. O Problema Atual vs. O Estado Desejado
**Atual:** A página (`oferta.html`) possui apenas Hero (Headline + Subheadline + Vídeo) seguido diretamente pelas caixas de Oferta/Checkout. Faltam blocos de persuasão (Copy, Dores, Benefícios, Prova Social, FAQ).
**Desejado:** Um construtor visual de blocos de conteúdo e um botão "Magic Build", onde a IA do Gemini gera a página inteira de vendas baseada no curso ou em um simples prompt.

---

## 2. Novo Schema de Dados: A Coleção `landing_pages`
Para suportar páginas longas, adicionaremos a propriedade `contentBlocks` (Array).
```javascript
{
  "id": "masterclass-gramatica",
  "title": "...",
  "slug": "...",
  "status": "published",
  "hero": { ... }, // Mantém igual
  "offerBlocks": [ ... ], // Mantém igual
  
  // NOVA PROPRIEDADE: Blocos de Copy e Persuasão
  "contentBlocks": [
    {
      "id": "block_1",
      "type": "pain_agitation", // Tipos: text, benefits, faq, about_leo, guarantee
      "title": "Você já travou na hora de falar no exterior?",
      "content": "A maioria dos brasileiros trava porque aprendeu inglês traduzindo...",
      "items": [], // Usado para FAQ ou Benefícios em tópicos
      "order": 1
    },
    ...
  ]
}
```

---

## 3. O Motor "Magic Build" (Gemini 3.1 Pro)
No topo do painel `admin-landing-pages.html`, haverá um botão dourado: **✨ Gerar Página com IA**.

### Fluxo de Usuário:
1. O Leo clica no botão. Um mini-modal abre: *"Qual é o produto e a promessa principal?"* (Ex: *"Curso intensivo sobre o Sentimento da Estrutura. Promessa: parar de traduzir e falar por reflexo."*)
2. O Admin chama uma Cloudflare Worker (ex: `/api/admin/generate-sales-page`).
3. O Worker consulta a **Gemini 3.1 Pro API** com um System Prompt rigoroso baseado nas Regras do Leo (Zero Jargões, Tom de Voz Acolhedor, Foco no Som).
4. O Gemini retorna um JSON estruturado com todos os blocos:
   - *Headline de Impacto*
   - *Subheadline*
   - *Bloco de Problema/Solução*
   - *3 Benefícios/Módulos*
   - *Seção de Garantia*
   - *FAQ (Perguntas Frequentes)*
5. O painel recebe esse JSON e pré-preenche o formulário visual do construtor. O Leo revisa, altera o que quiser, seleciona a Oferta (preço) manualmente, e salva.

---

## 4. O Construtor Visual no Admin (`admin-landing-pages.html`)
O modal de edição deixará de ser um formulário simples vertical e passará a ter abas ou uma coluna de "Blocos":
- **Aba 1: Configuração Básica** (Título, Slug, Status).
- **Aba 2: Hero Section** (Vídeo YT, Headline principal).
- **Aba 3: Blocos de Copy (Drag & Drop)** (Adicionar seções de Texto, FAQ, Garantia).
- **Aba 4: Checkout & Ofertas** (As caixinhas de selecionar a oferta Hotmart/Stripe).

---

## 5. Renderização Dinâmica Pública (`oferta.html`)
O script do `oferta.html` fará um loop pelos `contentBlocks` e renderizará componentes Tailwind pré-fabricados para cada `type`:
- Se `type === 'faq'`, renderiza um acordeão (Accordion).
- Se `type === 'benefits'`, renderiza um Grid de 3 colunas com ícones Lucide.
- Se `type === 'guarantee'`, renderiza uma caixa com selo de 7 Dias.
- A ordem visual na página pública será sempre: **Hero ➔ Copy Blocks ➔ Ofertas ➔ FAQ ➔ Garantia.**

---

## 6. Fases de Execução
Para implementar isso com segurança sem quebrar a plataforma atual:
* **Fase 1:** Atualizar a UI do `admin-landing-pages.html` para suportar o gerenciamento manual do array `contentBlocks`.
* **Fase 2:** Atualizar o `oferta.html` para ler e renderizar os blocos em componentes Tailwind bonitos (Arquétipos Nobres Deep Navy).
* **Fase 3:** Construir o endpoint no Cloudflare Worker integrando o SDK oficial do Gemini 3.1 Pro para gerar o JSON da Sales Page e conectar o botão "✨ Magic Build" no frontend do Admin.
