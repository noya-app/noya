import { useDispatch } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import {
  FALLTHROUGH,
  getCurrentPlatform,
  handleKeyboardEvent,
} from 'noya-keymap';
import { DrawableLayerType, ParentLayer } from 'noya-state';
import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
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
import styled from 'styled-components';

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
import { filterHashTagsAndSlashCommands } from './parse';
import { Stacking } from './stacking';
import { InferredBlockTypeResult } from './types';
import { useCompletionMenu } from './useCompletionMenu';

export const PositioningElement = styled.div({
  top: '-9999px',
  left: '-9999px',
  position: 'absolute',
  zIndex: Stacking.level.menu,
});

export const ContentElement = styled.div(({ theme }) => ({
  ...theme.textStyles.small,
  borderRadius: 4,
  overflow: 'hidden',
  backgroundColor: theme.colors.popover.background,
  boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 12px rgba(0,0,0,0.1)',
  color: theme.colors.textMuted,
}));

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

  const triggerRegex = new RegExp(`\\${triggerPrefix}(\\w*)$`);

  const [start] = Range.edges(selection);

  const lineStart = Editor.before(editor, start, { unit: 'line' });

  if (!lineStart) return;

  const beforeText = Editor.string(
    editor,
    Editor.range(editor, lineStart, start),
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
    onFocusCanvas,
  }: {
    isEditing: boolean;
    isSelected: boolean;
    layer: Sketch.SymbolInstance;
    parent: ParentLayer;
    blockText: string;
    blockTypes: InferredBlockTypeResult[];
    onChangeBlockType: (type: DrawableLayerType) => void;
    onFocusCanvas: () => void;
  },
  forwardedRef: ForwardedRef<IBlockEditor>,
) {
  const dispatch = useDispatch();

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const descendants = useMemo(() => fromString(blockText), [blockText]);

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

  const symbolCompletionMenu = useCompletionMenu({
    editor,
    possibleItems: symbolItems,
    onSelect: (target, item) => {
      Transforms.delete(editor, { at: target });
      const newText = toString(editor.children);

      onChangeBlockType({ symbolId: item.id });
      dispatch('setSymbolIdIsFixed', layer.do_objectID, true);
      dispatch(
        'setBlockText',
        layer.do_objectID,
        newText,
        filterHashTagsAndSlashCommands(newText).content,
      );
    },
  });

  const hashCompletionMenu = useCompletionMenu<{
    name: string;
    id: string;
  }>({
    editor,
    possibleItems: [],
    onSelect: (target, item) => {
      Transforms.delete(editor, { at: target });
      Transforms.insertText(editor, item.id, { at: target.anchor });

      const newText = toString(editor.children);

      dispatch(
        'setBlockText',
        layer.do_objectID,
        newText,
        filterHashTagsAndSlashCommands(newText).content,
      );
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
      value={descendants}
      // This can fire after the selection has changed, so we need to be explicit
      // about which layer we're modifying when dispatching actions
      onChange={(value) => {
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
          dispatch('setSymbolIdIsFixed', layer.do_objectID, true);
          dispatch(
            'setBlockText',
            layer.do_objectID,
            newText,
            filterHashTagsAndSlashCommands(newText).content,
          );

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

        dispatch(
          'setBlockText',
          layer.do_objectID,
          text,
          filterHashTagsAndSlashCommands(text).content,
        );

        // Lock the block type when the user starts editing the text
        if (text) {
          dispatch('setSymbolIdIsFixed', layer.do_objectID, true);
        }
      }}
    >
      <Editable
        onKeyDown={onKeyDown}
        style={{ position: 'absolute', inset: 0, padding: 4 }}
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
