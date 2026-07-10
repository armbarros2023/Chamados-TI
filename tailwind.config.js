/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './*.{ts,tsx}', './components/**/*.{ts,tsx}', './pages/**/*.{ts,tsx}', './context/**/*.{ts,tsx}'],
  theme: {extend: {fontFamily: {sans: ['Aptos', 'Segoe UI', 'system-ui', 'sans-serif']}}},
  plugins: [],
};
