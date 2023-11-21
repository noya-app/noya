import { DSConfig } from 'noya-api';
import {
  ComponentThumbnailChrome,
  NoyaResolvedNode,
  renderResolvedNode,
} from 'noya-component';
import { darkTheme, lightTheme } from 'noya-designsystem';
import React from 'react';
import { DSRenderProps } from './DSRenderer';
import { closest } from './dom';

export function renderDSPreview({
  renderProps: props,
  highlightedPath,
  dsConfig,
  resolvedNode,
  canvasBackgroundColor,
  selectionOutlineColor,
  padding,
  isThumbnail,
  chrome = 'none',
}: {
  renderProps: DSRenderProps;
  highlightedPath: string[] | undefined;
  dsConfig: DSConfig;
  resolvedNode: NoyaResolvedNode;
  canvasBackgroundColor: string;
  selectionOutlineColor: string;
  padding?: number;
  isThumbnail?: boolean;
  chrome?: ComponentThumbnailChrome;
}) {
  // console.info(
  //   ResolvedHierarchy.diagram(resolvedNode, (node, indexPath) => {
  //     if (!node) return '()';
  //     if (node.type === 'noyaString') return `"${node.value}"`;
  //     return [node.name, `(${node.path.join('/')})`].filter(Boolean).join(' ');
  //   }),
  // );

  // const system = isThumbnail ? ThumbnailDesignSystem : props.system;

  const content = renderResolvedNode({
    isEditable: true,
    resolvedNode,
    dsConfig,
    selectionOutlineColor,
    highlightedPath,
    system: props.system,
    theme: isThumbnail ? props.theme : undefined,
  });

  const colorMode = dsConfig.colorMode ?? 'light';
  const noyaTheme = colorMode === 'light' ? lightTheme : darkTheme;
  const bgColor = noyaTheme.colors.canvas.background;
  const dotColor =
    colorMode === 'light' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.15)';

  let computedBackgroundColor = props.iframe.contentWindow?.getComputedStyle(
    props.iframe.contentDocument!.body,
  ).backgroundColor;

  // if computedBackgroundColor is transparent, set it to either white or dark gray
  if (computedBackgroundColor === 'rgba(0, 0, 0, 0)') {
    computedBackgroundColor = colorMode === 'light' ? '#fff' : '#111';
  }

  return (
    <div
      style={{
        backgroundImage: `radial-gradient(circle at 0px 0px, ${dotColor} 1px, ${bgColor} 0px)`,
        backgroundSize: '10px 10px',
        flex: 1,
        display: 'flex',
        alignItems: 'stretch',
        flexDirection: 'column',
        padding,
        position: 'relative',
        ...(isThumbnail && {
          padding: '5vh 5vw',
          backgroundImage: undefined,
          background: 'rgb(240, 240, 242)',
          justifyContent: 'center',
        }),
      }}
    >
      <div
        style={{
          display: 'flex',
          background: computedBackgroundColor,
          overflow: 'hidden',
          position: 'relative',
          transition: 'background 0.2s',
          ...(isThumbnail && {
            borderRadius: '16px',
            border: '2px solid rgba(0,0,0,0.15)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }),
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1',
          }}
        >
          {isThumbnail && chrome === 'window' && (
            <div
              style={{
                height: '52px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                gap: '12px',
                borderBottom:
                  colorMode === 'light'
                    ? '4px solid rgba(0,0,0,0.1)'
                    : '4px solid rgba(255,255,255,0.1)',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#f44',
                }}
              />
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#fc0',
                }}
              />
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#4c4',
                }}
              />
            </div>
          )}
          <div
            style={{
              display: 'flex',
              flex: '1',
              flexDirection: 'column',
            }}
          >
            {content}
          </div>
        </div>
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
