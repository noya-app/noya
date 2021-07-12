import styled from 'styled-components';

const headingSizes = {
  1: 'min(20vw, 20vh)',
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
