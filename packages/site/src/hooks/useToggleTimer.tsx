import React from 'react';

export function useToggleTimer(delay: number) {
  const [value, setValue] = React.useState(false);

  React.useEffect(() => {
    if (!value) return;

    const timeout = setTimeout(() => setValue(false), delay);

    return () => clearTimeout(timeout);
  }, [delay, value]);

  return { value, trigger: () => setValue(true) };
}
