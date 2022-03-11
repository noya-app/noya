export type RelativeDropPosition = 'above' | 'below' | 'inside';

export type DropValidator = (
  sourceId: string,
  destinationId: string,
  position: RelativeDropPosition,
) => boolean;
