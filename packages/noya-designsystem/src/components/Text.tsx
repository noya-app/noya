import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import styled from 'styled-components';
import { textStyles } from '../theme/light';

export type TextProps = {
  as?: any;
  variant?: keyof typeof textStyles;
  className?: string;
  children: ReactNode;
};

const elements = {
  heading1: 'h1',
  heading2: 'h2',
  heading3: 'h3',
  mark: 'mark',
};

const TextContext = createContext(false);

const Text = styled(
  ({ as: Element = 'p', variant = 'body', className, children }: TextProps) => {
    const inline = useContext(TextContext);
    // @ts-ignore
    const propElement = elements[variant];
    if (inline) {
      Element = 'span';
    }
    if (propElement) {
      Element = propElement;
    }
    return (
      <TextContext.Provider value={true}>
        <Element className={className}>{children}</Element>
      </TextContext.Provider>
    );
  },
)<TextProps>(
  {
    margin: 0,
    lineHeight: 1,
  },
  (props) => textStyles[props.variant || 'body'],
);

export default Text;
