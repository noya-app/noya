import { DS } from 'noya-api';
import { useWorkspace } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import { Size, createResizeTransform, transformRect } from 'noya-geometry';
import { useSize } from 'noya-react-utils';
import { Layers, OverriddenBlockContent, Selectors } from 'noya-state';
import React, { ComponentProps, forwardRef, useCallback, useRef } from 'react';
import { DSControlledRenderer } from '../../dseditor/DSControlledRenderer';
import { IDSRenderer } from '../../dseditor/DSRenderer';
import { Model } from '../../dseditor/builders';
import { initialComponents } from '../../dseditor/builtins';
import { renderResolvedNode } from '../../dseditor/renderDSPreview';
import {
  ResolvedHierarchy,
  createResolvedNode,
  embedRootLevelDiff,
} from '../../dseditor/traversal';
import { NoyaResolvedString } from '../../dseditor/types';
import { useAyonState } from '../state/ayonState';
import { boxSymbolId, textSymbolId } from '../symbols/symbolIds';
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

const DOMRendererContent = forwardRef(function DOMRendererContent(
  {
    size,
    resizeBehavior,
    padding = 0,
    ds,
    overriddenBlock,
    sync,
    highlightedPath,
    setHighlightedPath,
  }: {
    size: Size;
    resizeBehavior: ResizeBehavior;
    padding?: number;
    ds: DS;
    overriddenBlock?: OverriddenBlockContent;
    sync: boolean;
    highlightedPath?: string[];
    setHighlightedPath?: (path: string[] | undefined) => void;
  },
  forwardedRef: React.ForwardedRef<IDSRenderer>,
): JSX.Element {
  const [state, dispatch] = useAyonState();
  const { canvasInsets } = useWorkspace();
  const page = Selectors.getCurrentPage(state);
  const artboard = page.layers[0] as Sketch.Artboard;
  const rect = Selectors.getBoundingRect(page, [artboard.do_objectID])!;
  const editingLayerId =
    state.interactionState.type === 'editingBlock'
      ? state.interactionState.layerId
      : undefined;
  const selectedLayerId =
    state.selectedLayerIds.length === 1 ? state.selectedLayerIds[0] : undefined;

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
          <DSControlledRenderer
            ref={forwardedRef}
            sourceName="@noya-design-system/chakra"
            primary="blue"
            onChangeTextAtPath={({ path, value }) => {
              const layer = artboard.layers
                .filter(Layers.isCustomLayer<CustomLayerData>)
                .find((layer) => layer.do_objectID === editingLayerId);

              if (!layer || !layer.data.node) return undefined;

              const newNode = embedRootLevelDiff(
                layer.data.node,
                Model.diff([Model.diffItem({ path, textValue: value })]),
              );

              dispatch('setLayerNode', layer.do_objectID, newNode);
            }}
            getStringValueAtPath={(path) => {
              const layer = artboard.layers
                .filter(Layers.isCustomLayer<CustomLayerData>)
                .find((layer) => layer.do_objectID === editingLayerId);

              if (!layer) return undefined;

              const resolvedNode = createResolvedNode(
                findComponent,
                layer.data.node ??
                  Model.primitiveElement({
                    componentID: boxSymbolId,
                  }),
              );

              if (!resolvedNode) return undefined;

              return ResolvedHierarchy.find<NoyaResolvedString>(
                resolvedNode,
                (node): node is NoyaResolvedString =>
                  node.type === 'noyaString' &&
                  node.path.join('/') === path.join('/'),
              )?.value;
            }}
            renderContent={(props) => {
              const layers = artboard.layers.filter(
                Layers.isCustomLayer<CustomLayerData>,
              );

              return layers.map((layer) => {
                const resolvedNode = createResolvedNode(
                  findComponent,
                  layer.data.node ??
                    Model.primitiveElement({
                      componentID: boxSymbolId,
                      classNames: [
                        'flex-1',
                        'flex',
                        'items-center',
                        'justify-center',
                        'bg-slate-50',
                      ],
                      children: [
                        layer.data.description === undefined
                          ? Model.primitiveElement({
                              componentID: textSymbolId,
                              children: [
                                Model.string(
                                  `Generating ${layer.name} description...`,
                                ),
                              ],
                            })
                          : Model.primitiveElement({
                              componentID: textSymbolId,
                              children: [
                                Model.string(
                                  `Generating ${layer.name} layout...`,
                                ),
                              ],
                            }),
                      ],
                    }),
                );

                const content = renderResolvedNode({
                  resolvedNode,
                  primary: props.primary,
                  system: props.system,
                  highlightedPath:
                    layer.do_objectID === selectedLayerId
                      ? highlightedPath
                      : undefined,
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
});

type ResizeBehavior = 'match-canvas' | 'fit-container';

export const DOMRenderer = forwardRef(function DOMRenderer(
  props: Omit<ComponentProps<typeof DOMRendererContent>, 'size'>,
  forwardedRef: React.ForwardedRef<IDSRenderer>,
): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useSize(containerRef);

  return (
    <div style={{ display: 'flex', flex: 1 }}>
      <div ref={containerRef} style={{ flex: 1, position: 'relative' }}>
        {size && (
          <DOMRendererContent ref={forwardedRef} size={size} {...props} />
        )}
      </div>
    </div>
  );
});
