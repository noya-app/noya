import styled from 'styled-components';
import { Colors } from '../theme';

export type GridProps = {
  columns?: string;
  rows?: string;
  alignItems?: 'start' | 'center' | 'end';
  justifyItems?: 'start' | 'center' | 'end';
  placeItems?: 'start' | 'center' | 'end';
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
  gap?: number | string;
  gapX?: number | string;
  gapY?: number | string;
  background?: keyof Colors;
};

const Grid = styled.div<GridProps>((props) => ({
  display: 'grid',
  gridTemplateColumns: props.columns,
  gridTemplateRows: props.rows,
  alignItems: props.alignItems,
  justifyItems: props.justifyItems,
  width: props.width,
  minWidth: props.minWidth ?? 0,
  maxWidth: props.maxWidth,
  height: props.height,
  minHeight: props.minHeight ?? 0,
  maxHeight: props.maxHeight,
  padding: props.padding,
  paddingInline: props.paddingX,
  paddingInlineStart: props.paddingXStart,
  paddingInlineEnd: props.paddingXEnd,
  paddingBlock: props.paddingY,
  paddingBlockStart: props.paddingYStart,
  paddingBlockEnd: props.paddingYEnd,
  gap: props.gap,
  gapRow: props.gapX,
  gapColumn: props.gapY,
  background: props.background,
}));

export default Grid;
