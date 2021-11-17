import { Size } from 'noya-geometry';
import yoga from 'yoga-layout-prebuilt';
import { LayoutNode, LayoutProperties } from './types';
import { createYogaNode } from './yogaNode';

export function createLayoutNode(
  properties: LayoutProperties,
  children?: LayoutNode[],
) {
  return {
    properties,
    children: children ?? [],
  };
}

export function calculateLayout(layoutNode: LayoutNode, size: Size) {
  const yogaNode = createYogaNode(layoutNode);

  yogaNode.calculateLayout(size.width, size.height, yoga.DIRECTION_LTR);

  return yogaNode;
}
