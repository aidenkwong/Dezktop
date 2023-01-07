/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "rgb(var(--accent) / <alpha-value>)",
        content: "rgb(var(--content) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        lighterForeground: "rgb(var(--lighter-foreground) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        lighterBackground: "rgb(var(--lighter-background) / <alpha-value>)",
        edge: "rgb(var(--edge) / <alpha-value>)",
      },
    },
    gridTemplateColumns: {
      "auto-224": "repeat(auto-fit, 224px)",
    },
  },
  plugins: [require("@shrutibalasa/tailwind-grid-auto-fit")],
};
