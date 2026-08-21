# 📖 Diretrizes e Playbook de SEO Oficial — AgoraEuFalo

Este documento contém o padrão ouro de SEO (Search Engine Optimization) estabelecido para o site **AgoraEuFalo** (Professor Leonardo Leite). Qualquer nova página criada neste projeto deve seguir rigorosamente as diretrizes e templates abaixo.

---

## 🎯 1. Estratégia de Palavras-Chave & Intenção de Busca

### 🔑 Palavras-Chave Primárias (High Intent / Core Brand)
- `curso de ingles para adultos`
- `treino auditivo ingles`
- `falar ingles com naturalidade`
- `metodo magic stories ingles`
- `professor leonardo leite ingles`
- `destravar a fala em ingles`
- `english quick start agoraeufalo`
- `frases prontas em ingles para viagens e trabalho`

### 🔍 Palavras-Chave Secundárias & Cauda Longa (Long-Tail)
- `como destravar o ingles depois dos 40 anos`
- `curso de ingles sem gramatica decoreba`
- `por que entendo ingles mas travo na hora de falar`
- `treinar ouvido para falar ingles com rapidez`
- `metodo natural de escuta ativa ingles`
- `kit de sobrevivencia ingles viagens trabalho`

### 🧠 Termos LSI (Latent Semantic Indexing) & Neurociência
- *Escuta ativa*, *surdez fonética*, *reflexo rápido*, *sem tradução mental*, *comprehensible input*, *chunks de linguagem*, *pronúncia conectada (connected speech)*, *didática de sala de aula*, *35 anos de experiência*.

---

## 📏 2. Limites e Regras de Redação para Meta Tags

| Elemento | Tamanho Recomendado | Regra Prática | Exemplo |
|---|---|---|---|
| **Meta Title** | 50 a 60 caracteres | Palavra-chave principal no início + Proposta de Valor + Marca no final | `AgoraEuFalo | Treine seu Ouvido e Fale Inglês com Naturalidade` |
| **Meta Description** | 140 a 160 caracteres | Chamada direta, problema + solução, números de autoridade (35 anos) + CTA claro | `O sistema definitivo de 35 anos de sala de aula com o Professor Leonardo Leite. Não estude inglês, treine seu ouvido para falar com naturalidade. Conheça!` |
| **Canonical URL** | URL absoluta única | Evita conteúdo duplicado e direciona o ranqueamento | `https://agoraeufalo.com.br/guia-magic-stories.html` |
| **Robots Tag** | `index, follow, max-image-preview:large` | Para páginas públicas indexáveis. Usar `noindex, nofollow` em páginas de obrigado/sucesso. | `<meta name="robots" content="index, follow, max-image-preview:large">` |
| **Heading H1** | 1 único por página | Deve conter a palavra-chave primária e expressar a promessa central | `<h1>Pare de memorizar regras. Treine seu ouvido para falar Inglês com naturalidade.</h1>` |

---

## 🌐 3. Template Oficial de `<head>` para Novas Páginas

Ao criar qualquer nova página no site, utilize esta estrutura padrão:

```html
<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- 1. SEO Primary Meta Tags -->
  <title>[Título da Página: 50-60 chars] | AgoraEuFalo</title>
  <meta name="title" content="[Título da Página] | AgoraEuFalo">
  <meta name="description" content="[Descrição persuasiva com palavra-chave: 140-160 chars com CTA]">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="https://agoraeufalo.com.br/[nome-da-pagina].html">

  <!-- 2. Open Graph / WhatsApp / Facebook / LinkedIn -->
  <meta property="og:type" content="website"> <!-- ou product / article -->
  <meta property="og:url" content="https://agoraeufalo.com.br/[nome-da-pagina].html">
  <meta property="og:title" content="[Título Atraente para Redes Sociais] | AgoraEuFalo">
  <meta property="og:description" content="[Descrição persuasiva para compartilhamento no WhatsApp/Redes]">
  <meta property="og:image" content="https://agoraeufalo.com.br/assets/images/[og-image-especifica].png">
  <meta property="og:image:secure_url" content="https://agoraeufalo.com.br/assets/images/[og-image-especifica].png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="[Texto descritivo da imagem para acessibilidade e SEO]">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="AgoraEuFalo">

  <!-- 3. Twitter / X Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://agoraeufalo.com.br/[nome-da-pagina].html">
  <meta name="twitter:title" content="[Título Twitter]">
  <meta name="twitter:description" content="[Descrição Twitter]">
  <meta name="twitter:image" content="https://agoraeufalo.com.br/assets/images/[og-image-especifica].png">

  <!-- 4. Favicon & App Icons -->
  <link rel="icon" type="image/svg+xml" href="assets/images/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="assets/images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="assets/images/android-chrome-192x192.png">
  <link rel="icon" type="image/png" href="assets/images/favicon.png">
  <link rel="apple-touch-icon" sizes="180x180" href="assets/images/apple-touch-icon.png">

  <!-- 5. Structured Data / Rich Snippets (Schema.org JSON-LD) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": "https://agoraeufalo.com.br/#organization",
        "name": "AgoraEuFalo",
        "url": "https://agoraeufalo.com.br/",
        "logo": "https://agoraeufalo.com.br/assets/images/logo.png"
      },
      {
        "@type": "Person",
        "@id": "https://agoraeufalo.com.br/#instructor",
        "name": "Leonardo Leite",
        "jobTitle": "Professor de Inglês",
        "image": "https://agoraeufalo.com.br/assets/images/leonardo-leite.png"
      }
      // Adicionar Course, FAQPage, Article ou WebPage conforme aplicável
    ]
  }
  </script>
</head>
```

---

## 🛠️ 4. Aplicativo Visual SEO Manager (`seo-manager.html`)

Para gerenciar, simular e validar visualmente todas as páginas do site em tempo real:
- Acesse: `http://localhost:5173/seo-manager.html` ou abra diretamente no navegador.
- No app você pode:
  - Auditar os scores de SEO de todas as páginas.
  - Testar pré-visualizações no **Google (Desktop & Mobile)**, **WhatsApp** e **Twitter (X)**.
  - Construtor interativo de FAQ Schema e Course Schema.
  - Copiar com 1 clique o bloco `<head>` pronto para qualquer nova página.
