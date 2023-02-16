import { useDispatch } from 'noya-app-state-context';
import { useDesignSystemTheme } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import {
  FALLTHROUGH,
  getCurrentPlatform,
  handleKeyboardEvent,
} from 'noya-keymap';
import { amplitude, ILogEvent } from 'noya-log';
import { BlockDefinition, DrawableLayerType, ParentLayer } from 'noya-state';
import { debounce } from 'noya-utils';
import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  BaseEditor,
  createEditor,
  Descendant,
  Editor,
  Element as SlateElement,
  Node,
  Range,
  Transforms,
} from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import {
  DefaultElement,
  Editable,
  ReactEditor,
  RenderElementProps,
  Slate,
  useFocused,
  useSelected,
  withReact,
} from 'slate-react';
import { Blocks } from './blocks';

import {
  heading1SymbolId,
  heading2SymbolId,
  heading3SymbolId,
  heading4SymbolId,
  heading5SymbolId,
  heading6SymbolId,
  textSymbolId,
} from './blocks/symbolIds';
import { allAyonSymbols } from './blocks/symbols';
import { layersWithoutSpacers } from './blocks/zipWithoutSpacers';
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
  const theme = useDesignSystemTheme();
  const dispatch = useDispatch();

  const blockDefinition = Blocks[layer.symbolID];

  const editorRef = useRef<CustomEditor>();

  // Creating an editor ref with useLazyValue fixes hot reload
  // TODO: Swap editor or validation when component type changes?
  if (!editorRef.current) {
    const newEditor = withLayout(
      blockDefinition.symbol,
      withHistory(withReact(createEditor())),
    );
    newEditor.blockDefinition = blockDefinition;
    editorRef.current = newEditor;
  }

  useEffect(() => {
    if (!editorRef.current) return;

    if (editorRef.current.blockDefinition === blockDefinition) return;

    const newEditor = withLayout(
      blockDefinition.symbol,
      withHistory(withReact(createEditor())),
    );
    newEditor.blockDefinition = blockDefinition;
    editorRef.current = newEditor;
  }, [blockDefinition]);

  const editor = editorRef.current;

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

  const getRangeDOMPosition = useCallback(
    (range: Range) => {
      const domRange = ReactEditor.toDOMRange(editor, range);
      const rect = domRange.getBoundingClientRect();
      return { x: rect.left, y: rect.top };
    },
    [editor],
  );

  const symbolCompletionMenu = useCompletionMenu({
    getPosition: getRangeDOMPosition,
    possibleItems: symbolItems,
    onSelect: (target, item) => {
      Transforms.delete(editor, { at: target });
      const newText = toString(editor.children);

      onChangeBlockType({ symbolId: item.id });
      setBlockText(newText);
    },
  });

  const hashCompletionMenu = useCompletionMenu({
    getPosition: getRangeDOMPosition,
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
        'Block Type': blockDefinition.symbol.symbolID,
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

  const [isMouseWithinEditor, setIsMouseWithinEditor] = useState(false);

  const onMouseEnter = useCallback(() => {
    setIsMouseWithinEditor(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsMouseWithinEditor(false);
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const handleDelete = () => {
        // If there's text, don't delete the layer
        if (blockText) return FALLTHROUGH;

        dispatch('deleteLayer', layer.do_objectID);
        dispatch('interaction', ['reset']);

        onFocusCanvas();
      };

      handleKeyboardEvent(event.nativeEvent, getCurrentPlatform(navigator), {
        // If the mouse is inside the editor, we'll always be showing the text cursor anyway,
        // so it's just distracting to change this (which updates the tool icons in the UI)
        ...(!isMouseWithinEditor && {
          Shift: () => {
            dispatch('interaction', ['setCursor', 'cell']);
            return FALLTHROUGH;
          },
          Mod: () => {
            dispatch('interaction', ['setCursor', 'crosshair']);
            return FALLTHROUGH;
          },
        }),
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
      isMouseWithinEditor,
      symbolCompletionMenu.keyMap,
      hashCompletionMenu.keyMap,
      blockText,
      dispatch,
      layer.do_objectID,
      onFocusCanvas,
    ],
  );

  const onKeyUp = useCallback(
    (event: React.KeyboardEvent) => {
      handleKeyboardEvent(event.nativeEvent, getCurrentPlatform(navigator), {
        Shift: () => {
          dispatch('interaction', ['setCursor', undefined]);
          return FALLTHROUGH;
        },
        Mod: () => {
          dispatch('interaction', ['setCursor', undefined]);
          return FALLTHROUGH;
        },
      });
    },
    [dispatch],
  );

  const logEditedTextDebounced = useMemo(
    () =>
      debounce((...args: Parameters<ILogEvent>): void => {
        amplitude.logEvent(...args);
      }, 1000),
    [],
  );

  const renderElement = useCallback(
    (props: RenderElementProps) => (
      <ElementComponent symbol={blockDefinition.symbol} {...props} />
    ),
    [blockDefinition.symbol],
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

        logEditedTextDebounced('Project - Block - Edited Text', {
          'Block Type': blockDefinition.symbol.symbolID,
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
        onKeyUp={onKeyUp}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          position: 'absolute',
          inset: 0,
          padding: 4,
          gap: '2px',
          display: 'flex',
          flexDirection: 'column',
          ...theme.textStyles.small,
        }}
        spellCheck={false}
        placeholder={blockDefinition.placeholderText}
        renderElement={renderElement}
      />
      {symbolCompletionMenu.element}
      {hashCompletionMenu.element}
    </Slate>
  );
});

function ElementComponent({
  symbol,
  ...props
}: RenderElementProps & {
  symbol: Sketch.SymbolMaster;
}) {
  const selected = useSelected();
  const focused = useFocused();

  if (focused && props.element.label) {
    return (
      <div
        style={{
          background: selected ? 'white' : 'rgba(0,0,0,0.05)',
          border: `1px solid ${selected ? 'black' : 'transparent'}`,
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'end',
        }}
      >
        <div style={{ flex: '1' }}>
          <DefaultElement {...props} />
        </div>
        <span
          contentEditable={false}
          style={{
            color: 'rgba(0,0,0,0.4)',
            userSelect: 'none',
            // TODO: Click should focus the end of the line
            pointerEvents: 'none',
          }}
        >
          {props.element.label}
        </span>
      </div>
    );
  }

  return <DefaultElement {...props} />;
}

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
  label?: string;
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

export type CustomEditor = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    blockDefinition: BlockDefinition;
  };

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText | EmptyText;
  }
}

