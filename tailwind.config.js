/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: '#f8f9fa',
          text: '#2d3748',
        },
        card: {
          bg: '#ffffff',
        },
        dark: {
          bg: '#2d3748',
        },
        accent: {
          blue: '#3182ce',
        },
        text: {
          primary: '#2d3748',
          secondary: '#718096',
        },
        success: '#38a169',
        border: '#e2e8f0',
      },
    },
  },
  plugins: [],
}