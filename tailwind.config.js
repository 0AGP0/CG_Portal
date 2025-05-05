/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#002757",
        secondary: "#ffc105",
        accent: "#ff9900",
        danger: "#e00000",
        warning: "#ff8a00",
      },
      backgroundOpacity: {
        '90': '0.9',
      },
    },
  },
  plugins: [],
}; 