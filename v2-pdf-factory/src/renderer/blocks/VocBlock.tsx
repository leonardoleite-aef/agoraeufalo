import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { VocBlockSchema } from '../../schemas/pdfSchema';
import { z } from 'zod';
import { AEF_PALETTES, ThemeId } from '../palettes';
import { ActivityExplanation } from '../components/ActivityExplanation';
import { CANONICAL_EXPLANATIONS } from '../constants/canonicalExplanations';

type VocBlockData = z.infer<typeof VocBlockSchema>;

interface Props {
  block: VocBlockData;
  themeId: ThemeId;
}

export function VocBlock({ block, themeId }: Props) {
  const palette = AEF_PALETTES[themeId] || AEF_PALETTES.slate;

  // --- HEURÍSTICA DE ESCALONAMENTO (O MOTOR RESPONSIVO) ---
  const itemCount = block.items?.length || 0;
  
  // Se tem algum item com nota gramatical muito longa, forçamos 1 coluna para não espremer a leitura
  const hasLongNotes = block.items?.some(i => (i.grammarNote?.length || 0) > 80);
  
  // Decisão Matemática:
  // Usa 2 colunas se tivermos 6 ou mais itens, DESDE QUE não haja textos gigantescos.
  const useTwoColumns = itemCount >= 6 && !hasLongNotes;
  
  // Ajuste da fonte baseado na densidade
  const targetFontSize = itemCount <= 4 ? 15 : (useTwoColumns ? 12 : 14);
  const translationFontSize = itemCount <= 4 ? 13 : (useTwoColumns ? 11 : 12);

  const styles = StyleSheet.create({
    container: {
      marginBottom: 0,
      padding: 20,
      backgroundColor: palette.primaryLight,
      borderLeftWidth: 6,
      borderLeftColor: palette.primary,
      borderRadius: 4,
    },
    badge: {
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: '700',
      fontSize: 12,
      color: palette.badgeText,
      backgroundColor: palette.badgeBg,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
      alignSelf: 'flex-start',
      marginBottom: 16,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: palette.border,
      padding: 12,
      marginBottom: 12,
      borderRadius: 6,
      width: useTwoColumns ? '48.5%' : '100%',
    },
    cardTarget: {
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: '700',
      fontSize: targetFontSize,
      color: palette.primaryDark,
      marginBottom: 4,
      paddingLeft: 2, // Previne corte lateral de fontes bold
    },
    cardTranslation: {
      fontFamily: 'Plus Jakarta Sans',
      fontSize: translationFontSize,
      color: '#475569',
      marginBottom: 4,
      paddingLeft: 2,
    },
    cardNoteBox: {
      marginTop: 8,
      paddingTop: 8,
      paddingLeft: 2,
      borderTopWidth: 1,
      borderTopColor: '#F1F5F9',
    },
    cardNoteText: {
      fontFamily: 'Plus Jakarta Sans',
      fontSize: translationFontSize - 1,
      color: '#475569', // Texto mais escuro para notas importantes
      lineHeight: 1.5,
    },
    fullTranslationBox: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 6,
      padding: 16,
      marginBottom: 16,
    },
    fullTranslationTitle: {
      fontFamily: 'Playfair Display',
      fontWeight: '700',
      fontSize: 16,
      color: palette.primaryDark,
      marginBottom: 8,
    },
    fullTranslationText: {
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 14,
      lineHeight: 1.6,
      color: '#334155',
      marginBottom: 8,
    }
  });

  return (
    <View style={styles.container}>
      <View wrap={false}>
        <Text style={styles.badge}>2. Vocabulary Session (VOC)</Text>
      </View>

      {block.storyTranslation && block.storyTranslation.length > 0 && (
        <View style={styles.fullTranslationBox}>
          <Text style={styles.fullTranslationTitle}>História Completa (Tradução)</Text>
          {block.storyTranslation.map((p, idx) => (
            <Text key={idx} style={styles.fullTranslationText}>{p}</Text>
          ))}
        </View>
      )}

      <View style={styles.gridContainer}>
        {block.items && block.items.map((item, idx) => (
          <View key={idx} style={styles.card} wrap={false}>
            <Text style={styles.cardTarget}>{item.target}</Text>
            
            {item.spokenTranslation && (
              <Text style={styles.cardTranslation}>{item.spokenTranslation}</Text>
            )}
            
            {item.grammarNote && (
              <View style={styles.cardNoteBox}>
                <Text style={styles.cardNoteText}>💡 {item.grammarNote}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
