/** @type {import('tailwindcss').Config} */
module.exports = {
  // Expo Router screens live in `app/`; scan them along with shared components.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],

  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
