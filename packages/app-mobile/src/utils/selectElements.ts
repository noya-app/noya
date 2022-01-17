import {
  CanvasElement,
  ElementType,
  Position,
  Rect,
  Path,
  Size,
} from '../types';

function checkRectCollision(element: CanvasElement, point: Position) {
  const { position, size } = element as Rect;

  // For simplicty assume that rect doesn't use animated values
  const x2 = (position.x as number) + (size.width as number);
  const y2 = (position.y as number) + (size.height as number);

  // Dummy version
  return (
    point.x >= position.x &&
    point.y >= position.y &&
    point.x <= x2 &&
    point.y <= y2
  );
}

function checkPathCollision(element: CanvasElement, point: Position) {
  const { points } = element as Path;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -1;
  let maxY = -1;

  points.forEach((pathPoint) => {
    minX = Math.min(minX, pathPoint.x as number);
    minY = Math.min(minY, pathPoint.y as number);
    maxX = Math.max(maxX, pathPoint.x as number);
    maxY = Math.max(maxY, pathPoint.y as number);
  });

  // Dummy version
  return (
    point.x >= minX && point.y >= minY && point.x <= maxX && point.y <= maxY
  );
}

export default function selectElements(
  elements: CanvasElement[],
  point: Position,
  size?: Size,
): CanvasElement[] {
  // // Reverse the array to have 'front' elements first
  const reversedElements = [...elements].reverse();
  const newElements = [...elements];
  const canBeOnlyOne = !size;
  let collisionFound = false;

  for (let i = 0; i < reversedElements.length; i += 1) {
    const element = reversedElements[i];
    const collisionDect = {
      [ElementType.Rect]: checkRectCollision,
      [ElementType.Image]: checkRectCollision,
      [ElementType.Path]: checkPathCollision,
    }[element.type];
    const isColliding = collisionDect(element, point);

    if (isColliding && (!canBeOnlyOne || !collisionFound)) {
      newElements[elements.length - i - 1] = {
        ...newElements[elements.length - i - 1],
        isActive: true,
      };
      collisionFound = true;
    } else {
      newElements[elements.length - i - 1] = {
        ...newElements[elements.length - i - 1],
        isActive: false,
      };
    }
  }

  return newElements;
}
