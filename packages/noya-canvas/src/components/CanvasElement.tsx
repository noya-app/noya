import { Insets, Size } from '@noya-app/noya-geometry';
import { ReactDOMEventHandlers } from 'noya-designsystem';
import { KEYBOARD_SHORTCUT_PASSTHROUGH_CLASS } from 'noya-keymap';
import React, {
  CSSProperties,
  ForwardedRef,
  ReactNode,
  forwardRef,
  memo,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import styled from 'styled-components';
import { useAutomaticCanvasSize } from '../hooks/useAutomaticCanvasSize';
import { ICanvasElement } from './types';

export const ZERO_INSETS: Insets = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

const InsetContainer = styled.div<{ insets: Insets; zIndex: number }>(
  ({ insets, zIndex }) => ({
    position: 'absolute',
    top: -insets.top,
    bottom: -insets.bottom,
    right: -insets.right,
    left: -insets.left,
    zIndex,
  }),
);

const Container = styled.div<{ cursor: CSSProperties['cursor'] }>(
  ({ cursor }) => ({
    flex: '1',
    position: 'relative',
    cursor,
  }),
);

const HiddenInputTarget = styled.input({
  position: 'absolute',
  top: '-200px',
});

export interface CanvasElementProps extends ReactDOMEventHandlers {
  onChangeSize: (size: Size, insets: Insets) => void;
  insets?: Insets;
  rendererZIndex?: number;
  children?: ({ size }: { size: Size }) => ReactNode;
  widgets?: ReactNode;
  cursor?: CSSProperties['cursor'];
  autoFocus?: boolean;
}

export const CanvasElement = memo(
  forwardRef(function CanvasElement(
    {
      children,
      onChangeSize,
      rendererZIndex = 0,
      insets = ZERO_INSETS,
      widgets,
      cursor,
      autoFocus,
      ...props
    }: CanvasElementProps,
    forwardedRef: ForwardedRef<ICanvasElement>,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { canvasSize } = useAutomaticCanvasSize({
      insets,
      containerRef,
      onChangeSize,
    });

    useImperativeHandle(forwardedRef, () => ({
      focus: () => inputRef.current?.focus(),
      setPointerCapture: (pointerId: number) =>
        containerRef.current?.setPointerCapture(pointerId),
      releasePointerCapture: (pointerId: number) =>
        containerRef.current?.releasePointerCapture(pointerId),
    }));

    const {
      onKeyDown,
      onKeyDownCapture,
      onKeyUp,
      onKeyUpCapture,
      onKeyPress,
      onKeyPressCapture,
      onBeforeInput,
      ...rest
    } = props;

    useLayoutEffect(() => {
      const input = inputRef.current;

      if (!input || !onBeforeInput) return;

      input.addEventListener('beforeinput', onBeforeInput);

      return () => input.removeEventListener('beforeinput', onBeforeInput);
    }, [onBeforeInput]);

    useLayoutEffect(() => {
      // Initial focus
      if (autoFocus) {
        inputRef.current?.focus();
      }
    }, [autoFocus]);

    return (
      <Container
        id="canvas-container"
        ref={containerRef}
        tabIndex={0}
        cursor={cursor}
        onFocus={() => inputRef.current?.focus()}
        {...rest}
      >
        <HiddenInputTarget
          id="hidden-canvas-input"
          className={KEYBOARD_SHORTCUT_PASSTHROUGH_CLASS}
          ref={inputRef}
          type="text"
          onKeyDown={onKeyDown}
          onKeyDownCapture={onKeyDownCapture}
          onKeyUp={onKeyUp}
          onKeyUpCapture={onKeyUpCapture}
          onKeyPress={onKeyPress}
          onKeyPressCapture={onKeyPressCapture}
        />
        <InsetContainer insets={insets} zIndex={rendererZIndex}>
          {canvasSize && children?.({ size: canvasSize })}
        </InsetContainer>
        {widgets}
      </Container>
    );
  }),
);
