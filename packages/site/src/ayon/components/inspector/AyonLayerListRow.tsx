import {
  Chip,
  CompletionItem,
  InputField,
  InputFieldWithCompletions,
  Spacer,
  Stack,
  TreeView,
  createSectionedMenu,
} from '@noya-app/noya-designsystem';
import { Sketch } from '@noya-app/noya-file-format';
import { Component1Icon } from '@noya-app/noya-icons';
import { useKeyboardShortcuts } from '@noya-app/noya-keymap';
import { useApplicationState } from 'noya-app-state-context';
import { ApplicationState, Overrides, Selectors } from 'noya-state';
import { allClassNames } from 'noya-tailwind';
import React, { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { BlockPreviewProps } from '../../../docs/InteractiveBlockPreview';
import { getAllInsertableSymbols } from '../../symbols/symbols';
import { DraggableMenuButton } from './DraggableMenuButton';
import { HashtagIcon } from './HashtagIcon';

const InputWrapper = styled.div(({ theme }) => ({
  flex: '1',
  border: `1px solid ${theme.colors.divider}`,
  padding: '1px',
  margin: '4px 0',
  borderRadius: '6px',
  outline: 'none',
  minHeight: '30px',
  '&:focus': {
    boxShadow: `0 0 0 2px ${theme.colors.primary}`,
  },
}));

function getCompletionItems({
  state,
  layer,
  master,
}: {
  state: ApplicationState;
  layer: Sketch.SymbolInstance;
  master: Sketch.SymbolMaster;
}) {
  const blockItems = getAllInsertableSymbols(state).map(
    (block): CompletionItem => ({
      id: 'block:' + block.symbolID,
      name: block.name,
      icon: <Component1Icon />,
    }),
  );

  const styleItems = (master.blockDefinition?.hashtags ?? allClassNames)
    .map((item) => ({
      name: item,
      id: 'style:' + item,
      icon: <HashtagIcon item={item} />,
    }))
    // Filter styles that are already applied
    .filter((item) => !layer.blockParameters?.includes(item.name));

  return [...blockItems, ...styleItems];
}

export function AyonLayerListRow({
  inspectorMode,
  layer,
  depth,
  path,
  isDragging,
  onInsertChild,
  onDelete,
  onDuplicate,
  onSetOverriddenBlock,
}: {
  inspectorMode: 'compact' | 'advanced';
  layer: Sketch.SymbolInstance;
  depth: number;
  path: string[];
  isDragging: boolean;
  onInsertChild: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSetOverriddenBlock: (
    overriddenBlock: BlockPreviewProps | undefined,
  ) => void;
}) {
  const [state, dispatch] = useApplicationState();
  const getSymbolMaster = useCallback(
    (symbolId: string) => Selectors.getSymbolMaster(state, symbolId),
    [state],
  );
  const master = getSymbolMaster(layer.symbolID);
  const componentName = master.name.toUpperCase();
  const placeholderText = master.blockDefinition?.placeholderText;
  const key = path.join('/');

  const [hovered, setHovered] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);

  useKeyboardShortcuts(
    depth === 0
      ? {
          '/': () => {
            setIsSearching(true);
          },
        }
      : {},
  );

  const completionItems = useMemo(
    () =>
      getCompletionItems({
        state,
        layer,
        master,
      }),
    [layer, master, state],
  );

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearching) {
      searchInputRef.current?.focus();
    }
  }, [isSearching]);

  const handleSelectBlockItem = useCallback(
    (item: CompletionItem) => {
      const symbolId = item.id.replace('block:', '');

      if (depth === 0) {
        dispatch('setSymbolInstanceSource', symbolId, 'preserveCurrent');
      } else {
        dispatch(
          'setOverrideValue',
          undefined,
          Overrides.encodeName(path, 'symbolID'),
          symbolId,
        );
      }
    },
    [depth, dispatch, path],
  );

  const handleUpdateParameters = (updatedParameters: string[]) => {
    if (depth === 0) {
      dispatch('setBlockParameters', undefined, updatedParameters);
    } else {
      dispatch(
        'setOverrideValue',
        undefined,
        Overrides.encodeName(path, 'blockParameters'),
        updatedParameters,
      );
    }
  };

  const handleSelectItem = (item: CompletionItem) => {
    if (item.id.startsWith('block:')) {
      handleSelectBlockItem(item);
    } else if (item.id.startsWith('style:')) {
      handleUpdateParameters((layer.blockParameters ?? []).concat(item.name));
    }
  };

  const handleDeleteParameer = (parameter: string) =>
    handleUpdateParameters(
      (layer.blockParameters ?? []).filter((p) => p !== parameter),
    );

  const supportsBlockText = master.blockDefinition?.supportsBlockText ?? false;

  const inputWrapperRef = React.useRef<HTMLDivElement>(null);

  const menuItems = createSectionedMenu(
    [
      {
        title: 'Change Component',
        value: 'setComponent',
        shortcut: '/',
      },
      {
        title: 'Add Style',
        value: 'addStyle',
        shortcut: '/',
      },
    ],
    [
      {
        title: 'Duplicate',
        value: 'duplicate',
      },
      {
        title: 'Add Child Component',
        value: 'insertChild',
      },
    ],
    [
      {
        title: 'Delete',
        value: 'delete',
      },
    ],
  );

  return (
    <TreeView.Row
      key={key}
      id={layer.do_objectID}
      depth={depth - 1}
      icon={
        depth !== 0 &&
        inspectorMode === 'advanced' && (
          <DraggableMenuButton
            items={menuItems}
            onSelect={(value) => {
              switch (value) {
                case 'delete': {
                  onDelete();
                  return;
                }
                case 'duplicate': {
                  onDuplicate();
                  return;
                }
                case 'addStyle':
                case 'setComponent': {
                  setIsSearching(true);
                  setTimeout(() => {
                    searchInputRef.current?.focus();
                  }, 0);
                  return;
                }
                case 'insertChild': {
                  onInsertChild();
                  return;
                }
              }
            }}
          />
        )
      }
      onHoverChange={setHovered}
    >
      <InputWrapper
        ref={inputWrapperRef}
        style={
          supportsBlockText
            ? {
                gap: '2px',
              }
            : {}
        }
        tabIndex={!supportsBlockText ? 0 : undefined}
        onClick={() => {
          inputWrapperRef.current?.focus();
        }}
        onKeyDown={(event) => {
          switch (event.key) {
            case '/': {
              event.preventDefault();
              event.stopPropagation();

              setIsSearching(true);
            }
          }
        }}
      >
        <Stack.H flex="1" opacity={isDragging ? 0.5 : 1}>
          {isSearching ? (
            <InputFieldWithCompletions
              ref={searchInputRef}
              placeholder={'Find component/style'}
              items={completionItems}
              onBlur={() => {
                setIsSearching(false);
              }}
              onSelectItem={handleSelectItem}
              // size={depth === 0 ? 'large' : 'medium'}
              style={{
                background: 'transparent',
              }}
            />
          ) : supportsBlockText ? (
            <InputField.Root key={key} labelPosition="end" labelSize={60}>
              <InputField.Input
                style={{
                  background: 'transparent',
                }}
                value={layer.blockText ?? ''}
                placeholder={placeholderText}
                onKeyDown={(event) => {
                  switch (event.key) {
                    case '/': {
                      event.preventDefault();
                      event.stopPropagation();

                      setIsSearching(true);
                    }
                  }
                }}
                onChange={(value) => {
                  if (depth === 0) {
                    dispatch('setBlockText', undefined, value);
                  } else {
                    dispatch(
                      'setOverrideValue',
                      undefined,
                      Overrides.encodeName(path, 'blockText'),
                      value,
                    );
                  }
                }}
              />
              {hovered && (inspectorMode === 'advanced' || depth === 0) ? (
                <InputField.Button
                  onClick={() => {
                    setIsSearching(true);
                  }}
                >
                  Command
                  <Spacer.Horizontal size={8} inline />
                  <span style={{ opacity: 0.5 }}>/</span>
                </InputField.Button>
              ) : (
                <InputField.Label>{componentName}</InputField.Label>
              )}
            </InputField.Root>
          ) : null}
        </Stack.H>
        {(inspectorMode === 'advanced' || depth === 0) &&
          !(!supportsBlockText && isSearching) &&
          (!supportsBlockText ||
            (layer.blockParameters && layer.blockParameters.length > 0)) && (
            <Stack.H
              flexWrap="wrap"
              gap="2px"
              padding={!supportsBlockText ? '1px' : 0}
            >
              {(layer.blockParameters || []).map((parameter) => (
                <Chip
                  key={parameter}
                  size={supportsBlockText ? 'small' : 'medium'}
                  deletable
                  monospace
                  onDelete={() => handleDeleteParameer(parameter)}
                >
                  {parameter}
                </Chip>
              ))}
            </Stack.H>
          )}
      </InputWrapper>
    </TreeView.Row>
  );
}
