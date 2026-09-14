import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { AEF_PALETTES, ThemeId } from '../palettes';

export const ProBlock = ({ block, themeId }: { block: any; themeId: string }) => {
  const palette = AEF_PALETTES[themeId as ThemeId] || AEF_PALETTES.amber;

  const styles = StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    badge: {
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: '700',
      fontSize: 14,
      color: palette.primaryDark,
      backgroundColor: palette.primaryLight,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 4,
      alignSelf: 'flex-start',
      marginBottom: 16,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    sentenceText: {
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 14,
      lineHeight: 1.5,
      color: '#1E293B',
      marginBottom: 16, // Espaçamento generoso entre cada frase
    },
    goldenTipBox: {
      backgroundColor: '#FEF3C7',
      borderWidth: 1,
      borderColor: '#F59E0B',
      padding: 12,
      borderRadius: 4,
      marginTop: 16,
    },
    goldenTipTitle: {
      fontFamily: 'Playfair Display',
      fontWeight: '700',
      fontSize: 14,
      color: '#B45309',
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    goldenTipText: {
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 12,
      color: '#78350F',
      lineHeight: 1.4,
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.badge}>6. Pronunciation & Connected Speech (PRO)</Text>

      {block.fullTextWithLinking && block.fullTextWithLinking.map((sentence: string, idx: number) => (
        <Text key={idx} style={styles.sentenceText}>{sentence}</Text>
      ))}

      {block.goldenTip && (
        <View style={styles.goldenTipBox} wrap={false}>
          <Text style={styles.goldenTipTitle}>SACADA DE OURO DO LEO</Text>
          <Text style={styles.goldenTipText}>{block.goldenTip}</Text>
        </View>
      )}
    </View>
  );
};
