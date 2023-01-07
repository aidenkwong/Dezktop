/**@type{import('tailwindcss').Config}*/
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern:
        /(bg|border|outline|text)-(black|white|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|lightBlue|warmGray|trueGray|coolGray|blueGray)-|scale/,

      variants: ["hover"],
    },
  ],
  theme: {
    extend: {
      //colors:{
      //accent:"rgb(var(--accent)/<alpha-value>)",
      //content:"rgb(var(--content)/<alpha-value>)",
      //foreground:"rgb(var(--foreground)/<alpha-value>)",
      //background:"rgb(var(--background)/<alpha-value>)",
      //lighterBackground:"rgb(var(--lighterBackground)/<alpha-value>)",
      //edge:"rgb(var(--edge)/<alpha-value>)",
      //},
    },
    gridTemplateColumns: {
      "auto-224": "repeat(auto-fit,224px)",
    },
  },
  plugins: [require("@shrutibalasa/tailwind-grid-auto-fit")],
};
