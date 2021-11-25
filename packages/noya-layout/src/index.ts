import { Size } from 'noya-geometry';
import yoga from 'yoga-layout-prebuilt';
import { LayoutNode, LayoutProperties } from './types';
import { createYogaNode, YogaTraverse } from './yogaNode';

export * from './types';
export { YogaTraverse };
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
