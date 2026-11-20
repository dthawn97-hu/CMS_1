import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    fontFamily: { sans: ['"Manrope Variable"', 'Manrope', 'sans-serif'], serif: ['"Manrope Variable"', 'Manrope', 'sans-serif'] },
    colors: { mist: { 50: '#fbfcfe', 100: '#f6f8fd', 200: '#eef2fa' }, navy: { 900: '#14213d', 800: '#1d2f52', 700: '#2a4270' }, ink: '#14213d', brand: { DEFAULT: '#2bb3c6', dark: '#0f7c8c' }, page: '#f6f9fb' } // from the Bellhop logo: deep navy bell + teal dots
  } },
  plugins: [forms, typography]
};
