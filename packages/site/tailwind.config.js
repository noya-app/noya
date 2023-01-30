/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  safelist: [
    {
      pattern: /(shadow|border|rounded|opacity|bg|blur|text).*/,
    },
  ],
  plugins: [],
};
