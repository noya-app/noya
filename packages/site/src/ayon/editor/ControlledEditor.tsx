import { isEqualIgnoringUndefinedKeys } from 'noya-utils';
import React, {
  ComponentProps,
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { Descendant, Node } from 'slate';
import { Slate } from 'slate-react';
import { resetNodes } from './resetNodes';
import { CustomEditor, EditorSchema } from './types';

export interface IControlledEditor {
  updateInternal(value: Node[], schema?: EditorSchema): void;
}

export const ControlledEditor = forwardRef(function ControlledEditor(
  {
    value: initialValue,
    onChange,
    schema,
    editor,
    children,
  }: Omit<ComponentProps<typeof Slate>, 'editor'> & {
    editor: CustomEditor;
    schema: EditorSchema;
  },
  forwardedRef: ForwardedRef<IControlledEditor>,
) {
  const [internalNodes, setInternalNodes] = useState(initialValue);

  useEffect(() => {
    if (
      isEqualIgnoringUndefinedKeys(initialValue, internalNodes) &&
      isEqualIgnoringUndefinedKeys(editor.schema, schema)
    ) {
      return;
    }

    editor.schema = schema;
    setInternalNodes(initialValue);
    resetNodes(editor, { nodes: initialValue });
  }, [initialValue, internalNodes, editor, schema]);

  useImperativeHandle(forwardedRef, () => ({
    updateInternal(value: Descendant[], schema?: EditorSchema) {
      if (schema) {
        editor.schema = schema;
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
