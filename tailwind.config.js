/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "var(--accent)",
        content: "var(--content)",
        foreground: "var(--foreground)",
        foregroundHover: "var(--foreground-hover)",
        foreground2: "var(--foreground2)",
        foreground2Hover: "var(--foreground2-hover)",
        background: "var(--background)",
        background2: "var(--background2)",
        edge: "var(--edge)",
      },
    },
    gridTemplateColumns: {
      "auto-224": "repeat(auto-fit, 224px)",
    },
  },
  plugins: [require("@shrutibalasa/tailwind-grid-auto-fit")],
};
