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
        primary: "#00c73c",
        "primary-light": "#e8f7ef",
        "primary-dark": "#00a82e",
        light: "#f5f6f7",
        surface: "#ffffff",
        text: "#000000",
        muted: "#666666",
        border: "#c9c9c9",
      },
    },
  },
  plugins: [],
}