function withLayout(symbol: Sketch.SymbolMaster, editor: CustomEditor) {
  const { normalizeNode } = editor;

  const layers = layersWithoutSpacers(symbol);

  editor.normalizeNode = ([node, path]) => {
    // If this is the editor
    if (path.length === 0) {
      // Ensure there's a node for each layer and the container
      while (editor.children.length < layers.length + 1) {
        const block = Blocks[layers[editor.children.length - 1].symbolID];

        const paragraph: ParagraphElement = {
          type: 'paragraph',
          children: [{ text: '' }],
          label: block.symbol.name,
        };

        Transforms.insertNodes(editor, paragraph, {
          at: path.concat(editor.children.length),
        });
      }

      while (editor.children.length > layers.length + 1) {
        Transforms.removeNodes(editor, {
          at: path.concat(editor.children.length - 1),
        });
      }

      for (const [child, childPath] of Node.children(editor, path)) {
        if (!SlateElement.isElement(child)) continue;

        const slateIndex = childPath[0];

        const layer = layers[slateIndex];

        if (layer) {
          const block = Blocks[layer.symbolID];

          const label = block.symbol.name;

          if (child.label === label) continue;

          const newProperties: Partial<SlateElement> = { label };

          Transforms.setNodes<SlateElement>(editor, newProperties, {
            at: childPath,
          });
        } else {
          if (!child.label) continue;

          const newProperties: Partial<SlateElement> = { label: undefined };

          Transforms.setNodes<SlateElement>(editor, newProperties, {
            at: childPath,
          });
        }
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
}
