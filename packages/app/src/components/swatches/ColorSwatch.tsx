import { RgbaColor } from 'noya-colorpicker/src/types';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import styled from 'styled-components';
import { memo } from 'react';


const ColorSwatchContainer = styled.div(({ selected }: PropsSelected) => ({
    width: '200px',
    height: '130px',
    backgroundColor: 'rgba(40,40,40,0.85)',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    borderRadius: '12px',
    border: `2px ${selected ? 'solid' : 'none'} rgb(132,63,255)`
}));
         
const ColorSwatchDescription = styled.p(({ theme }) => ({
    color: theme.colors.textDecorativeLight,
    margin: "10px 0px" 
}));

const ColoredCircle = styled.div(({ theme, color }) => ({
    height: "50px",
    width: "50px",
    backgroundColor: color,
    borderRadius: "50%",
}));


type ColorSwatchProps = {
    value: Sketch.Swatch; 
    selected?: boolean;
}

interface PropsSelected{
    selected?: boolean;
}
  
function rgb2hex(rgb: string){
    const rgba = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    const hex = (rgba && rgba.length === 4) ? "#" +
     ("0" + parseInt(rgba[1],10).toString(16)).slice(-2) +
     ("0" + parseInt(rgba[2],10).toString(16)).slice(-2) +
     ("0" + parseInt(rgba[3],10).toString(16)).slice(-2) : '';

    return hex.toUpperCase();
}

export default memo(function ColorSwatch(props: ColorSwatchProps){
    const { value, selected } = props;

    const color: RgbaColor = {
        "a": value.value.alpha,
        "r": Math.round(value.value.red   * 255),
        "g": Math.round(value.value.green * 255),
        "b": Math.round(value.value.blue  * 255)
    }

    const colorString: string = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    return (
        <>
            <ColorSwatchContainer selected={selected}>
                <ColoredCircle color = {colorString}/>
            </ColorSwatchContainer>
            <ColorSwatchDescription>
                {value.name}<br/>
                <span style={{color: 'white'}} >
                    {rgb2hex(colorString)} - {Math.round(color.a * 100)}%
                </span>
            </ColorSwatchDescription>
        </>
    )
})


