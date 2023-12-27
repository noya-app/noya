import {
  DesignSystemDefinition,
  Theme,
  component,
} from '@noya-design-system/protocol';
import type { DSConfig } from 'noya-api';
import {
  NoyaNumberProp,
  NoyaProp,
  NoyaResolvedNode,
  ResolvedHierarchy,
  StylingMode,
  createPatternSVG,
  createSVG,
  placeholderImage,
  replaceColorPalette,
  svgToDataUri,
} from 'noya-component';
import {
  BreakpointKey,
  extractTailwindClassesByBreakpoint,
  extractTailwindClassesByTheme,
  matchBreakpoint,
  parametersToTailwindStyle,
  tailwindColors,
} from 'noya-tailwind';
import { findLast, unique } from 'noya-utils';
import React, { ReactNode } from 'react';
import { svgToReactElement } from './renderSVGElement';

export const selectOptionSymbolId = 'a4009f44-db30-4658-9bcb-7531434150bb';
export const ZERO_WIDTH_SPACE = '\u200b';

export function getImageFromProp(colors: Theme['colors'], prop?: NoyaProp) {
  switch (prop?.type) {
    case 'string': {
      return prop.value || placeholderImage;
    }
    case 'generator': {
      if (prop.generator === 'geometric') {
        return svgToDataUri(
          replaceColorPalette(
            prop.data ? createSVG(prop.data) : createPatternSVG(prop.query),
            colors,
          ),
        );
      }
      if (prop.result) {
        if (prop.result.startsWith('<svg')) {
          return svgToDataUri(prop.result);
        }
        return prop.result;
      }
    }
  }

  return placeholderImage;
}

export function renderResolvedNode({
  containerWidth,
  contentEditable,
  disableTabNavigation,
  includeDataProps,
  resolvedNode,
  dsConfig,
  system,
  stylingMode = 'inline',
  theme,
}: {
  containerWidth?: number;
  contentEditable: boolean;
  disableTabNavigation: boolean;
  includeDataProps: boolean;
  resolvedNode: NoyaResolvedNode;
  dsConfig: DSConfig;
  system: DesignSystemDefinition;
  stylingMode?: StylingMode;
  theme?: any;
}) {
  const noya = { theme, dsConfig };

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
            dangerouslySetInnerHTML={{ __html: string }}
          />
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

      let classNamesForRendering = extractTailwindClassesByTheme(
        classNames,
        dsConfig.colorMode ?? 'light',
      );

      let breakpoint: BreakpointKey = 'md';

      if (containerWidth) {
        breakpoint = matchBreakpoint(containerWidth);
      }

      // Keep classNames starting with sm: and md:, but remove the prefixes.
      // Remove any classNames starting with lg:, xl:, and 2xl:.
      classNamesForRendering = extractTailwindClassesByBreakpoint(
        classNamesForRendering,
        breakpoint,
      );

      const style = parametersToTailwindStyle(classNamesForRendering);

      const variantClassName = findLast(classNamesForRendering, (className) =>
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
      const neutralScale = (tailwindColors as any)[
        'slate'
      ] as Theme['colors']['neutral'];

      const stylingProps = {
        ...(stylingMode === 'tailwind' &&
          classNames.length > 0 && {
            className: classNames.join(' '),
          }),
        ...(stylingMode === 'inline' && { style }),
      };

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
            ...stylingProps,
            ...(includeDataProps && {
              'data-path': element.path.join('/'),
            }),
            ...(disableTabNavigation && { tabIndex: -1 }),
          },
        };
      }

      return (
        <PrimitiveComponent
          // We use the indexPath as the key, since the element ids aren't stable while
          // the layout is being generated.
          key={indexPath.join('/')}
          {...stylingProps}
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
              getImageFromProp(
                { primary: primaryScale, neutral: neutralScale },
                srcProp,
              ),
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
          {...(noya && { _noya: noya })}
        />
      );
    },
  );
}
