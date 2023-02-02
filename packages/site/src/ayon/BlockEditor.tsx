import * as Portal from '@radix-ui/react-portal';
import { useDispatch } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
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
import { InferredBlockTypeResult } from './types';

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

// TODO:
// Markdown heading shortcuts
// Improve suggestion design
export const BlockEditor = forwardRef(function BlockEditor(
  {
    isEditing,
    isSelected,
    layer,
    parent,
    blockText,
    blockTypes,
    onChangeBlockType,
  }: {
    isEditing: boolean;
    isSelected: boolean;
    layer: Sketch.SymbolInstance;
    parent: ParentLayer;
    blockText: string;
    blockTypes: InferredBlockTypeResult[];
    onChangeBlockType: (type: DrawableLayerType) => void;
  },
  forwardedRef: ForwardedRef<IBlockEditor>,
) {
  const dispatch = useDispatch();

  const menuRef = React.useRef<HTMLDivElement>(null);

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

  const [target, setTarget] = useState<Range | null>(null);
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');

  const items = allAyonSymbols
    .filter((c) => c.name.toLowerCase().startsWith(search.toLowerCase()))
    .slice(0, 10);

  const onKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Shift': {
          dispatch('interaction', ['setCursor', 'cell']);
          break;
        }
        case 'Escape': {
          dispatch('interaction', ['reset']);
          dispatch('selectLayer', []);
          event.preventDefault();
          return;
        }
        case 'Backspace':
        case 'Delete': {
          // If there's text, don't delete the layer
          if (blockText) break;

          dispatch('deleteLayer', layer.do_objectID);
          event.preventDefault();
          return;
        }
      }

      if (target && items.length > 0) {
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            const prevIndex = index >= items.length - 1 ? 0 : index + 1;
            setIndex(prevIndex);
            break;
          case 'ArrowUp':
            event.preventDefault();
            const nextIndex = index <= 0 ? items.length - 1 : index - 1;
            setIndex(nextIndex);
            break;
          case 'Tab':
          case 'Enter':
            event.preventDefault();

            const item = items[index];

            Transforms.delete(editor, { at: target });
            const newText = toString(editor.children);

            onChangeBlockType({ symbolId: item.symbolID });
            dispatch('setSymbolIdIsFixed', true);
            dispatch(
              'setBlockText',
              layer.do_objectID,
              newText,
              filterHashTagsAndSlashCommands(newText).content,
            );

            setTarget(null);
            break;
          case 'Escape':
            event.preventDefault();
            setTarget(null);
            break;
        }
      }
    },
    [
      blockText,
      dispatch,
      editor,
      index,
      items,
      layer.do_objectID,
      onChangeBlockType,
      target,
    ],
  );

  useEffect(() => {
    const el = menuRef.current;

    if (!target || !items.length || !el) return;

    const domRange = ReactEditor.toDOMRange(editor, target);
    const rect = domRange.getBoundingClientRect();
    el.style.top = `${rect.top + window.pageYOffset + 24}px`;
    el.style.left = `${rect.left + window.pageXOffset}px`;
  }, [items.length, editor, index, search, target]);

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
          dispatch('setSymbolIdIsFixed', true);
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

          setTarget(range);
          setSearch(match);
          setIndex(0);
        } else {
          setTarget(null);
        }

        dispatch(
          'setBlockText',
          layer.do_objectID,
          text,
          filterHashTagsAndSlashCommands(text).content,
        );
      }}
    >
      <Editable
        onKeyDown={onKeyDown}
        style={{
          position: 'absolute',
          inset: 0,
          padding: 4,
        }}
      />
      {target && items.length > 0 && (
        <Portal.Root asChild>
          <div
            ref={menuRef}
            style={{
              top: '-9999px',
              left: '-9999px',
              position: 'absolute',
              zIndex: 1,
              padding: '3px',
              background: 'white',
              borderRadius: '4px',
              boxShadow: '0 1px 5px rgba(0,0,0,.2)',
            }}
            data-cy="mentions-portal"
          >
            {items.map((item, i) => (
              <div
                key={item.name}
                style={{
                  padding: '1px 3px',
                  borderRadius: '3px',
                  background: i === index ? '#B4D5FF' : 'transparent',
                }}
              >
                {item.name}
              </div>
            ))}
          </div>
        </Portal.Root>
      )}
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
