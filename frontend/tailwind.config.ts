import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,css,md,mdx,html,json,scss}',
  ],
  darkMode: 'class', // or 'media'
  theme: {
    extend: {
      colors: {
        'bg-dark': 'oklch(0.1 0.03 310)',
        'bg': 'oklch(0.15 0.03 310)',
        'bg-light': 'oklch(0.2 0.03 310)',
        'text': 'oklch(0.96 0.06 310)',
        'text-muted': 'oklch(0.76 0.06 310)',
        'highlight': 'oklch(0.5 0.06 310)',
        'border': 'oklch(0.4 0.06 310)',
        'border-muted': 'oklch(0.3 0.06 310)',
        'primary': 'oklch(0.76 0.1 310)',
        'secondary': 'oklch(0.76 0.1 130)',
        'danger': 'oklch(0.7 0.06 30)',
        'warning': 'oklch(0.7 0.06 100)',
        'success': 'oklch(0.7 0.06 160)',
        'info': 'oklch(0.7 0.06 260)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;