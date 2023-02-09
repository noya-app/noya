import { useDispatch } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import {
  FALLTHROUGH,
  getCurrentPlatform,
  handleKeyboardEvent,
} from 'noya-keymap';
import { amplitude } from 'noya-log';
import { useLazyValue } from 'noya-react-utils';
import { DrawableLayerType, ParentLayer } from 'noya-state';
import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  BaseEditor,
  createEditor,
  Descendant,
  Editor,
  Node,
  Range,
  Transforms,
} from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import { Blocks } from './blocks';

import {
  allAyonSymbols,
  heading1SymbolId,
  heading2SymbolId,
  heading3SymbolId,
  heading4SymbolId,
  heading5SymbolId,
  heading6SymbolId,
  textSymbolId,
} from './blocks/symbols';
import { InferredBlockTypeResult } from './types';
import { useCompletionMenu } from './useCompletionMenu';

export interface IBlockEditor {
  focus: () => void;
}

const BLOCK_TYPE_SHORTCUTS: { [shortcut: string]: string } = {
  '#': heading1SymbolId,
  '##': heading2SymbolId,
  '###': heading3SymbolId,
  '####': heading4SymbolId,
  '#####': heading5SymbolId,
  '######': heading6SymbolId,
  '"': textSymbolId,
};

function textCommand(
  triggerPrefix: string,
  editor: Editor,
): { range: Range; match: string } | undefined {
  const { selection } = editor;

  if (!selection || !Range.isCollapsed(selection)) return;

  const triggerRegex = new RegExp(`\\${triggerPrefix}([A-Za-z0-9\\-]*)$`);
  const afterRegex = /^(,|\s|$)/;

  const [start] = Range.edges(selection);

  const lineStart = Editor.before(editor, start, { unit: 'line' });
  const lineEnd = Editor.after(editor, start, { unit: 'line' });

  if (!lineStart) return;

  const beforeText = Editor.string(
    editor,
    Editor.range(editor, lineStart, start),
  );
  const afterText = Editor.string(editor, Editor.range(editor, start, lineEnd));

  const beforeMatch = beforeText.match(triggerRegex);
  const afterMatch = afterText.match(afterRegex);

  if (!beforeMatch || !afterMatch) return;

  const match = beforeMatch[1];

  const rangeStart = Editor.before(editor, start, {
    unit: 'character',
    distance: match.length + 1,
  });

  if (!rangeStart) return;

  const range = Editor.range(editor, rangeStart, start);

  return { range, match };
}

function textShortcut(
  triggerPrefix: string,
  editor: Editor,
): { range: Range; match: string } | undefined {
  const { selection } = editor;

  if (!selection || !Range.isCollapsed(selection)) return;

  const triggerRegex = new RegExp(`^(${triggerPrefix}) $`);

  const [start] = Range.edges(selection);

  const editorStart = Editor.start(editor, []);

  if (!editorStart) return;

  const beforeText = Editor.string(
    editor,
    Editor.range(editor, editorStart, start),
  );

  const beforeMatch = beforeText.match(triggerRegex);

  if (!beforeMatch) return;

  const match = beforeMatch[1];

  const rangeStart = Editor.before(editor, start, {
    unit: 'character',
    distance: match.length + 1,
  });

  if (!rangeStart) return;

  const range = Editor.range(editor, rangeStart, start);

  return { range, match };
}

