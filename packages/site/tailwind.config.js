/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  safelist: [
    {
      pattern: /^(shadow|border|rounded|opacity|bg|blur|text).*/,
    },
  ],
  plugins: [
    require('tailwind-safelist-generator')({
      patterns: [
        'shadow-{boxShadow}',
        'border-{borderWidth}',
        'border-{colors}',
        'rounded-{borderRadius}',
        'opacity-{opacity}',
        'bg-{colors}',
        'blur-{blur}',
        'text-{colors}',
      ],
    }),
  ],
};
