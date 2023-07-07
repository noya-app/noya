import {
  CompletionItem,
  CompletionListItem,
  CompletionMenu,
  Divider,
  InputField,
  ListView,
  Small,
  Stack,
  fuzzyFilter,
} from 'noya-designsystem';
import { getCurrentPlatform, handleKeyboardEvent } from 'noya-keymap';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export function SearchCompletionMenu({
  onSelect,
  onHover,
  onClose,
  items,
}: {
  onSelect: (item: CompletionListItem) => void;
  onHover: (item: CompletionListItem) => void;
  onClose: () => void;
  items: CompletionItem[];
}) {
  const [state, setState] = useState({
    search: '',
    index: 0,
  });

  const { index, search } = state;

  const listRef = React.useRef<ListView.VirtualizedList>(null);

  useEffect(() => {
    listRef.current?.scrollToIndex(index);
  }, [index]);

  const results = useMemo(
    () =>
      fuzzyFilter({
        items: items.map((item) => item.name),
        query: search,
      }).map((item) => ({ ...item, ...items[item.index] })),
    [items, search],
  );

  const setSearch = useCallback((search: string) => {
    setState((state) => ({ ...state, search, index: 0 }));
  }, []);

  const setIndex = useCallback((index: number) => {
    setState((state) => ({ ...state, index }));
  }, []);

  useEffect(() => {
    onHover(results[index]);
  }, [index, onHover, results]);

  const searchHeight = 31;

  const listSize =
    results.length > 0
      ? {
          width: 200,
          height: Math.min(results.length * 31, 31 * 6.5),
        }
      : {
          width: 200,
          height: 60,
        };

  const elementSize = {
    width: listSize.width,
    height: searchHeight + listSize.height,
  };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      handleKeyboardEvent(event.nativeEvent, getCurrentPlatform(navigator), {
        ArrowUp: () => {
          const nextIndex = index <= 0 ? results.length - 1 : index - 1;
          setIndex(nextIndex);
        },
        ArrowDown: () => {
          const prevIndex = index >= results.length - 1 ? 0 : index + 1;
          setIndex(prevIndex);
        },
        Tab: () => onSelect(results[index]),
        Enter: () => onSelect(results[index]),
        Escape: () => onClose(),
      });
    },
    [index, onClose, onSelect, results, setIndex],
  );

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Stack.V {...elementSize} overflow="hidden">
      <InputField.Root flex="0">
        <InputField.Input
          ref={inputRef}
          value={search}
          placeholder="Filter..."
          style={{
            height: searchHeight,
            borderRadius: 0,
            outline: 'none',
            boxShadow: 'none',
            backgroundColor: 'white',
            padding: '4px 12px',
          }}
          onChange={setSearch}
          onKeyDown={handleKeyDown}
          onBlur={(event) => {
            const isWithinPopover =
              event.relatedTarget &&
              event.relatedTarget instanceof HTMLElement &&
              event.relatedTarget.role === 'dialog';

            if (isWithinPopover) {
              inputRef.current?.focus();

              event.stopPropagation();
              event.preventDefault();
            }
          }}
          onPointerDown={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
          onFocusCapture={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
        />
      </InputField.Root>
      <Divider />
      {results.length > 0 ? (
        <CompletionMenu
          ref={listRef}
          listSize={listSize}
          items={results}
          selectedIndex={index}
          onSelectItem={onSelect}
          onHoverIndex={setIndex}
        />
      ) : (
        <Stack.V
          {...listSize}
          padding="20"
          alignItems="center"
          justifyContent="center"
        >
          <Small color="textDisabled">No results</Small>
        </Stack.V>
      )}
    </Stack.V>
  );
}
