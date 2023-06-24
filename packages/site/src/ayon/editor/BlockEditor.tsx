import debounce from 'lodash.debounce';
import { useDispatch } from 'noya-app-state-context';
import { useDesignSystemTheme } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import {
  FALLTHROUGH,
  getCurrentPlatform,
  handleKeyboardEvent,
} from 'noya-keymap';
import { ILogEvent, amplitude } from 'noya-log';
import { useLazyValue } from 'noya-react-utils';
import { SketchModel } from 'noya-sketch-model';
import { BlockContent, Overrides, ParentLayer } from 'noya-state';
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
  Descendant,
  Editor,
  Range,
  Element as SlateElement,
  Transforms,
  createEditor,
} from 'slate';
import { withHistory } from 'slate-history';
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  withReact,
} from 'slate-react';
import { Blocks, allInsertableSymbols } from '../blocks/blocks';
import { flattenPassthroughLayers } from '../blocks/flattenPassthroughLayers';
import { InferredBlockTypeResult } from '../types';
import { CompletionItem, useCompletionMenu } from '../useCompletionMenu';
import { ControlledEditor, IControlledEditor } from './ControlledEditor';
import { ElementComponent } from './ElementComponent';
import { BLOCK_TYPE_SHORTCUTS, textCommand, textShortcut } from './commands';
import { extractBlockContent, fromSymbol, toContent } from './serialization';
import { CustomEditor, ParagraphElement } from './types';
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
    blockTypes,
    onChangeBlockContent,
    onFocusCanvas,
  }: {
    isEditing: boolean;
    isSelected: boolean;
    layer: Sketch.SymbolInstance;
    parent: ParentLayer;
    blockTypes: InferredBlockTypeResult[];
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

  const initialNodes = fromSymbol(
    blockDefinition.symbol,
    extractBlockContent(layer),
  );

  const setBlockNodes = useCallback(
    (
      nodes: Descendant[],
      // If there's a layerId that means this is a nested block
      symbolInfo?: { layerId?: string; symbolId: string },
    ) => {
      let content = toContent(blockDefinition.symbol, nodes);

      if (symbolInfo && symbolInfo.layerId) {
        const override = SketchModel.overrideValue({
          overrideName: Overrides.encodeName([symbolInfo.layerId], 'symbolID'),
          value: symbolInfo.symbolId,
        });

        content = {
          ...content,
          overrides: [...(content.overrides ?? []), override],
        };
      }

      if (symbolInfo && !symbolInfo.layerId) {
        content.symbolId = symbolInfo.symbolId;
        controlledEditorRef.current?.updateInternal(nodes, symbolInfo.symbolId);
      } else {
        controlledEditorRef.current?.updateInternal(nodes);
      }

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

  const symbolItems = allInsertableSymbols.map((symbol) => ({
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

  const controlledEditorRef = React.useRef<IControlledEditor>(null);

  const symbolCompletionMenu = useCompletionMenu({
    getPosition: getRangeDOMPosition,
    possibleItems: symbolItems,
    onSelect: (target, item) => {
      const elementPair = Editor.above<ParagraphElement>(editor, {
        at: target,
        match: (n) => SlateElement.isElement(n) && n.type === 'paragraph',
      });

      if (!elementPair) return;

      const [element] = elementPair;

      Transforms.select(editor, Editor.start(editor, []));
      Transforms.delete(editor, { at: target });

      setBlockNodes(editor.children, {
        layerId: element.layerId,
        symbolId: item.id,
      });

      if (!Blocks[item.id].editorVersion) {
        setTimeout(() => {
          const el = document.querySelector(`#editor-${layer.do_objectID}`);

          if (el instanceof HTMLElement) {
            el.focus();
          }
        }, 100);
      }
    },
  });

  const [hashtagItems, setHashtagItems] = useState<CompletionItem[]>([]);

  const hashCompletionMenu = useCompletionMenu({
    getPosition: getRangeDOMPosition,
    showExactMatch: false,
    possibleItems: hashtagItems,
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

  useEffect(() => {
    if (isEditing) return;

    ReactEditor.deselect(editor);
  }, [editor, isEditing]);

  // Closing the completion menu on blur prevents us from clicking the menu with the mouse,
  // so we close the menus here instead.
  useEffect(() => {
    if (isEditing) return;

    symbolCompletionMenu.close();
    hashCompletionMenu.close();
  }, [isEditing, symbolCompletionMenu, hashCompletionMenu]);

  const [isMouseWithinEditor, setIsMouseWithinEditor] = useState(false);

  const onMouseEnter = useCallback(() => {
    setIsMouseWithinEditor(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsMouseWithinEditor(false);
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const isEmpty = Editor.string(editor, []).trim() === '';

      const handleDelete = () => {
        // If there's text, don't delete the layer
        if (!isEmpty) return FALLTHROUGH;

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
        Tab: () => {
          const blockPair = Editor.above(editor, {
            match: (node) =>
              SlateElement.isElement(node) && Editor.isBlock(editor, node),
          });

          if (!blockPair) return;

          const [, path] = blockPair;

          if (path[0] < editor.children.length - 1) {
            Transforms.select(editor, Editor.end(editor, [path[0] + 1]));
          }
        },
        'Shift-Tab': () => {
          const blockPair = Editor.above(editor, {
            match: (node) =>
              SlateElement.isElement(node) && Editor.isBlock(editor, node),
          });

          if (!blockPair) return;

          const [, path] = blockPair;

          if (path[0] > 0) {
            Transforms.select(editor, Editor.end(editor, [path[0] - 1]));
          }
        },
        // These may override the Escape shortcut
        ...symbolCompletionMenu.keyMap,
        ...hashCompletionMenu.keyMap,
      });
    },
    [
      editor,
      isMouseWithinEditor,
      symbolCompletionMenu.keyMap,
      hashCompletionMenu.keyMap,
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

  const onSetVisible = useCallback(
    (layerId: string, isVisible: boolean) => {
      dispatch(
        'setOverrideValue',
        [layer.do_objectID],
        Overrides.encodeName([layerId], 'isVisible'),
        isVisible,
      );
    },
    [dispatch, layer.do_objectID],
  );

  const layerVisibility = useMemo(() => {
    const visibility: Record<string, boolean> = {};
    const children = flattenPassthroughLayers(blockDefinition.symbol);

    for (const child of children) {
      const isVisible = Overrides.getOverrideValue(
        layer.overrideValues,
        child.do_objectID,
        'isVisible',
      );

      visibility[child.do_objectID] = isVisible ?? child.isVisible;
    }

    return visibility;
  }, [blockDefinition.symbol, layer.overrideValues]);

  const layerPlaceholderText = useMemo(() => {
    const placeholderText: Record<string, string> = {};
    const children = flattenPassthroughLayers(blockDefinition.symbol);

    for (const child of children) {
      if (!child.blockText) continue;

      placeholderText[child.do_objectID] = child.blockText;
    }

    return placeholderText;
  }, [blockDefinition.symbol]);

  const layerBlockTypes = useMemo(() => {
    const blockTypes: Record<string, string> = {};
    const children = flattenPassthroughLayers(blockDefinition.symbol);

    for (const child of children) {
      const blockType = Overrides.getOverrideValue(
        layer.overrideValues,
        child.do_objectID,
        'symbolID',
      );

      blockTypes[child.do_objectID] = blockType ?? child.symbolID;
    }

    return blockTypes;
  }, [blockDefinition.symbol, layer.overrideValues]);

  const layerBlockTypesRef = useRef(layerBlockTypes);

  // layerBlockTypes is stale in the Editor onChange callback if we don't use a ref
  useEffect(() => {
    layerBlockTypesRef.current = layerBlockTypes;
  }, [layerBlockTypes]);

  const renderElement = useCallback(
    (props: RenderElementProps) => {
      const layerId = props.element.layerId;
      const isVisible = layerId ? layerVisibility[layerId] : true;
      const placeholder = layerId ? layerPlaceholderText[layerId] : undefined;

      return (
        <ElementComponent
          isVisible={isVisible}
          onSetVisible={onSetVisible}
          layerBlockTypes={layerBlockTypes}
          placeholder={placeholder}
          {...props}
        />
      );
    },
    [layerBlockTypes, layerPlaceholderText, layerVisibility, onSetVisible],
  );

  return (
    <ControlledEditor
      ref={controlledEditorRef}
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

        const mdShortcut = textShortcut(
          Object.keys(BLOCK_TYPE_SHORTCUTS).join('|'),
          editor,
        );

        if (mdShortcut) {
          const { range, match } = mdShortcut;

          Transforms.delete(editor, { at: range });

          setBlockNodes(editor.children, {
            symbolId: BLOCK_TYPE_SHORTCUTS[match],
          });

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

          const elementPair = Editor.above<ParagraphElement>(editor, {
            at: range,
            match: (n) => SlateElement.isElement(n) && n.type === 'paragraph',
          });

          if (elementPair) {
            const [element] = elementPair;
            const targetSymbolId = element.layerId
              ? layerBlockTypesRef.current[element.layerId]
              : element.symbolId;
            const blockDefinition = Blocks[targetSymbolId];

            setHashtagItems(
              (blockDefinition?.hashtags ?? []).map((item) => ({
                name: item,
                id: item,
                icon: <HashtagIcon item={item} />,
              })),
            );

            hashCompletionMenu.open(range, match);
          }
        } else {
          hashCompletionMenu.close();
        }

        setBlockNodes(editor.children);
      }}
    >
      <Editable
        id={`editor-${layer.do_objectID}`}
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
        renderElement={renderElement}
      />
      {symbolCompletionMenu.element}
      {hashCompletionMenu.element}
    </ControlledEditor>
  );
});

function HashtagIcon({ item }: { item: string }) {
  return (
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
      className={/^(p\w?-|m\w?-)/.test(item) ? undefined : item}
    >
      {/^(text|font)/.test(item) ? 'Tt' : null}
    </div>
  );
}
