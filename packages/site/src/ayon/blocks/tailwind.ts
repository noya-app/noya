import { SafelistConfig } from 'tailwindcss/types/config';
import tailwindConfig from '../../../tailwind.config';

const allClassNames = (
  require('../../../safelist.txt').default as string
).split('\n');

type SafelistPattern = SafelistConfig[0];

const safelistPatterns = tailwindConfig.safelist ?? [];

function isSafe(className: string, item?: SafelistPattern) {
  return !item
    ? false
    : typeof item === 'string'
    ? className === item
    : item.pattern.test(className);
}

export function getTailwindClasses(filters?: SafelistConfig[0][]) {
  if (!filters) return allClassNames;

  return allClassNames.filter((className) =>
    filters.some((filter) => isSafe(className, filter)),
  );
}

export function isSupportedTailwindClass(className: string) {
  return safelistPatterns.some((item) => isSafe(className, item));
}

export function getBlockClassName(hashTags: string[]) {
  return hashTags.filter(isSupportedTailwindClass).join(' ');
}
