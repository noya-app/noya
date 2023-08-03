import { DesignSystemDefinition } from '@noya-design-system/protocol';
import { normalizeRange } from 'noya-state';
import { findLast } from 'noya-utils';
import React, { ReactNode } from 'react';
import {
  buttonSymbolId,
  imageSymbolId,
  inputSymbolId,
  linkSymbolId,
  selectSymbolId,
  tableSymbolId,
  tagSymbolId,
  textSymbolId,
  textareaSymbolId,
} from '../ayon/symbols/symbolIds';
import { parametersToTailwindStyle } from '../ayon/tailwind/tailwind';
import { DSRenderProps } from './DSRenderer';
import { contentReducer } from './contentReducer';
import { SerializedSelection, ZERO_WIDTH_SPACE, closest } from './dom';
import { ResolvedHierarchy } from './traversal';
import { NoyaResolvedNode, NoyaResolvedString } from './types';

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

      if (element.type === 'noyaString') {
        return (element.value || ZERO_WIDTH_SPACE).replace(/ +/, '\u00A0');
      }

      if (element.type === 'noyaCompositeElement') {
        return transformedChildren;
      }

      const isChildHighlighted = element.children.some(
        (child) =>
          child.type === 'noyaString' &&
          child.path.join() === highlightedPath?.join(),
      );
      const isHighlighted =
        element.path.join() === highlightedPath?.join() || isChildHighlighted;

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
          {...(element.componentID !== imageSymbolId &&
            element.componentID !== inputSymbolId &&
            element.componentID !== selectSymbolId && {
              children: transformedChildren,
            })}
          {...(element.componentID === textareaSymbolId && {
            value: element.children[0],
          })}
          _passthrough={{
            'data-path': element.path.join('/'),
            contentEditable:
              element.componentID === buttonSymbolId ||
              element.componentID === tagSymbolId ||
              element.componentID === linkSymbolId ||
              element.componentID === textSymbolId,
            ...(element.children[0]?.type === 'noyaString' && {
              'data-stringpath': element.children[0].path.join('/'),
            }),
          }}
        />
      );
    },
  );
}

export function renderDSPreview({
  renderProps: props,
  handleSetTextAtPath,
  highlightedPath,
  primary,
  resolvedNode,
  serializedSelection,
  canvasBackgroundColor,
  selectionOutlineColor,
  setHighlightedPath,
  setSerializedSelection,
}: {
  renderProps: DSRenderProps;
  handleSetTextAtPath: ({
    path,
    value,
  }: {
    path: string[];
    value: string;
  }) => void;
  highlightedPath: string[] | undefined;
  primary: string;
  resolvedNode: NoyaResolvedNode;
  serializedSelection: SerializedSelection | undefined;
  canvasBackgroundColor: string;
  selectionOutlineColor: string;
  setHighlightedPath: (path: string[] | undefined) => void;
  setSerializedSelection: (selection: SerializedSelection) => void;
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

  const iframe = props.iframe;

  return (
    <div
      style={{
        backgroundImage: `radial-gradient(circle at 0px 0px, rgba(0,0,0,0.25) 1px, ${canvasBackgroundColor} 0px)`,
        backgroundSize: '10px 10px',
        minHeight: '100%',
        display: 'flex',
        alignItems: 'stretch',
        flexDirection: 'column',
        padding: '20px',
        position: 'relative',
      }}
      onMouseMove={(event) => {
        const window = iframe.contentWindow;
        const document = iframe.contentDocument;

        if (!document || !window) return;

        if (document) {
          const elements = document.elementsFromPoint(
            event.clientX,
            event.clientY,
          );

          const element = elements.find(
            (element): element is HTMLElement =>
              element instanceof
                (window as unknown as typeof globalThis).HTMLElement &&
              !!element.dataset.path,
          );

          // console.log(elements);
          if (element) {
            if (element.dataset.path !== highlightedPath?.join('/')) {
              setHighlightedPath(element.dataset.path?.split('/'));
            }
          } else {
            if (highlightedPath) {
              setHighlightedPath(undefined);
            }
          }
        }
      }}
      onKeyDownCapture={(event) => {
        const target = event.target as HTMLElement;

        // Handle space manually
        if (event.key === ' ') {
          // Prevent ' ' from getting inserted automatically and triggering beforeinput.
          // Also prevent triggering buttons.
          event.preventDefault();

          const path = findStringElementPath(target);

          if (!path) return;

          const stringNode = ResolvedHierarchy.find<NoyaResolvedString>(
            resolvedNode,
            (node): node is NoyaResolvedString =>
              node.type === 'noyaString' &&
              node.path.join('/') === path.join('/'),
          );

          if (!stringNode) return;

          const content = contentReducer(stringNode.value, {
            insertText: ' ',
            range: normalizeRange([
              serializedSelection?.anchorOffset ?? 0,
              serializedSelection?.focusOffset ?? 0,
            ]),
          });

          handleSetTextAtPath({ path, value: content.string });

          if (serializedSelection) {
            setSerializedSelection({
              ...serializedSelection,
              anchorOffset: content.range[0],
              focusOffset: content.range[1],
            });
          }
        }
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
