import styled from 'styled-components';

export type StackProps = {
  axis: 'x' | 'y';
  width?: number | string;
  height?: number | string;
  padding?: number | string;
  paddingX?: number | string;
  paddingY?: number | string;
  background?: string;
};

const Stack = styled.div<StackProps>((props) => ({
  display: 'flex',
  flexDirection: props.axis === 'x' ? 'row' : 'column',
  width: props.width,
  height: props.height,
  padding: props.padding,
  paddingLeft: props.paddingX,
  paddingRight: props.paddingX,
  paddingTop: props.paddingY,
  paddingBottom: props.paddingY,
  background: props.background,
}));

export default Stack;
