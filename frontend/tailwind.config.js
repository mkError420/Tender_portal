/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f2a4a',
          light: '#1a3a5c',
          dark: '#0a1d33',
        },
        accent: {
          DEFAULT: '#008080',
          light: '#00a0a0',
          dark: '#006666',
        },
        gold: {
          DEFAULT: '#d4af37',
          light: '#e5c158',
          dark: '#b8952f',
        }
      }
    },
  },
  plugins: [],
}
