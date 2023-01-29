import tailwindConfig from '../../../tailwind.config';

const tailwindSafelist = tailwindConfig.safelist ?? [];

export function isSupportedTailwindClass(className: string) {
  return tailwindSafelist.some((item) =>
    !item
      ? false
      : typeof item === 'string'
      ? className === item
      : item.pattern.test(className),
  );
}

export function getBlockClassName(hashTags: string[]) {
  return hashTags.filter(isSupportedTailwindClass).join(' ');
}
