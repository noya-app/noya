import { Node, YogaEdge, YogaNode } from 'yoga-layout-prebuilt';
import { LayoutNode, LayoutProperties } from './types';
import { withOptions } from 'tree-visit';
import { range } from 'noya-utils';

export function setYogaNodeProperties(
  node: YogaNode,
  properties: LayoutProperties,
) {
  if (properties.alignContent !== undefined) {
    node.setAlignContent(properties.alignContent);
  }
  if (properties.alignItems !== undefined) {
    node.setAlignItems(properties.alignItems);
  }
  if (properties.alignSelf !== undefined) {
    node.setAlignSelf(properties.alignSelf);
  }
  if (properties.aspectRatio !== undefined) {
    node.setAspectRatio(properties.aspectRatio);
  }
  if (properties.border !== undefined) {
    Object.entries(properties.border).forEach(([edge, value]) => {
      node.setBorder(Number(edge) as YogaEdge, value);
    });
  }
  if (properties.display !== undefined) {
    node.setDisplay(properties.display);
  }
  if (properties.flex !== undefined) {
    node.setFlex(properties.flex);
  }
  if (properties.flexBasis !== undefined) {
    node.setFlexBasis(properties.flexBasis);
  }
  if (properties.flexBasisPercent !== undefined) {
    node.setFlexBasisPercent(properties.flexBasisPercent);
  }
  if (properties.flexDirection !== undefined) {
    node.setFlexDirection(properties.flexDirection);
  }
  if (properties.flexGrow !== undefined) {
    node.setFlexGrow(properties.flexGrow);
  }
  if (properties.flexShrink !== undefined) {
    node.setFlexShrink(properties.flexShrink);
  }
  if (properties.flexWrap !== undefined) {
    node.setFlexWrap(properties.flexWrap);
  }
  if (properties.height !== undefined) {
    node.setHeight(properties.height);
  }
  if (properties.heightAuto) {
    node.setHeightAuto();
  }
  if (properties.heightPercent !== undefined) {
    node.setHeightPercent(properties.heightPercent);
  }
  if (properties.justifyContent !== undefined) {
    node.setJustifyContent(properties.justifyContent);
  }
  if (properties.margin !== undefined) {
    Object.entries(properties.margin).forEach(([edge, value]) => {
      node.setMargin(Number(edge) as YogaEdge, value);
    });
  }
  if (properties.marginAuto !== undefined) {
    Object.entries(properties.marginAuto).forEach(([edge, value]) => {
      if (value) {
        node.setMarginAuto(Number(edge) as YogaEdge);
      }
    });
  }
  if (properties.marginPercent !== undefined) {
    Object.entries(properties.marginPercent).forEach(([edge, value]) => {
      node.setMarginPercent(Number(edge) as YogaEdge, value);
    });
  }
  if (properties.maxHeight !== undefined) {
    node.setMaxHeight(properties.maxHeight);
  }
  if (properties.maxHeightPercent !== undefined) {
    node.setMaxHeightPercent(properties.maxHeightPercent);
  }
  if (properties.maxWidth !== undefined) {
    node.setMaxWidth(properties.maxWidth);
  }
  if (properties.maxWidthPercent !== undefined) {
    node.setMaxWidthPercent(properties.maxWidthPercent);
  }
  if (properties.minHeight !== undefined) {
    node.setMinHeight(properties.minHeight);
  }
  if (properties.minHeightPercent !== undefined) {
    node.setMinHeightPercent(properties.minHeightPercent);
  }
  if (properties.minWidth !== undefined) {
    node.setMinWidth(properties.minWidth);
  }
  if (properties.minWidthPercent !== undefined) {
    node.setMinWidthPercent(properties.minWidthPercent);
  }
  if (properties.overflow !== undefined) {
    node.setOverflow(properties.overflow);
  }
  if (properties.padding !== undefined) {
    Object.entries(properties.padding).forEach(([edge, value]) => {
      node.setPadding(Number(edge) as YogaEdge, value);
    });
  }
  if (properties.paddingPercent !== undefined) {
    Object.entries(properties.paddingPercent).forEach(([edge, value]) => {
      node.setPaddingPercent(Number(edge) as YogaEdge, value);
    });
  }
  if (properties.position !== undefined) {
    Object.entries(properties.position).forEach(([edge, value]) => {
      node.setPosition(Number(edge) as YogaEdge, value);
    });
  }
  if (properties.positionPercent !== undefined) {
    Object.entries(properties.positionPercent).forEach(([edge, value]) => {
      node.setPositionPercent(Number(edge) as YogaEdge, value);
    });
  }
  if (properties.positionType !== undefined) {
    node.setPositionType(properties.positionType);
  }
  if (properties.width !== undefined) {
    node.setWidth(properties.width);
  }
  if (properties.widthAuto) {
    node.setWidthAuto();
  }
  if (properties.widthPercent !== undefined) {
    node.setWidthPercent(properties.widthPercent);
  }
}

export function createYogaNode(layoutNode: LayoutNode) {
  const node = Node.create();

  setYogaNodeProperties(node, layoutNode.properties);

  layoutNode.children.forEach((child, index) => {
    node.insertChild(createYogaNode(child), index);
  });

  return node;
}

export const YogaTraverse = withOptions<YogaNode>({
  getChildren: (node) => {
    const count = node.getChildCount();
    return range(0, count).map((index) => node.getChild(index));
  },
});
