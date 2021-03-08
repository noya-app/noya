import Sketch from '@sketch-hq/sketch-file-format-ts';
import { memo, useState } from 'react';
import ColorSwatch from '../components/swatches/ColorSwatch';
import styled, { ThemeProvider } from 'styled-components';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';

const ComponetsGrid = styled.div(({ theme, color }) => ({
    flex: 1, 
    color: 'white', 
    display: 'grid',
    padding: '14px',
    gridTemplateColumns: "repeat(auto-fill, 200px)",
    gridTemplateRows: "repeat(auto-fill, 180px)",
    justifyContent: "space-between",
    gap: "20px"
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

export default memo(function ComponentsWindow() {
    let elements: Array< Sketch.Color >;
    const colors = ['pink', 'blue', 'green', 'purple', 'white', 'black'];
    const [selected, setSelected] = useState(0);
    const [state, dispatch] = useApplicationState();

    return (
      <>
        <ComponetsGrid>
        {colors.map((value, index) => {
            return(
                <ColorSwatch 
                    key = {index} 
                    value = {value}
                    selected = {selected === index}
                    onClick = {
                        (value) => {
                          setSelected(index)
                          console.log(value);
                          //dispatch('setFillColor', index, elements[0])
                        }
                    }
                />
            )
          })}
        </ComponetsGrid>
      </>
    );
  });