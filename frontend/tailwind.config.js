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
          dark: '#050E3C',
          blue: '#002455',
        },
        alert: {
          red: '#DC0000',
          lightRed: '#FF3838',
        },
      },
    },
  },
  plugins: [],
}
