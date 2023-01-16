import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import { CanvasKitRenderer, Interactions, SimpleCanvas } from 'noya-canvas';
import { Design, RenderingModeProvider } from 'noya-renderer';
import { DrawableLayerType, Layers, Selectors } from 'noya-state';
import { SVGRenderer } from 'noya-svg-renderer';
import React, { memo, useRef } from 'react';
import { ImperativePanelHandle } from 'react-resizable-panels';
import styled from 'styled-components';
import { DOMRenderer } from './DOMRenderer';
import { inferBlockType, inferBlockTypes } from './inferBlock';
import { Panel } from './Panel';
import { Stacking } from './stacking';
import { buttonSymbol } from './symbols';
import { DrawingWidget, Widget } from './Widget';

const Overlay = styled.div({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
});

export const Content = memo(function Content() {
  const { canvasSize } = useWorkspace();
  const [state, dispatch] = useApplicationState();
  const layers = Layers.flat(Selectors.getCurrentPage(state)).filter(
    Layers.isSymbolInstance,
  );
  const panelRef = useRef<ImperativePanelHandle>(null);

  return (
    <Panel.Root direction="horizontal" autoSaveId="ayon-canvas">
      <Panel.Item ref={panelRef} collapsible defaultSize={75}>
        <SimpleCanvas
          interactions={[
            Interactions.zoom,
            Interactions.escape,
            Interactions.reorder,
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
        <Overlay style={{ zIndex: Stacking.level.overlay }}>
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
