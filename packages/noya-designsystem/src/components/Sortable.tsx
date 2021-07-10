import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
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
import {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

export type DragIndicator = 'above' | 'below' | 'inside';

const ActiveIndexContext = createContext<number | undefined>(undefined);

/* ----------------------------------------------------------------------------
 * Item
 * ------------------------------------------------------------------------- */

interface ItemProps {
  id: string;
  children: (props: any) => JSX.Element;
}

function SortableItem({ id, children }: ItemProps) {
  const activeIndex = useContext(ActiveIndexContext);
  const sortable = useSortable({ id });

  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    index,
    overIndex,
  } = sortable;

  return children({
    ref: setNodeRef,
    ...attributes,
    ...listeners,
    dragIndicator:
      index === overIndex && !isDragging
        ? activeIndex !== undefined && activeIndex > index
          ? 'above'
          : 'below'
        : undefined,
  });
}

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

interface RootProps {
  keys: string[];
  children: ReactNode;
  renderOverlay?: (index: number) => ReactNode;
  onMoveItem?: (sourceIndex: number, destinationIndex: number) => void;
}

function SortableRoot({
  keys,
  children,
  onMoveItem,
  renderOverlay,
}: RootProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
  );

  const [activeIndex, setActiveIndex] = useState<number | undefined>();

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveIndex(keys.indexOf(event.active.id));
    },
    [keys],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveIndex(undefined);

      if (over && active.id !== over.id) {
        const oldIndex = keys.indexOf(active.id);
        const newIndex = keys.indexOf(over.id);

        onMoveItem?.(oldIndex, newIndex);
      }
    },
    [keys, onMoveItem],
  );

  return (
    <ActiveIndexContext.Provider value={activeIndex}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
      >
        <SortableContext items={keys} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
        {renderOverlay &&
          createPortal(
            <DragOverlay dropAnimation={null}>
              {activeIndex !== undefined && renderOverlay(activeIndex)}
            </DragOverlay>,
            document.body,
          )}
      </DndContext>
    </ActiveIndexContext.Provider>
  );
}

export const Item = memo(SortableItem);
export const Root = memo(SortableRoot);
