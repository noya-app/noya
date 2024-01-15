import { classNamesToStyle } from '@noya-app/noya-tailwind';
import { isDeepEqual } from '@noya-app/noya-utils';
import {
  FindComponent,
  NoyaComponent,
  NoyaResolvedNode,
  ResolvedHierarchy,
  getNodeName,
} from 'noya-component';
import { CSSProperties } from 'react';
import {
  SimpleElement,
  SimpleElementTree,
  getComponentNameIdentifier,
  isPassthrough,
} from './common';

function styleNameToString(key: string) {
  const prefix = /^(ms|moz|webkit)/i.test(key) ? '-' : '';
  // Convert camelCase to kebab-case and add vendor prefix if needed
  key = prefix + camelCaseToKebabCase(key);
  return key;

  function camelCaseToKebabCase(string: string) {
    return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}

export type StyleRule = {
  selector: string;
  declarations: [string, string][];
};

export function compileCSS({
  simpleElement,
  component,
  resolvedNode,
  findComponent,
  mode,
}: {
  simpleElement: SimpleElement;
  component: NoyaComponent;
  resolvedNode: NoyaResolvedNode;
  findComponent: FindComponent;
  mode: 'css' | 'css-modules';
}) {
  let styleRules: StyleRule[] = [];
  const simpleElementToClassName = new Map<SimpleElement, string>();
  const existingNames = new Set<string>();

  SimpleElementTree.visit(simpleElement, (simple) => {
    if (typeof simple === 'string') return;
    if (isPassthrough(simple)) return;
    if (simple.nodePath) {
      const indexPath = ResolvedHierarchy.findIndexPath(resolvedNode, (node) =>
        isDeepEqual(node.path, simple.nodePath),
      );

      if (!indexPath) return;

      const pathOfNodes = ResolvedHierarchy.accessPath(resolvedNode, indexPath);

      const namePath = pathOfNodes.map((n) => getNodeName(n, findComponent));
      const elementName = namePath[namePath.length - 1];

      const className = (
        !existingNames.has(elementName)
          ? [component.name, elementName]
          : [component.name, ...namePath]
      )
        .map((name) => getComponentNameIdentifier(name, 'kebab'))
        .join('__');

      simpleElementToClassName.set(simple, className);

      const convertedFromTailwind = classNamesToStyle(
        (simple.props.className as string | undefined)?.split(' '),
      );

      const allDeclarationsObject = mergeShorthand({
        ...(simple.props.style ?? {}),
        ...convertedFromTailwind,
      });

      const allDeclarations = Object.entries(allDeclarationsObject)
        // Filter undefined values
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => {
          const styleName = styleNameToString(key);
          return [styleName, value.toString()] as [string, string];
        });

      styleRules.push({
        selector: `.${className}`,
        declarations: allDeclarations,
      });
    }
  });

  return { styleRules, simpleElementToClassName };
}

export function buildStyleSheet(styleRules: StyleRule[]) {
  return styleRules
    .map(({ selector: ruleName, declarations: rules }) => {
      return `${ruleName} { ${rules
        .map(([key, value]) => `${key}: ${value};`)
        .join(' ')} }`;
    })
    .join('\n\n');
}

const shorthandProperties = {
  padding: [
    'paddingTop' as const,
    'paddingRight' as const,
    'paddingBottom' as const,
    'paddingLeft' as const,
  ],
  margin: [
    'marginTop' as const,
    'marginRight' as const,
    'marginBottom' as const,
    'marginLeft' as const,
  ],
};

type ShorthandProperty = keyof typeof shorthandProperties;

function mergeShorthand(style: CSSProperties): CSSProperties {
  for (const shorthand in shorthandProperties) {
    const properties = shorthandProperties[shorthand as ShorthandProperty];
    const usedProps = (properties as any[]).filter((prop) => prop in style);

    // Only create shorthand if 2 or more properties are used
    if (usedProps.length >= 2) {
      const values = properties.map((prop) => style[prop] || '0');

      // Determine the shortest possible shorthand
      let shorthandValue: string | number = '';
      if (values[0] === values[2] && values[1] === values[3]) {
        shorthandValue =
          values[0] === values[1] ? values[0] : `${values[0]} ${values[1]}`;
      } else if (values[1] === values[3]) {
        shorthandValue = `${values[0]} ${values[1]} ${values[2]}`;
      } else {
        shorthandValue = values.join(' ');
      }

      style[shorthand as ShorthandProperty] = shorthandValue;
      properties.forEach((prop) => delete style[prop]);
    }
  }

  return style;
}
