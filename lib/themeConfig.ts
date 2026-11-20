export type ThemeId = 'A' | 'B' | 'C';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  label: string;
  bgColor: string;
  cardBg: string;
  cardBorder: string;
  inkPrimary: string;
  inkStrand2: string;
  inkStrand3: string;
  inkFaint: string;
  accent: string;
  needleColor: string;
  tagBg: string;
}

export const THEME_PRESETS: Record<ThemeId, ThemeConfig> = {
  A: {
    id: 'A',
    name: 'off-white',
    label: 'A: Ink on Linen',
    bgColor: '#faf7f2',
    cardBg: '#f3efe6',
    cardBorder: '#e3ded3',
    inkPrimary: '#1c1917',
    inkStrand2: '#383430',
    inkStrand3: '#4d4842',
    inkFaint: 'rgba(28, 25, 23, 0.22)',
    accent: '#b03b5b',
    needleColor: '#8c8275',
    tagBg: '#eae4d8',
  },
  B: {
    id: 'B',
    name: 'midnight-black',
    label: 'B: Monoline on Night',
    bgColor: '#090807',
    cardBg: '#141312',
    cardBorder: '#272522',
    inkPrimary: '#f5f3ef',
    inkStrand2: '#d8d4cd',
    inkStrand3: '#b5b0a7',
    inkFaint: 'rgba(245, 243, 239, 0.22)',
    accent: '#f2a7bb',
    needleColor: '#d4cebe',
    tagBg: '#211f1c',
  },
  C: {
    id: 'C',
    name: 'acid-green',
    label: 'C: Acid Yellow-Green',
    bgColor: '#D9F27A',
    cardBg: '#cbdf70',
    cardBorder: '#b3c754',
    inkPrimary: '#0f0f0f',
    inkStrand2: '#222222',
    inkStrand3: '#363636',
    inkFaint: 'rgba(15, 15, 15, 0.25)',
    accent: '#0f0f0f',
    needleColor: '#444444',
    tagBg: '#bed261',
  },
};

export const DEFAULT_THEME_ID: ThemeId = 'A';
