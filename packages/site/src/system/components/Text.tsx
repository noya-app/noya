import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';
import styled from 'styled-components';
import { textStyles } from '../theme';

export type TextProps = {
  as?: any;
  variant?: keyof typeof textStyles;
  className?: string;
  children: ReactNode;
  alignment?: 'start' | 'center' | 'end';
  width?: string | number;
  lineHeight?: string;
};

const elements = {
  heading1: 'h1',
  heading2: 'h2',
  heading3: 'h3',
  body1: 'p',
  body2: 'p',
  mark: 'mark',
};

const TextAncestorContext = createContext(false);

export const Text = styled(
  ({
    as: Element = 'p',
    variant = 'body1',
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
)<TextProps>(({ lineHeight, width, alignment, variant = 'body' }) => {
  const styles = {
    margin: 0,
    textAlign: alignment,
    width,
    ...(textStyles[variant] ?? {}),
  };
  // allow overriding text style line height
  if (lineHeight !== undefined) {
    styles.lineHeight = lineHeight;
  }
  return styles;
});
