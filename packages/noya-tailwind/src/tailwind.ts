import { get, groupBy, memoize } from '@noya-app/noya-utils';
import {
  ThemeValue,
  config,
  context,
  suggestedTailwindClasses,
} from 'noya-tailwind';
import { CSSProperties } from 'react';
import { tailwindToLinearGradient } from './tailwindGradient';

export const allClassNames = suggestedTailwindClasses;

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

const textAlignKeys = new Set(['left', 'right', 'center']);

export function getTextAlign(hashtags: string[]) {
  const textAlignKey = hashtags
    .slice()
    .reverse()
    .find((key) => textAlignKeys.has(key)) as
    | 'left'
    | 'right'
    | 'center'
    | undefined;

  return textAlignKey;
}

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
  boxShadow: /^shadow/,
  autoCols: /^auto-cols/,
  autoRows: /^auto-rows/,
  gridFlow: /^grid-flow/,
  gridCols: /^grid-cols/,
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

export function parseTailwindClass(className: string) {
  const match = className.match(/^(\w+:)?(.*?)(\/\d*)?$/);

  if (!match) return { className };

  const [, prefix, classNameWithoutPrefix, opacity] = match;

  return {
    className: classNameWithoutPrefix,
    ...(prefix && { prefix: prefix.slice(0, -1) }),
    ...(opacity !== undefined && { opacity: opacity.slice(1) }),
  };
}

export function stringifyTailwindClass({
  className,
  prefix,
  opacity,
}: ReturnType<typeof parseTailwindClass>) {
  return `${prefix ? `${prefix}:` : ''}${className}${
    opacity ? `/${opacity}` : ''
  }`;
}

export const filterTailwindClassesByLastInGroup = memoize(
  (classNames: string[]) => {
    const originalIndexes = Object.fromEntries(
      classNames.map((className, index) => [className, index]),
    );

    const byKey: Record<string, string> = {};
    const prefixedGroups = new Map<string, Set<string>>();

    classNames.forEach((className) => {
      const parsed = parseTailwindClass(className);
      const group = getTailwindClassGroup(parsed.className);
      const key = parsed.prefix ? `${parsed.prefix}:${group}` : group;

      if (parsed.prefix) {
        // Track groups for each prefix
        if (!prefixedGroups.has(parsed.prefix)) {
          prefixedGroups.set(parsed.prefix, new Set());
        }
        prefixedGroups.get(parsed.prefix)?.add(group);
      } else {
        // If a non-prefixed class comes after a prefixed class in the same group
        // Remove all prefixed versions of this group
        prefixedGroups.forEach((groups, prefix) => {
          if (groups.has(group)) {
            delete byKey[`${prefix}:${group}`];
          }
        });
      }

      byKey[key] = className;
    });

    return Object.values(byKey).sort(
      (a, b) => originalIndexes[a] - originalIndexes[b],
    );
  },
);

export const breakpoints = [
  'sm' as const,
  'md' as const,
  'lg' as const,
  'xl' as const,
  '2xl' as const,
];

export const colorSchemes = ['light' as const, 'dark' as const];

export type BreakpointKey = (typeof breakpoints)[number];

export function matchBreakpoint(width: number): BreakpointKey {
  if (width < 640) return 'sm';
  if (width < 768) return 'md';
  if (width < 1024) return 'lg';
  if (width < 1280) return 'xl';
  if (width < 1536) return '2xl';
  return '2xl';
}

export const extractTailwindClassesByBreakpoint = (
  classes: string[],
  breakpoint: BreakpointKey,
) => {
  const breakpointIndex = breakpoints.indexOf(breakpoint);
  const included = breakpoints.slice(0, breakpointIndex + 1);
  const excluded = breakpoints.slice(breakpointIndex + 1);

  return classes.flatMap((className): string[] => {
    // If the class starts with a breakpoint in the set, return the class without the breakpoint
    for (const bp of included) {
      if (className.startsWith(`${bp}:`)) {
        return [className.substring(bp.length + 1)];
      }
    }

    // If the class starts with a breakpoint not in the set, return nothing
    for (const bp of excluded) {
      if (className.startsWith(`${bp}:`)) {
        return [];
      }
    }

    return [className];
  });
};

