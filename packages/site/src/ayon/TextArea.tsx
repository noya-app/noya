import { useDispatch } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import { DrawableLayerType, ParentLayer } from 'noya-state';
import React, { forwardRef } from 'react';
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

const BLOCK_TYPE_TEXT_SHORTCUTS: { [shortcut: string]: string } = {
  '#': heading1SymbolId,
  '##': heading2SymbolId,
  '###': heading3SymbolId,
  '####': heading4SymbolId,
  '#####': heading5SymbolId,
  '######': heading6SymbolId,
  '"': textSymbolId,
};

export const TextArea = forwardRef(function TextArea(
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
  forwardedRef: React.Ref<HTMLTextAreaElement>,
) {
  const dispatch = useDispatch();

  return (
    <textarea
      ref={forwardedRef}
      value={blockText}
      style={{
        position: 'absolute',
        inset: 0,
        border: 'none',
        background: 'none',
        outline: 'none',
        resize: 'none',
      }}
      disabled={!isEditing}
      onKeyDown={(event) => {
        if (event.key === 'Shift') {
          dispatch('interaction', ['setCursor', 'cell']);
        }

        if (event.key === 'Escape') {
          dispatch('interaction', ['reset']);
          dispatch('selectLayer', []);
          event.preventDefault();
          return;
        }

        if (
          (event.key === 'Delete' || event.key === 'Backspace') &&
          !blockText
        ) {
          dispatch('deleteLayer', layer.do_objectID);
          event.preventDefault();
          return;
        }

        if (event.key !== 'Tab') {
          return;
        }

        event.preventDefault();

        const words = blockText.split(/\s/);
        const slashWords = words.filter(
          (word) => word[0] === '/' && word !== '/',
        );

        if (slashWords.length > 0) {
          const symbol = allAyonSymbols.find(
            (symbol) =>
              symbol.name.toLowerCase() ===
              slashWords[slashWords.length - 1].substring(1).toLowerCase(),
          );
          const newText = blockText
            .split(/\r?\n/)
            .map((line) =>
              line
                .split(' ')
                .filter((word) => word[0] !== '/' || word === '/')
                .join(' '),
            )
            .join('\n');
          if (symbol) {
            onChangeBlockType({ symbolId: symbol.symbolID });
            dispatch('setSymbolIdIsFixed', true);
            dispatch(
              'setBlockText',
              newText,
              filterHashTagsAndSlashCommands(newText).content,
            );
            return;
          } else if (
            blockTypes.length > 0 &&
            typeof blockTypes[0].type !== 'string'
          ) {
            onChangeBlockType({
              symbolId: blockTypes[0].type.symbolId,
            });
            dispatch('setSymbolIdIsFixed', true);
            dispatch(
              'setBlockText',
              newText,
              filterHashTagsAndSlashCommands(newText).content,
            );
            return;
          }
        }
      }}
      onChange={(event) => {
        const text = event.target.value;
        const words = text.split(/\s/);
        const slashWords = words.filter(
          (word) => word[0] === '/' && word !== '/',
        );

        if (
          words.length > blockText.split(' ').length &&
          Object.keys(BLOCK_TYPE_TEXT_SHORTCUTS).includes(words[0])
        ) {
          onChangeBlockType({
            symbolId: BLOCK_TYPE_TEXT_SHORTCUTS[words[0]],
          });
          dispatch('setSymbolIdIsFixed', true);
          dispatch(
            'setBlockText',
            words.slice(1).join(' '),
            filterHashTagsAndSlashCommands(words.slice(1).join(' ')).content,
          );
          return;
        }

        if (
          slashWords.length > 0 &&
          words.length > blockText.split(/\s/).length
        ) {
          const symbol = allAyonSymbols.find(
            (symbol) =>
              symbol.name.toLowerCase() ===
              slashWords[slashWords.length - 1].substring(1).toLowerCase(),
          );
          const newText = text
            .split(/\r?\n/)
            .map((line) =>
              line
                .split(' ')
                .filter((word) => word[0] !== '/' || word === '/')
                .join(' '),
            )
            .join('\n');
          if (symbol) {
            onChangeBlockType({ symbolId: symbol.symbolID });
            dispatch('setSymbolIdIsFixed', true);
            dispatch(
              'setBlockText',
              newText,
              filterHashTagsAndSlashCommands(newText).content,
            );
            return;
          } else if (
            blockTypes.length > 0 &&
            typeof blockTypes[0].type !== 'string'
          ) {
            onChangeBlockType({
              symbolId: blockTypes[0].type.symbolId,
            });
            dispatch('setSymbolIdIsFixed', true);
            dispatch(
              'setBlockText',
              newText,
              filterHashTagsAndSlashCommands(newText).content,
            );
            return;
          }
        }

        dispatch(
          'setBlockText',
          text,
          filterHashTagsAndSlashCommands(text).content,
        );
      }}
    />
  );
});
