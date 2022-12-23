/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    gridTemplateColumns: {
      "auto-240": "repeat(auto-fit, minmax(240px, 1fr))",
    },
  },
  plugins: [require("@shrutibalasa/tailwind-grid-auto-fit")],
};
