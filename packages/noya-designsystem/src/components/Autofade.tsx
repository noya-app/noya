import React, { memo, useLayoutEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
  timestamp: number;
  delay?: number;
}

export const Autofade = memo(function Autofade({
  children,
  timestamp,
  delay = 10000,
}: Props) {
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const elapsed = Date.now() - timestamp;
    const remaining = delay - elapsed;

    if (remaining > 0) {
      setVisible(true);

      const timerId = setTimeout(() => setVisible(false), remaining);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [delay, timestamp]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 1s linear',
      }}
    >
      {children}
    </div>
  );
});
