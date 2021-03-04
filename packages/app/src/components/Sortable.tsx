import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToFirstScrollableAncestor,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo, ReactNode, useCallback, useMemo } from 'react';

/* ----------------------------------------------------------------------------
 * Item
 * ------------------------------------------------------------------------- */

interface ItemProps {
  id: string;
  children: (props: any) => JSX.Element;
}

function SortableItem({ id, children }: ItemProps) {
  const sortable = useSortable({ id });

  const { attributes, listeners, setNodeRef, transform, transition } = sortable;

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition],
  );

  return children({ ref: setNodeRef, style, ...attributes, ...listeners });
}

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

interface RootProps {
  keys: string[];
  children: ReactNode;
  onMoveItem?: (sourceIndex: number, destinationIndex: number) => void;
}

function SortableRoot({ keys, children, onMoveItem }: RootProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = keys.indexOf(active.id);
        const newIndex = keys.indexOf(over.id);

        onMoveItem?.(oldIndex, newIndex);
      }
    },
    [keys, onMoveItem],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
    >
      <SortableContext items={keys} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

export const Item = memo(SortableItem);
export const Root = memo(SortableRoot);
