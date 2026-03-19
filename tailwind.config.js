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
          50:  '#e8edf4',
          100: '#c5d1e3',
          200: '#9fb3d0',
          300: '#7994bd',
          400: '#5c7daf',
          500: '#3f66a1',
          600: '#335a95',
          700: '#264b84',
          800: '#1e3a5f',
          900: '#132440',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
