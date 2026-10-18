/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f8f6",
          100: "#e2ece7",
          200: "#c6d9d0",
          300: "#9fbfb1",
          400: "#76a08d",
          500: "#578471",
          600: "#436a5a",
          700: "#37554a",
          800: "#2e453d",
          900: "#273a33",
          950: "#13201c",
        },
        gold: {
          300: "#e6c98d",
          400: "#d9b36a",
          500: "#c99a4b",
          600: "#b07f36",
        },
        ink: {
          900: "#101820",
          800: "#1b2733",
          700: "#2c3a49",
          500: "#5b6b7c",
          400: "#7c8b9b",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      borderRadius: {
        theme: "var(--radius)",
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(16,24,32,0.14)",
        lift: "0 20px 60px -18px rgba(16,24,32,0.25)",
      },
    },
  },
  plugins: [],
};
