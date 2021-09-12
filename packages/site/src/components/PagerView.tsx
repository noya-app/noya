import * as React from 'react';
import { useDrag } from 'react-use-gesture';
import { animated, SpringValue, useSpring } from 'react-spring';
import { snap } from '@popmotion/popcorn';

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

const viewSize = 300;

export function View({ color }: { color: string }) {
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
      style={{
        gridArea: '1 / 1',
        backgroundColor: color,
        transform: trackXOffset.to((x) => `translateX(${getViewTarget(x)}px)`),
        width: viewSize,
        height: '16rem',
      }}
    >
      {initialOffset / viewSize}
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
  ) as number;
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
        style={{
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
      <div css={{ height: '2rem' }}>
        <button onClick={() => moveTrackPosition(viewSize)}>Prev</button>
        <button onClick={() => moveTrackPosition(-viewSize)}>Next</button>
      </div>
    </>
  );
}
