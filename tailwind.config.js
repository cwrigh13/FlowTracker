/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'library-teal': '#007582',
        'library-teal-dark': '#005f69',
        'library-light': '#00A5A5',
        'library-bg': '#E2F2F2',
        'library-accent': '#C8E6E6',
        'library-suggestion': '#5DBFC0',
        'library-maintenance': '#9AD3D4'
      },
      fontFamily: {
        'work-sans': ['Work Sans', 'Arial', 'sans-serif'],
        'arial': ['Arial', 'Work Sans', 'sans-serif'],
        'sans': ['Work Sans', 'Arial', 'sans-serif'], // Override default sans
      },
    },
  },
  plugins: [],
}
