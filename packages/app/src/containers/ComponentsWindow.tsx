import Sketch from '@sketch-hq/sketch-file-format-ts';
import { memo, useState, useCallback } from 'react';
import ColorSwatch from '../components/swatches/ColorSwatch';
import styled from 'styled-components';
import {
  useApplicationState,
} from '../contexts/ApplicationStateContext';
import {
  getSharedSwatches
} from 'noya-state/src/selectors';
const ScrollContainer = styled.div`
  &::-webkit-scrollbar {
    width: 10px;
  }

  /* Track */
  &::-webkit-scrollbar-track {
    background: rgba(40,40,40,0.85); 
    margin: 12px;
  }
  
  /* Handle */
  &::-webkit-scrollbar-thumb {
    background: #999; 
    width: 8px;    
    border-radius: 12px;
  }

  /* Handle on hover */
  &::-webkit-scrollbar-thumb:hover {
    background: #888; 
  }
`;
const ComponetsGrid = styled(ScrollContainer)(({ theme }) => ({
    flex: 1, 
    color: 'white', 
    display: 'grid',
    padding: '14px',
    gridTemplateColumns: "repeat(auto-fill, 200px)",
    gridTemplateRows: "repeat(auto-fill, 180px)",
    justifyContent: "space-between",
    gap: "20px",
    overflowY: 'scroll'
}));



/**
 * TODO: Multiselect and change color 
 * TODO: Clean code
 */

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
            if (content.classList.contains("swatch-grid")){
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
      <>
        <ComponetsGrid
          className="swatch-grid"
          onPointerDown ={handleMouseDown}
        >
        {swatches.map((swatch, index) => {
            return(
              <ColorSwatch 
                  key   = {index} 
                  value = {swatch}
                  selected  = { state.selectedSwatchIds.includes(swatch.do_objectID) }
                  onPointerDown ={handleMouseDown}
              />
            )
          })}
        </ComponetsGrid>
      </>
    );
  });