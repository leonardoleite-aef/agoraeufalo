import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { AEF_PALETTES, ThemeId } from '../palettes';
import { CANONICAL_EXPLANATIONS } from '../constants/canonicalExplanations';
import { ActivityExplanation } from '../components/ActivityExplanation';

export const LRTBlock = ({ block, themeId }: { block: any; themeId: string }) => {
  const palette = AEF_PALETTES[themeId as ThemeId] || AEF_PALETTES.amber;

  const styles = StyleSheet.create({
    container: {
      marginBottom: 0,
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
      marginBottom: 12,
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
  });

  return (
    <View style={styles.container}>
      <View wrap={false}>
        <Text style={styles.badge}>4. Look & Retell (LRT)</Text>
      </View>

      {block.guideQuestions && block.guideQuestions.map((question: string, idx: number) => (
        <View key={idx} style={styles.drillRow} wrap={false}>
          <View style={styles.questionRow}>
            <Text style={styles.questionNumber}>{idx + 1}.</Text>
            <Text style={styles.questionText}>{question}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};
