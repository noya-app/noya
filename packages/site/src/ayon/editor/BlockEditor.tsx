import { useDispatch } from 'noya-app-state-context';
import { useDesignSystemTheme } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import {
  FALLTHROUGH,
  getCurrentPlatform,
  handleKeyboardEvent,
} from 'noya-keymap';
import { amplitude, ILogEvent } from 'noya-log';
import { useLazyValue } from 'noya-react-utils';
import { BlockContent, DrawableLayerType, ParentLayer } from 'noya-state';
import { debounce } from 'noya-utils';
import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { createEditor, Descendant, Editor, Range, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  withReact,
} from 'slate-react';
import { Blocks } from '../blocks';
import { allAyonSymbols } from '../blocks/symbols';
import { InferredBlockTypeResult } from '../types';
import { useCompletionMenu } from '../useCompletionMenu';
import { BLOCK_TYPE_SHORTCUTS, textCommand, textShortcut } from './commands';
import { ControlledEditor } from './ControlledEditor';
import { ElementComponent } from './ElementComponent';
import { fromSymbol, toContent, toString } from './serialization';
import { CustomEditor } from './types';
import { withLayout } from './withLayout';

export interface IBlockEditor {
  focus: () => void;
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
    onChangeBlockContent,
    onFocusCanvas,
  }: {
    isEditing: boolean;
    isSelected: boolean;
    layer: Sketch.SymbolInstance;
    parent: ParentLayer;
    blockText: string;
    blockTypes: InferredBlockTypeResult[];
    onChangeBlockType: (type: DrawableLayerType) => void;
    onChangeBlockContent: (content: BlockContent) => void;
    onFocusCanvas: () => void;
  },
  forwardedRef: ForwardedRef<IBlockEditor>,
) {
  const theme = useDesignSystemTheme();
  const dispatch = useDispatch();

  const blockDefinition = Blocks[layer.symbolID];

  const editor = useLazyValue<CustomEditor>(() =>
    withLayout(layer.symbolID, withHistory(withReact(createEditor()))),
  );

  const initialNodes = fromSymbol(blockDefinition.symbol, layer);

  const setBlockNodes = useCallback(
    (nodes: Descendant[]) => {
      const content = toContent(blockDefinition.symbol, nodes);

      onChangeBlockContent(content);
    },
    [blockDefinition.symbol, onChangeBlockContent],
  );

  useImperativeHandle(forwardedRef, () => ({
    focus: () => {
      ReactEditor.focus(editor);
      Transforms.select(editor, Editor.start(editor, []));
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

      onChangeBlockType({ symbolId: item.id });
      setBlockNodes(editor.children);
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

      setBlockNodes(editor.children);
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
    (props: RenderElementProps) => <ElementComponent {...props} />,
    [],
  );

  return (
    <ControlledEditor
      key={layer.symbolID}
      symbolId={layer.symbolID}
      editor={editor}
      value={initialNodes}
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

          onChangeBlockType({ symbolId: BLOCK_TYPE_SHORTCUTS[match] });
          setBlockNodes(editor.children);

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

        setBlockNodes(editor.children);

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
    </ControlledEditor>
  );
});
