import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import styled from 'styled-components';

export type TextProps = {
  as?: any;
  variant: keyof typeof variants;
  className?: string;
  children: ReactNode;
};

const variants = {
  heading1: {
    as: 'h1',
    fontSize: 'min(20vw, 20vh)',
    fontWeight: 700,
  },
  heading2: {
    as: 'h2',
    fontSize: '4rem',
    fontWeight: 500,
  },
  heading3: {
    as: 'h3',
    fontSize: '2rem',
    fontWeight: 500,
  },
  body: {
    fontSize: '1.8rem',
  },
};

const TextContext = createContext(false);

const Text = styled(
  ({ as: Element = 'p', variant = 'body', className, children }: TextProps) => {
    const inline = useContext(TextContext);
    const textVariant = variants[variant] as any;
    if (inline) {
      Element = 'span';
    }
    if (textVariant.as) {
      Element = textVariant.as;
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
  ...variants[props.variant],
}));

export default Text;
