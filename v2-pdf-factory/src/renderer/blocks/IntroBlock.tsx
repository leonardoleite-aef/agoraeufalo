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
      padding: 24,
      backgroundColor: '#F8FAFC', // Cinza muito sutil para diferenciar do miolo
      borderTopWidth: 4,
      borderTopColor: palette.primary,
      borderRadius: 4,
    },
    title: {
      fontFamily: 'Playfair Display',
      fontWeight: '700',
      fontSize: 18,
      color: palette.primaryDark,
      marginBottom: 12,
    },
    focusText: {
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 14,
      lineHeight: 1.6,
      color: '#334155',
      marginBottom: 16,
    },
    sectionTitle: {
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: '700',
      fontSize: 12,
      color: '#0F172A',
      marginTop: 12,
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    bulletRow: {
      flexDirection: 'row',
      marginBottom: 4,
      paddingLeft: 8,
    },
    bulletPoint: {
      width: 10,
      fontSize: 14,
      color: palette.primary,
    },
    bulletText: {
      flex: 1,
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 13,
      lineHeight: 1.5,
      color: '#475569',
    }
  });

  const renderList = (title: string, items: string[]) => {
    if (!items || items.length === 0) return null;
    return (
      <View style={{ marginBottom: 8 }}>
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
    <View style={styles.container}>
      <View wrap={false}>
        <Text style={styles.title}>{block.documentTitle || 'Lesson Overview'}</Text>
        
        {block.focus && (
          <Text style={styles.focusText}>{block.focus}</Text>
        )}
      </View>
      {renderList('Key Chunks', block.keyChunks)}
      {renderList('Grammar Points', block.grammarPoints)}
      {renderList('Recommendations', block.recommendations)}
      {renderList('Roadblocks', block.roadblocks)}
    </View>
  );
}
