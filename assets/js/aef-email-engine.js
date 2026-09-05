/**
 * 🏛️ AgoraEuFalo • Motor Unificado de Comunicação & E-mails Transacionais (Brevo)
 * 
 * Suporta envio via Brevo API v3 (https://api.brevo.com/v3/smtp/email)
 * e fila de contingência no Google Cloud Firestore ('mail/{mailId}').
 * 
 * Contém os 6 Templates Canônicos de Lifecycle:
 * E1 - Boas-Vindas & Onboarding (com Link Mágico)
 * E2 - Acesso Direto / Magic Link / Senha
 * E3 - Novo Conteúdo Liberado na Plataforma
 * E4 - Confirmação de Matrícula / Compra (Hotmart & Stripe)
 * E5 - Alteração de Plano / Upgrade
 * E6 - Suspensão / Falha de Cobrança / Cancelamento
 */

(function(window) {
  'use strict';

  const BREVO_API_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
  const DEFAULT_SENDER_NAME = 'Professor Leonardo Leite • AgoraEuFalo';
  const DEFAULT_SENDER_EMAIL = 'selexenglish@gmail.com';
  const SUPPORT_WHATSAPP = 'https://wa.me/5511999999999';

  class AEFEmailEngine {
    constructor() {
      this.apiKey = this._getStoredApiKey();
      this.senderName = DEFAULT_SENDER_NAME;
      this.senderEmail = DEFAULT_SENDER_EMAIL;
    }

    _getStoredApiKey() {
      try {
        return localStorage.getItem('aef_brevo_api_key') || '';
      } catch (e) {
        return '';
      }
    }

    setApiKey(key) {
      this.apiKey = String(key || '').trim();
      try {
        if (this.apiKey) {
          localStorage.setItem('aef_brevo_api_key', this.apiKey);
        } else {
          localStorage.removeItem('aef_brevo_api_key');
        }
      } catch (e) {}
    }

    hasApiKey() {
      return Boolean(this.apiKey && this.apiKey.length > 10);
    }

    /**
     * Gera o invólucro visual de luxo (Calm EdTech) para todos os e-mails
     */
    _wrapEmailTemplate({ preheader, title, badge, contentHtml, ctaText, ctaUrl, footerNote }) {
      return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
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
    ${preheader || title}
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

            ${ctaUrl && ctaText ? `
              <div style="text-align: center; margin: 28px 0 10px 0;">
                <a href="${ctaUrl}" class="btn" target="_blank">${ctaText}</a>
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
              Dúvidas pedagógicas ou suporte técnico: <a href="mailto:selexenglish@gmail.com">selexenglish@gmail.com</a>
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
      const portalUrl = data.magicLink || 'https://agoraeufalo.com.br/portal.html';

      switch (templateId) {
        // E1: Boas-Vindas & Onboarding
        case 'E1_WELCOME_ONBOARDING':
          return {
            subject: `Hello, my dear friend! Sua sala no AgoraEuFalo está pronta 🎓`,
            html: this._wrapEmailTemplate({
              preheader: 'Bem-vindo ao AgoraEuFalo com o Professor Leonardo Leite.',
              badge: 'Boas-Vindas • Sala Liberada',
              title: `Hello, ${studentName}!`,
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

        // E2: Magic Link / Acesso Direto / Recuperação
        case 'E2_AUTH_MAGIC_LINK':
          return {
            subject: `Seu link de acesso rápido ao AgoraEuFalo 🔑`,
            html: this._wrapEmailTemplate({
              preheader: 'Acesse o portal do aluno com 1 toque.',
              badge: 'Segurança & Acesso Rápido',
              title: `Seu Acesso Rápido, ${studentName}`,
              contentHtml: `
                <p>Você solicitou acesso à sua conta no AgoraEuFalo.</p>
                <p>Para entrar direto na sua sala de aula e no Training Player com total segurança, clique no botão abaixo:</p>
                <div class="box-amber">
                  ⏱️ <strong>Atenção:</strong> Por motivos de segurança, este link é pessoal e expira em instantes.
                </div>
              `,
              ctaText: 'Entrar no AgoraEuFalo Agora ➔',
              ctaUrl: portalUrl,
              footerNote: 'Se você não solicitou este acesso, pode ignorar esta mensagem com tranquilidade.'
            })
          };

        // E3: Novo Conteúdo Disponível
        case 'E3_NEW_CONTENT':
          const contentTitle = data.contentTitle || 'Nova Lição de Treino';
          return {
            subject: `Tem aula nova esperando pelo seu ouvido hoje, my friend! 🎧`,
            html: this._wrapEmailTemplate({
              preheader: `Novo conteúdo disponível: ${contentTitle}`,
              badge: 'Novo Conteúdo • Prática Ativa',
              title: `Tem treino novo para você, ${studentName}!`,
              contentHtml: `
                <p>Acabei de liberar um novo material no ecossistema:</p>
                <div class="box-amber">
                  <strong style="font-size: 17px;">📌 ${contentTitle}</strong><br>
                  ${data.contentDescription || 'Um novo treino focado no Sentimento da Estrutura e musicalidade da língua inglesa viva.'}
                </div>
                <p>Pegue seus fones de ouvido e dedique 10 minutinhos de treino focado hoje. A consistência diária vence qualquer decoreba!</p>
              `,
              ctaText: 'Ouvir e Praticar Agora ➔',
              ctaUrl: data.contentUrl || portalUrl,
              footerNote: 'Disponível tanto no computador quanto direto no seu smartphone.'
            })
          };

        // E4: Confirmação de Compra / Matrícula
        case 'E4_PURCHASE_CONFIRMED':
          const productName = data.productName || 'AgoraEuFalo Club';
          return {
            subject: `Pagamento confirmado! Você agora é membro oficial 🚀`,
            html: this._wrapEmailTemplate({
              preheader: `Sua matrícula em ${productName} foi aprovada com sucesso.`,
              badge: 'Matrícula Confirmada',
              title: `Parabéns pela decisão, ${studentName}!`,
              contentHtml: `
                <p>O seu pagamento para <strong>${productName}</strong> foi aprovado e o seu acesso já está liberado no sistema.</p>
                <div class="box-amber">
                  ✅ <strong>Status da Matrícula:</strong> Ativa & Confirmada<br>
                  📦 <strong>Produto:</strong> ${productName}<br>
                  💳 <strong>Plataforma de Pagamento:</strong> ${data.platform || 'Hotmart / Stripe'}
                </div>
                <p>Sua sala de aula completa, os materiais em PDF diagramados e as trilhas do Training Player de Bolso já estão disponíveis na sua conta.</p>
              `,
              ctaText: 'Entrar na Minha Sala Agora ➔',
              ctaUrl: portalUrl,
              footerNote: 'Você também pode gerenciar sua assinatura e recibos a qualquer momento no Portal.'
            })
          };

        // E5: Troca de Plano / Upgrade
        case 'E5_PLAN_CHANGED':
          const newPlanName = data.newPlanName || 'Membro VIP';
          return {
            subject: `Seu plano foi atualizado no AgoraEuFalo ⭐️`,
            html: this._wrapEmailTemplate({
              preheader: `Seu novo plano é ${newPlanName}.`,
              badge: 'Atualização de Plano',
              title: `Tudo pronto, ${studentName}!`,
              contentHtml: `
                <p>Confirmamos a alteração do seu plano para <strong>${newPlanName}</strong>.</p>
                <p>Os novos módulos, treinos e funcionalidades do seu novo nível de acesso já foram atribuídos ao seu perfil no Firestore.</p>
              `,
              ctaText: 'Explorar Meus Novos Treinos ➔',
              ctaUrl: portalUrl,
              footerNote: 'Caso tenha dúvidas sobre os novos recursos liberados, nossa equipe está à disposição.'
            })
          };

        // E6: Suspensão / Falha de Cobrança / Cancelamento
        case 'E6_SUSPENSION_CANCELLATION':
          return {
            subject: `Importante sobre o seu acesso ao AgoraEuFalo ⚠️`,
            html: this._wrapEmailTemplate({
              preheader: 'Aviso importante sobre sua assinatura.',
              badge: 'Aviso de Assinatura',
              title: `Olá, ${studentName}`,
              contentHtml: `
                <p>Escrevo para informar que sua assinatura do AgoraEuFalo teve uma alteração recente no status de pagamento.</p>
                <div class="box-amber">
                  ⚠️ <strong>Detalhes:</strong> ${data.reason || 'Houve uma falha na renovação da assinatura ou solicitação de encerramento.'}
                </div>
                <p>Se você deseja continuar com seus treinos e manter todo o seu histórico de streaks e práticas ativo, basta regularizar sua forma de pagamento pelo link abaixo:</p>
              `,
              ctaText: 'Regularizar Meu Acesso ➔',
              ctaUrl: data.recoveryUrl || 'https://agoraeufalo.com.br/precos.html',
              footerNote: 'Se você realmente optou pelo encerramento, agradeço profundamente pela companhia nesta jornada!'
            })
          };

        default:
          throw new Error(`[AEFEmailEngine] Template '${templateId}' não reconhecido.`);
      }
    }

    /**
     * Envia e-mail transacional via Brevo API
     */
    async sendTransactionalEmail({ templateId, toEmail, toName, params = {} }) {
      if (!toEmail) {
        throw new Error('[AEFEmailEngine] E-mail do destinatário obrigatório.');
      }

      const template = this.buildTemplate(templateId, {
        name: toName,
        email: toEmail,
        ...params
      });

      console.log(`📬 [AEFEmailEngine] Preparando envio de '${templateId}' para ${toEmail}...`);

      // 1. Se possuir Brevo API Key, envia diretamente via REST API
      if (this.hasApiKey()) {
        try {
          const response = await fetch(BREVO_API_ENDPOINT, {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'api-key': this.apiKey,
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              sender: {
                name: this.senderName,
                email: this.senderEmail
              },
              to: [
                {
                  email: toEmail,
                  name: toName || toEmail.split('@')[0]
                }
              ],
              subject: template.subject,
              htmlContent: template.html
            })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error('❌ [AEFEmailEngine] Erro na API Brevo:', response.status, errData);
            throw new Error(`Brevo API Error ${response.status}: ${JSON.stringify(errData)}`);
          }

          const resData = await response.json();
          console.log('✅ [AEFEmailEngine] E-mail enviado com sucesso via Brevo:', resData);
          return { success: true, provider: 'brevo', messageId: resData.messageId };
        } catch (err) {
          console.warn('⚠️ [AEFEmailEngine] Falha ao enviar via Brevo API direta. Tentando fila Firestore...', err);
        }
      } else {
        console.info('ℹ️ [AEFEmailEngine] Brevo API Key não configurada localmente. Registrando na fila Firestore/mail...');
      }

      // 2. Fila Firestore de Contingência ('mail/{mailId}') para Firebase Extension / Cloud Function
      if (window.firebase && window.firebase.firestore) {
        try {
          const db = window.firebase.firestore();
          const mailDoc = await db.collection('mail').add({
            to: toEmail,
            message: {
              subject: template.subject,
              html: template.html
            },
            templateId: templateId,
            createdAt: new Date().toISOString(),
            status: 'queued'
          });

          console.log(`✅ [AEFEmailEngine] E-mail enfileirado no Firestore ('mail/${mailDoc.id}'):`, template.subject);
          return { success: true, provider: 'firestore_queue', queueId: mailDoc.id };
        } catch (dbErr) {
          console.error('❌ [AEFEmailEngine] Erro ao gravar na fila Firestore:', dbErr);
        }
      }

      return {
        success: false,
        warning: 'API Key não informada e Firestore indisponível. Template gerado localmente com sucesso.',
        template
      };
    }
  }

  // Instância singleton global
  window.aefEmailEngine = new AEFEmailEngine();

})(typeof window !== 'undefined' ? window : this);
