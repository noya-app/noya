import * as InspectorPrimitives from '../inspector/InspectorPrimitives';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import {
  Sortable,
  Spacer,
  ListView,
  RelativeDropPosition,
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
  getKey?: (item: Item) => string;
  onMoveItem?: (sourceIndex: number, destinationIndex: number) => void;
  onClickPlus?: () => void;
  onClickTrash?: () => void;
  renderItem: (props: { item: Item; index: number }) => ReactNode;
}

function ArrayController<Item>({
  // id,
  items,
  title,
  sortable = false,
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

  const renderRow = (index: number) => {
    return (
      <ElementRow>
        {renderItem({
          item: items[index],
          index,
        })}
      </ElementRow>
    );
  };

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

      onMoveItem?.(sourceIndex, destinationIndex);
    },
    [onMoveItem],
  );

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title>{title}</InspectorPrimitives.Title>
        <Spacer.Horizontal />
        {onClickTrash && items.some((item) => !item) && (
          <TrashIcon color={iconColor} onClick={onClickTrash} />
        )}
        <Spacer.Horizontal size={12} />
        {onClickPlus && <PlusIcon color={iconColor} onClick={onClickPlus} />}
      </InspectorPrimitives.SectionHeader>
      {sortable ? (
        <Sortable.Root
          keys={keys}
          renderOverlay={renderRow}
          onMoveItem={handleMoveItem}
        >
          {items.map((_, index) => (
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
        items.map((_, index) => renderRow(index))
      )}
    </InspectorPrimitives.Section>
  );
}

export default memo(ArrayController);
