import { get, memoize } from '@noya-app/noya-utils';
import {
  ThemeValue,
  config,
  context,
  suggestedTailwindClasses,
} from 'noya-tailwind';
import { CSSProperties } from 'react';
import {
  getClassGroup,
  getLastClassInGroup,
  hasClassGroup,
} from './classGroup';
import { parseTailwindClass } from './parse';
import { tailwindToLinearGradient } from './tailwindGradient';

export const allClassNames = suggestedTailwindClasses;

export const filterTailwindClassesByLastInGroup = memoize(
  (classNames: string[]) => {
    const originalIndexes = Object.fromEntries(
      classNames.map((className, index) => [className, index]),
    );

    const byKey: Record<string, string> = {};
    const prefixedGroups = new Map<string, Set<string>>();

    classNames.forEach((className) => {
      const parsed = parseTailwindClass(className);
      const group = getClassGroup(parsed.className);
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
  'base' as const,
  'sm' as const,
  'md' as const,
  'lg' as const,
  'xl' as const,
  '2xl' as const,
];

export const colorSchemes = ['light' as const, 'dark' as const];

export type BreakpointKey = (typeof breakpoints)[number] | 'base';

export function matchBreakpoint(width: number): BreakpointKey {
  if (width >= 1536) return '2xl';
  if (width >= 1280) return 'xl';
  if (width >= 1024) return 'lg';
  if (width >= 768) return 'md';
  if (width >= 640) return 'sm';
  return 'base';
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

function getColor(className: string) {
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

export const classNameToStyle = memoize(function classNameToStyle(
  className: string,
): CSSProperties | null {
  const classGroup = getClassGroup(className);

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
    case 'boxShadowColor':
      return {}; // Handled separately
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
    case 'gridColumnSpan': {
      const value = className.replace('col-', '');
      return {
        gridColumn: (config.theme as any).gridColumn[value || 'auto'],
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

export function classNamesToStyle(
  classNames?: string[],
  options: {
    resolve?: (className: string) => CSSProperties | null;
  } = {},
): CSSProperties {
  if (!classNames) return {};

  classNames = Array.isArray(classNames) ? classNames : Object.keys(classNames);

  let result: CSSProperties = classNames.reduce((result, className) => {
    let style = options.resolve?.(className);

    if (!style) {
      style = classNameToStyle(className);
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

  if (
    hasClassGroup('boxShadow', classNames) &&
    hasClassGroup('boxShadowColor', classNames)
  ) {
    const shadow = getLastClassInGroup('boxShadow', classNames);

    if (shadow) {
      const value = getValue(shadow);
      const baseValue = (config.theme.boxShadow as any)[value || 'DEFAULT'];
      const shadowColor = getLastClassInGroup('boxShadowColor', classNames);

      if (baseValue && shadowColor) {
        result.boxShadow = baseValue.replace(
          /rgb\((.*?)\)/g,
          getColor(shadowColor),
        );
      }
    }
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