export const BlockEditor = forwardRef(function BlockEditor(
  {
    isEditing,
    isSelected,
    layer,
    parent,
    blockText,
    blockTypes,
    onChangeBlockType,
    onChangeBlockText,
    onFocusCanvas,
  }: {
    isEditing: boolean;
    isSelected: boolean;
    layer: Sketch.SymbolInstance;
    parent: ParentLayer;
    blockText: string;
    blockTypes: InferredBlockTypeResult[];
    onChangeBlockType: (type: DrawableLayerType) => void;
    onChangeBlockText: (text: string) => void;
    onFocusCanvas: () => void;
  },
  forwardedRef: ForwardedRef<IBlockEditor>,
) {
  const dispatch = useDispatch();

  // Creating an editor ref with useLazyValue fixes hot reload
  const editor = useLazyValue(() => withHistory(withReact(createEditor())));

  const [internalBlockText, setInternalBlockText] = useState(blockText);

  const setBlockText = useCallback(
    (text: string) => {
      setInternalBlockText(text);
      onChangeBlockText(text);
    },
    [onChangeBlockText],
  );

  const initialValue = useMemo(() => fromString(blockText), [blockText]);

  useEffect(() => {
    if (internalBlockText === blockText) return;

    editor.children = initialValue;
  }, [initialValue, editor, internalBlockText, blockText]);

  useImperativeHandle(forwardedRef, () => ({
    focus: () => {
      ReactEditor.focus(editor);
      Transforms.select(editor, Editor.range(editor, []));
    },
  }));

  useEffect(() => {
    if (isEditing) return;

    ReactEditor.deselect(editor);
  }, [editor, isEditing]);

  const symbolItems = allAyonSymbols.map((symbol) => ({
    name: symbol.name,
    id: symbol.symbolID,
  }));

  const blockDefinition = Blocks[layer.symbolID];

  const symbolCompletionMenu = useCompletionMenu({
    editor,
    possibleItems: symbolItems,
    onSelect: (target, item) => {
      Transforms.delete(editor, { at: target });
      const newText = toString(editor.children);

      onChangeBlockType({ symbolId: item.id });
      setBlockText(newText);
    },
  });

  const hashCompletionMenu = useCompletionMenu({
    editor,
    showExactMatch: false,
    possibleItems: (blockDefinition?.hashtags ?? []).map((item) => ({
      name: item,
      id: item,
      icon: (
        <div
          style={{
            width: 19,
            height: 19,
            borderWidth: /^border(?!-\d)/.test(item) ? 1 : undefined,
            background: /^rounded/.test(item)
              ? 'rgb(148 163 184)'
              : /^opacity/.test(item)
              ? 'black'
              : undefined,
          }}
          className={item}
        >
          {/^(text|font)/.test(item) ? 'Tt' : null}
        </div>
      ),
    })),
    onSelect: (target, item) => {
      amplitude.logEvent('Project - Block - Inserted Hashtag', {
        'Block Type': blockDefinition.id,
        X: layer.frame.x,
        Y: layer.frame.y,
        Width: layer.frame.width,
        Height: layer.frame.height,
        Hashtag: item.id,
      });

      Transforms.delete(editor, { at: target });
      Transforms.insertText(editor, `#${item.id} `, { at: target.anchor });

      const newText = toString(editor.children);

      setBlockText(newText);
    },
  });

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const handleDelete = () => {
        // If there's text, don't delete the layer
        if (blockText) return FALLTHROUGH;

        dispatch('deleteLayer', layer.do_objectID);
        dispatch('interaction', ['reset']);

        onFocusCanvas();
      };

      handleKeyboardEvent(event.nativeEvent, getCurrentPlatform(), {
        Shift: () => {
          dispatch('interaction', ['setCursor', 'cell']);
          return FALLTHROUGH;
        },
        Escape: () => {
          dispatch('interaction', ['reset']);
          dispatch('selectLayer', []);
        },
        Backspace: handleDelete,
        Delete: handleDelete,
        // These may override the Escape shortcut
        ...symbolCompletionMenu.keyMap,
        ...hashCompletionMenu.keyMap,
      });
    },
    [
      symbolCompletionMenu.keyMap,
      hashCompletionMenu.keyMap,
      blockText,
      dispatch,
      layer.do_objectID,
      onFocusCanvas,
    ],
  );

  return (
    <Slate
      editor={editor}
      value={initialValue}
      // This can fire after the selection has changed, so we need to be explicit
      // about which layer we're modifying when dispatching actions
      onChange={(value) => {
        const domNode = ReactEditor.toDOMNode(editor, editor);

        // Slate fires a final change event after the editor is blurred.
        // We should only handle change events if the editor is focused.
        if (domNode !== document.activeElement) return;

        amplitude.logEvent('Project - Block - Edited Text', {
          'Block Type': blockDefinition.id,
          X: layer.frame.x,
          Y: layer.frame.y,
          Width: layer.frame.width,
          Height: layer.frame.height,
        });

        const text = toString(value);

        const mdShortcut = textShortcut(
          Object.keys(BLOCK_TYPE_SHORTCUTS).join('|'),
          editor,
        );

        if (mdShortcut) {
          const { range, match } = mdShortcut;

          Transforms.delete(editor, { at: range });
          const newText = toString(editor.children);

          onChangeBlockType({ symbolId: BLOCK_TYPE_SHORTCUTS[match] });
          setBlockText(newText);

          return;
        }

        const slashCommand = textCommand('/', editor);

        if (slashCommand) {
          const { range, match } = slashCommand;

          symbolCompletionMenu.open(range, match);
        } else {
          symbolCompletionMenu.close();
        }

        const hashCommand = textCommand('#', editor);

        if (hashCommand) {
          const { range, match } = hashCommand;

          hashCompletionMenu.open(range, match);
        } else {
          hashCompletionMenu.close();
        }

        setBlockText(text);

        // Lock the block type when the user starts editing the text
        if (text) {
          dispatch('setSymbolIdIsFixed', layer.do_objectID, true);
        }
      }}
    >
      <Editable
        onKeyDown={onKeyDown}
        style={{ position: 'absolute', inset: 0, padding: 4 }}
        spellCheck={false}
        placeholder={blockDefinition.placeholderText}
      />
      {symbolCompletionMenu.element}
      {hashCompletionMenu.element}
    </Slate>
  );
});

function toString(value: Descendant[]): string {
  return value.map((n) => Node.string(n)).join('\n');
}

function fromString(value: string): Descendant[] {
  return value.split('\n').map((line) => ({
    type: 'paragraph',
    children: [{ text: line }],
  }));
}

export type ParagraphElement = {
  type: 'paragraph';
  align?: string;
  children: Descendant[];
};

type CustomElement = ParagraphElement;

export type CustomText = {
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  text: string;
};

export type EmptyText = {
  text: string;
};

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText | EmptyText;
  }
}
