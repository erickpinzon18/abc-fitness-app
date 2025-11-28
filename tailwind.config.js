/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'avc-red': '#dc2626',
        'avc-dark': '#1f2937',
        'avc-gray': '#f9fafb',
      },
      fontFamily: {
        'montserrat': ['Montserrat'],
        'montserrat-medium': ['Montserrat-Medium'],
        'montserrat-semibold': ['Montserrat-SemiBold'],
        'montserrat-bold': ['Montserrat-Bold'],
        'roboto-mono': ['RobotoMono'],
        'roboto-mono-bold': ['RobotoMono-Bold'],
      },
    },
  },
  plugins: [],
};

