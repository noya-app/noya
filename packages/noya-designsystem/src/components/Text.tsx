import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import styled from 'styled-components';
import { textStyles } from '../theme/light';

export type TextProps = {
  as?: any;
  variant: keyof typeof textStyles;
  className?: string;
  children: ReactNode;
};

const headingElements = {
  heading1: 'h1',
  heading2: 'h2',
  heading3: 'h3',
};

const TextContext = createContext(false);

const Text = styled(
  ({ as: Element = 'p', variant = 'body', className, children }: TextProps) => {
    const inline = useContext(TextContext);
    // @ts-ignore
    const headingElement = headingElements[variant];
    if (headingElement) {
      Element = headingElement;
    }
    if (inline) {
      Element = 'span';
    }
    return (
      <TextContext.Provider value={true}>
        <Element className={className}>{children}</Element>
      </TextContext.Provider>
    );
  },
)<TextProps>((props) => ({
  margin: 0,
  lineHeight: 1,
  ...textStyles[props.variant],
}));

export default Text;
