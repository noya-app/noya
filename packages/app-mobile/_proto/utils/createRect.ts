import { Position, ElementType, Size, Rect } from '../types';

export default function createRect(position: Position, size: Size): Rect {
  const x1 = position.x as number;
  const x2 = (position.x as number) + (size.width as number);

  const y1 = position.y as number;
  const y2 = (position.y as number) + (size.height as number);

  let topLeft: Position = {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
  };
  let actualSize: Size = {
    width: Math.max(x1, x2) - (topLeft.x as number),
    height: Math.max(y1, y2) - (topLeft.y as number),
  };

  return {
    type: ElementType.Rect,
    color: '#D8D8D8',
    position: topLeft,
    size: actualSize,
    stroke: { width: 1, color: '#999' },
  };
}
