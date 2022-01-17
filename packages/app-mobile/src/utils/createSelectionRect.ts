import { SelectionGesture } from '../hooks/useSelectionGesture';
import { ElementType } from '../types';

export default function createSelectionRect(gesture: SelectionGesture) {
  return {
    type: ElementType.Rect,
    color: 'transparent',
    stroke: {
      width: 1,
      color: 'lightblue',
    },
    position: {
      x: () => gesture.position.value.x,
      y: () => gesture.position.value.y,
    },
    size: {
      width: () => gesture.size.value.width,
      height: () => gesture.size.value.height,
    },
  };
}
