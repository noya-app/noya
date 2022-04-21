import React, {
  memo,
  useRef,
  useMemo,
  useState,
  useContext,
  useCallback,
  createContext,
} from 'react';
import {
  View,
  ViewStyle,
  TouchableOpacity,
  LayoutChangeEvent,
} from 'react-native';
import styled from 'styled-components';

import { Portal } from 'noya-react-utils';
import type {
  RootProps,
  PopoverType,
  ContextType,
  TriggerProps,
  ContentProps,
  ElementDimensions,
} from './types';

const ContentView = styled(View)(({ theme }) => ({
  zIndex: 999,
  position: 'absolute',
  borderRadius: 4,
  padding: 4,
  backgroundColor: theme.colors.popover.background,
  borderWidth: 1,
  borderColor: theme.colors.divider,
}));

const PopoverContext = createContext<ContextType>({
  isOpen: false,
  onChangeOpen: () => {},
  setTriggerDimensions: () => {},
  triggerDimensions: { x: 0, y: 0, width: 0, height: 0 },
});

const Root = memo(function Root(props: RootProps) {
  const { onOpenChange, children } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [triggerDimensions, setTriggerDimensions] = useState<ElementDimensions>(
    {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
  );

  const onChangeOpen = useCallback(
    (isOpen: boolean) => {
      setIsOpen(isOpen);
      onOpenChange?.(isOpen);
    },
    [setIsOpen, onOpenChange],
  );

  return (
    <PopoverContext.Provider
      value={{ isOpen, onChangeOpen, triggerDimensions, setTriggerDimensions }}
    >
      {children}
    </PopoverContext.Provider>
  );
});

const Trigger = memo(function Trigger({ children }: TriggerProps) {
  const popover = useContext(PopoverContext);
  const triggerRef = useRef<View>(null);

  const onTriggerPress = useCallback(() => {
    triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      popover.setTriggerDimensions({ x: pageX, y: pageY, width, height });
      popover.onChangeOpen(!popover.isOpen);
    });
  }, [popover]);

  return (
    <TouchableOpacity onPress={onTriggerPress}>
      <View ref={triggerRef}>{children}</View>
    </TouchableOpacity>
  );
});

const Content = memo(function Content({
  children,
  style,
  align,
  side,
}: ContentProps & { style?: ViewStyle }) {
  const popover = useContext(PopoverContext);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const positionStyle: ViewStyle = useMemo(() => {
    if (!dimensions.width || !dimensions.height) {
      // If dimensions aren't available let react calcuate them
      // while component is invisible to avoid component jumping
      return {
        top: 0,
        left: 0,
        opacity: 0,
      };
    }

    const offsetHorizontal = {
      start: 0,
      center: (popover.triggerDimensions.width - dimensions.width) / 2,
      end: popover.triggerDimensions.width - dimensions.width,
    }[align ?? 'center'];

    const offsetVertical = {
      start: 0,
      center: (popover.triggerDimensions.height - dimensions.height) / 2,
      end: popover.triggerDimensions.height - dimensions.height,
    }[align ?? 'center'];

    if (side === 'bottom') {
      return {
        top: popover.triggerDimensions.y + popover.triggerDimensions.height,
        left: popover.triggerDimensions.x + offsetHorizontal,
      };
    }

    if (side === 'top') {
      return {
        top: popover.triggerDimensions.y - dimensions.height,
        left: popover.triggerDimensions.x + offsetHorizontal,
      };
    }

    if (side === 'left') {
      return {
        top: popover.triggerDimensions.y + offsetVertical,
        left: popover.triggerDimensions.x - dimensions.width,
      };
    }

    if (side === 'right') {
      return {
        top: popover.triggerDimensions.y + offsetVertical,
        left: popover.triggerDimensions.x + popover.triggerDimensions.width,
      };
    }

    return {
      top: 0,
      left: 0,
    };
  }, [align, dimensions, side, popover.triggerDimensions]);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setDimensions({
        width: event.nativeEvent.layout.width,
        height: event.nativeEvent.layout.height,
      });
    },
    [setDimensions],
  );

  return (
    <Portal>
      {popover.isOpen && (
        <ContentView style={[style, positionStyle]} onLayout={onLayout}>
          {children}
        </ContentView>
      )}
    </Portal>
  );
});

const PopoverNative: PopoverType = {
  Root,
  Trigger,
  Content,
};

export default PopoverNative;
