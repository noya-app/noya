import {
  DesignSystemDefinition,
  Theme,
  component,
} from '@noya-design-system/protocol';
import { DSConfig } from 'noya-api';
import { darkTheme, lightTheme } from 'noya-designsystem';
import { findLast, unique } from 'noya-utils';
import React, { ReactNode } from 'react';
import {
  boxSymbolId,
  buttonSymbolId,
  checkboxSymbolId,
  imageSymbolId,
  inputSymbolId,
  linkSymbolId,
  radioSymbolId,
  selectOptionSymbolId,
  selectSymbolId,
  tableSymbolId,
  tagSymbolId,
  textSymbolId,
  textareaSymbolId,
} from '../ayon/symbols/symbolIds';
import {
  extractTailwindClassesByBreakpoint,
  extractTailwindClassesByTheme,
  parametersToTailwindStyle,
} from '../ayon/tailwind/tailwind';
import { tailwindColors } from '../ayon/tailwind/tailwind.config';
import {
  createPatternSVG,
  placeholderImage,
  replaceColorPalette,
  svgToDataUri,
} from '../ayon/utils/patterns';
import { DSRenderProps } from './DSRenderer';
import { ZERO_WIDTH_SPACE, closest } from './dom';
import { ResolvedHierarchy } from './resolvedHierarchy';
import { NoyaProp, NoyaResolvedNode } from './types';

function getImageFromProp(
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
    return prop.result;
  }
  return placeholderImage;
}

export function renderResolvedNode({
  isEditable,
  resolvedNode,
  dsConfig,
  selectionOutlineColor,
  highlightedPath,
  system,
}: {
  isEditable: boolean;
  resolvedNode: NoyaResolvedNode;
  dsConfig: DSConfig;
  selectionOutlineColor: string;
  highlightedPath: string[] | undefined;
  system: DesignSystemDefinition;
}) {
  return ResolvedHierarchy.map<ReactNode>(
    resolvedNode,
    (element, transformedChildren, indexPath) => {
      if (element.type === 'noyaCompositeElement') {
        return transformedChildren;
      }

      if (element.type === 'noyaString') {
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
            contentEditable={isEditable}
            key="editable-span"
            data-path={element.path.slice(0, -1).join('/')}
            data-stringpath={element.path.join('/')}
            tabIndex={isEditable ? 1 : -1}
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

      const isHighlighted = element.path.join() === highlightedPath?.join();

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

      if (isHighlighted) {
        Object.assign(style, {
          outline: `1px solid ${selectionOutlineColor}`,
        });
      }

      const variantClassName = findLast(classNames, (className) =>
        className.startsWith('variant-'),
      );
      const variant = variantClassName
        ? variantClassName.split('-')[1]
        : undefined;

      if (element.componentID === tableSymbolId) return null;

      const namedProps = Object.fromEntries(
        element.props.map((prop) => [prop.name, prop]),
      );
      const srcProp = namedProps['src'];
      const placeholderProp = namedProps['placeholder'];

      const primaryScale = (tailwindColors as any)[
        dsConfig.colors.primary
      ] as Theme['colors']['primary'];

      return (
        <PrimitiveComponent
          style={style}
          // We use the indexPath as the key, since the element ids aren't stable while
          // the layout is being generated.
          key={indexPath.join('/')}
          _passthrough={{
            'data-path': element.path.join('/'),
            ...(!isEditable && { tabIndex: -1 }),
          }}
          {...(variant && { variant })}
          {...((element.componentID === textareaSymbolId ||
            element.componentID === inputSymbolId) &&
            element.children[0]?.type === 'noyaString' && {
              value: element.children[0].value,
            })}
          {...((element.componentID === textareaSymbolId ||
            element.componentID === inputSymbolId) && {
            placeholder:
              placeholderProp && placeholderProp.type === 'string'
                ? placeholderProp.value
                : undefined,
          })}
          {...(element.componentID === imageSymbolId && {
            // src: 'https://placehold.it/300x300',
            // src: 'https://picsum.photos/300/300',
            src:
              // If we have a result
              getImageFromProp(primaryScale, srcProp),
          })}
          {...(element.componentID === selectSymbolId && {
            options: unique(transformedChildren),
          })}
          // Components with children
          {...((element.componentID === boxSymbolId ||
            element.componentID === buttonSymbolId ||
            element.componentID === linkSymbolId ||
            element.componentID === tagSymbolId ||
            element.componentID === textSymbolId ||
            element.componentID === component.id.Card) && {
            children: transformedChildren,
          })}
          // Components with labels
          {...((element.componentID === checkboxSymbolId ||
            element.componentID === radioSymbolId) && {
            label: transformedChildren,
          })}
        />
      );
    },
  );
}

export function renderDSPreview({
  renderProps: props,
  highlightedPath,
  dsConfig,
  resolvedNode,
  canvasBackgroundColor,
  selectionOutlineColor,
}: {
  renderProps: DSRenderProps;
  highlightedPath: string[] | undefined;
  dsConfig: DSConfig;
  resolvedNode: NoyaResolvedNode;
  canvasBackgroundColor: string;
  selectionOutlineColor: string;
}) {
  // console.info(
  //   ResolvedHierarchy.diagram(resolvedNode, (node, indexPath) => {
  //     if (!node) return '()';
  //     if (node.type === 'noyaString') return `"${node.value}"`;
  //     return [node.name, `(${node.path.join('/')})`].filter(Boolean).join(' ');
  //   }),
  // );

  const content = renderResolvedNode({
    isEditable: true,
    resolvedNode,
    dsConfig,
    selectionOutlineColor,
    highlightedPath,
    system: props.system,
  });

  const colorMode = dsConfig.colorMode ?? 'light';
  const noyaTheme = colorMode === 'light' ? lightTheme : darkTheme;
  const bgColor = noyaTheme.colors.canvas.background;
  const dotColor =
    colorMode === 'light' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.15)';

  const computedBackgroundColor = props.iframe.contentWindow?.getComputedStyle(
    props.iframe.contentDocument!.body,
  ).backgroundColor;

  return (
    <div
      style={{
        backgroundImage: `radial-gradient(circle at 0px 0px, ${dotColor} 1px, ${bgColor} 0px)`,
        backgroundSize: '10px 10px',
        flex: 1,
        display: 'flex',
        alignItems: 'stretch',
        flexDirection: 'column',
        padding: '20px',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          background: computedBackgroundColor,
          overflow: 'hidden',
          position: 'relative',
          transition: 'background 0.2s',
        }}
      >
        {content}
      </div>
    </div>
  );
}

export function findStringElementPath(element: HTMLElement | null) {
  const parent = closest(
    element,
    (element) => !!('dataset' in element && element.dataset.stringpath),
  );

  return parent?.dataset.stringpath?.split('/');
}
