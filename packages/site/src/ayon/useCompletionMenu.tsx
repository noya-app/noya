import * as Portal from '@radix-ui/react-portal';
import { ListView, Spacer } from 'noya-designsystem';
import { KeyMap } from 'noya-keymap';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { Editor, Range } from 'slate';
import { ReactEditor } from 'slate-react';
import styled from 'styled-components';
import { ContentElement, PositioningElement } from './BlockEditor';
import { fuzzyFilter, fuzzyTokenize, IToken } from './fuzzyScorer';

type CompletionItem = { id: string; name: string; icon?: ReactNode };

const Token = styled.span<{ type: IToken['type'] }>(({ type }) => ({
  fontWeight: type === 'match' ? 'bold' : 'normal',
}));

export function useCompletionMenu({
  possibleItems,
  onSelect,
  editor,
  showExactMatch = true,
}: {
  editor: Editor;
  possibleItems: CompletionItem[];
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
  const menuPositionRef = React.useRef<HTMLDivElement>(null);
  const menuItemsRef = React.useRef<ListView.VirtualizedList>(null);

  const select = useCallback(
    (target: Range, item: CompletionItem) => {
      onSelect(target, item);
      setRange(null);
    },
    [onSelect],
  );

  useEffect(() => {
    if (!range) return;

    menuItemsRef.current?.scrollToIndex(index);
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
          <PositioningElement ref={menuPositionRef}>
            <ContentElement style={{ ...listSize, display: 'flex' }}>
              <ListView.Root
                ref={menuItemsRef}
                scrollable
                virtualized={listSize}
                keyExtractor={(item) => item.id}
                data={results}
                renderItem={(item, i) => {
                  const tokens = fuzzyTokenize({
                    item: item.name,
                    itemScore: item,
                  });

                  return (
                    <ListView.Row
                      key={item.id}
                      selected={i === index}
                      onPress={() => select(range, item)}
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
            </ContentElement>
          </PositioningElement>
        </Portal.Root>
      )}
    </>
  );

  useEffect(() => {
    const el = menuPositionRef.current;

    if (!shouldShow || !el) return;

    try {
      const domRange = ReactEditor.toDOMRange(editor, range);
      const rect = domRange.getBoundingClientRect();
      el.style.top = `${rect.top + window.pageYOffset + 24}px`;
      el.style.left = `${rect.left + window.pageXOffset}px`;
    } catch {}
  }, [editor, results.length, index, search, range, shouldShow]);

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
  };
}
