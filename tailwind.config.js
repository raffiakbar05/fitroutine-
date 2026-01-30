/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fit-teal': '#54BAB9', // Ini warna hijau toska dari desain Anda
      },
    },
  },
  plugins: [],
}