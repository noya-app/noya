import type { DropValidator, RelativeDropPosition } from './types';

export function validateDropIndicator(
  acceptsDrop: DropValidator,
  activeId: string,
  overId: string,
  offsetTop: number,
  elementTop: number,
  elementHeight: number,
): RelativeDropPosition | undefined {
  const acceptsDropInside = acceptsDrop(activeId, overId, 'inside');

  // If we're in the center of the element, prefer dropping inside
  if (
    offsetTop >= elementTop + elementHeight / 3 &&
    offsetTop <= elementTop + (elementHeight * 2) / 3 &&
    acceptsDropInside
  )
    return 'inside';

  // Are we over the top or bottom half of the element?
  const indicator =
    offsetTop < elementTop + elementHeight / 2 ? 'above' : 'below';

  // Drop above or below if possible, falling back to inside
  return acceptsDrop(activeId, overId, indicator)
    ? indicator
    : acceptsDropInside
    ? 'inside'
    : undefined;
}

export const defaultAcceptsDrop: DropValidator = (
  sourceId,
  destinationId,
  position,
) => {
  return position !== 'inside' && sourceId !== destinationId;
};
