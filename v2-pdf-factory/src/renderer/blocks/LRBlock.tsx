import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { LRBlockSchema } from '../../schemas/pdfSchema';
import { z } from 'zod';
import { AEF_PALETTES, ThemeId } from '../palettes';
import { ActivityExplanation } from '../components/ActivityExplanation';
import { CANONICAL_EXPLANATIONS } from '../constants/canonicalExplanations';

type LRBlockData = z.infer<typeof LRBlockSchema>;

interface Props {
  block: LRBlockData;
  themeId: ThemeId;
}

export function LRBlock({ block, themeId }: Props) {
  const palette = AEF_PALETTES[themeId] || AEF_PALETTES.slate;

  const styles = StyleSheet.create({
    container: {
      marginBottom: 0,
      padding: 24,
      backgroundColor: palette.primaryLight,
      borderLeftWidth: 6,
      borderLeftColor: palette.primary,
      borderRadius: 4,
    },
    badge: {
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: '700',
      fontSize: 12, // Tamanho maior
      color: palette.badgeText,
      backgroundColor: palette.badgeBg,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
      alignSelf: 'flex-start',
      marginBottom: 16,
      textTransform: 'uppercase',
      letterSpacing: 1, // Espaçamento entre letras para luxo
    },
    paragraph: {
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 15, // Tamanho confortável para público 40+
      lineHeight: 1.7, // Relaxado
      color: '#0F172A', // Texto profundo
      marginBottom: 14,
    }
  });

  return (
    <View style={styles.container}>
      <View wrap={false}>
        <Text style={styles.badge}>1. Listen & Read (LR)</Text>
      </View>
      

      {block.paragraphs.map((text, idx) => (
        <Text key={idx} style={styles.paragraph}>
          {text}
        </Text>
      ))}
    </View>
  );
}
