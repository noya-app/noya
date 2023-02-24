import { Editor, Node, Point, Transforms } from 'slate';
import { CustomEditor } from './types';

export function resetNodes(
  editor: CustomEditor,
  options: {
    nodes?: Node[];
    at?: Location;
  } = {},
): void {
  const children = [...editor.children];

  children.forEach((node) =>
    editor.apply({ type: 'remove_node', path: [0], node }),
  );

  const nodes = options.nodes;

  if (nodes) {
    Editor.withoutNormalizing(editor, () => {
      nodes.forEach((node, i) =>
        editor.apply({ type: 'insert_node', path: [i], node: node }),
      );
    });
  }

  const point =
    options.at && Point.isPoint(options.at)
      ? options.at
      : Editor.end(editor, []);

  if (point) {
    Transforms.select(editor, point);
  }

  Editor.normalize(editor, { force: true });
}
