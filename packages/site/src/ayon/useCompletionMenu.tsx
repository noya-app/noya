import * as Portal from '@radix-ui/react-portal';
import {
  Divider,
  InputField,
  ListView,
  Small,
  Spacer,
  Stack,
} from 'noya-designsystem';
import { Point, Size } from 'noya-geometry';
import { getCurrentPlatform, handleKeyboardEvent, KeyMap } from 'noya-keymap';
import React, {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Range } from 'slate';
import styled from 'styled-components';
import { fuzzyFilter, fuzzyTokenize, IScoredItem, IToken } from './fuzzyScorer';
import { IModalMenu, ModalMenu } from './ModalMenu';

type CompletionItem = { id: string; name: string; icon?: ReactNode };

const Token = styled.span<{ type: IToken['type'] }>(({ type }) => ({
  fontWeight: type === 'match' ? 'bold' : 'normal',
}));

type CompletionListItem = CompletionItem & IScoredItem;

const CompletionMenu = forwardRef(function CompletionMenu(
  {
    items,
    selectedIndex,
    select,
    setIndex,
    listSize,
  }: {
    items: CompletionListItem[];
    selectedIndex: number;
    select: (item: CompletionListItem) => void;
    setIndex: (index: number) => void;
    listSize: Size;
  },
  forwardedRef: ForwardedRef<ListView.VirtualizedList>,
) {
  return (
    <ListView.Root
      ref={forwardedRef}
      scrollable
      virtualized={listSize}
      keyExtractor={(item) => item.id}
      data={items}
      renderItem={(item, i) => {
        const tokens = fuzzyTokenize({
          item: item.name,
          itemScore: item,
        });

        return (
          <ListView.Row
            key={item.id}
            selected={i === selectedIndex}
            onPress={() => select(item)}
            onHoverChange={(hovered) => {
              if (hovered) {
                setIndex(i);
              }
            }}
          >
            {tokens.map((token, j) => (
              <Token key={j} type={token.type}>
                {token.text}
              </Token>
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
});

export function SearchCompletionMenu({
  onSelect,
  onClose,
  items,
}: {
  onSelect: (item: CompletionListItem) => void;
  onClose: () => void;
  items: CompletionItem[];
}) {
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');
  const listRef = React.useRef<ListView.VirtualizedList>(null);

  // When search changes, reset the index
  useEffect(() => {
    setIndex(0);
  }, [search]);

  useEffect(() => {
    listRef.current?.scrollToIndex(index);
  }, [index]);

  const results = fuzzyFilter({
    items: items.map((item) => item.name),
    query: search,
  }).map((item) => ({ ...item, ...items[item.index] }));

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
    [index, onClose, onSelect, results],
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
          select={onSelect}
          setIndex={setIndex}
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

export function useCompletionMenu({
  possibleItems,
  getPosition,
  onSelect,
  showExactMatch = true,
}: {
  possibleItems: CompletionItem[];
  getPosition: (range: Range) => Point;
  onSelect: (range: Range, item: CompletionItem) => void;
  /**
   * Whether to show the completion menu when there is a single result that's an exact match.
   * If the completion is a command, this should probably be true, while if it inserts text
   * it should probably be false, since otherwise completions will show anytime the cursor
   * is at the end of the text.
   */
  showExactMatch?: boolean;
}) {
  const [range, setRange] = useState<Range | null>(null);
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');
  const modalMenuRef = React.useRef<IModalMenu>(null);
  const listRef = React.useRef<ListView.VirtualizedList>(null);

  const select = useCallback(
    (target: Range, item: CompletionItem) => {
      onSelect(target, item);
      setRange(null);
    },
    [onSelect],
  );

  useEffect(() => {
    if (!range) return;

    listRef.current?.scrollToIndex(index);
  }, [index, range]);

  const results = fuzzyFilter({
    items: possibleItems.map((item) => item.name),
    query: search,
  }).map((item) => ({ ...item, ...possibleItems[item.index] }));

  const listSize = {
    width: 200,
    height: Math.min(results.length * 31, 31 * 6.5),
  };

  const isExactMatch = results.length === 1 && results[0].name === search;

  const shouldShow =
    range && results.length > 0 && (showExactMatch || !isExactMatch);

  const element = (
    <>
      {shouldShow && (
        <Portal.Root asChild>
          <ModalMenu ref={modalMenuRef} size={listSize}>
            <CompletionMenu
              ref={listRef}
              listSize={listSize}
              items={results}
              selectedIndex={index}
              select={(item) => select(range, item)}
              setIndex={setIndex}
            />
          </ModalMenu>
        </Portal.Root>
      )}
    </>
  );

  useEffect(() => {
    if (!shouldShow || !modalMenuRef.current) return;

    try {
      const position = getPosition(range);

      modalMenuRef.current.setPosition(position);
    } catch {}
  }, [results.length, index, search, range, shouldShow, getPosition]);

  const keyMap: KeyMap = shouldShow
    ? {
        ArrowUp: () => {
          const nextIndex = index <= 0 ? results.length - 1 : index - 1;
          setIndex(nextIndex);
        },
        ArrowDown: () => {
          const prevIndex = index >= results.length - 1 ? 0 : index + 1;
          setIndex(prevIndex);
        },
        Tab: () => select(range, results[index]),
        Enter: () => select(range, results[index]),
        Escape: () => setRange(null),
      }
    : {};

  return {
    keyMap,
    element: element,
    open: (range: Range, search: string) => {
      setRange(range);
      setIndex(0);
      setSearch(search);
    },
    close: () => {
      setRange(null);
    },
    show: shouldShow || false,
  };
}
