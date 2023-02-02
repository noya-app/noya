import * as Portal from '@radix-ui/react-portal';
import { ListView } from 'noya-designsystem';
import { KeyMap } from 'noya-keymap';
import React, { useCallback, useEffect, useState } from 'react';
import { Editor, Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { ContentElement, PositioningElement } from './BlockEditor';

export function useCompletionMenu<T extends { id: string; name: string }>({
  possibleItems,
  onSelect,
  editor,
}: {
  editor: Editor;
  possibleItems: T[];
  onSelect: (range: Range, item: T) => void;
}) {
  const [range, setRange] = useState<Range | null>(null);
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');
  const menuPositionRef = React.useRef<HTMLDivElement>(null);
  const menuItemsRef = React.useRef<ListView.VirtualizedList>(null);

  const select = useCallback(
    (target: Range, item: T) => {
      onSelect(target, item);
      setRange(null);
    },
    [onSelect],
  );

  useEffect(() => {
    if (!range) return;

    menuItemsRef.current?.scrollToIndex(index);
  }, [index, range]);

  const filteredItems = possibleItems.filter((item) =>
    item.name.toLowerCase().startsWith(search.toLowerCase()),
  );

  const listSize = {
    width: 200,
    height: Math.min(filteredItems.length * 31, 31 * 6.5),
  };

  const element = (
    <>
      {range && filteredItems.length > 0 && (
        <Portal.Root asChild>
          <PositioningElement ref={menuPositionRef}>
            <ContentElement style={{ ...listSize, display: 'flex' }}>
              <ListView.Root<T>
                ref={menuItemsRef}
                scrollable
                virtualized={listSize}
                keyExtractor={(item) => item.id}
                data={filteredItems}
                renderItem={(item, i) => {
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
                      {item.name}
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

    if (!range || !filteredItems.length || !el) return;

    const domRange = ReactEditor.toDOMRange(editor, range);
    const rect = domRange.getBoundingClientRect();
    el.style.top = `${rect.top + window.pageYOffset + 24}px`;
    el.style.left = `${rect.left + window.pageXOffset}px`;
  }, [editor, filteredItems.length, index, search, range]);

  const keyMap: KeyMap = range
    ? {
        ArrowUp: () => {
          const nextIndex = index <= 0 ? filteredItems.length - 1 : index - 1;
          setIndex(nextIndex);
        },
        ArrowDown: () => {
          const prevIndex = index >= filteredItems.length - 1 ? 0 : index + 1;
          setIndex(prevIndex);
        },
        Tab: () => select(range, filteredItems[index]),
        Enter: () => select(range, filteredItems[index]),
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
