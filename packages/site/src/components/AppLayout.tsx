import React from 'react';
import { ScrollArea, Stack, useDesignSystemTheme } from 'noya-designsystem';
import { ReactNode } from 'react';

export function AppLayout({
  children,
  toolbar,
}: {
  children: ReactNode;
  toolbar: ReactNode;
}) {
  const theme = useDesignSystemTheme();

  return (
    <Stack.V flex="1" background={theme.colors.canvas.background}>
      <ScrollArea>
        <Stack.V flex="1">
          {toolbar}
          <Stack.H flex="1" justifyContent="center">
            <Stack.V flex="1" maxWidth={840} padding={'100px 60px'}>
              {children}
            </Stack.V>
          </Stack.H>
        </Stack.V>
      </ScrollArea>
    </Stack.V>
  );
}
