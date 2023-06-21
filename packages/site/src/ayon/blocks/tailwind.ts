import { groupBy, memoize } from 'noya-utils';
import { CSSProperties } from 'react';
import { ParsedBlockItemParameters } from '../parse';
import { ThemeValue, config } from './tailwind.config';
import { resolveColor } from './tailwindColors';

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
  fontSize: /^(text-base|text-sm|text-xs)/,
  fontWeight:
    /^(font-thin|font-extralight|font-light|font-normal|font-medium|font-semibold|font-bold|font-extrabold|font-black)$/,
  background: /^bg/,
  backdropFilter: /^backdrop-blur/,
  // From https://github.com/tailwindlabs/tailwindcss/blob/86f9c6f09270a9da6fee77909863444b52e2f9b6/stubs/config.full.js
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
  flexBasis: /^basis-/,
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

function getValue(className: string): string | undefined {
  return /-((\d+)|(sm|md|lg|xl|2xl|3xl|full|none))$/.exec(className)?.[1];
}

function getSpacingValue(className: string): string | undefined {
  const key = getValue(className);

  if (!key) return undefined;

  const value = (config.theme.spacing as Record<string, ThemeValue>)[key];

  return value as string;
}

const customValueRE = /[A-Za-z0-9-]*(?:\[(.*)\])?/;

export const resolveTailwindClass = memoize(function resolveTailwindClass(
  className: string,
): CSSProperties | null {
  const classGroup = getTailwindClassGroup(className);

  switch (classGroup) {
    case 'fontSize':
      // Not used?
      return {};
    case 'background':
      const custom = customValueRE.exec(className)?.[1];

      return {
        backgroundColor: custom || resolveColor(className),
      };
    case 'backdropFilter': {
      const key = /backdrop-blur-(.+)/.exec(className)?.[1];
      const value = (config.theme as any).blur[key || 'DEFAULT'];

      return {
        backdropFilter: `blur(${value})`,
      };
    }
    case 'textColor':
      return {
        color: resolveColor(className),
      };
    case 'fill':
      return {
        fill: resolveColor(className),
      };
    case 'justify':
      return {
        justifyContent: className.replace('justify-', ''),
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
      const value = getSpacingValue(className);
      return value ? { margin: value } : {};
    }
    case 'marginX': {
      const value = getSpacingValue(className);
      return value ? { marginLeft: value, marginRight: value } : {};
    }
    case 'marginY': {
      const value = getSpacingValue(className);
      return value ? { marginTop: value, marginBottom: value } : {};
    }
    case 'marginTop': {
      const value = getSpacingValue(className);
      return value ? { marginTop: value } : {};
    }
    case 'marginRight': {
      const value = getSpacingValue(className);
      return value ? { marginRight: value } : {};
    }
    case 'marginBottom': {
      const value = getSpacingValue(className);
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
        borderColor: resolveColor(className),
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
  }

  return assertNever(classGroup);
});

export function parametersToTailwindStyle(
  parameters: ParsedBlockItemParameters | string[],
): CSSProperties {
  const hashtags = Array.isArray(parameters)
    ? parameters
    : Object.keys(parameters);

  return hashtags.reduce((result, className) => {
    const style = resolveTailwindClass(className);

    return {
      ...result,
      ...style,
    };
  }, {});
}

// assertNever
function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x);
}