const themes = ['light', 'dark'] as const;

/**
 * Extracts the classes for the given theme. Omits the theme prefix.
 * Omits that are prefixed with a different theme.
 */
export const extractTailwindClassesByColorScheme = (
  classes: string[],
  theme: (typeof themes)[number],
) => {
  return classes.flatMap((className): string[] => {
    if (className.startsWith(`${theme}:`)) {
      return [className.substring(theme.length + 1)];
    }

    for (const t of themes) {
      if (className.startsWith(`${t}:`)) {
        return [];
      }
    }

    return [className];
  });
};

function getValue(className: string): string | undefined {
  let value =
    /-((\d+)((\/|\.)\d+)?|(base|px|xs|sm|md|lg|\d?xl|full|none|auto|screen))$/.exec(
      className,
    )?.[1];

  // if className starts with "-", add a "-" to the start of the value
  if (value && className.startsWith('-')) {
    value = `-${value}`;
  }

  return value;
}

function getSpacingValue(className: string): string | undefined {
  const key = getValue(className);

  if (!key) return undefined;

  const value = (config.theme.spacing as Record<string, ThemeValue>)[key];

  return value as string;
}

const customValueRE = /[A-Za-z0-9-]*(?:\[(.*)\])?/;

export function getColor(className: string) {
  const [withoutOpacity, opacity] = className.split('/');

  const custom = customValueRE.exec(withoutOpacity)?.[1];

  if (custom) {
    return custom;
  }

  const value = withoutOpacity.split('-').slice(1);

  let result = get(context.theme('colors'), value) as string;

  // If result is a 3 digit hex, expand it to 6 digits
  if (opacity && result && /#([0-9a-f]{3})$/i.test(result)) {
    result = `#${result[1]}${result[1]}${result[2]}${result[2]}${result[3]}${result[3]}`;
  }

  // If result is a 6 digit hex, add the opacity
  if (opacity && /#([0-9a-f]{6})$/i.test(result)) {
    const o = Math.floor((parseInt(opacity, 10) * 255) / 100)
      .toString(16)
      .padStart(2, '0');
    result = `${result}${o}`;
  }

  return result;
}

