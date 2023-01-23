import styled from 'styled-components';

interface Props {
  size?: number | string;
  inline?: boolean;
}

/* ----------------------------------------------------------------------------
 * Vertical
 * ------------------------------------------------------------------------- */

const SpacerVertical = styled.span<Props>(({ size, inline }) => ({
  display: inline ? 'inline-block' : 'block',
  ...(size === undefined ? { flex: 1 } : { minHeight: size }),
}));

/* ----------------------------------------------------------------------------
 * Horizontal
 * ------------------------------------------------------------------------- */

const SpacerHorizontal = styled.span<Props>(({ size, inline }) => ({
  display: inline ? 'inline-block' : 'block',
  ...(size === undefined ? { flex: 1 } : { minWidth: size }),
}));

export namespace Spacer {
  export const Vertical = SpacerVertical;
  export const Horizontal = SpacerHorizontal;
}
