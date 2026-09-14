import React from 'react';
import { Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { AEF_PALETTES, ThemeId } from '../palettes';

export const QRCodeBlock = ({ block, themeId }: { block: any; themeId: string }) => {
  const palette = AEF_PALETTES[themeId as ThemeId] || AEF_PALETTES.amber;

  // Usa uma API externa confiável para gerar o QR Code. 
  // O React-PDF gerencia o fetch de imagens remote internamente de forma assíncrona e segura.
  const qrUrl = block.url ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(block.url)}` : '';

  const styles = StyleSheet.create({
    container: {
      marginTop: 40,
      marginBottom: 24,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: '#FFFFFF',
      borderWidth: 2,
      borderColor: palette.primary,
      borderRadius: 8,
    },
    qrCodeImage: {
      width: 120,
      height: 120,
      marginBottom: 16,
    },
    instruction: {
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 12,
      fontWeight: '700',
      color: '#1E293B',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 1,
    }
  });

  return (
    <View style={styles.container} wrap={false}>
      {qrUrl ? (
        <Image src={qrUrl} style={styles.qrCodeImage} />
      ) : (
        <View style={[styles.qrCodeImage, { backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: 10, color: '#94A3B8' }}>Sem URL</Text>
        </View>
      )}
      <Text style={styles.instruction}>{block.instruction || 'Escaneie para acessar o conteúdo'}</Text>
    </View>
  );
};
