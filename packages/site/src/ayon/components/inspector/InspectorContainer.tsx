import {
  ScrollArea,
  Stack,
  useDesignSystemTheme,
} from '@noya-app/noya-designsystem';
import React, { memo } from 'react';

export const InspectorContainer = memo(function InspectorContainer({
  width,
  header,
  children,
  fallback,
}: {
  width: number | string;
  header?: React.ReactNode;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const theme = useDesignSystemTheme();

  return (
    <Stack.V
      background={theme.colors.sidebar.background}
      width={width}
      flex={`0 0 ${width}px`}
      position="relative"
    >
      {header}
      {children ? (
        <ScrollArea>
          <Stack.V
            gap="1px"
            position="relative"
            background={theme.colors.canvas.background}
          >
            {children}
          </Stack.V>
        </ScrollArea>
      ) : fallback ? (
        <Stack.V position="relative" height="100%">
          {fallback}
        </Stack.V>
      ) : null}
    </Stack.V>
  );
});
