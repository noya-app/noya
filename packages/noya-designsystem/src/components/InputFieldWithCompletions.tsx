import { Size } from 'noya-geometry';
import { chunkBy, partition } from 'noya-utils';
import React, {
  ForwardedRef,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import {
  CompletionItem,
  CompletionListItem,
  CompletionSectionHeader,
} from '../utils/completions';
import { IToken, fuzzyFilter, fuzzyTokenize } from '../utils/fuzzyScorer';
import { ActivityIndicator } from './ActivityIndicator';
import { InputField, InputFieldSize } from './InputField';
import { ListView } from './ListView';
import { Spacer } from './Spacer';
import { Stack } from './Stack';
import { Small } from './Text';

function filterWithGroupedSections(
  items: (CompletionItem | CompletionSectionHeader)[],
  query: string,
): CompletionListItem[] {
  const sections = chunkBy(items, (a, b) => b.type !== 'sectionHeader');

  return sections.flatMap((section) => {
    const [headers, regular] = partition(
      section,
      (item): item is CompletionSectionHeader => item.type === 'sectionHeader',
    );
    const maxVisibleItems =
      headers.length > 0 ? headers[0].maxVisibleItems : undefined;

    const scoredItems = fuzzyFilter({
      items: regular.map((item) => item.name),
      query,
    });

    const usedIndexes = new Set(scoredItems.map((item) => item.index));
    const extraItems = regular.flatMap((item, index): CompletionListItem[] =>
      item.alwaysInclude && !usedIndexes.has(index)
        ? [{ ...item, index, score: 0 }]
        : [],
    );
    let newItems = scoredItems
      .map((item): CompletionListItem => ({ ...item, ...regular[item.index] }))
      .concat(extraItems);

    if (maxVisibleItems !== undefined) {
      newItems = newItems.slice(0, maxVisibleItems);
    }

    if (newItems.length === 0) return [];

    return [...headers, ...newItems];
  });
}

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
        sectionHeaderVariant="label"
        renderItem={(item, i) => {
          if (item.type === 'sectionHeader') {
            return (
              <ListView.Row key={item.id} isSectionHeader>
                {item.name}
              </ListView.Row>
            );
          }

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
  loading?: boolean;
  initialValue?: string;
  placeholder?: string;
  items: (CompletionItem | CompletionSectionHeader)[];
  onChange?: (value: string) => void;
  onHoverItem?: (item: CompletionItem | undefined) => void;
  onSelectItem?: (item: CompletionItem) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  size?: InputFieldSize;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const InputFieldWithCompletions = memo(
  forwardRef(function InputFieldWithCompletions(
    {
      loading,
      initialValue = '',
      placeholder,
      items,
      size,
      onChange,
      onSelectItem,
      onHoverItem,
      onFocus,
      onBlur,
      style,
      children,
    }: Props,
    forwardedRef: ForwardedRef<HTMLInputElement>,
  ) {
    const defaultRef = useRef<HTMLInputElement>(null);
    const ref = forwardedRef || defaultRef;

    const [isFocused, setIsFocused] = useState(false);
    const [state, _setState] = useState({
      filter: initialValue,
      selectedIndex: 0,
    });

    const updateState = useCallback(
      (
        newState: { filter?: string; selectedIndex?: number },
        hoverItem?: 'resetHover',
      ) => {
        const nextState = { ...state, ...newState };

        if (hoverItem === 'resetHover') {
          onHoverItem?.(undefined);
        } else {
          const nextItems = filterWithGroupedSections(items, nextState.filter);
          const nextItem = nextItems[nextState.selectedIndex];

          if (nextItem && nextItem.type !== 'sectionHeader') {
            onHoverItem?.(nextItem);
          } else {
            onHoverItem?.(undefined);
          }
        }

        _setState(nextState);
        if (newState.filter !== undefined) {
          onChange?.(newState.filter);
        }
      },
      [items, onChange, onHoverItem, state],
    );

    const initialValueRef = useRef(initialValue);

    useLayoutEffect(() => {
      if (initialValueRef.current === initialValue) return;
      initialValueRef.current = initialValue;
      updateState({ filter: initialValue });
    }, [initialValue, updateState]);

    const { filter, selectedIndex } = state;

    const listRef = React.useRef<ListView.VirtualizedList>(null);

    const filteredItems = useMemo(
      () => filterWithGroupedSections(items, filter),
      [items, filter],
    );

    const [normalItems, sectionHeaderItems] = partition(
      filteredItems,
      (item) => item.type !== 'sectionHeader',
    );

    const height = Math.min(
      ListView.calculateHeight(
        normalItems.length,
        sectionHeaderItems.length,
        'label',
      ),
      ListView.rowHeight * 10.5,
    );

    useEffect(() => {
      if (listRef.current) {
        listRef.current.scrollToIndex(selectedIndex);
      }
    }, [selectedIndex]);

    const selectItem = useCallback(
      (item: CompletionListItem) => {
        if (item.type === 'sectionHeader') return;

        onSelectItem?.(item);
        onHoverItem?.(undefined);

        if (ref && typeof ref === 'object') {
          ref.current?.blur();
        }
      },
      [onSelectItem, onHoverItem, ref],
    );

    const handleChange = useCallback(
      (value: string) => updateState({ selectedIndex: 0, filter: value }),
      [updateState],
    );

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      updateState({ selectedIndex: 0, filter: initialValue }, 'resetHover');
      onBlur?.();
    }, [initialValue, onBlur, updateState]);

    const handleFocus = useCallback(
      (event) => {
        setIsFocused(true);
        updateState({ selectedIndex: 0, filter: initialValue });
        onFocus?.(event);
      },
      [initialValue, onFocus, updateState],
    );

    const handleIndexChange = useCallback(
      (index: number) => updateState({ selectedIndex: index }),
      [updateState],
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown') {
          handleIndexChange(
            getNextIndex(
              filteredItems,
              selectedIndex,
              'next',
              (item) => item.type === 'sectionHeader',
            ),
          );

          event.preventDefault();
          event.stopPropagation();
        } else if (event.key === 'ArrowUp') {
          handleIndexChange(
            getNextIndex(
              filteredItems,
              selectedIndex,
              'previous',
              (item) => item.type === 'sectionHeader',
            ),
          );

          event.preventDefault();
          event.stopPropagation();
        } else if (event.key === 'Enter') {
          const item = filteredItems[selectedIndex];
          selectItem(item);
        } else if (event.key === 'Escape') {
          if (ref && typeof ref === 'object') {
            ref.current?.blur();
          }
        }
      },
      [filteredItems, ref, handleIndexChange, selectItem, selectedIndex],
    );

    return (
      <InputField.Root
        size={size}
        labelSize={16}
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
                  onHoverIndex={handleIndexChange}
                  listSize={listSize}
                />
              ) : (
                <Stack.V
                  height="100px"
                  padding="20px"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Small color="textDisabled">
                    {loading ? 'Loading' : 'No results'}
                  </Small>
                </Stack.V>
              )}
            </Stack.V>
          );
        }}
      >
        <InputField.Input
          ref={ref}
          value={filter}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocusCapture={handleFocus}
          onKeyDown={handleKeyDown}
          style={style}
        />
        {children}
        {loading && isFocused && (
          <InputField.Label>
            <ActivityIndicator />
          </InputField.Label>
        )}
      </InputField.Root>
    );
  }),
);

function getNextIndex<T>(
  items: T[],
  currentIndex: number,
  direction: 'next' | 'previous',
  isDisabled: (item: T) => boolean,
): number {
  // Make sure the current index is within bounds
  currentIndex =
    currentIndex < 0
      ? 0
      : currentIndex >= items.length
      ? items.length - 1
      : currentIndex;

  // If there are no valid items in the array, return -1
  if (items.every(isDisabled)) return -1;

  let nextIndex = currentIndex;

  do {
    // Move to the next or previous index, wrapping around if necessary
    if (direction === 'next') {
      nextIndex = (nextIndex + 1) % items.length;
    } else {
      nextIndex = (nextIndex - 1 + items.length) % items.length;
    }

    // If we've looped all the way around without finding a valid item, return the current index
    if (nextIndex === currentIndex) return currentIndex;
  } while (isDisabled(items[nextIndex]));

  return nextIndex;
}
