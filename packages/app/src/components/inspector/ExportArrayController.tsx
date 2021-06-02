import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { Spacer } from 'noya-designsystem';
import { memo, ReactNode, useCallback } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';

/* ----------------------------------------------------------------------------
 * ArrayElement
 * ------------------------------------------------------------------------- */

const ElementRow = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: '10px',
  cursor: 'initial !important', // Override draggableProps.style
}));

interface ArrayElementProps {
  id: string;
  index: number;
  children: ReactNode;
}

const ArrayElement = memo(function ArrayElement({
  id,
  index,
  children,
}: ArrayElementProps) {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => (
        <ElementRow
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          {children}
        </ElementRow>
      )}
    </Draggable>
  );
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
  getKey?: (item: Item) => string | number;
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
  const handleDragEnd = useCallback(
    (result) => {
      const { destination, source } = result;

      if (!destination) {
        onDeleteItem?.(source.index);
        return;
      }

      if (
        // Different destination
        source.droppableId !== destination.droppableId ||
        // Same index
        source.index === destination.index
      ) {
        return;
      }

      onMoveItem?.(source.index, destination.index);
    },
    [onDeleteItem, onMoveItem],
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <ArrayControllerContainer>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title>{title}</Title>
          <Spacer.Horizontal />
          {onClickTrash && value.some((item) => !item) && (
            <span onClick={onClickTrash}>
              <TrashIcon color="rgb(139,139,139)" />
            </span>
          )}
          <Spacer.Horizontal size={12} />
          {onClickPlus && (
            <span onClick={onClickPlus}>
              <PlusIcon color="rgb(139,139,139)" />
            </span>
          )}
        </div>
        <Droppable droppableId={id}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {value.map((item, index) => (
                <ArrayElement
                  key={getKey?.(item) ?? index}
                  id={String(index)}
                  index={index}
                >
                  {renderItem({
                    item,
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
                </ArrayElement>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </ArrayControllerContainer>
    </DragDropContext>
  );
}

export default memo(ArrayController);
