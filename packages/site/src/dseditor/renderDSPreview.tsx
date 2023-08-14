import { DesignSystemDefinition } from '@noya-design-system/protocol';
import { findLast } from 'noya-utils';
import React, { ReactNode } from 'react';
import {
  boxSymbolId,
  buttonSymbolId,
  checkboxSymbolId,
  imageSymbolId,
  inputSymbolId,
  linkSymbolId,
  radioSymbolId,
  tableSymbolId,
  tagSymbolId,
  textSymbolId,
  textareaSymbolId,
} from '../ayon/symbols/symbolIds';
import { parametersToTailwindStyle } from '../ayon/tailwind/tailwind';
import { DSRenderProps } from './DSRenderer';
import { ZERO_WIDTH_SPACE, closest } from './dom';
import { ResolvedHierarchy } from './traversal';
import { NoyaResolvedNode } from './types';

export function renderResolvedNode({
  resolvedNode,
  primary,
  selectionOutlineColor,
  highlightedPath,
  system,
}: {
  resolvedNode: NoyaResolvedNode;
  primary: string;
  selectionOutlineColor: string;
  highlightedPath: string[] | undefined;
  system: DesignSystemDefinition;
}) {
  return ResolvedHierarchy.map<ReactNode>(
    resolvedNode,
    (element, transformedChildren) => {
      if (element.status === 'removed') return null;

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
            contentEditable
            key="editable-span"
            data-path={element.path.slice(0, -1).join('/')}
            data-stringpath={element.path.join('/')}
            tabIndex={1}
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

      const isHighlighted = element.path.join() === highlightedPath?.join();

      const PrimitiveComponent: React.FC<any> =
        system.components[element.componentID];

      if (!PrimitiveComponent) return null;

      const classNames = element.classNames
        .filter((className) => className.status !== 'removed')
        .map((className) => {
          return className.value.replace(/-primary-/, `-${primary}-`);
        });

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

      return (
        <PrimitiveComponent
          style={style}
          key={element.path.join('/')}
          {...(variant && { variant })}
          {...((element.componentID === textareaSymbolId ||
            element.componentID === inputSymbolId) &&
            element.children[0]?.type === 'noyaString' && {
              value: element.children[0].value,
            })}
          {...(element.componentID === imageSymbolId && {
            src: 'https://picsum.photos/300/300',
          })}
          // Components with children
          {...((element.componentID === boxSymbolId ||
            element.componentID === buttonSymbolId ||
            element.componentID === linkSymbolId ||
            element.componentID === tagSymbolId ||
            element.componentID === textSymbolId) && {
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
  primary,
  resolvedNode,
  canvasBackgroundColor,
  selectionOutlineColor,
}: {
  renderProps: DSRenderProps;
  highlightedPath: string[] | undefined;
  primary: string;
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
    resolvedNode,
    primary,
    selectionOutlineColor,
    highlightedPath,
    system: props.system,
  });

  return (
    <div
      style={{
        backgroundImage: `radial-gradient(circle at 0px 0px, rgba(0,0,0,0.25) 1px, ${canvasBackgroundColor} 0px)`,
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
          background: 'white',
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
