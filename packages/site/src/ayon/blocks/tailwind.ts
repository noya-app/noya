import { groupBy, memoize, partition } from 'noya-utils';
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
  const supportedHashtags = hashtags.filter(isSupportedTailwindClass);

  const groups = groupBy(supportedHashtags, getTailwindClassGroup);

  const hashtagsToApply = Object.entries(groups).flatMap(([name, group]) =>
    name === 'none' ? group : group.slice(-1),
  );

  const className = hashtagsToApply.join(' ');

  return className || undefined;
}

export const classGroups = {
  background: /^bg/,
  textColor: /^text/,
  justify: /^justify/,
  items: /^items/,
  gap: /^gap-/,
  none: /.*/,
  flexDirection: /^(flex-row|flex-col)/,
  flex: /^(flex-1|flex-auto|flex-none)/,
  alignSelf: /^self/,
};

type ClassGroup = keyof typeof classGroups;

export function hasClassGroup(group: ClassGroup, hashtags: string[]) {
  return hashtags.some((className) => classGroups[group].test(className));
}

export const getTailwindClassGroup = memoize(
  (className: string): ClassGroup => {
    const entry = Object.entries(classGroups).find(([, re]) =>
      re.test(className),
    )!;

    return entry[0] as ClassGroup;
  },
);
