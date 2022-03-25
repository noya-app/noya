import React, { ReactNode, memo, useCallback, useMemo } from 'react';
import { useTheme } from 'styled-components';

import {
  withSeparatorElements,
  IconButton,
  Sortable,
  Button,
  Layout,
} from 'noya-designsystem';
import { ListView } from 'noya-designsystem';
import { range, Platform } from 'noya-utils';
import { Primitives } from '../primitives';
import { ElementRow, ItemContainer } from './components';
import { Text } from 'react-native';

export interface ArrayControllerProps<Item> {
  id: string;
  items: Item[];
  title: ReactNode;
  sortable?: boolean;
  reversed?: boolean;
  expanded?: boolean;
  getKey?: (item: Item) => string;
  onMoveItem?: (sourceIndex: number, destinationIndex: number) => void;
  onClickPlus?: () => void;
  onClickTrash?: () => void;
  onClickExpand?: () => void;
  renderItem: (props: { item: Item; index: number }) => ReactNode;
  renderExpandedContent?: () => ReactNode;
}

function ArrayController<Item>({
  id,
  items,
  title,
  sortable = false,
  reversed = true,
  expanded = false,
  getKey,
  onMoveItem,
  onClickPlus,
  onClickTrash,
  onClickExpand,
  renderItem,
  renderExpandedContent,
}: ArrayControllerProps<Item>) {
  const iconColor = useTheme().colors.icon;
  const primaryLightColor = useTheme().colors.primaryLight;

  const keys = useMemo(
    () => items.map((item, index) => getKey?.(item) ?? index.toString()),
    [getKey, items],
  );

  const indexes = reversed
    ? range(0, items.length).reverse()
    : range(0, items.length);

  const handleMoveItem = useCallback(
    (
      sourceIndex: number,
      destinationIndex: number,
      position: Sortable.RelativeDropPosition,
    ) => {
      if (reversed) {
        if (position === 'above') {
          position = 'below';
        } else if (position === 'below') {
          position = 'above';
        }
      }

      onMoveItem?.(
        sourceIndex,
        position === 'below' ? destinationIndex + 1 : destinationIndex,
      );
    },
    [onMoveItem, reversed],
  );

  const renderRow = useCallback(
    (index: number) => {
      return (
        <ElementRow key={keys[index]}>
          {renderItem({ item: items[index], index: index })}
        </ElementRow>
      );
    },
    [renderItem, keys, items],
  );

  const keyExtractor = useCallback((item: number) => keys[item], [keys]);

  const renderSortableItem = useCallback(
    ({ item }: { item: number }) => {
      console.log('fff');
      return (
        <Sortable.Item id={keys[item]} key={keys[item]}>
          {({ relativeDropPosition }) => (
            <ItemContainer>
              <Text>blablaba</Text>
              {renderRow(item)}
              {relativeDropPosition && (
                <ListView.DragIndicatorElement
                  relativeDropPosition={relativeDropPosition}
                  offsetLeft={0}
                />
              )}
            </ItemContainer>
          )}
        </Sortable.Item>
      );
    },
    [keys, renderRow],
  );

  return (
    <Primitives.Section id={id}>
      <Primitives.SectionHeader>
        <Button variant="none" onClick={onClickPlus}>
          <Primitives.Title>{title}</Primitives.Title>
        </Button>
        <Layout.Stack />
        {withSeparatorElements(
          [
            onClickTrash && (
              <IconButton
                id={`${id}-trash`}
                name="trash"
                color={iconColor}
                onClick={onClickTrash}
              />
            ),
            onClickExpand && (
              <IconButton
                id={`${id}-gear`}
                name="gear"
                color={expanded ? primaryLightColor : iconColor}
                onClick={onClickExpand}
              />
            ),
            onClickPlus && (
              <IconButton
                id={`${id}-add`}
                name="plus"
                color={iconColor}
                onClick={onClickPlus}
              />
            ),
          ],
          <Layout.Stack size={12} />,
        )}
      </Primitives.SectionHeader>
      {sortable ? (
        Platform.isNative ? (
          <Sortable.List
            data={indexes}
            onMoveItem={onMoveItem}
            renderOverlay={renderRow}
            renderItem={renderSortableItem}
            keyExtractor={keyExtractor}
          />
        ) : (
          <Sortable.Root
            keys={keys}
            renderOverlay={renderRow}
            onMoveItem={handleMoveItem}
          >
            {indexes.map((index) => renderSortableItem({ item: index }))}
          </Sortable.Root>
        )
      ) : (
        indexes.map(renderRow)
      )}
      {expanded && renderExpandedContent?.()}
    </Primitives.Section>
  );
}

export default memo(ArrayController);
