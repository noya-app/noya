import { Size } from 'noya-geometry';
import yoga from 'yoga-layout-prebuilt';
import { LayoutNode, LayoutProperties } from './types';
import { createYogaNode, YogaTraverse } from './yogaNode';

export * from './types';

export { YogaTraverse };

export const Edge = {
  top: yoga.EDGE_TOP,
  right: yoga.EDGE_RIGHT,
  bottom: yoga.EDGE_BOTTOM,
  left: yoga.EDGE_LEFT,
};

export type { YogaNode } from 'yoga-layout-prebuilt';

export const FlexDirection = {
  row: yoga.FLEX_DIRECTION_ROW,
  column: yoga.FLEX_DIRECTION_COLUMN,
};

export function createLayoutNode(
  properties: LayoutProperties,
  children?: LayoutNode[],
) {
  return {
    properties,
    children: children ?? [],
  };
}

export function measureLayout(layoutNode: LayoutNode, size: Size) {
  const yogaNode = createYogaNode(layoutNode);

  yogaNode.calculateLayout(size.width, size.height, yoga.DIRECTION_LTR);

  return yogaNode;
}
