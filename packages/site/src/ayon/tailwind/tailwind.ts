import { get, groupBy, memoize } from 'noya-utils';
import { CSSProperties } from 'react';
import { ThemeValue, config, tailwindColors } from './tailwind.config';
import { tailwindToLinearGradient } from './tailwindGradient';

export const allClassNames = (
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
  fontSize: /^(text-base|text-sm|text-xs)/,
  fontWeight:
    /^(font-thin|font-extralight|font-light|font-normal|font-medium|font-semibold|font-bold|font-extrabold|font-black)$/,
  background: /^bg/,
  backgroundSize: /^bg-(auto|cover|contain)/,
  backgroundPosition:
    /^bg-(bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top)/,
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
  textDecoration: /^(underline|overline|no-underline|line-through)/,
  boxShadow: /^shadow/,
  autoCols: /^auto-cols/,
  autoRows: /^auto-rows/,
  gridFlow: /^grid-flow/,
  gridCols: /^grid-cols/,
  lineHeight: /^leading-/,
  position: /^(absolute|relative|fixed|sticky)/,
  inset: /^inset-/,
  opacity: /^opacity-/,
  objectFit:
    /^(object-contain|object-cover|object-fill|object-none|object-scale-down)/,
  objectPosition: /^object-/,
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

export const filterTailwindClassesByLastInGroup = memoize(
  (hashtags: string[]) => {
    const byGroup: Partial<Record<ClassGroupKey, string>> = {};

    hashtags.forEach((className) => {
      const group = getTailwindClassGroup(className);
      byGroup[group] = className;
    });

    return Object.values(byGroup);
  },
);

const breakpoints = ['sm', 'md', 'lg', 'xl', '2xl'] as const;
type BreakpointKey = (typeof breakpoints)[number];

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
export const extractTailwindClassesByTheme = (
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
  return /-((\d+)(\/\d+)?|(sm|md|lg|xl|2xl|3xl|full|none|auto|screen))$/.exec(
    className,
  )?.[1];
}

function getSpacingValue(className: string): string | undefined {
  const key = getValue(className);

  if (!key) return undefined;

  const value = (config.theme.spacing as Record<string, ThemeValue>)[key];

  return value as string;
}

const customValueRE = /[A-Za-z0-9-]*(?:\[(.*)\])?/;

function configSelector(...keyPath: string[]) {
  return get(config.theme as any, keyPath);
}

const themeParameter = {
  theme: configSelector,
  colors: tailwindColors,
  breakpoints: () => {},
};

export function getColor(className: string) {
  const custom = customValueRE.exec(className)?.[1];

  if (custom) {
    return custom;
  }

  const value = className.split('-').slice(1);

  return get((config.theme as any).colors(themeParameter), value);
}

export const resolveTailwindClass = memoize(function resolveTailwindClass(
  className: string,
): CSSProperties | null {
  const classGroup = getTailwindClassGroup(className);

  switch (classGroup) {
    case 'fontSize':
      // Not used?
      return {};
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
      const value = (config.theme as any).margin(themeParameter)[
        getValue(className) || 'auto'
      ];
      return value ? { margin: value } : {};
    }
    case 'marginX': {
      const value = (config.theme as any).margin(themeParameter)[
        getValue(className) || 'auto'
      ];
      return value ? { marginLeft: value, marginRight: value } : {};
    }
    case 'marginY': {
      const value = (config.theme as any).margin(themeParameter)[
        getValue(className) || 'auto'
      ];
      return value ? { marginTop: value, marginBottom: value } : {};
    }
    case 'marginTop': {
      const value = (config.theme as any).margin(themeParameter)[
        getValue(className) || 'auto'
      ];
      return value ? { marginTop: value } : {};
    }
    case 'marginRight': {
      const value = (config.theme as any).margin(themeParameter)[
        getValue(className) || 'auto'
      ];
      return value ? { marginRight: value } : {};
    }
    case 'marginBottom': {
      const value = (config.theme as any).margin(themeParameter)[
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
        width: (config.theme as any).width(themeParameter)[value || 'auto'],
      };
    }
    case 'maxWidth': {
      const value = getValue(className);
      return {
        maxWidth: (config.theme as any).maxWidth(themeParameter)[
          value || 'none'
        ],
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
        maxHeight: (config.theme as any).maxHeight(themeParameter)[
          value || 'none'
        ],
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
        [classGroup]: (config.theme as any).inset(themeParameter)[
          value || 'auto'
        ],
      };
    }
    case 'height': {
      const value = getValue(className);
      return {
        height: (config.theme as any).height(themeParameter)[value || 'auto'],
      };
    }
    case 'lineHeight': {
      const value = getValue(className);
      return {
        lineHeight: (config.theme as any).lineHeight[value || 'DEFAULT'],
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
        inset: (config.theme as any).inset(themeParameter)[value || 'auto'],
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

  return result;
}

// assertNever
function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x);
}
