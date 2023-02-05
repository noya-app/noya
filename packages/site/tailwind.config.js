/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [],
  safelist: [
    {
      pattern: /^(shadow|border|rounded|opacity|bg|blur|text|font).*/,
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
        'font-{fontWeight}',
        // Text alignment
        'text-left',
        'text-center',
        'text-right',
        // 'text-justify',
        // 'text-start',
        // 'text-end',
      ],
    }),
  ],
};
