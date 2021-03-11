import Sketch from '@sketch-hq/sketch-file-format-ts';
import { RgbaColor } from 'noya-colorpicker/src/types';
import { memo, useState } from 'react';
import ColorSwatch from '../components/swatches/ColorSwatch';
import styled from 'styled-components';
import {
  useApplicationState,
} from '../contexts/ApplicationStateContext';
import {
  getSharedSwatches
} from 'noya-state/src/selectors';

const ComponetsGrid = styled.div(({ theme, color }) => ({
    flex: 1, 
    color: 'white', 
    display: 'grid',
    padding: '14px',
    gridTemplateColumns: "repeat(auto-fill, 200px)",
    gridTemplateRows: "repeat(auto-fill, 180px)",
    justifyContent: "space-between",
    gap: "20px",
}));


/**
 * TODO: Click on the color and modify
 * TODO: Add color modifier
 * TODO: Add new Colors
 * TODO: Multiselect and change color 
 * TODO: Clean code
 * TODO: Remove Toolbar
 * TODO: Show correct name and percentaje color
 * TODO: Allow to change color name i guess.
 */

export interface RgbaColorName extends RgbaColor {
  name: string;
}

export default memo(function ComponentsWindow() {
    const [selected, setSelected] = useState(0);
    const [state, dispatch] = useApplicationState();

    let sharedSwatches: Sketch.SwatchContainer | never[] = getSharedSwatches(state);

    let colorsX: Array<RgbaColorName> = []
    let tesst : Array<Sketch.Color> = []
    if (sharedSwatches){
      sharedSwatches = sharedSwatches as Sketch.SwatchContainer
      colorsX = sharedSwatches.objects.map((swatch: Sketch.Swatch) => {
        const value: Sketch.Color = swatch.value;
        tesst.push(value);
        return ({
          "name": swatch.name,
          "a": value.alpha,
          "r": Math.round(value.red   * 255),
          "g": Math.round(value.green * 255),
          "b": Math.round(value.blue  * 255)
        })
      })
    }

    
    return (
      <>
        <ComponetsGrid>
        {colorsX.map((value, index) => {
            return(
              <ColorSwatch 
                  key   = {index} 
                  value = {value}
                  selected  = {selected === index}
                  onClick   = {
                      (value) => {
                        sharedSwatches = sharedSwatches as Sketch.SwatchContainer;
                        const id = sharedSwatches.objects[index].do_objectID;

                        setSelected(index);
                        //dispatch('setSwatchColor', id, tesst[index]);
                        dispatch('selectSwatch', id);
                      }
                  }
              />
            )
          })}
        </ComponetsGrid>
      </>
    );
  });