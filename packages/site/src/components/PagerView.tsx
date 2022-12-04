import { snap } from '@popmotion/popcorn';
import * as React from 'react';
import { animated, SpringValue, useSpring } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import { Spacer, Stack } from '../system';

import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';

type PagerViewContextProps = {
  initialOffset: number;
  frameSize: number;
  trackSize: number;
  trackXOffset: SpringValue;
};

const PagerViewContext = React.createContext<PagerViewContextProps | undefined>(
  undefined,
);

const usePagerContext = () => {
  const contextValue = React.useContext(PagerViewContext);

  if (!contextValue) throw new Error('Missing context');

  return contextValue;
};

const viewSize = 540;

export function View({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { initialOffset, frameSize, trackSize, trackXOffset } =
    usePagerContext();
  const getViewTarget = (value: number) => {
    const align = 0.5;
    const alignOffset = (frameSize - viewSize) * align;
    let position = initialOffset + value;

    while (position > trackSize - viewSize - alignOffset) {
      position = position - trackSize;
    }

    while (position < 0 - viewSize - alignOffset) {
      position = position + trackSize;
    }

    return position + alignOffset;
  };

  return (
    // @ts-ignore
    <animated.div
      className={className}
      css={{
        gridArea: '1 / 1',
        width: viewSize,
      }}
      style={{
        transform: trackXOffset.to((x) => `translateX(${getViewTarget(x)}px)`),
      }}
    >
      {children}
    </animated.div>
  );
}

export function PagerView({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [frameSize, setFrameSize] = React.useState(-1);
  const trackSize = React.Children.toArray(children).reduce(
    (total: number) => total + viewSize,
    0,
  );
  const [style, api] = useSpring(() => ({ x: 0 }));
  const moveTrackPosition = (amount: number) => {
    api.start({
      x: snap(viewSize)(style.x.get() + amount),
      config: {
        decay: false,
      },
    });
  };
  const bind = useDrag(
    (event) => {
      api.start({
        x: event.movement[0],
        immediate: event.down,
        config: {
          decay: true,
          velocity: event.vxvy[0],
        },
      });
    },
    {
      axis: 'x',
      initial: () => [style.x.get(), 0],
    },
  );

  useIsomorphicLayoutEffect(() => {
    if (ref.current) {
      setFrameSize(ref.current.offsetWidth);
    }
  }, []);

  return (
    <>
      <div
        {...bind()}
        ref={ref}
        onMouseDown={() => api.stop()}
        className={className}
        css={{
          display: 'grid',
          gridAutoFlow: 'column',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {React.Children.map(children, (child, index) => (
          <PagerViewContext.Provider
            value={{
              initialOffset: index * viewSize,
              frameSize,
              trackSize,
              trackXOffset: style.x,
            }}
          >
            {child}
          </PagerViewContext.Provider>
        ))}
      </div>
      <Spacer size="2rem" />
      <Stack
        flexDirection="row"
        justifyContent="center"
        height="1rem"
        gap="1rem"
        css={{
          gridColumn: '1 / -1',
        }}
      >
        {React.Children.map(children, (_, index) => (
          <button
            key={index}
            aria-label={`Move to ${index}`}
            onClick={() => moveTrackPosition(-index * viewSize)}
            css={{
              width: '1rem',
              height: '1rem',
              padding: 0,
              border: 'none',
              borderRadius: '100%',
              backgroundColor: '#9171a9',
            }}
          />
        ))}
      </Stack>
    </>
  );
}
