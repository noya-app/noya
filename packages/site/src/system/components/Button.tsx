import styled from 'styled-components';

export const Button = styled.button({
  '--button-background':
    'linear-gradient(0deg, hsl(273deg 92% 42%), hsl(273deg 92% 59%))',
  '--button-background-hover':
    'linear-gradient(0deg,hsl(273deg 91% 44%),hsl(273deg 93% 64%))',
  flexShrink: 0,
  fontSize: '1.5rem',
  fontWeight: 700,
  letterSpacing: '0.01em',
  height: '4rem',
  padding: '0 1.5rem',
  border: 'none',
  borderRadius: '1rem',
  background: 'var(--button-background)',
  color: 'white',
  cursor: 'pointer',
  transition: 'background 180ms ease',
  ':hover': {
    background: 'var(--button-background-hover)',
  },
  ':active': {
    background: 'var(--button-background)',
  },
});
