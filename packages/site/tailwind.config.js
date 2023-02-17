/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [],
  safelist: [
    {
      pattern:
        /^(shadow|border|rounded|opacity|bg|blur|text|font|flex|items|justify|p|gap|basis|aspect).*/,
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
        'flex-row',
        'flex-col',
        'items-start',
        'items-center',
        'items-end',
        'justify-start',
        'justify-center',
        'justify-end',
        'p-{spacing}',
        'gap-{spacing}',
        'basis-{spacing}',
        // 'text-justify',
        // 'text-start',
        // 'text-end',
        'flex-1',
        'flex-auto',
        'flex-initial',
        'flex-none',
        'aspect-auto',
        'aspect-square',
        'aspect-video',
      ],
    }),
  ],
};
