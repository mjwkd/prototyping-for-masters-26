import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dial: {
          outerRing: '#F2F2F2',
          innerDisc: '#FFFFFF',
          fanFill: '#FFD9F0',
          fanStroke: '#FFB0DE',
          outerPink: '#D12A8C',
          outerFan: '#3A3A3A',
          innerNorm: '#3A3A3A',
          innerFan: '#C81E83',
          hand: '#FF5FBF',
        },
        surface: '#F2F2F0',
        muted: '#6B6B6B',
        dark: '#1A1A1A',
        pinkAccent: '#FF5FBF',
      },
      fontFamily: {
        sans: ['"IBM Plex Mono"', 'monospace'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
