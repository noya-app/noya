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
      isEqualIgnoringUndefinedKeys(initialValue, internalNodes) &&
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
