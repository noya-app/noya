import React, {
  Children,
  CSSProperties,
  ForwardedRef,
  forwardRef,
  memo,
  ReactHTML,
  ReactNode,
} from 'react';
import styled from 'styled-components';
import { BreakpointCollection, mergeBreakpoints } from '../utils/breakpoints';
import withSeparatorElements from '../utils/withSeparatorElements';

interface StyleProps {
  display?: 'flex' | 'inline-flex' | 'none' | 'block';
  visibility?: CSSProperties['visibility'];
  position?: CSSProperties['position'];
  zIndex?: CSSProperties['zIndex'];
  gap?: CSSProperties['gap'];
  inset?: CSSProperties['inset'];
  top?: CSSProperties['top'];
  right?: CSSProperties['right'];
  bottom?: CSSProperties['bottom'];
  left?: CSSProperties['left'];
  flexDirection?: CSSProperties['flexDirection'];
  justifyContent?: CSSProperties['justifyContent'];
  alignItems?: CSSProperties['alignItems'];
  alignSelf?: CSSProperties['alignSelf'];
  flex?: CSSProperties['flex'];
  flexWrap?: CSSProperties['flexWrap'];
  height?: CSSProperties['height'];
  minHeight?: CSSProperties['minHeight'];
  maxHeight?: CSSProperties['maxHeight'];
  width?: CSSProperties['width'];
  minWidth?: CSSProperties['minWidth'];
  maxWidth?: CSSProperties['maxWidth'];
  padding?: CSSProperties['padding'];
  paddingVertical?: string | number;
  paddingHorizontal?: string | number;
  margin?: CSSProperties['margin'];
  background?: CSSProperties['background'];
  backgroundSize?: CSSProperties['backgroundSize'];
  backgroundPosition?: CSSProperties['backgroundPosition'];
  borderRadius?: CSSProperties['borderRadius'];
  overflowX?: CSSProperties['overflowX'];
  overflowY?: CSSProperties['overflowY'];
  overflow?: CSSProperties['overflow'];
  boxShadow?: CSSProperties['boxShadow'];
  outline?: CSSProperties['outline'];
  border?: CSSProperties['border'];
  borderTop?: CSSProperties['borderTop'];
  borderRight?: CSSProperties['borderRight'];
  borderBottom?: CSSProperties['borderBottom'];
  borderLeft?: CSSProperties['borderLeft'];
  cursor?: CSSProperties['cursor'];
  userSelect?: CSSProperties['userSelect'];
  transition?: CSSProperties['transition'];
  opacity?: CSSProperties['opacity'];
  filter?: CSSProperties['filter'];
  color?: CSSProperties['color'];
  order?: CSSProperties['order'];
  pointerEvents?: CSSProperties['pointerEvents'];
}

export type StackBreakpointList = BreakpointCollection<StyleProps>;

interface Props extends StyleProps {
  id?: string;
  as?: keyof ReactHTML;
  className?: string;
  children?: ReactNode;
  separator?: Parameters<typeof withSeparatorElements>[1];
  breakpoints?: StackBreakpointList | null | false;
  href?: string; // Shouldn't be here, ideally
}

const Element = styled.div<{
  styleProps: StyleProps;
  breakpoints?: StackBreakpointList | null | false;
}>(({ styleProps, breakpoints }) => ({
  ...styleProps,
  ...mergeBreakpoints(breakpoints || []),
}));

const StackBase = forwardRef(function StackBase(
  { id, as, children, separator, breakpoints, href, ...rest }: Props,
  forwardedRef: ForwardedRef<HTMLElement>,
) {
  const elements = separator
    ? withSeparatorElements(Children.toArray(children), separator)
    : children;

  const styleProps: StyleProps = {
    display: 'flex',
    position: 'relative',
    alignItems: 'stretch',
    ...rest,
  };

  return (
    <Element
      ref={forwardedRef}
      id={id}
      as={as}
      styleProps={styleProps}
      breakpoints={breakpoints}
      {...(href && { href })}
    >
      {elements}
    </Element>
  );
});

type StackProps = Omit<Props, 'flexDirection'>;

const VerticalStack = memo(
  forwardRef(function VStack(
    props: StackProps,
    forwardedRef: ForwardedRef<HTMLElement>,
  ) {
    return <StackBase {...props} flexDirection="column" ref={forwardedRef} />;
  }),
);

const HorizontalStack = memo(
  forwardRef(function HStack(
    props: StackProps,
    forwardedRef: ForwardedRef<HTMLElement>,
  ) {
    return <StackBase {...props} flexDirection="row" ref={forwardedRef} />;
  }),
);

export const Stack = {
  V: VerticalStack,
  H: HorizontalStack,
};
