/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#050a15',
        map: '#0f172a',
        borderGlow: '#1de9b6',
        food: '#d4a574',
        hero: '#00e5ff',
      },
    },
  },
  plugins: [],
}