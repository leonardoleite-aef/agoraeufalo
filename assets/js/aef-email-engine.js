/**
 * 🏛️ AgoraEuFalo • Motor Unificado de Comunicação & E-mails Transacionais (Brevo)
 * 
 * Envio direto via Brevo API v3 (https://api.brevo.com/v3/smtp/email).
 * 
 * Catálogo dos Templates Canônicos de Lifecycle:
 * - E1_WELCOME_ONBOARDING: Boas-Vindas & Onboarding (com Link do Portal)
 * - E2_AUTH_MAGIC_LINK: Lembrete de Acesso à Plataforma
 * - E3_NEW_CONTENT: Novo Conteúdo Liberado na Plataforma
 * - E4_PURCHASE_CONFIRMED: Confirmação de Matrícula / Compra (Hotmart & Stripe)
 * - E4_PRODUCT_ACCESS: Confirmação de Acesso a Novo(s) Produto(s) Liberado(s)
 * - E5_PLAN_UPGRADE: Upgrade Celebratório de Plano
 * - E5_PLAN_DOWNGRADE: Downgrade Acolhedor de Plano (histórico preservado)
 * - E5_PLAN_CHANGED: Alteração Neutra de Plano (alias retrocompatível)
 * - E6_SUSPENSION_CANCELLATION: Suspensão / Falha de Cobrança / Cancelamento
 * - E8_VIP_PRESCRIPTION: Prescrição de Áudio Sob Medida (Mentoria VIP)
 */

