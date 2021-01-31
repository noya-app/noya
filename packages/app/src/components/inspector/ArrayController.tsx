import { memo, ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import * as Spacer from '../Spacer';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import produce from 'immer';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

type BaseArrayItem = { isEnabled: boolean };

/* ----------------------------------------------------------------------------
 * ArrayElement
 * ------------------------------------------------------------------------- */

const ElementRow = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: '10px',
}));

const Checkbox = styled.input(({ theme }) => ({
  margin: 0,
}));

interface ArrayElementProps {
  id: string;
  index: number;
  checked: boolean;
  onChangeChecked: (checked: boolean) => void;
  children: ReactNode;
}

const ArrayElement = memo(function ArrayElement({
  id,
  index,
  checked,
  onChangeChecked,
  children,
}: ArrayElementProps) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeChecked(event.target.checked);
    },
    [onChangeChecked],
  );

  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => (
        <ElementRow
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <Checkbox type="checkbox" checked={checked} onChange={handleChange} />
          <Spacer.Horizontal size={8} />
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
  onChange: (item: Item[]) => void;
  onClickPlus?: () => void;
  onClickTrash?: () => void;
  getKey?: (item: Item) => string | number;
  children: (item: Item) => ReactNode;
}

function ArrayController<Item extends BaseArrayItem>({
  id,
  value,
  title,
  getKey,
  onChange,
  onClickPlus,
  onClickTrash,
  children: renderItem,
}: ArrayControllerProps<Item>) {
  const handleDragEnd = useCallback(
    (result) => {
      const { destination, source } = result;

      if (!destination) {
        onChange(
          produce(value, (value) => {
            value.splice(source.index, 1);
          }),
        );
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

      onChange(
        produce(value, (value) => {
          const sourceItem = value[source.index];

          value.splice(source.index, 1);
          value.splice(destination.index, 0, sourceItem);
        }),
      );
    },
    [onChange, value],
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <ArrayControllerContainer>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title>{title}</Title>
          <Spacer.Horizontal />
          {onClickTrash && value.some((item) => !item.isEnabled) && (
            <span onClick={onClickTrash}>
              <TrashIcon />
            </span>
          )}
          {onClickPlus && (
            <span onClick={onClickPlus}>
              <PlusIcon />
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
                  checked={value[index].isEnabled}
                  onChangeChecked={(checked) => {
                    onChange(
                      produce(value, (value) => {
                        value[index].isEnabled = checked;
                      }),
                    );
                  }}
                >
                  {renderItem(item)}
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

export default memo(ArrayController) as typeof ArrayController;
