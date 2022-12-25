/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    gridTemplateColumns: {
      "auto-224": "repeat(auto-fit, 224px)",
    },
  },
  plugins: [require("@shrutibalasa/tailwind-grid-auto-fit")],
};
