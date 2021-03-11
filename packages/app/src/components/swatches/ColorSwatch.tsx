import { memo } from 'react';
import styled from 'styled-components';
import { RgbaColor } from 'noya-colorpicker/src/types';

const ColorSwatchContainer = styled.div(({ selected }: PropsSelected) => ({
    width: '200px',
    height: '130px',
    backgroundColor: 'rgba(40,40,40,0.85)',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    borderRadius: '12px',
    border: `2px ${selected ? 'solid' : 'none'} white`
}));
  
         
const ColorSwatchDescription = styled.p(({ theme }) => ({
    color: "pink",
    margin: "10px 0px" 
}));

const SwatchContainer = styled.div<Props>`
    height: 175px,
    &:hover {
        cursor: pointer;
    }
`

const ColoredCircle = styled.div(({ theme, color }) => ({
    height: "50px",
    width: "50px",
    backgroundColor: color,
    borderRadius: "50%",
}));

export interface RgbaColorName extends RgbaColor {
    name: string;
}

type ColorSwatchProps = {
    value: RgbaColorName; 
    selected?: boolean;
    key: number; 
    onClick: (value:string) => void;
}

interface Props{
    onClick?: () => void;
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
    const { value, selected, onClick } = props;

    const color: string = `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a})`;
    return (
        <SwatchContainer onClick={() => onClick('value')}>
            <ColorSwatchContainer selected={selected}>
                <ColoredCircle color = {color}/>
            </ColorSwatchContainer>
            <ColorSwatchDescription>
                {value.name}<br/>
                <span style={{color: 'white'}} >
                {rgb2hex(color)} - {Math.round(value.a * 100)}%
                </span>
            </ColorSwatchDescription>
        </SwatchContainer>
    )
})