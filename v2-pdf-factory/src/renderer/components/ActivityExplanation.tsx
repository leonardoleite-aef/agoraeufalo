import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { AEF_PALETTES, ThemeId } from '../palettes';

interface Props {
  text: string;
  themeId: ThemeId;
}

export function ActivityExplanation({ text, themeId }: Props) {
  const palette = AEF_PALETTES[themeId] || AEF_PALETTES.slate;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#FFFFFF', // Fundo branco para destacar do bloco colorido principal
      borderLeftWidth: 2,
      borderLeftColor: palette.primaryDark,
      padding: 12,
      marginBottom: 16,
      borderRadius: 4,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    iconText: {
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 10,
      fontWeight: '700',
      color: palette.primaryDark,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    bodyText: {
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 11,
      lineHeight: 1.5,
      color: '#475569', // Texto de apoio sutil (Slate Muted)
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.iconText}>💡 Propósito desta atividade</Text>
      </View>
      <Text style={styles.bodyText}>"{text}"</Text>
    </View>
  );
}
