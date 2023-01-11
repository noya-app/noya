import { useApplicationState } from 'noya-app-state-context';
import { CanvasKitRenderer, Interactions, SimpleCanvas } from 'noya-canvas';
import { DesignFile, RenderingModeProvider } from 'noya-renderer';
import { DrawableLayerType, Layers, Selectors } from 'noya-state';
import * as React from 'react';
import { DOMRenderer } from './DOMRenderer';
import { inferBlockType, inferBlockTypes } from './inferBlock';
import { buttonSymbol } from './symbols';
import { DrawingWidget, Widget } from './Widget';

export function Content() {
  const [state, dispatch] = useApplicationState();

  const layers = Layers.flat(Selectors.getCurrentPage(state));

  return (
    <div style={{ flex: '1', display: 'flex' }}>
      <div style={{ flex: '1', display: 'flex' }}>
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
            <CanvasKitRenderer size={size}>
              <RenderingModeProvider value="interactive">
                <DesignFile />
              </RenderingModeProvider>
            </CanvasKitRenderer>
          )}
        </SimpleCanvas>
      </div>
      <div style={{ width: '1px', backgroundColor: '#ccc' }} />
      <div style={{ flex: '1', display: 'flex' }}>
        <DOMRenderer />
      </div>
    </div>
  );
}
