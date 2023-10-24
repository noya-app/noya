import { DS, useNoyaClientOrFallback } from 'noya-api';
import { useWorkspace } from 'noya-app-state-context';
import { lightTheme } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { AffineTransform, Size, createResizeTransform } from 'noya-geometry';
import { useSize } from 'noya-react-utils';
import { RenderingMode } from 'noya-renderer';
import { Layers, Selectors, getClippedLayerMap } from 'noya-state';
import React, {
  ComponentProps,
  forwardRef,
  memo,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import styled from 'styled-components';
import { DSControlledRenderer } from '../../dseditor/DSControlledRenderer';
import { IDSRenderer } from '../../dseditor/DSRenderer';
import { Model } from '../../dseditor/builders';
import { initialComponents } from '../../dseditor/builtins';
import { renderResolvedNode } from '../../dseditor/renderDSPreview';
import { ResolvedHierarchy } from '../../dseditor/resolvedHierarchy';
import { createResolvedNode, unresolve } from '../../dseditor/traversal';
import { NoyaNode, NoyaResolvedString } from '../../dseditor/types';
import { useAyonState } from '../state/ayonState';
import { boxSymbolId, textSymbolId } from '../symbols/symbolIds';
import { CustomLayerData, NodePath } from '../types';
import { useManagedLayouts } from './GeneratedLayoutContext';

const CanvasElement = styled.div<{ transform: string }>(({ transform }) => ({
  inset: 0,
  position: 'absolute',
  transform,
  transformOrigin: 'top left',
  overflow: 'visible',
}));

const ArtboardElement = styled.div<{ rect: Sketch.Rect }>(({ rect }) => ({
  position: 'absolute',
  top: rect.y,
  left: rect.x,
  width: rect.width,
  height: rect.height,
  outline: '1px solid #e0e0e0',
  backgroundColor: '#fff',
}));

const WrapperElement = styled.div({
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  display: 'flex',
});

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

const DOMRendererContent = memo(
  forwardRef(function DOMRendererContent(
    {
      size,
      resizeBehavior,
      padding = 0,
      ds,
      overriddenBlock,
      sync,
      highlightedNodePath,
      setHighlightedNodePath,
      renderingMode,
    }: {
      size: Size;
      resizeBehavior: ResizeBehavior;
      padding?: number;
      ds: DS;
      overriddenBlock?: NoyaNode;
      sync: boolean;
      highlightedNodePath?: NodePath;
      setHighlightedNodePath?: (path: NodePath | undefined) => void;
      renderingMode?: RenderingMode;
    },
    forwardedRef: React.ForwardedRef<IDSRenderer>,
  ): JSX.Element {
    const client = useNoyaClientOrFallback();
    const generatedLayouts = useManagedLayouts();
    const [state, dispatch] = useAyonState();
    const { canvasInsets, canvasSize } = useWorkspace();

    const page = Selectors.getCurrentPage(state);
    const editingLayerId =
      state.interactionState.type === 'editingBlock'
        ? state.interactionState.layerId
        : undefined;
    const selectedLayerId =
      state.selectedLayerIds.length === 1
        ? state.selectedLayerIds[0]
        : undefined;

    function getTransform() {
      const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);

      if (resizeBehavior === 'match-canvas') return canvasTransform;

      const artboard = page.layers.at(0);

      if (!artboard) return AffineTransform.identity;

      return createResizeTransform(artboard.frame, size, {
        scalingMode: 'down',
        padding,
      });
    }

    const transform = getTransform();

    const findComponent = useCallback(
      (id: string) =>
        initialComponents.find((component) => component.componentID === id),
      [],
    );

    const clippedLayerMap = useMemo(
      () =>
        renderingMode === 'static'
          ? {}
          : getClippedLayerMap(state, canvasSize, canvasInsets),
      [canvasInsets, canvasSize, renderingMode, state],
    );

    return (
      <CanvasElement transform={transform.toString()}>
        {page.layers
          .filter(Layers.isArtboard)
          .filter((artboard) => !clippedLayerMap[artboard.do_objectID])
          .map((artboard) => {
            const containsEditingLayer = artboard.layers.some(
              (layer) => layer.do_objectID === editingLayerId,
            );
            // Attach the ref to the currently edited layer
            const editingRef = containsEditingLayer ? forwardedRef : undefined;

            return (
              <ArtboardElement key={artboard.do_objectID} rect={artboard.frame}>
                <WrapperElement>
                  <ErrorBoundary>
                    <DSControlledRenderer
                      ref={editingRef}
                      sourceName={ds.source.name}
                      config={ds.config}
                      sync={sync}
                      setHighlightedPath={(path) => {
                        if (!selectedLayerId) return;

                        setHighlightedNodePath?.(
                          path ? { layerId: selectedLayerId, path } : undefined,
                        );
                      }}
                      onChangeTextAtPath={({ path, value }) => {
                        const layer = artboard.layers
                          .filter(Layers.isCustomLayer<CustomLayerData>)
                          .find(
                            (layer) => layer.do_objectID === editingLayerId,
                          );

                        if (!layer || !layer.data.node) return undefined;

                        const resolvedNode = createResolvedNode(
                          findComponent,
                          layer.data.node,
                        );

                        const indexPath = ResolvedHierarchy.findIndexPath(
                          resolvedNode,
                          (node) => node.path.join('/') === path.join('/'),
                        );

                        if (!indexPath) return;

                        const originalNode = ResolvedHierarchy.access(
                          resolvedNode,
                          indexPath,
                        ) as NoyaResolvedString;

                        const newResolvedNode = ResolvedHierarchy.replace(
                          resolvedNode,
                          {
                            at: indexPath,
                            node: { ...originalNode, value },
                          },
                        );

                        const newNode = unresolve(newResolvedNode);

                        dispatch(
                          'setLayerNode',
                          layer.do_objectID,
                          newNode,
                          'keep',
                        );
                      }}
                      getStringValueAtPath={(path) => {
                        const layer = artboard.layers
                          .filter(Layers.isCustomLayer<CustomLayerData>)
                          .find(
                            (layer) => layer.do_objectID === editingLayerId,
                          );

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
                          function createLoadingNode() {
                            if (!layer.data.description) return;

                            const key = client.componentLayoutCacheKey(
                              layer.name,
                              layer.data.description,
                            );

                            const layouts = generatedLayouts[key];
                            const activeIndex =
                              layer.data.activeGenerationIndex ?? 0;

                            if (!layouts || !layouts[activeIndex])
                              return undefined;

                            return layouts[activeIndex].node;
                          }

                          function createPlaceholderNode() {
                            return Model.primitiveElement({
                              componentID: boxSymbolId,
                              classNames: [
                                Model.className('flex-1'),
                                Model.className('flex'),
                                Model.className('items-center'),
                                Model.className('justify-center'),
                                Model.className('text-center'),
                                Model.className('p-4'),
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
                            });
                          }

                          const resolvedNode = createResolvedNode(
                            findComponent,
                            layer.do_objectID === selectedLayerId &&
                              overriddenBlock
                              ? overriddenBlock
                              : layer.data.node ??
                                  createLoadingNode() ??
                                  createPlaceholderNode(),
                          );

                          const content = renderResolvedNode({
                            isEditable: layer.do_objectID === editingLayerId,
                            resolvedNode,
                            dsConfig: ds.config,
                            system: props.system,
                            highlightedPath:
                              highlightedNodePath &&
                              layer.do_objectID === highlightedNodePath.layerId
                                ? highlightedNodePath.path
                                : undefined,
                            selectionOutlineColor: lightTheme.colors.secondary,
                          });

                          return (
                            <div
                              key={layer.do_objectID}
                              className={
                                !layer.data.node
                                  ? 'noya-skeleton-shimmer'
                                  : undefined
                              }
                              style={{
                                position: 'absolute',
                                top: layer.frame.y,
                                left: layer.frame.x,
                                width: layer.frame.width,
                                height: layer.frame.height,
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                            >
                              {content}
                            </div>
                          );
                        });
                      }}
                    />
                  </ErrorBoundary>
                </WrapperElement>
              </ArtboardElement>
            );
          })}
      </CanvasElement>
    );
  }),
);

type ResizeBehavior = 'match-canvas' | 'fit-container';

export const DOMRenderer = memo(
  forwardRef(function DOMRenderer(
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
  }),
);
