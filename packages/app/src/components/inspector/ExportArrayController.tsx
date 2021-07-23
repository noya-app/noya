import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { Sortable, Spacer, ListView } from 'noya-designsystem';
import { memo, ReactNode, useCallback, useMemo } from 'react';
// import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import styled, { useTheme } from 'styled-components';

/* ----------------------------------------------------------------------------
 * ArrayElement
 * ------------------------------------------------------------------------- */

const ElementRow = styled.div(({ theme }) => ({
  flex: '0 0 auto',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: '10px',
  // cursor: 'initial !important',
}));

const ArrayElement = styled.div({
  position: 'relative',
});

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

const Title = styled.div(({ theme }) => ({
  ...theme.textStyles.small,
  fontWeight: 'bold',
  display: 'flex',
  flexDirection: 'row',
  userSelect: 'none',
}));

const Checkbox = styled.input(({ theme }) => ({
  margin: 0,
}));

const ArrayControllerContainer = styled.div(({ theme }) => ({
  flex: '0 0 auto',
  display: 'flex',
  flexDirection: 'column',
  padding: '10px',
}));

interface ArrayControllerProps<Item> {
  id: string;
  value: Item[];
  title: ReactNode;
  onDeleteItem?: (index: number) => void;
  onMoveItem?: (sourceIndex: number, destinationIndex: number) => void;
  onChangeCheckbox?: (index: number, checked: boolean) => void;
  onClickPlus?: () => void;
  onClickTrash?: () => void;
  getKey?: (item: Item) => string;
  children: (props: {
    item: Item;
    index: number;
    checkbox: ReactNode;
  }) => ReactNode;
}

function ArrayController<Item>({
  id,
  value,
  title,
  getKey,
  onDeleteItem,
  onMoveItem,
  onClickPlus,
  onClickTrash,
  onChangeCheckbox,
  children: renderItem,
}: ArrayControllerProps<Item>) {
  const iconColor = useTheme().colors.icon;

  const keys = useMemo(
    () => value.map((item, index) => getKey?.(item) ?? index.toString()),
    [getKey, value],
  );

  const renderRow = (index: number) => {
    return (
      <ElementRow>
        {renderItem({
          item: value[index],
          index,
          checkbox: onChangeCheckbox && (
            <Checkbox
              type="checkbox"
              checked={true}
              onChange={(event) => {
                onChangeCheckbox(index, event.target.checked);
              }}
            />
          ),
        })}
      </ElementRow>
    );
  };

  return (
    <ArrayControllerContainer>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Title>{title}</Title>
        <Spacer.Horizontal />
        {onClickTrash && value.some((item) => !item) && (
          <span onClick={onClickTrash}>
            <TrashIcon color={iconColor} />
          </span>
        )}
        <Spacer.Horizontal size={12} />
        {onClickPlus && (
          <span onClick={onClickPlus}>
            <PlusIcon color={iconColor} />
          </span>
        )}
      </div>
      <Sortable.Root
        keys={keys}
        renderOverlay={renderRow}
        onMoveItem={useCallback(
          (sourceIndex, destinationIndex, position) => {
            if (
              sourceIndex === destinationIndex ||
              (position === 'above' && sourceIndex + 1 === destinationIndex) ||
              (position === 'below' && sourceIndex - 1 === destinationIndex)
            )
              return;

            onMoveItem?.(sourceIndex, destinationIndex);
          },
          [onMoveItem],
        )}
      >
        {value.map((_, index) => (
          <Sortable.Item<HTMLDivElement> id={keys[index]} key={keys[index]}>
            {({ relativeDropPosition, ...sortableProps }) => (
              <ArrayElement {...sortableProps}>
                {renderRow(index)}
                {relativeDropPosition && (
                  <ListView.DragIndicatorElement
                    relativeDropPosition={relativeDropPosition}
                    offsetLeft={0}
                  />
                )}
              </ArrayElement>
            )}
          </Sortable.Item>
        ))}
      </Sortable.Root>
    </ArrayControllerContainer>
  );
}

export default memo(ArrayController);
