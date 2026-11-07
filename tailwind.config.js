/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8F9FA',
        surface: '#FFFFFF',
        'surface-variant': '#E9ECEF',
        'on-surface': '#1A1C1E',
        'on-surface-variant': '#44474E',
        primary: {
          DEFAULT: '#0284c7',
          dark: '#0369a1',
          light: '#e0f2fe',
          container: '#C2E8FF',
          'on-container': '#001E2C',
        },
        secondary: {
          DEFAULT: '#4E616D',
          fixed: '#D1E5F4',
          'on-fixed': '#0A1E28',
        },
        tertiary: {
          DEFAULT: '#605A7D',
        },
        error: {
          DEFAULT: '#BA1A1A',
          container: '#FFDAD6',
        },
        zone: {
          green: '#2E7D32',
          yellow: '#ED6C02',
          red: '#D32F2F',
        }
      },
      spacing: {
        gutter: '1rem',
        '18': '4.5rem',
        '28': '7rem',
      },
      fontSize: {
        'body-md': ['0.938rem', { lineHeight: '1.4' }],
      }
    },
  },
  plugins: [],
}
