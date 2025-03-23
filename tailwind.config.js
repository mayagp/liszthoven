const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  content: [".//src//**//*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        custom: "#10b981",
        primary: "#085592",
        "primary-light": "#097CD8",
        "primary-dark": "#093C65",
        "dark-lowest": "#414246",
        "dark-low": "#1F2125",
        "dark-high": "#161819",
        "dark-highest": "#161819",
        "light-lowest": "#e5e7eb",
        "light-low": "#F8F9FA",
        "light-high": "#FFFFFF",
        "light-highest": "#FFFFFF",
      },
      fontSize: {
        "2xs": "0.65rem",
      },
    },
    screens: {
      xs: "375px", // iphone SE size
      ...defaultTheme.screens,
    },
  },
  darkMode: "class",
  plugins: [
    // require('prettier-plugin-tailwindcss'),
    require("@tailwindcss/container-queries"),
  ],
};
