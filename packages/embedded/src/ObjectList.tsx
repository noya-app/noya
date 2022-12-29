import { TreeView } from 'noya-designsystem';
import React from 'react';
import { withOptions } from 'tree-visit';
import { z } from 'zod';

export const Hierarchy = withOptions<ObjectListNode>({
  getChildren: (node) => node.children,
});

type ObjectListNode = {
  id: string;
  children: ObjectListNode[];
};

const objectListNode: z.ZodType<ObjectListNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    children: z.array(objectListNode),
  }),
);

export const objectListSchema = z.object({
  type: z.literal('objectList'),
  data: objectListNode,
  selection: z.string().optional(),
});

export function ObjectList({
  data,
  selection,
  sendMessage,
}: {
  data: ObjectListNode;
  selection: string | undefined;
  sendMessage: (message: any) => void;
}) {
  const [hoveredId, setHoveredId] = React.useState<string | undefined>();

  const flat = Hierarchy.flatMap(data, (node, indexPath) =>
    indexPath.length === 0
      ? []
      : [
          {
            id: node.id,
            depth: indexPath.length - 1,
            selected: node.id === selection,
            hovered: node.id === hoveredId,
            expanded: node.children.length > 0 ? true : undefined,
          },
        ],
  );

  return (
    <TreeView.Root
      data={flat}
      scrollable
      keyExtractor={(item) => item.id}
      renderItem={(item) => (
        <TreeView.Row
          key={item.id}
          depth={item.depth}
          isSectionHeader={item.depth === 0}
          // icon={<BoxIcon />}
          hovered={item.hovered}
          selected={item.selected}
          expanded={item.expanded}
          onPress={() => {
            sendMessage({ type: 'select', id: item.id });
          }}
          onHoverChange={(hovered) => {
            setHoveredId(hovered ? item.id : undefined);
          }}
        >
          {item.id}
        </TreeView.Row>
      )}
    />
  );
}