(function(root) {
  'use strict';

  const DEFAULT_SENDER_NAME = 'Leonardo Leite • AgoraEuFalo';
  const DEFAULT_SENDER_EMAIL = 'contato@agoraeufalo.com.br';
  const DEFAULT_REPLY_TO_EMAIL = 'selexenglish@gmail.com';
  const DEFAULT_PORTAL_URL = 'https://app.agoraeufalo.com.br/portal';
  const SUPPORT_WHATSAPP = 'https://wa.me/5511999999999';

  const PLAN_LABELS = {
    free: 'AgoraEuFalo Free',
    club_monthly: 'AEF Club Mensal',
    club_annual: 'AEF Club Anual',
    vip_mentorship: 'Mentoria VIP Individual',
    lifetime: 'Acesso Vitalício',
    pago: 'AEF Club'
  };

  /**
   * Escapa caracteres perigosos para HTML (& < > " ')
   */
  function _esc(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Valida URLs para permitir apenas protocolo http:// ou https://
   */
  function _safeUrl(url, fallback) {
    const fallbackUrl = fallback || DEFAULT_PORTAL_URL;
    if (!url || typeof url !== 'string') return fallbackUrl;
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return fallbackUrl;
  }

  class AEFEmailEngine {
    constructor() {
      this.senderName = DEFAULT_SENDER_NAME;
      this.senderEmail = DEFAULT_SENDER_EMAIL;
      this.replyToEmail = DEFAULT_REPLY_TO_EMAIL;
      this.PLAN_LABELS = PLAN_LABELS;
    }

    _esc(s) {
      return _esc(s);
    }

    _safeUrl(url, fallback) {
      return _safeUrl(url, fallback);
    }

    /**
     * Converte identificador técnico de plano/tier para label humanizado
     */
    planLabel(tier) {
      if (!tier) return '';
      const str = String(tier).trim();
      const lower = str.toLowerCase();
      if (PLAN_LABELS[lower]) {
        return PLAN_LABELS[lower];
      }
      for (const val of Object.values(PLAN_LABELS)) {
        if (val.toLowerCase() === lower) return val;
      }
      return str
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    }

    /**
     * Gera o invólucro visual de luxo (Calm EdTech) para todos os e-mails
     */
    /* CONTRATO: title/preheader/badge/ctaText/footerNote/contentHtml chegam JA ESCAPADOS pelo template; ctaUrl e validado/escapado aqui. */
    _wrapEmailTemplate({ preheader, title, badge, contentHtml, ctaText, ctaUrl, footerNote }) {
      const safeCtaUrl = _safeUrl(ctaUrl, DEFAULT_PORTAL_URL);
      const cleanTitle = (title || '').replace(/<[^>]*>/g, '');
      const cleanPreheader = (preheader || cleanTitle || '').replace(/<[^>]*>/g, '');

      return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cleanTitle}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #060D17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FAF8F5; border-radius: 20px; overflow: hidden; border: 1px solid #EAE5DC; }
    .header { background: #060D17; padding: 32px 30px; text-align: center; border-bottom: 2px solid #D97706; }
    .content { padding: 40px 36px; color: #1E293B; line-height: 1.65; font-size: 16px; }
    .badge { display: inline-block; padding: 5px 12px; background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 9999px; color: #92400E; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
    .heading { font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 18px 0; line-height: 1.25; }
    .btn { display: inline-block; padding: 15px 32px; background: linear-gradient(135deg, #F59E0B, #D97706); color: #060D17 !important; text-decoration: none; font-weight: 800; font-size: 15px; border-radius: 12px; box-shadow: 0 4px 14px rgba(217, 119, 6, 0.35); text-transform: uppercase; letter-spacing: 0.03em; margin: 24px 0 12px 0; text-align: center; }
    .box-amber { background-color: #FFFBEB; border-left: 4px solid #F59E0B; padding: 16px 20px; border-radius: 8px; margin: 20px 0; font-size: 15px; color: #78350F; }
    .footer { background-color: #F1EFE9; padding: 24px 30px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }
    .footer a { color: #D97706; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body style="margin: 0; padding: 30px 10px; background-color: #060D17;">
  <!-- Preheader invisível para clientes de e-mail -->
  <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
    ${cleanPreheader}
  </div>

  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <div class="container">
          
          <!-- Header Deep Navy -->
          <div class="header">
            <img src="https://agoraeufalo.com.br/assets/images/logo-fundo-escuro.png" alt="AgoraEuFalo" width="170" style="display: block; margin: 0 auto; max-width: 170px; height: auto;">
          </div>

          <!-- Corpo Principal Nobre Off-White -->
          <div class="content">
            ${badge ? `<div class="badge">${badge}</div>` : ''}
            <h1 class="heading">${title}</h1>
            
            ${contentHtml}

            ${safeCtaUrl && ctaText ? `
              <div style="text-align: center; margin: 28px 0 10px 0;">
                <a href="${_esc(safeCtaUrl)}" class="btn" target="_blank">${ctaText}</a>
              </div>
            ` : ''}

            ${footerNote ? `
              <p style="font-size: 13px; color: #64748B; margin-top: 24px; text-align: center;">
                ${footerNote}
              </p>
            ` : ''}
          </div>

          <!-- Rodapé Institucional -->
          <div class="footer">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #475569;">
              Professor Leonardo Leite • Mais de 35 anos de sala de aula
            </p>
            <p style="margin: 0 0 12px 0;">
              Inglês não é matéria para passar em prova; inglês é experiência viva.
            </p>
            <p style="margin: 0;">
              Dúvidas pedagógicas ou suporte técnico: <a href="mailto:${_esc(DEFAULT_REPLY_TO_EMAIL)}">${_esc(DEFAULT_REPLY_TO_EMAIL)}</a>
            </p>
          </div>

        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
    }

    /**
     * Constrói o template exato para cada evento de lifecycle
     */
    buildTemplate(templateId, data = {}) {
      const studentName = (data.name || 'Friend').trim().split(' ')[0];
      const portalUrl = _safeUrl(data.magicLink || data.portalUrl, DEFAULT_PORTAL_URL);

      switch (templateId) {
        // E1: Boas-Vindas & Onboarding
        case 'E1_WELCOME_ONBOARDING':
          return {
            subject: `Hello, my dear friend! Sua sala no AgoraEuFalo está pronta 🎓`,
            html: this._wrapEmailTemplate({
              preheader: 'Bem-vindo ao AgoraEuFalo com o Professor Leonardo Leite.',
              badge: 'Boas-Vindas • Sala Liberada',
              title: `Hello, ${_esc(studentName)}!`,
              contentHtml: `
                <p>Que alegria ter você aqui comigo nesta nova jornada!</p>
                <p>Nesses mais de 35 anos de sala de aula, uma coisa sempre ficou clara: <strong>você não precisa de mais regras gramaticais para falar inglês</strong>. O que você precisa é treinar seu ouvido com curiosidade até que as respostas comecem a sair no reflexo automático.</p>
                
                <div class="box-amber">
                  <strong>💡 A Regra de Ouro do Leo:</strong><br>
                  Coloque os fones de ouvido, relaxe os ombros e escute sem o vício de ler e traduzir tudo de imediato. A fala é uma consequência natural do acúmulo de horas de escuta viva.
                </div>

                <p>Seu acesso ao Portal e ao <strong>Training Player</strong> já está 100% pronto. Toque no botão abaixo para entrar direto sem precisar memorizar senhas:</p>
              `,
              ctaText: 'Acessar Minha Sala de Aula ➔',
              ctaUrl: portalUrl,
              footerNote: 'Dica: Guarde este e-mail para acessar sua sala a qualquer momento com 1 toque.'
            })
          };

        // E2: Lembrete de Acesso à Plataforma
        case 'E2_AUTH_MAGIC_LINK': {
          const e2LoginUrl = data.email
            ? ('https://app.agoraeufalo.com.br/login?email=' + encodeURIComponent(data.email))
            : portalUrl;
          return {
            subject: `Seu lembrete de acesso ao AgoraEuFalo 🔑`,
            html: this._wrapEmailTemplate({
              preheader: 'Acesse sua sala de aula e continue seus treinos.',
              badge: 'Lembrete de Acesso',
              title: `Hello, ${_esc(studentName)}!`,
              contentHtml: `
                <p>Aqui está o seu atalho para acessar a plataforma do AgoraEuFalo.</p>
                <p>Para entrar direto na sua sala de aula e no Training Player com total comodidade, clique no botão abaixo:</p>
                <div class="box-amber">
                  💡 <strong>Como entrar:</strong> Na tela de login, você pode entrar com sua senha ou clicar no botão <strong>"Receber Link Mágico"</strong> para receber um link de acesso instantâneo diretamente no seu e-mail, sem precisar memorizar senhas.
                </div>
              `,
              ctaText: 'Acessar o AgoraEuFalo Agora ➔',
              ctaUrl: _safeUrl(e2LoginUrl, portalUrl),
              footerNote: 'Se você não solicitou este lembrete de acesso, pode desconsiderar esta mensagem com tranquilidade.'
            })
          };
        }

        // E3: Novo Conteúdo Disponível
        case 'E3_NEW_CONTENT': {
          const contentTitle = data.contentTitle || 'Nova Lição de Treino';
          const contentDesc = data.contentDescription || 'Um novo treino focado no Sentimento da Estrutura e musicalidade da língua inglesa viva.';
          return {
            subject: `Tem aula nova esperando pelo seu ouvido hoje, my friend! 🎧`,
            html: this._wrapEmailTemplate({
              preheader: `Novo conteúdo disponível: ${contentTitle}`,
              badge: 'Novo Conteúdo • Prática Ativa',
              title: `Hello, ${_esc(studentName)}!`,
              contentHtml: `
                <p>Acabei de liberar um novo material no ecossistema:</p>
                <div class="box-amber">
                  <strong style="font-size: 17px;">📌 ${_esc(contentTitle)}</strong><br>
                  ${_esc(contentDesc)}
                </div>
                <p>Pegue seus fones de ouvido e dedique 10 minutinhos de treino focado hoje. A consistência diária vence qualquer decoreba!</p>
              `,
              ctaText: 'Ouvir e Praticar Agora ➔',
              ctaUrl: _safeUrl(data.contentUrl, portalUrl),
              footerNote: 'Disponível tanto no computador quanto direto no seu smartphone.'
            })
          };
        }

        // E4: Confirmação de Compra / Matrícula (Hotmart & Stripe)
        case 'E4_PURCHASE_CONFIRMED': {
          const productName = data.productName || 'AgoraEuFalo Club';
          const platformName = data.platform || 'Hotmart / Stripe';
          return {
            subject: `Pagamento confirmado! Você agora é membro oficial 🚀`,
            html: this._wrapEmailTemplate({
              preheader: `Sua matrícula em ${productName} foi aprovada com sucesso.`,
              badge: 'Matrícula Confirmada',
              title: `Hello, ${_esc(studentName)}!`,
              contentHtml: `
                <p>O seu pagamento para <strong>${_esc(productName)}</strong> foi aprovado e o seu acesso já está liberado no sistema.</p>
                <div class="box-amber">
                  ✅ <strong>Status da Matrícula:</strong> Ativa &amp; Confirmada<br>
                  📦 <strong>Produto:</strong> ${_esc(productName)}<br>
                  💳 <strong>Plataforma de Pagamento:</strong> ${_esc(platformName)}
                </div>
                <p>Sua sala de aula completa, os materiais em PDF diagramados e as trilhas do Training Player de Bolso já estão disponíveis na sua conta.</p>
              `,
              ctaText: 'Entrar na Minha Sala Agora ➔',
              ctaUrl: portalUrl,
              footerNote: 'Você também pode gerenciar sua assinatura e recibos a qualquer momento no Portal.'
            })
          };
        }

        // E4: Confirmação de Acesso a Novo(s) Produto(s) Liberado(s)
        case 'E4_PRODUCT_ACCESS': {
          const rawProducts = Array.isArray(data.products)
            ? data.products
            : (data.products ? [data.products] : (data.productName ? [data.productName] : ['Conteúdo AgoraEuFalo']));
          const productListHtml = rawProducts
            .filter(Boolean)
            .map(p => `<li><strong>${_esc(p)}</strong></li>`)
            .join('');
          return {
            subject: `Novo acesso liberado para você no AgoraEuFalo 🎓`,
            html: this._wrapEmailTemplate({
              preheader: 'Seu acesso a novos conteúdos foi liberado na plataforma.',
              badge: 'Novo Acesso Liberado',
              title: `Hello, ${_esc(studentName)}!`,
              contentHtml: `
                <p>Um novo acesso foi liberado para você na plataforma AgoraEuFalo!</p>
                <p>Você já pode acessar e praticar o(s) seguinte(s) conteúdo(s):</p>
                <div class="box-amber">
                  <ul style="margin: 8px 0; padding-left: 20px;">
                    ${productListHtml}
                  </ul>
                </div>
                <p>Sua sala de aula e todas as atividades práticas correspondentes já estão prontas para você treinar no Training Player.</p>
              `,
              ctaText: 'Acessar Meus Treinos Agora ➔',
              ctaUrl: portalUrl,
              footerNote: 'Coloque os fones de ouvido e aproveite seus novos treinos!'
            })
          };
        }

        // E5: Upgrade Celebratório de Plano
        case 'E5_PLAN_UPGRADE': {
          const rawPlan = data.newPlanName || data.plan || data.tier || 'club_monthly';
          const newPlanLabel = this.planLabel(rawPlan) || rawPlan;
          return {
            subject: `Parabéns pelo upgrade! Seu novo nível no AgoraEuFalo está liberado 🚀`,
            html: this._wrapEmailTemplate({
              preheader: `Seu upgrade para ${newPlanLabel} foi confirmado com sucesso.`,
              badge: 'Upgrade Confirmado',
              title: `Hello, ${_esc(studentName)}!`,
              contentHtml: `
                <p>Que notícia fantástica! O seu upgrade para <strong>${_esc(newPlanLabel)}</strong> foi confirmado com sucesso.</p>
                <div class="box-amber">
                  ⭐️ <strong>Novo Nível de Acesso:</strong> ${_esc(newPlanLabel)}<br>
                  🔓 Todos os novos módulos, masterclasses e trilhas de treino correspondentes já foram liberados no seu perfil.
                </div>
                <p>Você deu mais um passo significativo para destravar seu inglês pela escuta viva e reflexo automático. Agora é aproveitar ao máximo cada treino no Training Player!</p>
              `,
              ctaText: 'Explorar Meus Novos Treinos ➔',
              ctaUrl: portalUrl,
              footerNote: 'Caso precise de qualquer orientação sobre os novos recursos, estou à disposição.'
            })
          };
        }

        // E5: Downgrade Acolhedor de Plano (histórico preservado)
        case 'E5_PLAN_DOWNGRADE': {
          const rawPlan = data.newPlanName || data.plan || data.tier || 'free';
          const newPlanLabel = this.planLabel(rawPlan) || rawPlan;
          return {
            subject: `Atualização sobre o seu plano no AgoraEuFalo`,
            html: this._wrapEmailTemplate({
              preheader: `Seu plano foi atualizado para ${newPlanLabel}.`,
              badge: 'Atualização de Plano',
              title: `Hello, ${_esc(studentName)}!`,
              contentHtml: `
                <p>Escrevo para confirmar que o seu plano no AgoraEuFalo foi alterado para <strong>${_esc(newPlanLabel)}</strong>.</p>
                <div class="box-amber">
                  📋 <strong>O que muda:</strong> Seu acesso foi ajustado para os recursos e conteúdos do plano ${_esc(newPlanLabel)}.<br>
                  💾 <strong>Seu histórico está 100% preservado:</strong> Todas as suas aulas concluídas, estatísticas e ritmo de estudo continuam guardados com segurança na sua conta.
                </div>
                <p>Foi um privilégio caminhar com você neste ciclo, e as portas continuam sempre abertas. Caso deseje reativar seu plano completo e retomar todos os treinos avançados a qualquer momento, você pode fazer isso de forma simples:</p>
              `,
              ctaText: 'Conhecer Planos e Reativar ➔',
              ctaUrl: _safeUrl(data.reactivationUrl, 'https://agoraeufalo.com.br/precos.html'),
              footerNote: 'Você continua com acesso à sua conta e aos treinos abertos no Portal.'
            })
          };
        }

        // E5: Alteração Neutra de Plano (alias retrocompatível)
        case 'E5_PLAN_CHANGED': {
          const rawPlan = data.newPlanName || data.plan || data.tier || 'club_monthly';
          const newPlanLabel = this.planLabel(rawPlan) || rawPlan;
          return {
            subject: `Seu plano foi atualizado no AgoraEuFalo ⭐️`,
            html: this._wrapEmailTemplate({
              preheader: `Seu novo plano é ${newPlanLabel}.`,
              badge: 'Atualização de Plano',
              title: `Hello, ${_esc(studentName)}!`,
              contentHtml: `
                <p>Confirmamos a alteração do seu plano para <strong>${_esc(newPlanLabel)}</strong>.</p>
                <p>Os novos módulos, treinos e funcionalidades do seu novo nível de acesso já foram atribuídos ao seu perfil na plataforma.</p>
              `,
              ctaText: 'Explorar Meus Novos Treinos ➔',
              ctaUrl: portalUrl,
              footerNote: 'Caso tenha dúvidas sobre os recursos liberados, nossa equipe está à disposição.'
            })
          };
        }

        // E6: Suspensão / Falha de Cobrança / Cancelamento
        case 'E6_SUSPENSION_CANCELLATION': {
          const reasonText = data.reason || 'Houve uma falha na renovação da assinatura ou solicitação de encerramento.';
          return {
            subject: `Importante sobre o seu acesso ao AgoraEuFalo ⚠️`,
            html: this._wrapEmailTemplate({
              preheader: 'Aviso importante sobre sua assinatura.',
              badge: 'Aviso de Assinatura',
              title: `Hello, ${_esc(studentName)}!`,
              contentHtml: `
                <p>Escrevo para informar que sua assinatura do AgoraEuFalo teve uma alteração recente no status de pagamento.</p>
                <div class="box-amber">
                  ⚠️ <strong>Detalhes:</strong> ${_esc(reasonText)}
                </div>
                <p>Se você deseja continuar com seus treinos e manter todo o seu histórico e ritmo ativo, basta regularizar sua forma de pagamento pelo link abaixo:</p>
              `,
              ctaText: 'Regularizar Meu Acesso ➔',
              ctaUrl: _safeUrl(data.recoveryUrl, 'https://agoraeufalo.com.br/precos.html'),
              footerNote: 'Se você realmente optou pelo encerramento, agradeço profundamente pela companhia nesta jornada!'
            })
          };
        }

        // E8: Prescrição VIP Sob Medida
        case 'E8_VIP_PRESCRIPTION': {
          const prescriptionTitle = data.title || 'Novo Áudio de Treino Personalizado';
          const prescriptionUrl = _safeUrl(data.url, portalUrl);
          return {
            subject: `Professor Leo prescreveu um treino sob medida para você 👑`,
            html: this._wrapEmailTemplate({
              preheader: `Novo áudio prescrito na Mentoria VIP: ${prescriptionTitle}`,
              badge: 'Mentoria VIP • Prescrição Individual',
              title: `Hello, ${_esc(studentName)}!`,
              contentHtml: `
                <p>Acabei de prescrever um novo áudio de treino sob medida especialmente para você na sua Mentoria VIP.</p>
                <div class="box-amber">
                  <strong style="font-size: 17px;">🎧 ${_esc(prescriptionTitle)}</strong><br>
                  Este material foi gravado e orientado sob medida para o seu momento atual, focando no seu ritmo de fala e afinação de escuta.
                </div>
                <p>Coloque os fones de ouvido, relaxe os ombros e faça sua sessão de treino hoje. Estou acompanhando de perto sua evolução!</p>
              `,
              ctaText: 'Ouvir Meu Treino VIP ➔',
              ctaUrl: prescriptionUrl,
              footerNote: 'Disponível com exclusividade na sua área de Mentoria VIP no Portal.'
            })
          };
        }

        default:
          throw new Error(`[AEFEmailEngine] Template '${templateId}' não reconhecido.`);
      }
    }

    /**
     * Envia e-mail transacional via Brevo API
     * Suporta chamada posicional: sendEmail(templateId, toEmail, toName, params)
     * Ou objeto único de opções: sendEmail({ templateId, toEmail, toName, params })
     */
    async sendEmail(templateIdOrOptions, toEmail, toName, params = {}) {
      if (templateIdOrOptions && typeof templateIdOrOptions === 'object') {
        return this.sendTransactionalEmail(templateIdOrOptions);
      }
      return this.sendTransactionalEmail({
        templateId: templateIdOrOptions,
        toEmail,
        toName,
        params
      });
    }

    /**
     * Envia e-mail transacional delegando de forma segura ao Worker Cloudflare
     */
    async sendTransactionalEmail(templateIdOrOptions, toEmailArg, toNameArg, paramsArg = {}) {
      let templateId, toEmail, toName, params;

      if (templateIdOrOptions && typeof templateIdOrOptions === 'object') {
        templateId = templateIdOrOptions.templateId;
        toEmail = templateIdOrOptions.toEmail;
        toName = templateIdOrOptions.toName;
        params = templateIdOrOptions.params || {};
      } else {
        templateId = templateIdOrOptions;
        toEmail = toEmailArg;
        toName = toNameArg;
        params = paramsArg || {};
      }

      if (!toEmail || typeof toEmail !== 'string' || !toEmail.trim()) {
        throw new Error('[AEFEmailEngine] E-mail do destinatário obrigatório.');
      }
      toEmail = toEmail.trim();

      if (!templateId) {
        throw new Error('[AEFEmailEngine] ID do template obrigatório.');
      }

      const template = this.buildTemplate(templateId, {
        name: toName,
        email: toEmail,
        ...params
      });

      console.log(`📬 [AEFEmailEngine] Solicitando envio do template '${templateId}' para ${toEmail} via Worker...`);

      // Obtenção do token JWT atual via window.aefPortalAuth (Firebase)
      let authToken = '';
      if (typeof window !== 'undefined' && window.aefPortalAuth && typeof window.aefPortalAuth.getIdToken === 'function') {
        try {
          authToken = await window.aefPortalAuth.getIdToken();
        } catch (e) {
          console.warn('⚠️ [AEFEmailEngine] Falha ao obter token de autenticação Firebase.', e);
        }
      }

      if (!authToken) {
        throw new Error('[AEFEmailEngine] Usuário não autenticado no cliente. Impossível enviar e-mail via Worker.');
      }

      // Identifica o endpoint de forma dinâmica
      const isLocal = (typeof window !== 'undefined' && (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')));
      const WORKER_ENDPOINT = isLocal
        ? 'http://localhost:8787/api/admin/send-email'
        : 'https://admin.agoraeufalo.com.br/api/admin/send-email';

      let response;
      try {
        response = await fetch(WORKER_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            toEmail: toEmail,
            toName: toName,
            subject: template.subject,
            html: template.html
          })
        });
      } catch (networkErr) {
        console.error('❌ [AEFEmailEngine] Erro de rede/conexão com o Worker:', networkErr);
        throw new Error(`[AEFEmailEngine] Falha de conexão ao enviar e-mail: ${networkErr.message}`);
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = (errData && errData.error)
          ? errData.error
          : (typeof errData === 'object' ? JSON.stringify(errData) : String(errData));
        console.error('❌ [AEFEmailEngine] Erro no Worker:', response.status, errData);
        throw new Error(`[AEFEmailEngine] Erro do Servidor (${response.status}): ${errMsg}`);
      }

      const resData = await response.json().catch(() => ({}));
      const messageId = resData.messageId || 'enviado_worker';
      console.log('✅ [AEFEmailEngine] E-mail enviado com sucesso via Worker:', { messageId });
      return { success: true, provider: 'brevo_worker', messageId };
    }
  }

  // Registra no ambiente do navegador ou stub global se disponível
  const targetScope = (typeof window !== 'undefined') ? window : (root || {});
  if (targetScope) {
    targetScope.AEFEmailEngine = AEFEmailEngine;
    targetScope.aefEmailEngine = new AEFEmailEngine();
  }

  // Exportação CommonJS para testes em Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AEFEmailEngine;
    module.exports.AEFEmailEngine = AEFEmailEngine;
    module.exports.PLAN_LABELS = PLAN_LABELS;
    module.exports.aefEmailEngine = (targetScope && targetScope.aefEmailEngine) || new AEFEmailEngine();
  }

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
