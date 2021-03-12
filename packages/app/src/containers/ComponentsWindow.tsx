import Sketch from '@sketch-hq/sketch-file-format-ts';
import { memo, useCallback } from 'react';
import ColorSwatch from '../components/swatches/ColorSwatch';
import ColorSwatchGrid from './ColorSwatchGrid';
import {
  useApplicationState,
} from '../contexts/ApplicationStateContext';
import {
  getSharedSwatches
} from 'noya-state/src/selectors';
import styled from 'styled-components';

/**
 * TODO: Multiselect and change color 
 * TODO: Clean code
 */

const SwatchContainer = styled.div`
  height: 175px,
  &:hover {
      cursor: pointer;
  }
`



export default memo(function ComponentsWindow() {
    const [state, dispatch] = useApplicationState();

    let sharedSwatches: Sketch.SwatchContainer | never[] = getSharedSwatches(state);

    let swatches: Array<Sketch.Swatch> = []
    if (sharedSwatches){
        sharedSwatches = sharedSwatches as Sketch.SwatchContainer
        swatches = sharedSwatches.objects;
    }

    const handleMouseDown = useCallback(
      (event: React.PointerEvent, swatch?: Sketch.Swatch) => {  
        switch (state.interactionState.type) {
          case 'none': {    
            if (state.selectedSwatchIds.length > 0){

            }

            const content = event.nativeEvent.composedPath()[0] as HTMLInputElement;
            if (content.classList.contains("color-swatch-grid")){
                dispatch('selectSwatch', undefined);
                return;
            }
            if (swatch){
              swatch = swatch as Sketch.Swatch;
              if (state.selectedSwatchIds.includes(swatch.do_objectID)) {
                if (event.shiftKey && state.selectedObjects.length !== 1) {
                  dispatch('selectSwatch', swatch.do_objectID, 'difference');
                }
              } else {
                  dispatch(
                    'selectSwatch',
                    swatch.do_objectID,
                    event.shiftKey ? 'intersection' : 'replace',
                  );
              }
            }
          }
          break;
        }
      },
      [state, dispatch]
    );

    return (
        <ColorSwatchGrid
          className="color-swatch-grid"
          onPointerDown ={handleMouseDown}
        >
        {swatches.map((swatch, index) => (
            <SwatchContainer 
                key   = {index} 
                className="color-swatch"
                onPointerDown={e => handleMouseDown(e, swatch)}
            >
              <ColorSwatch 
                value = {swatch}
                selected  = { state.selectedSwatchIds.includes(swatch.do_objectID) }
              />
            </SwatchContainer>
        ))}
        </ColorSwatchGrid>
    );
  });