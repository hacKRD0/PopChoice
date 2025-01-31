/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        carter: ["Carter One", "cursive"],
        "roboto-slab": ["Roboto Slab", "serif"],
      },
    },
  },
  plugins: [],
}

