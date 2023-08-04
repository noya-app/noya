import { DS } from 'noya-api';
import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import { Size, createResizeTransform, transformRect } from 'noya-geometry';
import { useSize } from 'noya-react-utils';
import { Layers, OverriddenBlockContent, Selectors } from 'noya-state';
import React, { ComponentProps, useCallback, useRef } from 'react';
import { DSRenderer } from '../../dseditor/DSRenderer';
import { Model } from '../../dseditor/builders';
import { initialComponents } from '../../dseditor/builtins';
import { renderResolvedNode } from '../../dseditor/renderDSPreview';
import { createResolvedNode } from '../../dseditor/traversal';
import { boxSymbolId } from '../symbols/symbolIds';
import { CustomLayerData } from '../types';

class ErrorBoundary extends React.Component<any> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch() {}

  render() {
    return this.props.children;
  }
}

function DOMRendererContent({
  size,
  resizeBehavior,
  padding = 0,
  ds,
  overriddenBlock,
  sync,
}: {
  size: Size;
  resizeBehavior: ResizeBehavior;
  padding?: number;
  ds: DS;
  overriddenBlock?: OverriddenBlockContent;
  sync: boolean;
}): JSX.Element {
  const [state] = useApplicationState();
  const { canvasInsets } = useWorkspace();
  const page = Selectors.getCurrentPage(state);
  const artboard = page.layers[0] as Sketch.Artboard;
  const rect = Selectors.getBoundingRect(page, [artboard.do_objectID])!;

  const containerTransform = createResizeTransform(artboard.frame, size, {
    scalingMode: 'down',
    // resizePosition: 'top',
    padding,
  });
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
  const transform =
    resizeBehavior === 'match-canvas' ? canvasTransform : containerTransform;

  const paddedRect = transformRect(rect, transform);

  const findComponent = useCallback(
    (id: string) =>
      initialComponents.find((component) => component.componentID === id),
    [],
  );

  return (
    <>
      <div
        style={{
          position: 'absolute',
          width: paddedRect.width,
          height: paddedRect.height,
          left: paddedRect.x,
          top: paddedRect.y,
          outline: '1px solid #e0e0e0',
        }}
      />
      <div
        style={{
          position: 'absolute',
          transform: transform.toString(),
          transformOrigin: 'top left',
          background: 'white',
          width: rect.width,
          height: rect.height,
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        <ErrorBoundary>
          <DSRenderer
            sourceName="@noya-design-system/chakra"
            primary="blue"
            renderContent={(props) => {
              const layers = artboard.layers.filter(
                Layers.isCustomLayer,
              ) as Sketch.CustomLayer<CustomLayerData>[];

              return layers.map((layer) => {
                const resolvedNode = createResolvedNode(
                  findComponent,
                  layer.data.node ??
                    Model.primitiveElement({
                      componentID: boxSymbolId,
                    }),
                );

                const content = renderResolvedNode({
                  resolvedNode,
                  primary: props.primary,
                  system: props.system,
                  highlightedPath: undefined,
                  selectionOutlineColor: 'blue',
                });

                return (
                  <div
                    style={{
                      position: 'absolute',
                      top: layer.frame.y,
                      left: layer.frame.x,
                      width: layer.frame.width,
                      height: layer.frame.height,
                      overflow: 'hidden',
                      display: 'flex',
                    }}
                  >
                    {content}
                  </div>
                );
              });
            }}
          />
        </ErrorBoundary>
      </div>
    </>
  );
}

type ResizeBehavior = 'match-canvas' | 'fit-container';

export function DOMRenderer(
  props: Omit<ComponentProps<typeof DOMRendererContent>, 'size'>,
): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useSize(containerRef);

  return (
    <div style={{ display: 'flex', flex: 1 }}>
      <div ref={containerRef} style={{ flex: 1, position: 'relative' }}>
        {size && <DOMRendererContent size={size} {...props} />}
      </div>
    </div>
  );
}
