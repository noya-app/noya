import {
  DesignSystemDefinition,
  Theme,
  component,
} from '@noya-design-system/protocol';
import { DSConfig } from 'noya-api';
import {
  NoyaNumberProp,
  NoyaProp,
  NoyaResolvedNode,
  ResolvedHierarchy,
  createPatternSVG,
  placeholderImage,
  replaceColorPalette,
  svgToDataUri,
} from 'noya-component';
import {
  extractTailwindClassesByBreakpoint,
  extractTailwindClassesByTheme,
  parametersToTailwindStyle,
  tailwindColors,
} from 'noya-tailwind';
import { findLast, unique } from 'noya-utils';
import React, { ReactNode } from 'react';
import { svgToReactElement } from './renderSVGElement';

export const selectOptionSymbolId = 'a4009f44-db30-4658-9bcb-7531434150bb';
export const ZERO_WIDTH_SPACE = '\u200b';

export function getImageFromProp(
  primaryScale: Theme['colors']['primary'],
  prop?: NoyaProp,
) {
  if (!prop) return placeholderImage;
  if (prop.type !== 'generator') return placeholderImage;
  if (prop.generator === 'geometric') {
    return svgToDataUri(
      replaceColorPalette(createPatternSVG(prop.query), primaryScale),
    );
  }
  if (prop.result) {
    if (prop.result.startsWith('<svg')) {
      return svgToDataUri(prop.result);
    }
    return prop.result;
  }
  return placeholderImage;
}

export function renderResolvedNode({
  contentEditable,
  disableTabNavigation,
  includeDataProps,
  resolvedNode,
  dsConfig,
  system,
  theme,
}: {
  contentEditable: boolean;
  disableTabNavigation: boolean;
  includeDataProps: boolean;
  resolvedNode: NoyaResolvedNode;
  dsConfig: DSConfig;
  system: DesignSystemDefinition;
  theme?: any; // Passed into components as _theme
}) {
  return ResolvedHierarchy.map<ReactNode>(
    resolvedNode,
    (element, transformedChildren, indexPath) => {
      if (element.type === 'noyaCompositeElement') {
        return transformedChildren;
      }

      if (element.type === 'noyaString') {
        if (!contentEditable) return element.value;

        const string = (element.value || ZERO_WIDTH_SPACE)
          // Typing a space in contentEditable will insert a non-breaking space
          // instead of a regular space. We want to replace it with a regular space.
          // This will let the text wrap normally.
          .replace('\u00A0', ' ')
          // If the string ends with a space, we want to replace it with a
          // non-breaking space so that it doesn't collapse.
          .replace(/ +$/, '\u00A0');

        const isEmpty = string === ZERO_WIDTH_SPACE;

        return (
          <span
            contentEditable
            key="editable-span"
            {...(includeDataProps && {
              'data-path': element.path.slice(0, -1).join('/'),
              'data-stringpath': element.path.join('/'),
            })}
            tabIndex={disableTabNavigation ? -1 : 1}
            style={{
              fontFamily: 'inherit',
              fontSize: 'inherit',
              fontWeight: 'inherit',
              fontStyle: 'inherit',
              color: 'inherit',
              ...(isEmpty
                ? {
                    minWidth: '10px',
                    minHeight: '10px',
                    background: 'rgba(179,215,254, 0.3)',
                    display: 'inline-block',
                  }
                : undefined),
            }}
          >
            {string}
          </span>
        );
      }

      if (element.componentID === selectOptionSymbolId) {
        return element.name ?? '';
      }

      const PrimitiveComponent: React.FC<any> =
        system.components[element.componentID];

      if (!PrimitiveComponent) return null;

      let classNames = element.classNames.map((className) => {
        return className.value.replace(
          /-primary-/,
          `-${dsConfig.colors.primary}-`,
        );
      });

      classNames = extractTailwindClassesByTheme(
        classNames,
        dsConfig.colorMode ?? 'light',
      );

      // Keep classNames starting with sm: and md:, but remove the prefixes.
      // Remove any classNames starting with lg:, xl:, and 2xl:.
      classNames = extractTailwindClassesByBreakpoint(classNames, 'md');

      const style = parametersToTailwindStyle(classNames);

      const variantClassName = findLast(classNames, (className) =>
        className.startsWith('variant-'),
      );
      const variant = variantClassName
        ? variantClassName.split('-')[1]
        : undefined;

      if (element.componentID === component.id.Table) return null;

      const namedProps = Object.fromEntries(
        element.props.map((prop) => [prop.name, prop]),
      );
      const srcProp = namedProps['src'];
      const placeholderProp = namedProps['placeholder'];

      const primaryScale = (tailwindColors as any)[
        dsConfig.colors.primary
      ] as Theme['colors']['primary'];

      // Render SVGs as React elements
      if (
        srcProp &&
        srcProp.type === 'generator' &&
        srcProp.generator === 'random-icon' &&
        srcProp.result
      ) {
        const rootElement = svgToReactElement(srcProp.result);

        if (!rootElement) return null;

        return {
          ...rootElement,
          key: indexPath.join('/'),
          props: {
            ...rootElement.props,
            style: {
              ...rootElement.props.style,
              ...style,
            },
            ...(includeDataProps && {
              'data-path': element.path.join('/'),
            }),
            ...(disableTabNavigation && { tabIndex: -1 }),
          },
        };
      }

      return (
        <PrimitiveComponent
          style={style}
          // We use the indexPath as the key, since the element ids aren't stable while
          // the layout is being generated.
          key={indexPath.join('/')}
          _passthrough={{
            ...(includeDataProps && {
              'data-path': element.path.join('/'),
            }),
            ...(disableTabNavigation && { tabIndex: -1 }),
          }}
          {...(variant && { variant })}
          {...(element.componentID === component.id.Progress && {
            value: (namedProps['value'] as NoyaNumberProp)?.value,
          })}
          {...((element.componentID === component.id.Textarea ||
            element.componentID === component.id.Input) &&
            element.children[0]?.type === 'noyaString' && {
              value: element.children[0].value,
            })}
          {...((element.componentID === component.id.Textarea ||
            element.componentID === component.id.Input) && {
            placeholder:
              placeholderProp && placeholderProp.type === 'string'
                ? placeholderProp.value
                : undefined,
          })}
          {...(element.componentID === component.id.Image && {
            // src: 'https://placehold.it/300x300',
            // src: 'https://picsum.photos/300/300',
            src:
              // If we have a result
              getImageFromProp(primaryScale, srcProp),
          })}
          {...(element.componentID === component.id.Select && {
            options: unique(transformedChildren),
          })}
          // Components with children
          {...((element.componentID === component.id.Box ||
            element.componentID === component.id.Button ||
            element.componentID === component.id.Link ||
            element.componentID === component.id.Tag ||
            element.componentID === component.id.Text ||
            element.componentID === component.id.Card) && {
            children: transformedChildren,
          })}
          // Components with labels
          {...((element.componentID === component.id.Checkbox ||
            element.componentID === component.id.Radio) && {
            label: transformedChildren,
          })}
          {...(theme && { _theme: theme })}
        />
      );
    },
  );
}
