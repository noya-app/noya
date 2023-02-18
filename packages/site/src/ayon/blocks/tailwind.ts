import { partition } from 'noya-utils';
import { SafelistConfig } from 'tailwindcss/types/config';

const allClassNames = (
  require('../../../safelist.txt').default as string
).split('\n');

const allClassNamesSet = new Set(allClassNames);

type SafelistPattern = SafelistConfig[0];

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
  return allClassNamesSet.has(className);
}

const isTextClassRE = /^(text|font|truncate|leading)/;

export const [tailwindTextClasses, tailwindBlockClasses] = partition(
  allClassNames,
  (item) => isTextClassRE.test(item),
);

export function getBlockClassName(hashtags: string[]) {
  const className = hashtags.filter(isSupportedTailwindClass).join(' ');
  return className || undefined;
}

// export const classGroups = {
//   background: /^(bg|dark)/,
// };

// export function getTailwindClassGroup(className: string) {
//   return Object.entries(classGroups).find(([, re]) => re.test(className));
// }
