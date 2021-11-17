import { createLayoutNode } from 'noya-layout';
import { describeValue } from 'noya-sketch-model';
import yoga from 'yoga-layout-prebuilt';
import { createYogaNode, YogaTraverse } from '../yogaNode';

test('measures', () => {
  const layoutNode = createLayoutNode(
    {
      width: 500,
      height: 300,
      justifyContent: yoga.JUSTIFY_CENTER,
      flexDirection: yoga.FLEX_DIRECTION_ROW,
    },
    [
      createLayoutNode({
        width: 100,
        height: 100,
      }),
      createLayoutNode({
        width: 100,
        height: 100,
      }),
    ],
  );

  const yogaNode = createYogaNode(layoutNode);

  yogaNode.calculateLayout(500, 300, yoga.DIRECTION_LTR);

  expect(
    YogaTraverse.diagram(yogaNode, (node) =>
      describeValue(node.getComputedLayout()),
    ),
  ).toMatchSnapshot();
});
