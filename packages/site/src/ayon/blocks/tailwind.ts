import { groupBy, memoize } from 'noya-utils';

const allClassNames = (
  require('../../../safelist.txt').default as string
).split('\n');

const allClassNamesSet = new Set(allClassNames);

export function isSupportedTailwindClass(className: string) {
  return allClassNamesSet.has(className);
}

const isTextClassRE =
  /^(text|font|truncate|leading|underline|overline|no-underline|line-through)/;
const isFillClassRE = /^fill-/;

export const tailwindTextClasses = allClassNames.filter((item) =>
  isTextClassRE.test(item),
);
export const tailwindBlockClasses = allClassNames.filter(
  (item) => !isTextClassRE.test(item) && !isFillClassRE.test(item),
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
  // From https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/defaultConfig.stub.js
  textColor:
    /^text-(inherit|current|transparent|black|white|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)/,
  fill: /^fill-/,
  justify: /^justify/,
  items: /^items/,
  gap: /^gap-/,
  padding: /^p-/,
  paddingX: /^px-/,
  paddingY: /^py-/,
  paddingTop: /^pt-/,
  paddingRight: /^pr-/,
  paddingBottom: /^pb-/,
  paddingLeft: /^pl-/,
  margin: /^m-/,
  marginX: /^mx-/,
  marginY: /^my-/,
  marginTop: /^mt-/,
  marginRight: /^mr-/,
  marginBottom: /^mb-/,
  marginLeft: /^ml-/,
  flexDirection: /^(flex-row|flex-col)/,
  flex: /^(flex-1|flex-auto|flex-none)/,
  alignSelf: /^self/,
  borderRadius: /^rounded/,
  textDecoration: /^(underline|overline|no-underline|line-through)/,
  // Must be last!
  none: /.*/,
};

type ClassGroupKey = keyof typeof classGroups;

export function hasClassGroup(group: ClassGroupKey, hashtags: string[]) {
  return hashtags.some((className) => classGroups[group].test(className));
}

export function getLastClassInGroup(group: ClassGroupKey, hashtags: string[]) {
  return hashtags
    .slice()
    .reverse()
    .find((className) => classGroups[group].test(className));
}

export const getTailwindClassGroup = memoize(
  (className: string): ClassGroupKey => {
    const entry = Object.entries(classGroups).find(([, re]) =>
      re.test(className),
    )!;

    return entry[0] as ClassGroupKey;
  },
);

export const isTailwindClassGroup = memoize(
  (className: string, group: ClassGroupKey): boolean => {
    return classGroups[group].test(className);
  },
);

export const getTailwindClassesByGroup = memoize((group: ClassGroupKey) => {
  return allClassNames.filter((className) =>
    classGroups[group].test(className),
  );
});
