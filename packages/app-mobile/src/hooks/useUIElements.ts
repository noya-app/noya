import { CanvasElement, ElementType, Path, Rect, ToolMode } from '../types';
import createSelectionRect from '../utils/createSelectionRect';
import { SelectionGesture } from './useSelectionGesture';
import { TapGesture } from './useTapGesture';

interface Params {
  elements: CanvasElement[];
  toolMode: ToolMode;

  // Pure laziness
  selectionGesture: SelectionGesture;
  tapGesture: TapGesture;
}

const ControlPointSize = {
  width: 12,
  height: 12,
};

function getControlPoint(x: number, y: number) {
  return {
    type: ElementType.Rect,
    size: ControlPointSize,
    position: {
      x,
      y,
    },
    color: '#fff',
    stroke: {
      width: 2,
      color: '#151a23',
    },
  };
}

function getUIToolsForRect(element: Rect): CanvasElement[] {
  const ui: Rect[] = [
    {
      type: ElementType.Rect,
      size: element.size,
      position: element.position,
      color: 'transparent',
      stroke: {
        width: 1,
        color: 'lightblue',
      },
    },
    // Top points
    getControlPoint(
      (element.position.x as number) - ControlPointSize.width / 2 + 2,
      (element.position.y as number) - ControlPointSize.height / 2 + 2,
    ),
    getControlPoint(
      (element.position.x as number) +
        (element.size.width as number) / 2 -
        ControlPointSize.width / 2 +
        2,
      (element.position.y as number) - ControlPointSize.height / 2 + 2,
    ),
    getControlPoint(
      (element.position.x as number) +
        (element.size.width as number) -
        ControlPointSize.width / 2 -
        2,
      (element.position.y as number) - ControlPointSize.height / 2 + 2,
    ),

    // Mid points
    getControlPoint(
      (element.position.x as number) - ControlPointSize.width / 2 + 2,
      (element.position.y as number) +
        (element.size.height as number) / 2 -
        ControlPointSize.height / 2,
    ),
    // getControlPoint(
    //   (element.position.x as number) +
    //     (element.size.width as number) / 2 -
    //     ControlPointSize.width / 2 +
    //     2,
    //   (element.position.y as number) +
    //     (element.size.height as number) / 2 -
    //     ControlPointSize.height / 2,
    // ),
    getControlPoint(
      (element.position.x as number) +
        (element.size.width as number) -
        ControlPointSize.width / 2 -
        2,
      (element.position.y as number) +
        (element.size.height as number) / 2 -
        ControlPointSize.height / 2,
    ),

    // Bottom Points
    getControlPoint(
      (element.position.x as number) - ControlPointSize.width / 2 + 2,
      (element.position.y as number) +
        (element.size.height as number) -
        ControlPointSize.height / 2,
    ),
    getControlPoint(
      (element.position.x as number) +
        (element.size.width as number) / 2 -
        ControlPointSize.width / 2 +
        2,
      (element.position.y as number) +
        (element.size.height as number) -
        ControlPointSize.height / 2,
    ),
    getControlPoint(
      (element.position.x as number) +
        (element.size.width as number) -
        ControlPointSize.width / 2 -
        2,
      (element.position.y as number) +
        (element.size.height as number) -
        ControlPointSize.height / 2,
    ),
  ];

  return ui;
}

function getUIToolsForPath(element: Path): CanvasElement[] {
  const ui: Rect[] = [];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -1;
  let maxY = -1;

  element.points.forEach((point) => {
    minX = Math.min(minX, point.x as number);
    minY = Math.min(minY, point.y as number);
    maxX = Math.max(maxX, point.x as number);
    maxY = Math.max(maxY, point.y as number);

    ui.push(
      getControlPoint(
        (point.x as number) - ControlPointSize.width / 2 + 2,
        (point.y as number) - ControlPointSize.height / 2 + 2,
      ),
    );
  });

  ui.push({
    type: ElementType.Rect,
    size: { width: maxX - minX, height: maxY - minY },
    position: { x: minX, y: minY },
    color: 'transparent',
    stroke: {
      width: 1,
      color: 'lightblue',
    },
  });

  return ui;
}

function getUIToolsForElement(element: CanvasElement) {
  if (element.type === ElementType.Rect || element.type === ElementType.Image) {
    return getUIToolsForRect(element as Rect);
  }

  if (element.type === ElementType.Path) {
    return getUIToolsForPath(element as Path);
  }

  return [];
}

export default function useUIElements(params: Params) {
  const { elements, toolMode, selectionGesture } = params;

  const uiElements: CanvasElement[] = [];

  if (toolMode !== ToolMode.CreatePath) {
    uiElements.push(createSelectionRect(selectionGesture));
  }

  elements.forEach((element) => {
    if (element.isActive) {
      uiElements.push(...getUIToolsForElement(element));
    }
  });

  return uiElements;
}
