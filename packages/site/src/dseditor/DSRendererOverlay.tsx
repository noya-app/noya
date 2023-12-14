import { useDesignSystemTheme } from 'noya-designsystem';
import { Rect } from 'noya-geometry';
import { useDeepState } from 'noya-react-utils';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
} from 'react';
import { IDSRenderer } from './DSRenderer';

interface Props {
  highlightedPath?: string[];
  rendererRef: React.RefObject<IDSRenderer | undefined>;
}

export type IRendererOverlay = {
  update: () => void;
};

/**
 * Propagate mouse events to the renderer
 */
export const DSRendererOverlay = memo(
  forwardRef(function DSRendererOverlay(
    { highlightedPath, rendererRef }: Props,
    forwardedRef: React.ForwardedRef<IRendererOverlay>,
  ) {
    const theme = useDesignSystemTheme();
    const [highlightRect, setHighlightRect] = useDeepState<Rect>();

    const update = useCallback(
      (highlightedPath: string[] | undefined) => {
        const iframe = rendererRef.current?.getIframe();

        if (!iframe) return;

        if (!highlightedPath) {
          setHighlightRect(undefined);
          return;
        }

        const element = getDOMNodeByPath(iframe, highlightedPath);

        if (!element) {
          setHighlightRect(undefined);
          return;
        }

        const rect = element.getBoundingClientRect();

        setHighlightRect({
          x: Math.floor(rect.x),
          y: Math.floor(rect.y),
          width: Math.ceil(rect.width),
          height: Math.ceil(rect.height),
        });
      },
      [rendererRef, setHighlightRect],
    );

    useImperativeHandle(
      forwardedRef,
      () => ({
        update: () => update(highlightedPath),
      }),
      [highlightedPath, update],
    );

    useEffect(() => {
      update(highlightedPath);
    }, [highlightedPath, update]);

    return (
      <div
        style={{ position: 'absolute', inset: 0, cursor: 'text' }}
        onMouseDown={(event) => {
          event.preventDefault();
          rendererRef.current?.mouseDown({
            point: {
              x: event.nativeEvent.offsetX,
              y: event.nativeEvent.offsetY,
            },
          });
        }}
        onMouseMove={(event) => {
          event.preventDefault();
          rendererRef.current?.mouseMove({
            point: {
              x: event.nativeEvent.offsetX,
              y: event.nativeEvent.offsetY,
            },
          });
        }}
        onMouseUp={(event) => {
          event.preventDefault();
          rendererRef.current?.mouseUp({
            point: {
              x: event.nativeEvent.offsetX,
              y: event.nativeEvent.offsetY,
            },
          });
        }}
        onWheel={(event) => {
          setHighlightRect(undefined);

          rendererRef.current?.mouseWheel({
            delta: {
              x: event.deltaX,
              y: event.deltaY,
            },
            point: {
              x: event.nativeEvent.offsetX,
              y: event.nativeEvent.offsetY,
            },
          });
        }}
      >
        {highlightRect && (
          <div
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              border: `1px solid ${theme.colors.primary}`,
              width: highlightRect.width,
              height: highlightRect.height,
              left: highlightRect.x,
              top: highlightRect.y,
            }}
          />
        )}
      </div>
    );
  }),
);

function getDOMNodeByPath(iframe: HTMLIFrameElement, path: string[]) {
  const document = iframe.contentDocument!;

  const element = document.querySelector(`[data-path="${path.join('/')}"]`);

  return element as HTMLElement | undefined;
}
