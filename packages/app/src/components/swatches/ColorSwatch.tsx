import { memo } from 'react';
import styled from 'styled-components';

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

type ColorSwatchProps = {
    value: string; 
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

export default memo(function ColorSwatch(props: ColorSwatchProps){
    const { value, selected, onClick } = props;
    const test = () => {
        console.log("testing Colors")
        //onClick('test')
    }

    return (
        <SwatchContainer onClick={() => onClick(value)}>
            <ColorSwatchContainer selected={selected}>
                <ColoredCircle color = {value}/>
            </ColorSwatchContainer>
            <ColorSwatchDescription onClick = {test}>
                Color Name<br/>
                <span style={{color: 'white'}} >
                #{props.value} - 100%
                </span>
            </ColorSwatchDescription>
        </SwatchContainer>
    )
})