import { Size } from 'noya-geometry';
import React, {
  ForwardedRef,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styled from 'styled-components';
import { CompletionItem, CompletionListItem } from '../utils/completions';
import { IToken, fuzzyFilter, fuzzyTokenize } from '../utils/fuzzyScorer';
import { InputField } from './InputField';
import { ListView } from './ListView';
import { Spacer } from './Spacer';
import { Stack } from './Stack';
import { Small } from './Text';

export const CompletionToken = styled.span<{ type: IToken['type'] }>(
  ({ type }) => ({
    fontWeight: type === 'match' ? 'bold' : 'normal',
    whiteSpace: 'pre',
  }),
);

interface CompletionMenuProps {
  items: CompletionListItem[];
  selectedIndex: number;
  onSelectItem: (item: CompletionListItem) => void;
  onHoverIndex: (index: number) => void;
  listSize: Size;
}

export const CompletionMenu = memo(
  forwardRef(function CompletionMenu(
    {
      items,
      selectedIndex,
      onSelectItem,
      onHoverIndex,
      listSize,
    }: CompletionMenuProps,
    forwardedRef: ForwardedRef<ListView.VirtualizedList>,
  ) {
    return (
      <ListView.Root
        ref={forwardedRef}
        scrollable
        keyExtractor={(item) => item.id}
        data={items}
        virtualized={listSize}
        pressEventName="onPointerDown"
        renderItem={(item, i) => {
          const tokens = fuzzyTokenize({
            item: item.name,
            itemScore: item,
          });

          return (
            <ListView.Row
              key={item.id}
              selected={i === selectedIndex}
              onPress={() => onSelectItem(item)}
              onHoverChange={(hovered) => {
                if (hovered) {
                  onHoverIndex(i);
                }
              }}
            >
              {tokens.map((token, j) => (
                <CompletionToken key={j} type={token.type}>
                  {token.text}
                </CompletionToken>
              ))}
              {item.icon && (
                <>
                  <Spacer.Horizontal />
                  {item.icon}
                </>
              )}
            </ListView.Row>
          );
        }}
      />
    );
  }),
);

interface Props {
  placeholder: string;
  items: CompletionItem[];
  onHoverItem?: (item: CompletionItem | undefined) => void;
  onSelectItem?: (item: CompletionItem) => void;
  children?: React.ReactNode;
}

export const InputFieldWithCompletions = memo(
  forwardRef(function InputFieldWithCompletions(
    { placeholder, items, onSelectItem, onHoverItem, children }: Props,
    forwardedRef: ForwardedRef<HTMLInputElement>,
  ) {
    const [filter, setFilter] = useState('');
    const [selectedIndex, _setSelectedIndex] = useState(0);
    const listRef = React.useRef<ListView.VirtualizedList>(null);

    const filteredItems = useMemo(
      () =>
        fuzzyFilter({
          items: items.map((item) => item.name),
          query: filter,
        }).map(
          (item): CompletionListItem => ({ ...item, ...items[item.index] }),
        ),
      [items, filter],
    );

    const height = Math.min(
      filteredItems.length * ListView.rowHeight,
      ListView.rowHeight * 6.5,
    );

    useEffect(() => {
      if (listRef.current) {
        listRef.current.scrollToIndex(selectedIndex);
      }
    }, [selectedIndex]);

    const handleSelectIndex = useCallback(
      (index: number | undefined) => {
        _setSelectedIndex(index ?? 0);
        onHoverItem?.(index === undefined ? undefined : filteredItems[index]);
      },
      [filteredItems, onHoverItem],
    );

    const selectItem = useCallback(
      (item: CompletionListItem) => {
        onSelectItem?.(item);
        handleSelectIndex(undefined);

        if (forwardedRef && typeof forwardedRef === 'object') {
          forwardedRef.current?.blur();
        }
      },
      [onSelectItem, handleSelectIndex, forwardedRef],
    );

    const handleChange = useCallback(
      (value: string) => {
        setFilter(value);
        handleSelectIndex(0);
      },
      [handleSelectIndex],
    );

    const handleBlur = useCallback(() => {
      setFilter('');
      handleSelectIndex(undefined);
    }, [handleSelectIndex]);

    const handleFocus = useCallback(() => {
      setFilter('');
      handleSelectIndex(0);
    }, [handleSelectIndex]);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown') {
          handleSelectIndex(
            Math.min(selectedIndex + 1, filteredItems.length - 1),
          );

          event.preventDefault();
          event.stopPropagation();
        } else if (event.key === 'ArrowUp') {
          handleSelectIndex(Math.max(selectedIndex - 1, 0));

          event.preventDefault();
          event.stopPropagation();
        } else if (event.key === 'Enter') {
          const item = filteredItems[selectedIndex];
          selectItem(item);
        } else if (event.key === 'Escape') {
          if (forwardedRef && typeof forwardedRef === 'object') {
            forwardedRef.current?.blur();
          }
        }
      },
      [
        filteredItems,
        forwardedRef,
        handleSelectIndex,
        selectItem,
        selectedIndex,
      ],
    );

    return (
      <InputField.Root
        size="large"
        renderPopoverContent={({ width }) => {
          const listSize = { width, height };

          return (
            <Stack.V flex={`0 0 ${height}px`}>
              {filteredItems.length > 0 ? (
                <CompletionMenu
                  ref={listRef}
                  items={filteredItems}
                  selectedIndex={selectedIndex}
                  onSelectItem={selectItem}
                  onHoverIndex={handleSelectIndex}
                  listSize={listSize}
                />
              ) : (
                <Stack.V
                  height="100px"
                  padding="20px"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Small color="textDisabled">No results</Small>
                </Stack.V>
              )}
            </Stack.V>
          );
        }}
      >
        <InputField.Input
          ref={forwardedRef}
          value={filter}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocusCapture={handleFocus}
          onKeyDown={handleKeyDown}
        />
        {children}
      </InputField.Root>
    );
  }),
);
