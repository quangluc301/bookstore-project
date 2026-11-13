/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Segoe UI"', '"Noto Sans"', 'Tahoma', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: '#1d4ed8',
        secondary: '#111827',
        accent: '#f59e0b',
      },
    },
  },
  plugins: [],
};
