import styled from 'styled-components';

export type StackProps = {
  axis: 'x' | 'y';
  width?: number | string;
  height?: number | string;
  padding?: number | string;
  background?: string;
};

export const Stack = styled.div<StackProps>((props) => ({
  display: 'flex',
  flexDirection: props.axis === 'x' ? 'row' : 'column',
  width: props.width,
  height: props.height,
  padding: props.padding,
  background: props.background,
}));

const headingSizes = {
  1: '20vw',
  2: 24,
  3: 18,
};

const headingWeights = {
  1: 700,
  2: 500,
  3: 500,
};

export type HeadingProps = {
  level: 1 | 2 | 3;
};

export const Heading = styled.div<HeadingProps>((props) => ({
  display: 'flex',
  fontSize: headingSizes[props.level],
  fontWeight: headingWeights[props.level],
  lineHeight: 1,
  margin: 0,
}));
