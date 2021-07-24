import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import styled from 'styled-components';
import { TextStyles } from '../theme';

export type TextProps = {
  as?: any;
  variant?: keyof TextStyles;
  className?: string;
  children: ReactNode;
  alignment?: 'start' | 'center' | 'end';
  width?: string | number;
};

const elements = {
  heading1: 'h1',
  heading2: 'h2',
  heading3: 'h3',
  mark: 'mark',
};

const TextAncestorContext = createContext(false);

const Text = styled(
  ({
    as: Element = 'p',
    alignment,
    variant = 'body',
    className,
    children,
  }: TextProps) => {
    const hasTextAncestor = useContext(TextAncestorContext);
    // @ts-ignore
    const propElement = elements[variant];
    if (hasTextAncestor) {
      Element = 'span';
    }
    if (propElement) {
      Element = propElement;
    }
    return (
      <TextAncestorContext.Provider value={true}>
        <Element className={className}>{children}</Element>
      </TextAncestorContext.Provider>
    );
  },
)<TextProps>(
  (props) => ({
    margin: 0,
    lineHeight: 1,
    width: props.width,
    textAlign: props.alignment,
  }),
  (props) => props.theme.textStyles[props.variant || 'body'],
);

export default Text;
