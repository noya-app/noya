import React, { useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useEventCallback } from '../hooks/useEventCallback';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { clamp } from '../utils/clamp';

const Container = styled.div(() => ({
  position: 'absolute' as any,
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  borderRadius: 'inherit',
  outline: 'none',
  /* Don't trigger the default scrolling behavior when the event is originating from this element */
  touchAction: 'none',
}));

export interface Interaction {
  left: number;
  top: number;
}

// Check if an event was triggered by touch
const isTouch = (e: MouseEvent | TouchEvent): e is TouchEvent => 'touches' in e;

// Returns a relative position of the pointer inside the node's bounding box
const getRelativePosition = (
  node: HTMLDivElement,
  event: MouseEvent | TouchEvent,
): Interaction => {
  const rect = node.getBoundingClientRect();

  // Get user's pointer position from `touches` array if it's a `TouchEvent`
  const pointer = isTouch(event) ? event.touches[0] : (event as MouseEvent);

  return {
    left: clamp(
      (pointer.pageX - (rect.left + window.pageXOffset)) / rect.width,
    ),
    top: clamp((pointer.pageY - (rect.top + window.pageYOffset)) / rect.height),
  };
};

interface Props {
  onMove: (interaction: Interaction) => void;
  onMoveChange: (moving: boolean) => void;
  onClick: (interaction: Interaction) => void;
  onKey: (offset: Interaction) => void;
  isOnPoint: (interaction: Interaction) => boolean;
  children: React.ReactNode;
}

const InteractiveBase = ({
  onMove,
  onKey,
  onClick,
  onMoveChange,
  isOnPoint,
  ...rest
}: Props) => {
  const container = useRef<HTMLDivElement>(null);
  const hasTouched = useRef(false);
  const isDragging = useRef(false);
  const onMoveCallback = useEventCallback(onMove);
  const onKeyCallback = useEventCallback(onKey);
  const onClickCallback = useEventCallback(onClick);

  // Prevent mobile browsers from handling mouse events (conflicting with touch ones).
  // If we detected a touch interaction before, we prefer reacting to touch events only.
  const isValid = (event: MouseEvent | TouchEvent): boolean => {
    if (hasTouched.current && !isTouch(event)) return false;
    if (!hasTouched.current) hasTouched.current = isTouch(event);
    return true;
  };

  const handleMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!isDragging.current || !container.current) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      onMoveCallback(getRelativePosition(container.current, event));

      // // If user moves the pointer outside of the window or iframe bounds and release it there,
      // // `mouseup`/`touchend` won't be fired. In order to stop the picker from following the cursor
      // // after the user has moved the mouse/finger back to the document, we check `event.buttons`
      // // and `event.touches`. It allows us to detect that the user is just moving his pointer
      // // without pressing it down
      // const isDown = isTouch(event)
      //   ? event.touches.length > 0
      //   : event.buttons > 0;

      // if (isDown && container.current) {
      //   onMoveCallback(getRelativePosition(container.current, event));
      // } else {
      //   isDragging.current = false;
      // }
    },
    [onMoveCallback],
  );

  const handleMoveStart = useCallback(
    ({ nativeEvent: event }: React.MouseEvent | React.TouchEvent) => {
      event.preventDefault();

      if (!isValid(event)) return;

      if (!isOnPoint(getRelativePosition(container.current!, event))) {
        onClickCallback(getRelativePosition(container.current!, event));
        return;
      }
      // The node/ref must actually exist when user start an interaction.
      // We won't suppress the ESLint warning though, as it should probably be something to be aware of.
      onMoveChange(true);
      onMoveCallback(getRelativePosition(container.current!, event));

      isDragging.current = true;
    },
    [onMoveChange, onMoveCallback, onClickCallback, isOnPoint],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const keyCode = event.which || event.keyCode;

      // Ignore all keys except arrow ones
      if (keyCode < 37 || keyCode > 40) return;
      // Do not scroll page by arrow keys when document is focused on the element
      event.preventDefault();
      // Send relative offset to the parent component.
      // We use codes (37←, 38↑, 39→, 40↓) instead of keys ('ArrowRight', 'ArrowDown', etc)
      // to reduce the size of the library
      onKeyCallback({
        left: keyCode === 39 ? 0.05 : keyCode === 37 ? -0.05 : 0,
        top: keyCode === 40 ? 0.05 : keyCode === 38 ? -0.05 : 0,
      });
    },
    [onKeyCallback],
  );

  const handleMoveEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // console.log('is dragging?', isDragging.current);

      if (!isDragging.current) return;
      onMoveChange(false);

      // console.log('handle end');

      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      isDragging.current = false;
    },
    [onMoveChange],
  );

  const toggleDocumentEvents = useCallback(
    (state) => {
      // console.log(state ? 'add' : 'remove', 'events');
      // add or remove additional pointer event listeners

      const toggleEvent = state
        ? window.addEventListener
        : window.removeEventListener;
      toggleEvent(
        hasTouched.current ? 'touchmove' : 'mousemove',
        handleMove,
        true,
      );
      toggleEvent(
        hasTouched.current ? 'touchend' : 'mouseup',
        handleMoveEnd,
        true,
      );
    },
    [handleMove, handleMoveEnd],
  );

  useIsomorphicLayoutEffect(() => {
    toggleDocumentEvents(true);

    return () => {
      toggleDocumentEvents(false);
    };
  }, [toggleDocumentEvents]);

  return (
    <Container
      {...rest}
      ref={container}
      onTouchStart={handleMoveStart}
      onMouseDown={handleMoveStart}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="slider"
    />
  );
};

export const Interactive = React.memo(InteractiveBase);