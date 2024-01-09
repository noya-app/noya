import {
  CompletionItem,
  CompletionMenu,
  Divider,
  InputField,
  ListView,
  Small,
  Stack,
  fuzzyFilter,
} from '@noya-app/noya-designsystem';
import { getCurrentPlatform, handleKeyboardEvent } from '@noya-app/noya-keymap';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

export interface ISearchCompletionMenu {
  focus: () => void;
}

export const SearchCompletionMenu = forwardRef(function SearchCompletionMenu(
  {
    onSelect,
    onHover,
    onClose,
    items,
    width = 200,
  }: {
    onSelect: (item: CompletionItem) => void;
    onHover?: (item: CompletionItem) => void;
    onClose: () => void;
    items: CompletionItem[];
    width?: number;
  },
  forwardedRef: React.ForwardedRef<ISearchCompletionMenu>,
) {
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
    onHover?.(results[index]);
  }, [index, onHover, results]);

  const searchHeight = 31;

  const listSize =
    results.length > 0
      ? {
          width,
          height: Math.min(results.length * 31, 31 * 6.5),
        }
      : {
          width,
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

  useImperativeHandle(forwardedRef, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

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
          // onBlur={(event) => {
          //   const isWithinPopover =
          //     event.relatedTarget &&
          //     event.relatedTarget instanceof HTMLElement &&
          //     event.relatedTarget.role === 'dialog';

          //   if (isWithinPopover) {
          //     inputRef.current?.focus();

          //     event.stopPropagation();
          //     event.preventDefault();
          //   }
          // }}
          // onPointerDown={(event) => {
          //   event.stopPropagation();
          //   event.preventDefault();
          // }}
          // onFocusCapture={(event) => {
          //   event.stopPropagation();
          //   event.preventDefault();
          // }}
        />
      </InputField.Root>
      <Divider />
      {results.length > 0 ? (
        <CompletionMenu
          ref={listRef}
          listSize={listSize}
          items={results}
          selectedIndex={index}
          onSelectItem={(item) => {
            if (item.type === 'sectionHeader') return;
            onSelect(item);
          }}
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
});
