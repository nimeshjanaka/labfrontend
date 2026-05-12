/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:      '#1B4F9B',
          navydark:  '#0F3270',
          navylight: '#2860B8',
          red:       '#E53935',
          redlight:  '#EF5350',
          reddark:   '#C62828',
          sky:       '#4FC3F7',
          skylight:  '#B3E5FC',
        },
      },
      fontFamily: {
        heading: ['"DM Serif Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card:  '0 2px 16px 0 rgba(27,79,155,0.10)',
        panel: '0 4px 32px 0 rgba(27,79,155,0.13)',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        scaleIn: { from: { transform: 'scale(0.95)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
      },
      animation: {
        fadeIn:  'fadeIn 0.4s ease both',
        slideIn: 'slideIn 0.35s ease both',
        scaleIn: 'scaleIn 0.3s ease both',
      },
    },
  },
  plugins: [],
}