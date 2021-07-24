import * as InspectorPrimitives from './InspectorPrimitives';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import {
  Sortable,
  Spacer,
  ListView,
  RelativeDropPosition,
  withSeparatorElements,
} from 'noya-designsystem';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';

const ElementRow = styled.div({
  flex: '0 0 auto',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: '10px',
});

const ItemContainer = styled.div({
  position: 'relative',
});

interface ArrayControllerProps<Item> {
  id: string;
  items: Item[];
  title: ReactNode;
  sortable?: boolean;
  reversed?: boolean;
  getKey?: (item: Item) => string;
  onMoveItem?: (sourceIndex: number, destinationIndex: number) => void;
  onClickPlus?: () => void;
  onClickTrash?: () => void;
  renderItem: (props: { item: Item; index: number }) => ReactNode;
}

function getIndex<T>(array: T[], index: number): number {
  return index;
}

function getReversedIndex<T>(array: T[], index: number): number {
  return array.length - 1 - index;
}

function mapIndex<T, U>(
  array: T[],
  getIndex: (array: T[], index: number) => number,
  f: (value: T, index: number, array: T[]) => U,
): U[] {
  let result: U[] = [];

  for (let i = 0; i < array.length; i++) {
    result.push(f(array[getIndex(array, i)], i, array));
  }

  return result;
}

function ArrayController<Item>({
  id,
  items,
  title,
  sortable = false,
  reversed = true,
  getKey,
  onMoveItem,
  onClickPlus,
  onClickTrash,
  renderItem,
}: ArrayControllerProps<Item>) {
  const iconColor = useTheme().colors.icon;

  const keys = useMemo(
    () => items.map((item, index) => getKey?.(item) ?? index.toString()),
    [getKey, items],
  );

  const indexMapper = reversed ? getReversedIndex : getIndex;

  const handleMoveItem = useCallback(
    (
      sourceIndex: number,
      destinationIndex: number,
      position: RelativeDropPosition,
    ) => {
      if (
        sourceIndex === destinationIndex ||
        (position === 'above' && sourceIndex + 1 === destinationIndex) ||
        (position === 'below' && sourceIndex - 1 === destinationIndex)
      )
        return;

      onMoveItem?.(
        indexMapper(items, sourceIndex),
        indexMapper(items, destinationIndex),
      );
    },
    [indexMapper, items, onMoveItem],
  );

  const renderRow = (index: number) => {
    const mappedIndex = indexMapper(items, index);

    return (
      <ElementRow>
        {renderItem({ item: items[mappedIndex], index: mappedIndex })}
      </ElementRow>
    );
  };

  return (
    <InspectorPrimitives.Section id={id}>
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title>{title}</InspectorPrimitives.Title>
        <Spacer.Horizontal />
        {withSeparatorElements(
          [
            onClickTrash && (
              <TrashIcon color={iconColor} onClick={onClickTrash} />
            ),
            onClickPlus && <PlusIcon color={iconColor} onClick={onClickPlus} />,
          ],
          <Spacer.Horizontal size={12} />,
        )}
      </InspectorPrimitives.SectionHeader>
      {sortable ? (
        <Sortable.Root
          keys={keys}
          renderOverlay={renderRow}
          onMoveItem={handleMoveItem}
        >
          {mapIndex(items, indexMapper, (_, index) => (
            <Sortable.Item<HTMLDivElement> id={keys[index]} key={keys[index]}>
              {({ relativeDropPosition, ...sortableProps }) => (
                <ItemContainer {...sortableProps}>
                  {renderRow(index)}
                  {relativeDropPosition && (
                    <ListView.DragIndicatorElement
                      relativeDropPosition={relativeDropPosition}
                      offsetLeft={0}
                    />
                  )}
                </ItemContainer>
              )}
            </Sortable.Item>
          ))}
        </Sortable.Root>
      ) : (
        mapIndex(items, indexMapper, (_, index) => renderRow(index))
      )}
    </InspectorPrimitives.Section>
  );
}

export default memo(ArrayController);
