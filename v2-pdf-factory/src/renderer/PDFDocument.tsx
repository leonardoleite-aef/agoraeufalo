import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { PDFDocumentPayload, PedagogicalBlock } from '../schemas/pdfSchema';
import { LRBlock } from './blocks/LRBlock';
import { IntroBlock } from './blocks/IntroBlock';
import { VocBlock } from './blocks/VocBlock';
import { LABlock } from './blocks/LABlock';
import { LRTBlock } from './blocks/LRTBlock';
import { LASKBlock } from './blocks/LASKBlock';
import { ProBlock } from './blocks/ProBlock';
import { QRCodeBlock } from './blocks/QRCodeBlock';
import { AEF_PALETTES, ThemeId } from './palettes';

// Registro estrito das fontes Calm EdTech locais
import PlusJakartaSansRegular from '../fonts/PlusJakartaSans-Regular.ttf';
import PlusJakartaSansBold from '../fonts/PlusJakartaSans-Bold.ttf';
import PlayfairDisplayRegular from '../fonts/PlayfairDisplay-Regular.ttf';
import PlayfairDisplayBold from '../fonts/PlayfairDisplay-Bold.ttf';

Font.register({
  family: 'Plus Jakarta Sans',
  fonts: [
    { src: PlusJakartaSansRegular, fontWeight: '400' },
    { src: PlusJakartaSansBold, fontWeight: '700' }
  ]
});

Font.register({
  family: 'Playfair Display',
  fonts: [
    { src: PlayfairDisplayRegular, fontWeight: '400' },
    { src: PlayfairDisplayBold, fontWeight: '700' }
  ]
});

// Desabilita hifenização globalmente para evitar quebras estranhas (ex: NEIGH-BOR)
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FAFAFA',
    paddingTop: 42,
    paddingBottom: 42,
    paddingHorizontal: 45,
  },
  globalHeader: {
    position: 'absolute',
    top: 20,
    left: 45,
    right: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
  },
  headerLogo: {
    fontFamily: 'Playfair Display',
    fontWeight: '700',
    fontSize: 10,
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerCourse: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 9,
    color: '#64748B',
  },
  globalFooter: {
    position: 'absolute',
    bottom: 20,
    left: 45,
    right: 45,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
  },
  pageNumber: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 9,
    color: '#94A3B8',
  },
  pageMargin: {
    width: '100%',
  },
  header: {
    fontFamily: 'Playfair Display',
    fontSize: 24,
    marginBottom: 20,
    color: '#0F172A',
    fontWeight: '700',
  },
  text: {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 12,
    color: '#475569',
  }
});

interface PDFDocumentProps {
  data: PDFDocumentPayload | null;
}

const renderBlock = (block: PedagogicalBlock, themeId: string, index: number) => {
  switch (block.type) {
    case 'INTRO':
      return <IntroBlock key={index} block={block} themeId={themeId} />;
    case 'LR':
      return <LRBlock key={index} block={block} themeId={themeId} />;
    case 'VOC':
      return <VocBlock key={index} block={block} themeId={themeId} />;
    case 'LA':
      return <LABlock key={index} block={block} themeId={themeId} />;
    case 'LRT':
      return <LRTBlock key={index} block={block} themeId={themeId} />;
    case 'LASK':
      return <LASKBlock key={index} block={block} themeId={themeId} />;
    case 'PRO':
      return <ProBlock key={index} block={block} themeId={themeId} />;
    case 'QR_CODE':
      return <QRCodeBlock key={index} block={block} themeId={themeId} />;
    default:
      return (
        <View key={index} style={{ padding: 10, backgroundColor: '#FEE2E2', marginBottom: 10 }}>
          <Text style={{ color: '#991B1B' }}>Bloco não implementado ou erro de tipo: {block.type}</Text>
        </View>
      );
  }
};

export function AEFDocument({ data }: PDFDocumentProps) {
  if (!data) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.header}>Aguardando Dados Válidos...</Text>
          <Text style={styles.text}>Preencha o JSON no editor para visualizar o PDF.</Text>
        </Page>
      </Document>
    );
  }

  const themeId = data.theme.themeId;
  const palette = AEF_PALETTES[themeId as ThemeId] || AEF_PALETTES.amber;

  return (
    <Document>
      {/* CAPA INSTITUCIONAL (Sempre a primeira página) */}
      <Page size="A4" style={[styles.page, { backgroundColor: '#0A192F', justifyContent: 'center', alignItems: 'center', padding: 60 }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <Text style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: '700', color: palette.primary, fontSize: 14, letterSpacing: 2, marginBottom: 24, textTransform: 'uppercase' }}>
            {data.brandHeader || 'AGORAEUFALO ACADEMY'}
          </Text>
          
          <Text style={{ fontFamily: 'Playfair Display', fontWeight: '700', color: '#FFFFFF', fontSize: 42, textAlign: 'center', lineHeight: 1.2, marginBottom: 32 }}>
            {data.documentTitle}
          </Text>

          <View style={{ width: 60, height: 4, backgroundColor: palette.primary, marginBottom: 32 }} />

          <Text style={{ fontFamily: 'Plus Jakarta Sans', color: '#94A3B8', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
            {data.seriesHeader || 'MAGIC STORIES'}
          </Text>
        </View>
      </Page>

      {/* BLOCOS PEDAGÓGICOS */}
      {data.blocks.map((block, index) => (
        <Page key={index} size="A4" style={styles.page}>
          
          {/* Global Header (dinâmico e customizável) */}
          <View style={styles.globalHeader} fixed>
            <Text style={styles.headerCourse}>{data.brandHeader || 'AGORAEUFALO'}</Text>
            <Text style={styles.headerLogo}>{data.seriesHeader || data.documentTitle || ''}</Text>
          </View>

          {/* Global Footer (fixed) com número de página dinâmico */}
          <View style={styles.globalFooter} fixed>
            <Text 
              style={styles.pageNumber} 
              render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} 
            />
          </View>

          <View style={styles.pageMargin}>
            {renderBlock(block, themeId, index)}
          </View>

        </Page>
      ))}
    </Document>
  );
}
