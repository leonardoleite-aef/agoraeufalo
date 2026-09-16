import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { IntroBlockSchema } from '../../schemas/pdfSchema';
import { z } from 'zod';
import { AEF_PALETTES, ThemeId } from '../palettes';

type IntroBlockData = z.infer<typeof IntroBlockSchema>;

interface Props {
  block: IntroBlockData;
  themeId: ThemeId;
}

export function IntroBlock({ block, themeId }: Props) {
  const palette = AEF_PALETTES[themeId] || AEF_PALETTES.slate;

  const styles = StyleSheet.create({
    container: {
      marginBottom: 0,
      padding: 20,
      backgroundColor: '#F8FAFC',
      borderTopWidth: 4,
      borderTopColor: palette.primary,
      borderRadius: 6,
    },
    title: {
      fontFamily: 'Playfair Display',
      fontWeight: '700',
      fontSize: 18,
      color: palette.primaryDark,
      marginBottom: 8,
    },
    focusBox: {
      backgroundColor: '#FFFFFF',
      borderLeftWidth: 4,
      borderLeftColor: palette.primary,
      borderRadius: 4,
      padding: 10,
      marginBottom: 14,
    },
    focusLabel: {
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: '700',
      fontSize: 9,
      color: palette.primary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 3,
    },
    focusText: {
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 11,
      lineHeight: 1.5,
      color: '#334155',
    },
    grid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    column: {
      width: '48.5%',
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 6,
      padding: 10,
      marginBottom: 10,
    },
    sectionTitle: {
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: '700',
      fontSize: 10,
      color: '#0F172A',
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    bulletRow: {
      flexDirection: 'row',
      marginBottom: 4,
      alignItems: 'flex-start',
    },
    bulletPoint: {
      width: 10,
      fontSize: 11,
      color: palette.primary,
      marginTop: -1,
    },
    bulletText: {
      flex: 1,
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 10,
      lineHeight: 1.4,
      color: '#475569',
    }
  });

  const renderList = (title: string, items: string[]) => {
    if (!items || items.length === 0) return null;
    return (
      <View style={styles.card} wrap={false}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {items.map((item, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container} wrap={false}>
      <View wrap={false}>
        <Text style={styles.title}>{block.documentTitle || 'Lesson Overview'}</Text>
        
        {block.focus && (
          <View style={styles.focusBox}>
            <Text style={styles.focusLabel}>Objetivo & Sentimento da Lição</Text>
            <Text style={styles.focusText}>{block.focus}</Text>
          </View>
        )}
      </View>

      <View style={styles.grid}>
        <View style={styles.column}>
          {renderList('Key Chunks', block.keyChunks)}
          {renderList('Grammar Points', block.grammarPoints)}
        </View>
        <View style={styles.column}>
          {renderList('Recommendations', block.recommendations)}
          {renderList('Roadblocks', block.roadblocks)}
        </View>
      </View>
    </View>
  );
}
