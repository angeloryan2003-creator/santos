import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        azul: '#082944',
        amarelo: '#FCB502',
        cinza: '#949698',
        texto: '#333333',
        fundo: '#F5F5F5',
      },
      fontFamily: {
        titulo: ['var(--fonte-titulo)', 'system-ui', 'sans-serif'],
        corpo: ['var(--fonte-corpo)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
