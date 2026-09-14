/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        factory: {
          bg: '#080D1A',
          sidebar: '#0D1527',
          panel: '#111C33',
          border: '#1E3056'
        }
      }
    },
  },
  plugins: [],
}
