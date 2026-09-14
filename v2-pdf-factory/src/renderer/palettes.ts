// Dicionário Oficial de Paletas do AgoraEuFalo (Calm EdTech)
// Extraído do legado para garantir fidelidade 100% na V2

export type ThemeId = 'amber' | 'cobalt' | 'emerald' | 'ruby' | 'indigo' | 'slate';

export interface AEFPalette {
  id: ThemeId;
  name: string;
  primary: string;       // Uso: Títulos principais, ícones de destaque
  primaryDark: string;   // Uso: Textos fortes, contraste alto
  primaryLight: string;  // Uso: Fundo de blocos de destaque (Listen & Read, Chunks)
  border: string;        // Uso: Bordas de caixas (Vocabulary, LA)
  badgeBg: string;       // Uso: Fundo de tags/pílulas
  badgeText: string;     // Uso: Texto de tags/pílulas
}

export const AEF_PALETTES: Record<ThemeId, AEFPalette> = {
  amber: {
    id: 'amber',
    name: 'Âmbar Real (Ouro Master)',
    primary: '#C68A36',
    primaryDark: '#B45309',
    primaryLight: '#FFFBEB', // amber-50
    border: '#FDE68A',       // amber-200
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
  },
  cobalt: {
    id: 'cobalt',
    name: 'Azul Cobalto (Fundamentos)',
    primary: '#1A56DB',
    primaryDark: '#1E40AF',
    primaryLight: '#EFF6FF',
    border: '#BFDBFE',
    badgeBg: '#DBEAFE',
    badgeText: '#1E40AF',
  },
  emerald: {
    id: 'emerald',
    name: 'Verde Esmeralda (Vocabulário)',
    primary: '#047857',
    primaryDark: '#065F46',
    primaryLight: '#ECFDF5',
    border: '#A7F3D0',
    badgeBg: '#D1FAE5',
    badgeText: '#065F46',
  },
  ruby: {
    id: 'ruby',
    name: 'Rubi Quente (Speaking)',
    primary: '#E11D48',
    primaryDark: '#BE123C',
    primaryLight: '#FFF1F2',
    border: '#FECDD3',
    badgeBg: '#FFE4E6',
    badgeText: '#9F1239',
  },
  indigo: {
    id: 'indigo',
    name: 'Índigo Violeta (Questions)',
    primary: '#6366F1',
    primaryDark: '#4338CA',
    primaryLight: '#EEF2FF',
    border: '#C7D2FE',
    badgeBg: '#E0E7FF',
    badgeText: '#3730A3',
  },
  slate: {
    id: 'slate',
    name: 'Deep Slate (Executivo)',
    primary: '#1E293B',
    primaryDark: '#0F172A',
    primaryLight: '#F8FAFC',
    border: '#E2E8F0',
    badgeBg: '#F1F5F9',
    badgeText: '#1E293B',
  }
};

// Cores Globais Institucionais Indestrutíveis
export const GLOBAL_COLORS = {
  deepNavyBg: '#0A192F', // O Fundo padrão de toda Capa
  deepNavyText: '#0F172A', // Texto principal do corpo
  slateMuted: '#475569', // Texto de apoio
  pureWhite: '#FFFFFF', // Fundo das páginas do miolo
  pdfWatermark: '#F1F5F9', // Cor para linhas de LA e espaços pautados
};
