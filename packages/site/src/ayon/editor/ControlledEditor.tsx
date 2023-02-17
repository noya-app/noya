import { isDeepEqual } from 'noya-utils';
import React, {
  ComponentProps,
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { Descendant, Editor, Node, Point, Transforms } from 'slate';
import { Slate } from 'slate-react';
import { CustomEditor } from './types';

export interface IControlledEditor {
  updateInternal(value: Node[], symbolId?: string): void;
}

export const ControlledEditor = forwardRef(function ControlledEditor(
  {
    value: initialValue,
    onChange,
    symbolId,
    editor,
    children,
  }: Omit<ComponentProps<typeof Slate>, 'editor'> & {
    editor: CustomEditor;
    symbolId: string;
  },
  forwardedRef: ForwardedRef<IControlledEditor>,
) {
  const [internalNodes, setInternalNodes] = useState(initialValue);

  useEffect(() => {
    if (
      isDeepEqual(initialValue, internalNodes) &&
      symbolId === editor.symbolId
    ) {
      return;
    }

    editor.symbolId = symbolId;
    setInternalNodes(initialValue);
    resetNodes(editor, { nodes: initialValue });
  }, [initialValue, internalNodes, editor, symbolId]);

  useImperativeHandle(forwardedRef, () => ({
    updateInternal(value: Descendant[], symbolId?: string) {
      if (symbolId) {
        editor.symbolId = symbolId;
      }
      setInternalNodes(value);
    },
  }));

  return (
    <Slate
      editor={editor}
      value={initialValue}
      onChange={(value) => {
        onChange?.(value);
        setInternalNodes(value);
      }}
    >
      {children}
    </Slate>
  );
});

function resetNodes(
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
