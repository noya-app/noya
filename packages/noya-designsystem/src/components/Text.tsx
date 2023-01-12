import React, { ForwardedRef, forwardRef, ReactHTML, ReactNode } from 'react';
import styled, { CSSProperties } from 'styled-components';
import { Theme, ThemeColorName } from '../theme';
import { BreakpointCollection, mergeBreakpoints } from '../utils/breakpoints';

const elements: Record<keyof Theme['textStyles'], keyof ReactHTML> = {
  title: 'h1',
  subtitle: 'h1',
  heading1: 'h1',
  heading2: 'h2',
  heading3: 'h3',
  body: 'p',
  small: 'span',
  code: 'code',
  label: 'span',
};

type StyleProps = {
  flex?: CSSProperties['flex'];
  padding?: CSSProperties['padding'];
  background?: CSSProperties['background'];
  borderRadius?: CSSProperties['borderRadius'];
  textAlign?: CSSProperties['textAlign'];
  fontWeight?: CSSProperties['fontWeight'];
  fontSize?: CSSProperties['fontSize'];
  lineHeight?: CSSProperties['lineHeight'];
  fontFamily?: CSSProperties['fontFamily'];
  wordBreak?: CSSProperties['wordBreak'];
  whiteSpace?: CSSProperties['whiteSpace'];
  height?: CSSProperties['height'];
  width?: CSSProperties['width'];
  opacity?: CSSProperties['opacity'];
  position?: CSSProperties['position'];
  overflow?: CSSProperties['overflow'];
  textOverflow?: CSSProperties['textOverflow'];
};

export type TextBreakpointList = BreakpointCollection<StyleProps>;

interface Props extends StyleProps {
  as?: keyof ReactHTML;
  className?: string;
  variant: keyof Theme['textStyles'];
  breakpoints?: BreakpointCollection<StyleProps> | null | false;
  color?: ThemeColorName;
  children: ReactNode;
}

const StyledElement = styled.span<
  {
    variant: keyof Theme['textStyles'];
    styleProps: StyleProps;
  } & Pick<Props, 'variant' | 'breakpoints' | 'color'>
>(({ theme, variant, styleProps, breakpoints, color }) => ({
  ...theme.textStyles[variant],
  color: color ? theme.colors[color] : undefined,
  ...styleProps,
  ...mergeBreakpoints(breakpoints || []),
}));

export const Text = forwardRef(function Text(
  { as, variant, breakpoints, children, className, color, ...rest }: Props,
  forwardedRef: ForwardedRef<HTMLElement>,
) {
  const element = as ?? elements[variant] ?? 'span';

  return (
    <StyledElement
      ref={forwardedRef}
      as={element}
      className={className}
      variant={variant}
      breakpoints={breakpoints}
      styleProps={rest}
      color={color}
    >
      {children}
    </StyledElement>
  );
});

type PresetProps = Omit<Props, 'variant'>;

export const Heading1 = forwardRef(
  (props: PresetProps, ref: ForwardedRef<HTMLElement>) => (
    <Text ref={ref} {...props} variant="heading1" />
  ),
);

export const Heading2 = forwardRef(
  (props: PresetProps, ref: ForwardedRef<HTMLElement>) => (
    <Text ref={ref} {...props} variant="heading2" />
  ),
);

export const Heading3 = forwardRef(
  (props: PresetProps, ref: ForwardedRef<HTMLElement>) => (
    <Text ref={ref} {...props} variant="heading3" />
  ),
);

export const Body = forwardRef(
  (props: PresetProps, ref: ForwardedRef<HTMLElement>) => (
    <Text ref={ref} {...props} variant="body" />
  ),
);

export const Small = forwardRef(
  (props: PresetProps, ref: ForwardedRef<HTMLElement>) => (
    <Text ref={ref} {...props} variant="small" />
  ),
);

// export const Label = forwardRef(
//   (props: PresetProps, ref: ForwardedRef<HTMLElement>) => (
//     <Text ref={ref} {...props} variant="label" />
//   ),
// );

export const Italic = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      fontStyle: 'italic',
    }}
  >
    {children}
  </span>
);
