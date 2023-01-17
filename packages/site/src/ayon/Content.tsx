import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import { CanvasKitRenderer, Interactions, SimpleCanvas } from 'noya-canvas';
import { Design, RenderingModeProvider } from 'noya-renderer';
import { DrawableLayerType, Layers, Selectors } from 'noya-state';
import { SVGRenderer } from 'noya-svg-renderer';
import { isExternalUrl } from 'noya-utils';
import React, { memo, useEffect, useRef } from 'react';
import { ImperativePanelHandle } from 'react-resizable-panels';
import styled from 'styled-components';
import { DOMRenderer } from './DOMRenderer';
import { inferBlockType, inferBlockTypes } from './inferBlock';
import { Panel } from './Panel';
import { RedirectResolver } from './RedirectResolver';
import { Stacking } from './stacking';
import { buttonSymbol, imageSymbolId } from './symbols';
import { DrawingWidget, Widget } from './Widget';

const Overlay = styled.div({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
});

const redirectResolver = new RedirectResolver();

export const Content = memo(function Content() {
  const { canvasSize, isContextMenuOpen } = useWorkspace();
  const [state, dispatch] = useApplicationState();
  const layers = Layers.flat(Selectors.getCurrentPage(state)).filter(
    Layers.isSymbolInstance,
  );
  const panelRef = useRef<ImperativePanelHandle>(null);

  useEffect(() => {
    const subscriptions: Array<() => void> = [];

    layers.forEach((layer) => {
      const {
        blockText,
        resolvedBlockData,
        frame,
        symbolID,
        do_objectID: layerId,
      } = layer;

      if (typeof blockText !== 'string') return;

      // Already resolved
      if (resolvedBlockData && resolvedBlockData.originalText === blockText) {
        return;
      }

      if (symbolID === imageSymbolId && !isExternalUrl(blockText)) {
        const unsplashUrl = `https://source.unsplash.com/${frame.width}x${frame.height}?${blockText}`;

        redirectResolver.resolve(layerId, unsplashUrl);

        subscriptions.push(
          redirectResolver.addListener(layerId, unsplashUrl, (resolvedUrl) => {
            dispatch('setResolvedBlockData', layerId, {
              originalText: blockText,
              resolvedText: resolvedUrl,
              symbolID: symbolID,
            });
          }),
        );
      }
    });

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [dispatch, layers]);

  return (
    <Panel.Root direction="horizontal" autoSaveId="ayon-canvas">
      <Panel.Item ref={panelRef} collapsible defaultSize={75}>
        <SimpleCanvas
          interactions={[
            Interactions.duplicate,
            Interactions.reorder,
            Interactions.zoom,
            Interactions.escape,
            Interactions.history,
            Interactions.clipboard,
            Interactions.editText,
            Interactions.editBlock,
            Interactions.focus,
            Interactions.pan,
            Interactions.createScale({ inferBlockType }),
            Interactions.createInsertMode({ inferBlockType }),
            Interactions.selection,
            Interactions.move,
            Interactions.createDrawing({
              allowDrawingFromNoneState: true,
              inferBlockType,
            }),
          ]}
          widgets={
            <>
              {layers.map((layer) => (
                <Widget
                  key={layer.do_objectID}
                  layer={layer}
                  inferBlockTypes={inferBlockTypes}
                  onChangeBlockType={(type: DrawableLayerType) => {
                    dispatch(
                      'setSymbolInstanceSource',
                      typeof type !== 'string'
                        ? type.symbolId
                        : buttonSymbol.symbolID,
                      'preserveCurrent',
                    );
                  }}
                />
              ))}
              {state.interactionState.type === 'drawing' && (
                <DrawingWidget inferBlockType={inferBlockType} />
              )}
            </>
          }
        >
          {({ size }) => (
            <>
              <CanvasKitRenderer size={size}>
                <RenderingModeProvider value="interactive">
                  <Design.Root>
                    <Design.Background />
                    <Design.Page />
                    <Design.PixelGrid />
                    <Design.Marquee />
                    <Design.GradientEditor />
                    <Design.InsertSymbol />
                    <Design.DrawPath />
                    <Design.EditPath />
                  </Design.Root>
                </RenderingModeProvider>
              </CanvasKitRenderer>
            </>
          )}
        </SimpleCanvas>
        <Overlay>
          <SVGRenderer size={canvasSize}>
            <RenderingModeProvider value="interactive">
              <Design.Root>
                <Design.BoundingRect />
                <Design.LayerHighlight />
              </Design.Root>
            </RenderingModeProvider>
          </SVGRenderer>
        </Overlay>
        <Overlay
          style={{
            zIndex: isContextMenuOpen ? undefined : Stacking.level.overlay,
          }}
        >
          <SVGRenderer size={canvasSize}>
            <RenderingModeProvider value="interactive">
              <Design.Root>
                <Design.DrawLayer />
                <Design.SnapGuides />
                <Design.MeasurementGuides />
                <Design.DragHandles />
              </Design.Root>
            </RenderingModeProvider>
          </SVGRenderer>
        </Overlay>
      </Panel.Item>
      <Panel.Handle onDoubleClick={() => panelRef.current?.resize(50)} />
      <Panel.Item collapsible>
        <DOMRenderer />
      </Panel.Item>
    </Panel.Root>
  );
});
