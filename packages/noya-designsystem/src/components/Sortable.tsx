import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  Translate,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React, {
  createContext,
  memo,
  ReactNode,
  Ref,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

export type RelativeDropPosition = 'above' | 'below' | 'inside';

export type DropValidator = (
  sourceId: string,
  destinationId: string,
  position: RelativeDropPosition,
) => boolean;

const defaultAcceptsDrop: DropValidator = (
  sourceId,
  destinationId,
  position,
) => {
  return position !== 'inside' && sourceId !== destinationId;
};

const SortableItemContext = createContext<{
  position: Translate;
  acceptsDrop: DropValidator;
  setActivatorEvent: (event: PointerEvent) => void;
}>({
  position: { x: 0, y: 0 },
  acceptsDrop: defaultAcceptsDrop,
  setActivatorEvent: () => {},
});

function validateDropIndicator(
  acceptsDrop: DropValidator,
  activeId: string,
  overId: string,
  offsetTop: number,
  elementTop: number,
  elementHeight: number,
): RelativeDropPosition | undefined {
  const acceptsDropInside = acceptsDrop(activeId, overId, 'inside');

  // If we're in the center of the element, prefer dropping inside
  if (
    offsetTop >= elementTop + elementHeight / 3 &&
    offsetTop <= elementTop + (elementHeight * 2) / 3 &&
    acceptsDropInside
  )
    return 'inside';

  // Are we over the top or bottom half of the element?
  const indicator =
    offsetTop < elementTop + elementHeight / 2 ? 'above' : 'below';

  // Drop above or below if possible, falling back to inside
  return acceptsDrop(activeId, overId, indicator)
    ? indicator
    : acceptsDropInside
    ? 'inside'
    : undefined;
}

/* ----------------------------------------------------------------------------
 * Item
 * ------------------------------------------------------------------------- */

type UseSortableReturnType = ReturnType<typeof useSortable>;

interface ItemProps<T> {
  id: string;
  children: (
    props: {
      ref: Ref<T>;
      relativeDropPosition?: RelativeDropPosition;
      [key: string]: any;
    } & UseSortableReturnType['attributes'],
  ) => JSX.Element;
}

function SortableItem<T extends HTMLElement>({ id, children }: ItemProps<T>) {
  const { position, acceptsDrop, setActivatorEvent } = useContext(
    SortableItemContext,
  );
  const sortable = useSortable({ id });

  const {
    active,
    activatorEvent,
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    index,
    overIndex,
    over,
  } = sortable;

  if (activatorEvent) {
    setActivatorEvent(activatorEvent as PointerEvent);
  }

  const eventY = (activatorEvent as PointerEvent | null)?.clientY ?? 0;
  const offsetTop = eventY + position.y;

  const ref = useCallback((node: T) => setNodeRef(node), [setNodeRef]);

  return children({
    ref,
    ...attributes,
    ...listeners,
    relativeDropPosition:
      index === overIndex && !isDragging && active && over
        ? validateDropIndicator(
            acceptsDrop,
            active.id,
            over.id,
            offsetTop,
            over.rect.offsetTop,
            over.rect.height,
          )
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
  onMoveItem?: (
    sourceIndex: number,
    destinationIndex: number,
    position: RelativeDropPosition,
  ) => void;
  acceptsDrop?: DropValidator;
}

function SortableRoot({
  keys,
  children,
  onMoveItem,
  renderOverlay,
  acceptsDrop = defaultAcceptsDrop,
}: RootProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
  );

  const [activeIndex, setActiveIndex] = useState<number | undefined>();
  const activatorEvent = useRef<PointerEvent | null>(null);

  const setActivatorEvent = useCallback((event: PointerEvent) => {
    activatorEvent.current = event;
  }, []);

  const [position, setPosition] = useState<Translate>({ x: 0, y: 0 });

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveIndex(keys.indexOf(event.active.id));
    },
    [keys],
  );

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    setPosition({ ...event.delta });
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveIndex(undefined);

      if (over && active.id !== over.id) {
        const oldIndex = keys.indexOf(active.id);
        const newIndex = keys.indexOf(over.id);

        const eventY = activatorEvent.current?.clientY ?? 0;
        const offsetTop = eventY + position.y;

        const indicator = validateDropIndicator(
          acceptsDrop,
          active.id,
          over.id,
          offsetTop,
          over.rect.offsetTop,
          over.rect.height,
        );

        if (!indicator) return;

        onMoveItem?.(oldIndex, newIndex, indicator);
      }
    },
    [acceptsDrop, keys, onMoveItem, position.y],
  );

  return (
    <SortableItemContext.Provider
      value={useMemo(
        () => ({
          acceptsDrop,
          position,
          setActivatorEvent,
        }),
        [acceptsDrop, position, setActivatorEvent],
      )}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
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
    </SortableItemContext.Provider>
  );
}

export const Item = memo(SortableItem);
export const Root = memo(SortableRoot);
