import styled from 'styled-components';
import { Colors } from '../theme';

const alignments = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

const distributions = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-between': 'space-between',
  'space-evenly': 'space-evenly',
};

export type StackProps = {
  axis: 'x' | 'y';
  alignment?: keyof typeof alignments;
  distribution?: keyof typeof distributions | 'fill';
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  height?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  padding?: number | string;
  paddingX?: number | string;
  paddingXStart?: number | string;
  paddingXEnd?: number | string;
  paddingY?: number | string;
  paddingYStart?: number | string;
  paddingYEnd?: number | string;
  spacing?: number | string;
  background?: keyof Colors;
};

const Stack = styled.div<StackProps>(
  (props) => ({
    display: 'flex',
    flexDirection: props.axis === 'x' ? 'row' : 'column',
    width: props.width,
    minWidth: props.minWidth,
    maxWidth: props.maxWidth,
    height: props.height,
    minHeight: props.minHeight,
    maxHeight: props.maxHeight,
    padding: props.padding,
    paddingInline: props.paddingX,
    paddingInlineStart: props.paddingXStart,
    paddingInlineEnd: props.paddingXEnd,
    paddingBlock: props.paddingY,
    paddingBlockStart: props.paddingYStart,
    paddingBlockEnd: props.paddingYEnd,
    gap: props.spacing,
    alignItems: props.alignment ? alignments[props.alignment] : undefined,
    justifyContent:
      props.distribution === 'fill'
        ? undefined
        : props.distribution
        ? distributions[props.distribution]
        : undefined,
    background: props.background,
  }),
  (props) =>
    props.distribution === 'fill' && {
      '& > *': { flex: '1 0 0px' },
    },
);

export default Stack;
