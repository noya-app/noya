import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import { CanvasKitRenderer, Interactions, SimpleCanvas } from 'noya-canvas';
import { Design, RenderingModeProvider } from 'noya-renderer';
import { DrawableLayerType, Layers, Selectors } from 'noya-state';
import { SVGRenderer } from 'noya-svg-renderer';
import * as React from 'react';
import { DOMRenderer } from './DOMRenderer';
import { inferBlockType, inferBlockTypes } from './inferBlock';
import { buttonSymbol } from './symbols';
import { DrawingWidget, Widget } from './Widget';

export function Content() {
  const { canvasSize } = useWorkspace();
  const [state, dispatch] = useApplicationState();

  const layers = Layers.flat(Selectors.getCurrentPage(state));

  return (
    <div style={{ flex: '1', display: 'flex' }}>
      <div style={{ flex: '1', display: 'flex', position: 'relative' }}>
        <SimpleCanvas
          interactions={[
            Interactions.editText,
            Interactions.editBlock,
            Interactions.focus,
            Interactions.pan,
            Interactions.scale,
            Interactions.selection,
            Interactions.move,
            Interactions.createDrawing({
              initialState: 'none',
              inferBlockType: inferBlockType,
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
                      'setInstanceSymbolSource',
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
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
        >
          <SVGRenderer size={canvasSize}>
            <RenderingModeProvider value="interactive">
              <Design.Root>
                <Design.BoundingRect />
                <Design.LayerHighlight />
                <Design.DrawLayer />
                <Design.SnapGuides />
                <Design.MeasurementGuides />
                <Design.DragHandles />
                <Design.Rulers />
              </Design.Root>
            </RenderingModeProvider>
          </SVGRenderer>
        </div>
      </div>
      <div style={{ width: '1px', backgroundColor: '#ccc' }} />
      <div style={{ flex: '1', display: 'flex' }}>
        <DOMRenderer />
      </div>
    </div>
  );
}
