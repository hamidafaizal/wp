/** @type {import('tailwindcss').Config} */
export default {
  // // Menentukan file mana yang akan di-scan oleh Tailwind untuk mencari class
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
