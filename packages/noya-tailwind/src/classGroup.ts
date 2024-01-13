import { memoize } from '@noya-app/noya-utils';

export const classGroups = {
  appearance: /^appearance-none/,
  fontSize: /^text-(base|xs|sm|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/,
  fontWeight:
    /^(font-thin|font-extralight|font-light|font-normal|font-medium|font-semibold|font-bold|font-extrabold|font-black)$/,
  background: /^bg/,
  backgroundSize: /^bg-(auto|cover|contain)/,
  backgroundPosition:
    /^bg-(bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top)/,
  blur: /^blur/,
  backdropFilter: /^backdrop-blur/,
  gradientDirection: /^bg-gradient-to-/,
  gradientStopFrom: /^from-/,
  gradientStopTo: /^to-/,
  textAlign: /^(text-left|text-center|text-right)/,
  // From https://github.com/tailwindlabs/tailwindcss/blob/86f9c6f09270a9da6fee77909863444b52e2f9b6/stubs/config.full.js
  textColor:
    /^text-(inherit|current|transparent|black|white|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)/,
  fill: /^fill-/,
  justify: /^justify/,
  items: /^items/,
  width: /^w-/,
  height: /^h-/,
  minWidth: /^min-w-/,
  minHeight: /^min-h-/,
  maxWidth: /^max-w-/,
  maxHeight: /^max-h-/,
  aspectRatio: /^aspect-/,
  top: /^top-/,
  right: /^right-/,
  bottom: /^bottom-/,
  left: /^left-/,
  // translate: /^translate-/,
  // Only handle gap for now. Space-x and space-y are converted to gap.
  gap: /^(gap-|space-y|space-x)/,
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
  flexBasis: /^basis-/,
  flexWrap: /^(flex-wrap|flex-nowrap)/,
  grow: /^grow/,
  shrink: /^shrink/,
  alignSelf: /^self/,
  borderRadius: /^rounded/,
  borderWidth: /^border(-\d+)?$/,
  borderXWidth: /^border-x(-\d+)?$/,
  borderYWidth: /^border-y(-\d+)?$/,
  borderTopWidth: /^border-t(-\d+)?$/,
  borderRightWidth: /^border-r(-\d+)?$/,
  borderBottomWidth: /^border-b(-\d+)?$/,
  borderLeftWidth: /^border-l(-\d+)?$/,
  borderColor: /^border-[-a-z]+/,
  ringWidth: /^ring(-\d+)?$/,
  ringOffsetWidth: /^ring-offset(-\d+)?$/,
  ringInset: /^ring-inset$/,
  ringColor: /^ring-(?!inset)[-a-z]+/,
  textDecoration: /^(underline|overline|no-underline|line-through)/,
  boxShadow: /^shadow(-(sm|DEFAULT|md|lg|xl|2xl|inner|none))?$/,
  boxShadowColor: /^shadow-(?!sm|DEFAULT|md|lg|xl|2xl|inner|none)[-0-9a-z]+/,
  autoCols: /^auto-cols/,
  autoRows: /^auto-rows/,
  gridFlow: /^grid-flow/,
  gridCols: /^grid-cols/,
  gridColumnSpan: /^col-span-/,
  lineHeight: /^leading-/,
  tracking: /^tracking-/,
  position: /^(absolute|relative|fixed|sticky)/,
  inset: /^inset-/,
  opacity: /^opacity-/,
  objectFit:
    /^(object-contain|object-cover|object-fill|object-none|object-scale-down)/,
  objectPosition: /^object-/,
  overflow: /^overflow-(auto|hidden|visible|scroll)/,
  overflowX: /^overflow-x-(auto|hidden|visible|scroll)/,
  overflowY: /^overflow-y-(auto|hidden|visible|scroll)/,
  isolate: /^(isolate|isolation-auto)/,
  zIndex: /^-?z-/,
  display:
    /^(block|inline-block|inline|flex|inline-flex|table|table-caption|table-cell|table-column|table-column-group|table-footer-group|table-header-group|table-row-group|table-row|flow-root|grid|inline-grid|contents|list-item|hidden)$/,
  // Must be last!
  none: /.*/,
};

export type ClassGroupKey = keyof typeof classGroups;

export function hasClassGroup(group: ClassGroupKey, classNames: string[]) {
  return classNames.some((className) => classGroups[group].test(className));
}

export function getLastClassInGroup(
  group: ClassGroupKey,
  classNames: string[],
) {
  for (let i = classNames.length - 1; i >= 0; i--) {
    if (classGroups[group].test(classNames[i])) return classNames[i];
  }
}

const classGroupEntries = Object.entries(classGroups) as [
  ClassGroupKey,
  RegExp,
][];

export const getClassGroup = memoize((className: string): ClassGroupKey => {
  const entry = classGroupEntries.find(([, re]) => re.test(className))!;
  return entry[0];
});

export const isClassGroup = memoize(
  (className: string, group: ClassGroupKey): boolean => {
    return classGroups[group].test(className);
  },
);
