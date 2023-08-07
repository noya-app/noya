/** @type {import('tailwindcss').Config} */
module.exports = {
  // important: true,
  content: [],
  safelist: [
    {
      pattern:
        /^(top-|right-|bottom-|left-|absolute|relative|shadow|border|rounded|opacity|bg|fill|blur|text|font|flex|items|justify|gap|basis|aspect|p-|px-|py-|pt-|pr-|pb-|pl-|m-|mx-|my-|mt-|mr-|mb-|ml-|truncate|leading|self|underline|line-through|overline|no-underline|backdrop).*/,
    },
  ],
  plugins: [
    require('tailwind-safelist-generator')({
      patterns: [
        'absolute',
        'relative',
        'w-{width}',
        'h-{height}',
        'top-{inset}',
        'right-{inset}',
        'bottom-{inset}',
        'left-{inset}',
        'shadow-{boxShadow}',
        'border-{borderWidth}',
        'border-x-{borderWidth}',
        'border-y-{borderWidth}',
        'border-t-{borderWidth}',
        'border-r-{borderWidth}',
        'border-b-{borderWidth}',
        'border-l-{borderWidth}',
        'border-{colors}',
        'rounded-{borderRadius}',
        'opacity-{opacity}',
        'bg-{colors}',
        'fill-{colors}',
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
        'items-stretch',
        'justify-start',
        'justify-center',
        'justify-end',
        'p-{spacing}',
        'px-{spacing}',
        'py-{spacing}',
        'pt-{spacing}',
        'pr-{spacing}',
        'pb-{spacing}',
        'pl-{spacing}',
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
        'm-{spacing}',
        'mx-{spacing}',
        'my-{spacing}',
        'mt-{spacing}',
        'mr-{spacing}',
        'mb-{spacing}',
        'ml-{spacing}',
        'truncate',
        'leading-{lineHeight}',
        'self-auto',
        'self-start',
        'self-end',
        'self-center',
        'self-stretch',
        'self-baseline',
        'underline',
        'line-through',
        'overline',
        'no-underline',
        'text-xs',
        'text-sm',
        'text-base',
        'backdrop-blur-{blur}',
        'grid-cols-{gridTemplateColumns}',
        'grid-rows-{gridTemplateRows}',
        'auto-cols-auto',
        'auto-rows-auto',
        'grid',
        'grid-flow-col',
        'grid-flow-row',
        'leading-{lineHeight}',
      ],
    }),
  ],
};