export const resolveTailwindClass = memoize(function resolveTailwindClass(
  className: string,
): CSSProperties | null {
  const classGroup = getTailwindClassGroup(className);

  switch (classGroup) {
    case 'appearance':
      return {
        appearance: 'none',
      };
    case 'fontSize':
      const [size, extras] = (context.theme('fontSize') as any)[
        getValue(className) || 'base'
      ];

      return {
        fontSize: size,
        ...extras,
      };
    case 'background': {
      return {
        backgroundColor: getColor(className),
      };
    }
    case 'backgroundSize': {
      return {
        backgroundSize: className.replace('bg-', ''),
      };
    }
    case 'backgroundPosition': {
      return {
        backgroundPosition: className.replace('bg-', '').replace('-', ' '),
      };
    }
    case 'backdropFilter': {
      const key = /backdrop-blur-(.+)/.exec(className)?.[1];
      const value = (config.theme as any).blur[key || 'DEFAULT'];

      return {
        backdropFilter: `blur(${value})`,
      };
    }
    case 'textColor':
      return {
        color: getColor(className),
      };
    case 'fill':
      return {
        fill: getColor(className),
      };
    case 'justify':
      return {
        justifyContent:
          className === 'justify-between'
            ? 'space-between'
            : className === 'justify-around'
            ? 'space-around'
            : className === 'justify-evenly'
            ? 'space-evenly'
            : className.replace('justify-', ''),
      };
    case 'items':
      return {
        alignItems: className.replace('items-', ''),
      };
    case 'gap': {
      const value = getSpacingValue(className);
      return value ? { gap: value } : {};
    }
    case 'padding': {
      const value = getSpacingValue(className);
      return value ? { padding: value } : {};
    }
    case 'paddingX': {
      const value = getSpacingValue(className);
      return value ? { paddingLeft: value, paddingRight: value } : {};
    }
    case 'paddingY': {
      const value = getSpacingValue(className);
      return value ? { paddingTop: value, paddingBottom: value } : {};
    }
    case 'paddingTop': {
      const value = getSpacingValue(className);
      return value ? { paddingTop: value } : {};
    }
    case 'paddingRight': {
      const value = getSpacingValue(className);
      return value ? { paddingRight: value } : {};
    }
    case 'paddingBottom': {
      const value = getSpacingValue(className);
      return value ? { paddingBottom: value } : {};
    }
    case 'paddingLeft': {
      const value = getSpacingValue(className);
      return value ? { paddingLeft: value } : {};
    }
    case 'margin': {
      const value = (config.theme as any).margin(context)[
        getValue(className) || 'auto'
      ];
      return value ? { margin: value } : {};
    }
    case 'marginX': {
      const value = (config.theme as any).margin(context)[
        getValue(className) || 'auto'
      ];
      return value ? { marginLeft: value, marginRight: value } : {};
    }
    case 'marginY': {
      const value = (config.theme as any).margin(context)[
        getValue(className) || 'auto'
      ];
      return value ? { marginTop: value, marginBottom: value } : {};
    }
    case 'marginTop': {
      const value = (config.theme as any).margin(context)[
        getValue(className) || 'auto'
      ];
      return value ? { marginTop: value } : {};
    }
    case 'marginRight': {
      const value = (config.theme as any).margin(context)[
        getValue(className) || 'auto'
      ];
      return value ? { marginRight: value } : {};
    }
    case 'marginBottom': {
      const value = (config.theme as any).margin(context)[
        getValue(className) || 'auto'
      ];
      return value ? { marginBottom: value } : {};
    }
    case 'marginLeft': {
      const value = getSpacingValue(className);
      return value ? { marginLeft: value } : {};
    }
    case 'flexDirection':
      return {
        flexDirection: className === 'flex-col' ? 'column' : 'row',
      };
    case 'flex':
      return {
        flex: className.replace('flex-', ''),
      };
    case 'flexBasis':
      const value = getSpacingValue(className);
      return value ? { flexBasis: value } : {};
    case 'alignSelf':
      return {
        alignSelf: className.replace('self-', ''),
      };
    case 'borderRadius': {
      const value = getValue(className);
      return {
        borderRadius: (config.theme as any).borderRadius[value || 'DEFAULT'],
      };
    }
    case 'textDecoration':
      switch (className) {
        case 'underline':
          return {
            textDecoration: 'underline',
          };
        case 'overline':
          return {
            textDecoration: 'overline',
          };
        case 'no-underline':
          return {
            textDecoration: 'none',
          };
        case 'line-through':
          return {
            textDecoration: 'line-through',
          };
        default:
          return {};
      }
    case 'boxShadow': {
      const value = getValue(className);
      return {
        boxShadow: (config.theme as any).boxShadow[value || 'DEFAULT'],
      };
    }
    case 'borderWidth': {
      const value = getValue(className);
      return {
        borderWidth: (config.theme as any).borderWidth[value || 'DEFAULT'],
      };
    }
    case 'borderXWidth': {
      const value = getValue(className);
      return {
        borderLeftWidth: (config.theme as any).borderWidth[value || 'DEFAULT'],
        borderRightWidth: (config.theme as any).borderWidth[value || 'DEFAULT'],
      };
    }
    case 'borderYWidth': {
      const value = getValue(className);
      return {
        borderTopWidth: (config.theme as any).borderWidth[value || 'DEFAULT'],
        borderBottomWidth: (config.theme as any).borderWidth[
          value || 'DEFAULT'
        ],
      };
    }
    case 'borderTopWidth': {
      const value = getValue(className);
      return {
        borderTopWidth: (config.theme as any).borderWidth[value || 'DEFAULT'],
      };
    }
    case 'borderRightWidth': {
      const value = getValue(className);
      return {
        borderRightWidth: (config.theme as any).borderWidth[value || 'DEFAULT'],
      };
    }
    case 'borderBottomWidth': {
      const value = getValue(className);
      return {
        borderBottomWidth: (config.theme as any).borderWidth[
          value || 'DEFAULT'
        ],
      };
    }
    case 'borderLeftWidth': {
      const value = getValue(className);
      return {
        borderLeftWidth: (config.theme as any).borderWidth[value || 'DEFAULT'],
      };
    }
    case 'borderColor': {
      return {
        borderColor: getColor(className),
      };
    }
    case 'fontWeight': {
      const value = className.replace('font-', '');
      return {
        fontWeight: (config.theme as any).fontWeight[value],
      };
    }
    case 'none':
      return null;
    case 'autoCols': {
      const value = className.replace('auto-cols-', '');
      return {
        gridAutoColumns: (config.theme as any).gridAutoColumns[
          value || 'DEFAULT'
        ],
      };
    }
    case 'autoRows': {
      const value = className.replace('auto-rows-', '');
      return {
        gridAutoRows: (config.theme as any).gridAutoRows[value || 'DEFAULT'],
      };
    }
    case 'gridFlow': {
      const value = className.replace('grid-flow-', '');
      switch (value) {
        case 'row':
          return {
            gridAutoFlow: 'row',
          };
        case 'col':
          return {
            gridAutoFlow: 'column',
          };
        default:
          return null;
      }
    }
    case 'display': {
      return {
        display: className === 'hidden' ? 'none' : className,
      };
    }
    case 'position': {
      return {
        position: className as any,
      };
    }
    case 'width': {
      const value = getValue(className);
      return {
        width: (config.theme as any).width(context)[value || 'auto'],
      };
    }
    case 'maxWidth': {
      const value = getValue(className);
      return {
        maxWidth: (config.theme as any).maxWidth(context)[value || 'none'],
      };
    }
    case 'minWidth': {
      const value = getValue(className);
      return {
        minWidth: (config.theme as any).minWidth[value || 'none'],
      };
    }
    case 'maxHeight': {
      const value = getValue(className);
      return {
        maxHeight: (config.theme as any).maxHeight(context)[value || 'none'],
      };
    }
    case 'minHeight': {
      const value = getValue(className);
      return {
        minHeight: (config.theme as any).minHeight[value || 'none'],
      };
    }
    case 'top':
    case 'right':
    case 'bottom':
    case 'left': {
      const value = getValue(className);
      return {
        [classGroup]: (config.theme as any).inset(context)[value || 'auto'],
      };
    }
    case 'height': {
      const value = getValue(className);
      return {
        height: (config.theme as any).height(context)[value || 'auto'],
      };
    }
    case 'lineHeight': {
      const [, value] = className.split('-');
      return {
        lineHeight: (config.theme as any).lineHeight[value || 'DEFAULT'],
      };
    }
    case 'tracking': {
      const [, value] = className.split('-');
      return {
        letterSpacing: (config.theme as any).letterSpacing[value || 'DEFAULT'],
      };
    }
    case 'textAlign': {
      const value = className.replace('text-', '');
      return {
        textAlign: value as any,
      };
    }
    case 'inset': {
      const value = getValue(className);
      return {
        inset: (config.theme as any).inset(context)[value || 'auto'],
      };
    }
    case 'objectFit': {
      const value = className.replace('object-', '');
      return {
        objectFit: value as any,
      };
    }
    case 'objectPosition': {
      return {
        objectPosition: className.replace('object-', ''),
      };
    }
    case 'flexWrap':
      return {
        flexWrap: className === 'flex-nowrap' ? 'nowrap' : 'wrap',
      };
    case 'grow': {
      const value = getValue(className);
      return {
        flexGrow: (config.theme as any).flexGrow[value || 'DEFAULT'],
      };
    }
    case 'shrink': {
      const value = getValue(className);
      return {
        flexShrink: (config.theme as any).flexShrink[value || 'DEFAULT'],
      };
    }
    case 'opacity': {
      const value = getValue(className);
      return {
        opacity: (config.theme as any).opacity[value || 'DEFAULT'],
      };
    }
    case 'aspectRatio': {
      return {
        aspectRatio: (config.theme as any).aspectRatio[
          className.replace('aspect-', '')
        ],
      };
    }
    case 'gridCols': {
      const value = getValue(className);
      return {
        gridTemplateColumns: (config.theme as any).gridTemplateColumns[
          value || 'DEFAULT'
        ],
      };
    }
    case 'gradientDirection':
    case 'gradientStopFrom':
    case 'gradientStopTo': {
      return {
        // This will be replaced with a background image later,
        // but we return something here so that the class is not ignored.
        backgroundImage: tailwindToLinearGradient([className], getColor),
      };
    }
    case 'isolate':
      return {
        isolation: className === 'isolate' ? 'isolate' : 'auto',
      };
    case 'zIndex':
      return {
        zIndex: (getValue(className) as any) ?? undefined,
      };
    case 'blur':
      return {
        filter: `blur(${
          (context.theme('blur') as any)[getValue(className) || 'DEFAULT']
        })`,
      };
    case 'overflow':
      return {
        overflow: className.replace('overflow-', '') as any,
      };
    case 'overflowX':
      return {
        overflowX: className.replace('overflow-x-', '') as any,
      };
    case 'overflowY':
      return {
        overflowY: className.replace('overflow-y-', '') as any,
      };
    case 'ringColor':
    case 'ringInset':
    case 'ringOffsetWidth':
    case 'ringWidth':
      return {};
  }

  return assertNever(classGroup);
});

