import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { AEF_PALETTES, ThemeId } from '../palettes';
import { CANONICAL_EXPLANATIONS } from '../constants/canonicalExplanations';
import { ActivityExplanation } from '../components/ActivityExplanation';

export const LABlock = ({ block, themeId }: { block: any; themeId: string }) => {
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
    drillRow: {
      marginBottom: 16,
    },
    questionRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    questionNumber: {
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: '700',
      fontSize: 12,
      color: palette.primaryDark,
      marginRight: 6,
      width: 18,
    },
    questionText: {
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 12,
      color: '#1E293B',
      flex: 1,
      lineHeight: 1.4,
    },
    writingLine: {
      borderBottomWidth: 1,
      borderBottomColor: '#CBD5E1',
      borderBottomStyle: 'dashed',
      marginLeft: 24, // Alinha com o texto da pergunta
      marginTop: 18,  // Dá espaço apenas para 1 linha enxuta
    }
  });

  return (
    <View style={styles.container}>
      <View wrap={false}>
        <Text style={styles.badge}>3. Listen & Answer (LA)</Text>
      </View>

      {block.drills.map((drill: any, idx: number) => {
        // Pega apenas a primeira variação da pergunta para manter limpo
        const mainQuestion = drill.questionVariations?.[0] || 'Question missing?';

        return (
          <View key={idx} style={styles.drillRow} wrap={false}>
            <View style={styles.questionRow}>
              <Text style={styles.questionNumber}>{idx + 1}.</Text>
              <Text style={styles.questionText}>{mainQuestion}</Text>
            </View>
            <View style={styles.writingLine} />
          </View>
        );
      })}
    </View>
  );
};
