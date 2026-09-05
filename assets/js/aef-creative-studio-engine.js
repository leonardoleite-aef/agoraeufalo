/**
 * AgoraEuFalo • Creative Studio Engine (HTML5 Canvas Multi-Format Generator)
 * Professor Leonardo Leite
 * 
 * Gera o Kit Master Oficial de 6 Formatos para Cursos, Produtos e Aulas:
 * 1. Hotmart Capa do Produto (1:1 - 1000x1000)
 * 2. Hotmart Checkout Banner (Panorâmico - 940x120)
 * 3. YouTube / Webinar / Masterclass Thumb (16:9 - 1920x1080)
 * 4. AgoraEuFalo Player / Lockscreen Mobile (1:1 - 512x512)
 * 5. Hero de Sales Page & Landing Page (16:9 - 1920x1080)
 * 6. Card Vitrine LMS AgoraEuFalo (16:9 - 800x450)
 * 
 * Inclui:
 * - Renderização ao vivo em <canvas> com tipografia Calm EdTech e gradientes Deep Navy
 * - Simulador de Contexto (Hotmart, YouTube, Checkout, Player, Vitrine)
 * - Empacotador de Kit Completo em .ZIP via JSZip
 * - Sincronização direta com Firestore e aef-courses-registry
 */

(function (window) {
  'use strict';

  const FORMATS_SPEC = {
    hotmart_cover: {
      id: 'hotmart_cover',
      name: 'Hotmart • Capa do Produto (1:1)',
      width: 1000,
      height: 1000,
      aspectRatio: '1:1',
      badge: 'HOTMART OFICIAL',
      dest: 'Vitrine e aplicativo da Hotmart',
      filename: 'hotmart-capa-1000x1000.jpg',
      style: 'card'
    },
    hotmart_checkout: {
      id: 'hotmart_checkout',
      name: 'Hotmart • Banner de Checkout (Panorâmico)',
      width: 940,
      height: 120,
      aspectRatio: '940:120',
      badge: 'CHECKOUT OFICIAL',
      dest: 'Topo da tela de pagamento Hotmart',
      filename: 'hotmart-checkout-banner-940x120.jpg',
      style: 'banner_thin'
    },
    youtube_thumb: {
      id: 'youtube_thumb',
      name: 'YouTube / Webinar • Thumb 16:9',
      width: 1920,
      height: 1080,
      aspectRatio: '16:9',
      badge: 'VÍDEO MASTERCLASS',
      dest: 'Miniatura no YouTube e transmissões',
      filename: 'youtube-thumb-1920x1080.jpg',
      style: 'youtube'
    },
    player_mobile: {
      id: 'player_mobile',
      name: 'Player • Capa Mobile Lockscreen (1:1)',
      width: 512,
      height: 512,
      aspectRatio: '1:1',
      badge: 'TRAINING PLAYER',
      dest: 'Tela de bloqueio iOS/Android & Player',
      filename: 'player-mobile-512x512.jpg',
      style: 'player'
    },
    sales_hero: {
      id: 'sales_hero',
      name: 'Sales Page • Hero Banner 16:9',
      width: 1920,
      height: 1080,
      aspectRatio: '16:9',
      badge: 'PÁGINA DE VENDAS',
      dest: 'Destaque no topo de Landing Pages',
      filename: 'sales-page-hero-1920x1080.jpg',
      style: 'hero'
    },
    lms_card: {
      id: 'lms_card',
      name: 'Área de Membros • Card Vitrine LMS',
      width: 800,
      height: 450,
      aspectRatio: '16:9',
      badge: 'CURSO ATIVO',
      dest: 'Portal do Aluno (curso.html)',
      filename: 'vitrine-curso-800x450.jpg',
      style: 'lms'
    }
  };

  class AEFCreativeStudioEngine {
    constructor() {
      this.currentCourse = null;
      this.baseImage = null; // Image element
      this.baseImageUrl = null;
      this.settings = {
        title: 'Inglês da Vida Real',
        subtitle: 'Aprenda pelos ouvidos até a fala virar reflexo',
        badge: 'CURSO OFICIAL',
        accentColor: '#F59E0B',
        overlayDarkness: 0.55,
        verticalOffset: 0, // -100 to 100%
        zoom: 1.0,
        showLogo: true,
        showBadge: true
      };

      this.renderedBlobs = {};
      this.logoImage = null;
      this.loadLogo();
    }

    loadLogo() {
      const img = new Image();
      img.onload = () => { 
        this.logoImage = img; 
      };
      img.onerror = () => {
        console.warn('[CreativeStudioEngine] Logo não carregado:', img.src);
      };
      img.src = 'assets/images/AEF-Logo_2026_fundo_escuro-800x300.png';
    }

    /**
     * Carrega imagem a partir de arquivo do computador
     */
    async loadFromFile(file) {
      return new Promise((resolve, reject) => {
        if (!file) return reject(new Error('Nenhum arquivo fornecido'));
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            this.baseImage = img;
            this.baseImageUrl = e.target.result;
            resolve(img);
          };
          img.onerror = reject;
          img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    /**
     * Carrega imagem a partir de URL do ecossistema com fallback resiliente
     */
    async loadFromUrl(url) {
      return new Promise((resolve) => {
        if (!url) {
          console.warn('[CreativeStudioEngine] URL vazia');
          return resolve(null);
        }

        const isRemote = /^(https?:)?\/\//i.test(url) && (!window.location.origin || !url.startsWith(window.location.origin));

        const tryLoad = (useCors) => {
          const img = new Image();
          if (useCors) {
            img.crossOrigin = 'anonymous';
          }
          img.onload = () => {
            this.baseImage = img;
            this.baseImageUrl = url;
            resolve(img);
          };
          img.onerror = (err) => {
            if (useCors) {
              // Se falhou com CORS (ex: servidor sem cabeçalho Access-Control-Allow-Origin), tenta carregar direto sem CORS
              tryLoad(false);
            } else {
              console.warn('[CreativeStudioEngine] Falha ao carregar imagem:', url, err);
              this.baseImageUrl = url;
              resolve(null);
            }
          };
          img.src = url;
        };

        tryLoad(isRemote);
      });
    }

    /**
     * Atualiza as configurações textuais e de composição
     */
    updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings };
    }

    /**
     * Renderiza um formato específico em um canvas off-screen ou fornecido
     */
    renderFormat(formatKey, targetCanvas) {
      const spec = FORMATS_SPEC[formatKey];
      if (!spec) return null;

      const canvas = targetCanvas || document.createElement('canvas');
      canvas.width = spec.width;
      canvas.height = spec.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const W = spec.width;
      const H = spec.height;

      // 1. Fundo Base Deep Navy
      ctx.fillStyle = '#060D17';
      ctx.fillRect(0, 0, W, H);

      // 2. Desenhar Imagem Base com Enquadramento Inteligente
      if (this.baseImage && this.baseImage.complete && this.baseImage.naturalWidth > 0) {
        ctx.save();
        const img = this.baseImage;
        const imgRatio = img.width / img.height;
        const canvasRatio = W / H;

        let drawW, drawH, drawX, drawY;

        if (spec.style === 'banner_thin') {
          // No banner panorâmico (940x120), posicionamos a imagem na metade direita
          drawW = W * 0.55;
          drawH = drawW / imgRatio;
          if (drawH < H) {
            drawH = H;
            drawW = drawH * imgRatio;
          }
          drawX = W - drawW;
          const vOffset = (this.settings.verticalOffset / 100) * (drawH - H);
          drawY = (H - drawH) / 2 + vOffset;
          ctx.drawImage(img, drawX, drawY, drawW, drawH);

          // Gradiente cobrindo da esquerda para direita
          const grad = ctx.createLinearGradient(0, 0, W, 0);
          grad.addColorStop(0, '#060D17');
          grad.addColorStop(0.4, '#0A192F');
          grad.addColorStop(0.7, 'rgba(10, 25, 47, 0.7)');
          grad.addColorStop(1, 'rgba(10, 25, 47, 0.2)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
        } else if (spec.style === 'youtube' || spec.style === 'hero') {
          // Imagem na metade direita com sangria cinematográfica
          drawH = H;
          drawW = drawH * imgRatio;
          if (drawW < W * 0.65) {
            drawW = W * 0.65;
            drawH = drawW / imgRatio;
          }
          drawX = W - drawW + (W * 0.05);
          const vOffset = (this.settings.verticalOffset / 100) * (drawH - H);
          drawY = (H - drawH) / 2 + vOffset;
          ctx.drawImage(img, drawX, drawY, drawW, drawH);

          // Gradiente cinematográfico da esquerda para o centro
          const gradL = ctx.createLinearGradient(0, 0, W, 0);
          gradL.addColorStop(0, '#060D17');
          gradL.addColorStop(0.45, '#0A192F');
          gradL.addColorStop(0.75, 'rgba(10, 25, 47, 0.6)');
          gradL.addColorStop(1, 'rgba(10, 25, 47, 0.15)');
          ctx.fillStyle = gradL;
          ctx.fillRect(0, 0, W, H);

          // Vinheta suave inferior
          const gradB = ctx.createLinearGradient(0, H * 0.6, 0, H);
          gradB.addColorStop(0, 'transparent');
          gradB.addColorStop(1, 'rgba(6, 13, 23, 0.85)');
          ctx.fillStyle = gradB;
          ctx.fillRect(0, 0, W, H);
        } else {
          // Capa Quadrada (1000x1000 ou 512x512) ou LMS Card
          const scale = Math.max(W / img.width, H / img.height) * this.settings.zoom;
          drawW = img.width * scale;
          drawH = img.height * scale;
          drawX = (W - drawW) / 2;
          const vOffset = (this.settings.verticalOffset / 100) * (drawH - H);
          drawY = (H - drawH) / 2 + vOffset;
          ctx.drawImage(img, drawX, drawY, drawW, drawH);

          // Gradiente escuro de leitura inferior/lateral
          const grad = ctx.createLinearGradient(0, 0, 0, H);
          grad.addColorStop(0, 'rgba(6, 13, 23, 0.25)');
          grad.addColorStop(0.4, 'rgba(10, 25, 47, 0.45)');
          grad.addColorStop(0.75, 'rgba(6, 13, 23, 0.90)');
          grad.addColorStop(1, '#060D17');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
        }
        ctx.restore();
      } else {
        // Fallback estilizado se nenhuma foto for carregada ainda
        const defGrad = ctx.createLinearGradient(0, 0, W, H);
        defGrad.addColorStop(0, '#0A192F');
        defGrad.addColorStop(0.5, '#112240');
        defGrad.addColorStop(1, '#060D17');
        ctx.fillStyle = defGrad;
        ctx.fillRect(0, 0, W, H);
      }

      // 3. Camada de Escurecimento Global Configurável
      if (this.settings.overlayDarkness > 0) {
        ctx.fillStyle = `rgba(6, 13, 23, ${this.settings.overlayDarkness * 0.4})`;
        ctx.fillRect(0, 0, W, H);
      }

      // 4. Renderização Tipográfica e Elementos de Marca por Formato
      this.drawTypographyAndBrand(ctx, spec, W, H);

      return canvas;
    }

    /**
     * Renderiza tipografia, logos e selos de luxo Calm EdTech
     */
    drawTypographyAndBrand(ctx, spec, W, H) {
      ctx.save();

      if (spec.style === 'banner_thin') {
        // Banner Panorâmico Hotmart (940x120)
        const padX = 35;
        
        // Logo ou Badge no topo esquerdo
        if (this.logoImage && this.logoImage.complete && this.settings.showLogo) {
          const logoH = 28;
          const logoW = (this.logoImage.width / this.logoImage.height) * logoH;
          ctx.drawImage(this.logoImage, padX, 22, logoW, logoH);
        } else {
          this.drawBadgePill(ctx, 'AGORAEUFALO • CURSO', padX, 24, 18, '#F59E0B');
        }

        // Título Principal
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 8;
        const titleY = 78;
        ctx.fillText(this.truncate(this.settings.title, 42), padX, titleY);

        // Subtítulo / Promessa curta
        ctx.fillStyle = '#C68A36';
        ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
        ctx.shadowBlur = 4;
        ctx.fillText(this.truncate(this.settings.subtitle, 55), padX, 102);

        // Selo de Garantia / Checkout Seguro à direita
        this.drawBadgePill(ctx, '🔒 AMBIENTE 100% SEGURO', W - 200, 48, 24, '#10B981');
      } 
      else if (spec.style === 'youtube' || spec.style === 'hero') {
        // Widescreen 16:9 (1920x1080)
        const padX = 110;
        let curY = 160;

        // 1. Logo Oficial do AgoraEuFalo
        if (this.logoImage && this.logoImage.complete && this.settings.showLogo) {
          const logoH = 58;
          const logoW = (this.logoImage.width / this.logoImage.height) * logoH;
          ctx.drawImage(this.logoImage, padX, curY, logoW, logoH);
          curY += 105;
        } else {
          this.drawBadgePill(ctx, 'AGORAEUFALO • MASTERCLASS', padX, curY, 34, '#F59E0B');
          curY += 85;
        }

        // 2. Badge da Categoria / Formato
        if (this.settings.showBadge) {
          this.drawBadgePill(ctx, this.settings.badge || 'CURSO OFICIAL', padX, curY, 38, '#F59E0B');
          curY += 80;
        }

        // 3. Título Monumental
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 76px "Plus Jakarta Sans", sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 4;

        const maxTitleWidth = W * 0.58;
        const titleLines = this.getWrappedLines(ctx, this.settings.title, maxTitleWidth);
        titleLines.slice(0, 3).forEach(line => {
          ctx.fillText(line, padX, curY);
          curY += 88;
        });

        // 4. Subtítulo / Promessa de Transformação
        if (this.settings.subtitle) {
          curY += 15;
          ctx.fillStyle = '#F59E0B';
          ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
          ctx.shadowBlur = 8;
          const subLines = this.getWrappedLines(ctx, this.settings.subtitle, maxTitleWidth);
          subLines.slice(0, 2).forEach(line => {
            ctx.fillText(line, padX, curY);
            curY += 44;
          });
        }

        // 5. Rodapé: Assinatura do Professor Leo Leite
        ctx.fillStyle = '#94A3B8';
        ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
        ctx.shadowBlur = 4;
        ctx.fillText('PROFESSOR LEONARDO LEITE • 35+ ANOS DE SALA DE AULA', padX, H - 90);
      }
      else if (spec.style === 'player') {
        // Player Mobile Lockscreen (512x512)
        const padX = 36;
        let curY = 56;

        // Logo compacto no topo
        if (this.logoImage && this.logoImage.complete && this.settings.showLogo) {
          const logoH = 26;
          const logoW = (this.logoImage.width / this.logoImage.height) * logoH;
          ctx.drawImage(this.logoImage, padX, curY, logoW, logoH);
        } else {
          this.drawBadgePill(ctx, 'AEF PLAYER', padX, curY, 22, '#F59E0B');
        }

        // Informações no Terço Inferior
        const bottomY = H - 120;
        if (this.settings.showBadge) {
          this.drawBadgePill(ctx, this.settings.badge || 'TRAINING TRACK', padX, bottomY - 55, 24, '#10B981');
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 10;
        const titleLines = this.getWrappedLines(ctx, this.settings.title, W - 72);
        titleLines.slice(0, 2).forEach((line, idx) => {
          ctx.fillText(line, padX, bottomY + (idx * 32));
        });

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('LEONARDO LEITE • AGORAEUFALO', padX, H - 32);
      }
      else {
        // Capa Quadrada Hotmart (1000x1000) e LMS Card (800x450)
        const scale = W / 1000;
        const padX = 65 * scale;
        let curY = 85 * scale;

        // Logo Topo
        if (this.logoImage && this.logoImage.complete && this.settings.showLogo) {
          const logoH = 46 * scale;
          const logoW = (this.logoImage.width / this.logoImage.height) * logoH;
          ctx.drawImage(this.logoImage, padX, curY, logoW, logoH);
          curY += 75 * scale;
        } else {
          this.drawBadgePill(ctx, 'AGORAEUFALO', padX, curY, 30 * scale, '#F59E0B');
          curY += 60 * scale;
        }

        // Posicionamento no Terço Inferior
        const textStartY = (H * 0.58);
        let textY = textStartY;

        if (this.settings.showBadge) {
          this.drawBadgePill(ctx, this.settings.badge || 'CURSO OFICIAL', padX, textY, 34 * scale, '#F59E0B');
          textY += 58 * scale;
        }

        // Título de Alto Impacto
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(52 * scale)}px "Plus Jakarta Sans", sans-serif`;
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 14 * scale;

        const maxW = W - (padX * 2);
        const titleLines = this.getWrappedLines(ctx, this.settings.title, maxW);
        titleLines.slice(0, 3).forEach(line => {
          ctx.fillText(line, padX, textY);
          textY += 60 * scale;
        });

        // Subtítulo
        if (this.settings.subtitle && textY < H - (60 * scale)) {
          ctx.fillStyle = '#E2E8F0';
          ctx.font = `500 ${Math.round(22 * scale)}px "Plus Jakarta Sans", sans-serif`;
          ctx.shadowBlur = 6 * scale;
          const subLines = this.getWrappedLines(ctx, this.settings.subtitle, maxW);
          subLines.slice(0, 2).forEach(line => {
            ctx.fillText(line, padX, textY);
            textY += 30 * scale;
          });
        }

        // Rodapé de Autor
        ctx.fillStyle = '#C68A36';
        ctx.font = `bold ${Math.round(18 * scale)}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillText('PROFESSOR LEONARDO LEITE', padX, H - (38 * scale));
      }

      ctx.restore();
    }

    /**
     * Desenha uma pílula/badge arredondada com gradiente suave
     */
    drawBadgePill(ctx, text, x, y, height, colorHex) {
      ctx.save();
      ctx.font = `bold ${Math.round(height * 0.44)}px "Plus Jakarta Sans", sans-serif`;
      const textMetrics = ctx.measureText(text);
      const width = textMetrics.width + (height * 0.9);
      const radius = height / 2;

      // Fundo semi-transparente escuro
      ctx.fillStyle = 'rgba(10, 25, 47, 0.85)';
      ctx.beginPath();
      ctx.roundRect(x, y - (height * 0.75), width, height, radius);
      ctx.fill();

      // Borda colorida
      ctx.strokeStyle = colorHex || '#F59E0B';
      ctx.lineWidth = Math.max(1.5, height * 0.05);
      ctx.stroke();

      // Texto
      ctx.fillStyle = colorHex || '#F59E0B';
      ctx.fillText(text, x + (height * 0.45), y - (height * 0.1));
      ctx.restore();
    }

    /**
     * Quebra linhas de texto respeitando a largura máxima
     */
    getWrappedLines(ctx, text, maxWidth) {
      if (!text) return [];
      const words = text.split(' ');
      const lines = [];
      let currentLine = words[0] || '';

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    }

    truncate(str, maxLen) {
      if (!str) return '';
      return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
    }

    /**
     * Converte um canvas para Blob (JPEG de alta fidelidade)
     */
    async canvasToBlob(canvas, quality = 0.92) {
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
      });
    }

    /**
     * Renderiza e baixa um formato individual
     */
    async downloadSingleFormat(formatKey, slug = 'curso') {
      const spec = FORMATS_SPEC[formatKey];
      if (!spec) return;

      const canvas = this.renderFormat(formatKey);
      if (!canvas) return;

      const blob = await this.canvasToBlob(canvas, 0.95);
      if (!blob) return;

      const filename = `${slug}-${spec.filename}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }

    /**
     * Empacota e baixa o Kit Master Completo de 6 Formatos em um arquivo .ZIP
     */
    async downloadZipKit(slug = 'curso-aef') {
      if (!window.JSZip) {
        throw new Error('A biblioteca JSZip não foi carregada no navegador.');
      }

      const zip = new window.JSZip();
      const folder = zip.folder(`kit-criativos-${slug}`);

      for (const [key, spec] of Object.entries(FORMATS_SPEC)) {
        const canvas = this.renderFormat(key);
        if (canvas) {
          const blob = await this.canvasToBlob(canvas, 0.94);
          if (blob) {
            folder.file(`${slug}-${spec.filename}`, blob);
          }
        }
      }

      // Adicionar arquivo de guia de uso no ZIP
      const readmeText = `=====================================================
AGORAEUFALO • KIT MASTER DE IMAGENS & CRIATIVOS
Professor Leonardo Leite — 35+ Anos de Sala de Aula
Curso: ${this.settings.title}
=====================================================

ONDE APLICAR CADA ARQUIVO DO KIT:

1. ${slug}-hotmart-capa-1000x1000.jpg
   -> Hotmart: Cadastrar na Capa do Produto e Vitrine (Área do Produtor).

2. ${slug}-hotmart-checkout-banner-940x120.jpg
   -> Hotmart: Ferramentas > Aparência da Página de Pagamento (Checkout).

3. ${slug}-youtube-thumb-1920x1080.jpg
   -> YouTube: Miniatura do vídeo ou transmissão de Masterclass/Webinar.

4. ${slug}-player-mobile-512x512.jpg
   -> AgoraEuFalo: Capa 1:1 otimizada para a tela de bloqueio do iOS/Android (MediaSession API).

5. ${slug}-sales-page-hero-1920x1080.jpg
   -> Site/Páginas: Hero Banner no topo da Sales Page / Landing Page.

6. ${slug}-vitrine-curso-800x450.jpg
   -> Portal do Aluno: Card no catálogo de cursos matriculados.

Gerado automaticamente pelo Course Factory Studio do AgoraEuFalo.`;

      folder.file('COMO-USAR-CADA-IMAGEM.txt', readmeText);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kit-criativos-${slug}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }

    /**
     * Sincroniza o kit gerado diretamente com o registro do curso ativo
     */
    async linkKitToCurrentCourse(courseId) {
      // Renderiza as capas principais em DataURLs ou blobs para persistência
      const thumbCanvas = this.renderFormat('youtube_thumb');
      const playerCanvas = this.renderFormat('player_mobile');
      const coverCanvas = this.renderFormat('hotmart_cover');

      let thumbDataUrl = '';
      let playerDataUrl = '';
      try {
        if (thumbCanvas) thumbDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.85);
        if (playerCanvas) playerDataUrl = playerCanvas.toDataURL('image/jpeg', 0.88);
      } catch (e) {
        console.warn('[CreativeStudioEngine] toDataURL restrito:', e);
      }

      const updates = {};
      if (this.baseImageUrl) {
        updates.coverImageUrl = this.baseImageUrl;
        updates.artworkUrl = this.baseImageUrl;
      }
      if (playerDataUrl) updates.playerCoverDataUrl = playerDataUrl;
      if (thumbDataUrl) updates.thumbnailDataUrl = thumbDataUrl;

      if (window.aefCloudSync && typeof window.aefCloudSync.saveCourse === 'function') {
        const course = (window.ALL_COURSES && window.ALL_COURSES[courseId]) ? { ...window.ALL_COURSES[courseId], ...updates } : { id: courseId, ...updates };
        await window.aefCloudSync.saveCourse(course);
        return course;
      }
      return updates;
    }

    getFormats() {
      return FORMATS_SPEC;
    }
  }

  window.aefCreativeStudio = new AEFCreativeStudioEngine();

})(window);
