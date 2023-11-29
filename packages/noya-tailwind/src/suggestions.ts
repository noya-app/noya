import { generateClasses } from './safelist';
import { config, tailwindColors } from './tailwind.config';

export const suggestionPatterns = [
  'inset-{inset}',
  'object-contain',
  'object-cover',
  'object-fill',
  'object-none',
  'object-scale-down',
  'object-{objectPosition}',
  'absolute',
  'relative',
  'w-{width}',
  'h-{height}',
  'max-w-{maxWidth}',
  'max-h-{maxHeight}',
  'min-w-{minWidth}',
  'min-h-{minHeight}',
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
  'items-baseline',
  'justify-normal',
  'justify-start',
  'justify-center',
  'justify-end',
  'justify-between',
  'justify-around',
  'justify-evenly',
  'justify-stretch',
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
  'mx-auto',
  'my-auto',
  'mt-auto',
  'mr-auto',
  'mb-auto',
  'ml-auto',
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
  'grow',
  'grow-0',
  'shrink',
  'shrink-0',
  'flex',
  'inline-flex',
];

export const context = {
  theme: (key: string) => {
    const result = config.theme[key];
    if (typeof result === 'function') {
      const computed = result(context as any);
      return computed;
    } else {
      return result;
    }
  },
  colors: tailwindColors,
  breakpoints: () => {},
};

export const suggestedTailwindClasses = generateClasses(context.theme)(
  suggestionPatterns,
);