export function simpleAlignmentResolver(
  className: string,
): CSSProperties | null {
  switch (className) {
    case 'center':
      return { textAlign: 'center' };
    case 'left':
      return { textAlign: 'left' };
    case 'right':
      return { textAlign: 'right' };
    default:
      return null;
  }
}

export function parametersToTailwindStyle(
  parameters?: Record<string, unknown> | string[],
  resolve?: (className: string) => CSSProperties | null,
): CSSProperties {
  if (!parameters) return {};

  const classNames = Array.isArray(parameters)
    ? parameters
    : Object.keys(parameters);

  let result: CSSProperties = classNames.reduce((result, className) => {
    let style = resolve?.(className);

    if (!style) {
      style = resolveTailwindClass(className);
    }

    return {
      ...result,
      ...style,
    };
  }, {});

  if (hasClassGroup('gradientDirection', classNames)) {
    result.backgroundImage = tailwindToLinearGradient(classNames, (color) =>
      getColor(`bg-${color}`),
    );
  }

  if (hasClassGroup('ringWidth', classNames)) {
    let ringProps: {
      ringWidth?: string;
      ringOffsetWidth?: string;
      ringColor?: string;
      ringInset?: boolean;
    } = {};

    const ringWidth = getLastClassInGroup('ringWidth', classNames);
    if (ringWidth) {
      const value = getValue(ringWidth);
      ringProps.ringWidth = (config.theme.ringWidth as any)[value || 'DEFAULT'];
    }

    const ringOffsetWidth = getLastClassInGroup('ringOffsetWidth', classNames);
    if (ringOffsetWidth) {
      const value = getValue(ringOffsetWidth);
      ringProps.ringOffsetWidth = (config.theme.ringOffsetWidth as any)[
        value || 'DEFAULT'
      ];
    }

    const ringColor = getLastClassInGroup('ringColor', classNames);
    if (ringColor) {
      ringProps.ringColor = getColor(ringColor);
    } else {
      ringProps.ringColor = '#3b82f680';
    }

    const ringInset = classNames.includes('ring-inset');
    if (ringInset) {
      ringProps.ringInset = true;
    }

    const ringString = `${ringProps.ringInset ? 'inset ' : ''}0 0 0 ${
      ringProps.ringOffsetWidth
        ? `calc(${ringProps.ringWidth} + ${ringProps.ringOffsetWidth})`
        : ringProps.ringWidth
    } ${ringProps.ringColor}`;

    result.boxShadow = ringString;
  }

  return result;
}

// assertNever
function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x);
}
