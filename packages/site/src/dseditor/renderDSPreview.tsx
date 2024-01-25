import { darkTheme, lightTheme } from '@noya-app/noya-designsystem';
import { DSConfig } from 'noya-api';
import {
  ComponentThumbnailChrome,
  ComponentThumbnailSource,
  NoyaResolvedNode,
  renderResolvedNode,
} from 'noya-component';
import React from 'react';
import { DSRenderProps } from './DSRenderer';
import { closest } from './dom';

export function renderDSPreview({
  renderProps: props,
  dsConfig,
  resolvedNode,
  canvasBackgroundColor,
  padding,
  isThumbnail,
  chrome = 'none',
  height,
  thumbnail,
}: {
  renderProps: DSRenderProps;
  dsConfig: DSConfig;
  resolvedNode: NoyaResolvedNode;
  canvasBackgroundColor: string;
  padding?: number;
  isThumbnail?: boolean;
  chrome?: ComponentThumbnailChrome;
  height?: number;
  thumbnail?: ComponentThumbnailSource;
}) {
  const content = renderResolvedNode({
    // Thumbnails always use the largest breakpoint
    containerWidth: isThumbnail ? 9999 : props.size.width,
    contentEditable: true,
    disableTabNavigation: false,
    includeDataProps: true,
    resolvedNode,
    dsConfig,
    system: props.system,
    theme: props.theme,
    stylingMode: 'inline',
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

  if (isThumbnail) {
    computedBackgroundColor = `linear-gradient(to ${
      thumbnail?.position === 'bottom' ? 'top' : 'bottom'
    }, #fff 0%, hsla(0, 0%, 100%, 0.65) 100%)`;
  }

  const thumbnailAlignmentStyle =
    isThumbnail && thumbnail
      ? {
          justifyContent:
            thumbnail.position === 'bottom'
              ? 'end'
              : thumbnail.position === 'top'
              ? 'start'
              : 'center',
        }
      : {};

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
          // padding: '5vh 5vw',
          padding: '0',
          backgroundImage: undefined,
          justifyContent: 'center',
          ...thumbnailAlignmentStyle,
          flex: `0 0 ${thumbnail?.size?.height}px`,
          width: thumbnail?.size?.width,
          overflow: 'hidden',
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
            borderRadius: '48px',
            // border: '2px solid rgba(0,0,0,0.15)',
            // boxShadow: '0 16px 28px hsla(251, 46, 87, 0.4)',
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
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                padding: '12px 24px 0',
                gap: '12px',
                // borderBottom:
                //   colorMode === 'light'
                //     ? '4px solid rgba(0,0,0,0.1)'
                //     : '4px solid rgba(255,255,255,0.1)',
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
              flexDirection: 'column',
              ...(!isThumbnail && height && { height }),
              // overflowY: 'auto',
              // ...(isThumbnail && { flex: 1 }),
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
