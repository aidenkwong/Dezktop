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
        button: "var(--button)",
        buttonHover: "var(--button-hover)",
      },
    },
    gridTemplateColumns: {
      "auto-180": "repeat(auto-fit, minmax(180px, 1fr))",
    },
  },
  plugins: [
    require("@shrutibalasa/tailwind-grid-auto-fit"),
    require("@tailwindcss/line-clamp"),
  ],
};
