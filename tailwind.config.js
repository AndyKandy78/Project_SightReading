/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        piano: {
          white: '#f9fafb',
          black: '#111827',
          correct: '#22c55e',
          wrong: '#ef4444',
          next: '#3b82f6',
        }
      },
      fontFamily: {
        music: ['Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
