import {
  ScrollArea,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import React, { ReactNode } from 'react';

export function AppLayout({
  children,
  toolbar,
  footer,
}: {
  children: ReactNode;
  toolbar: ReactNode;
  footer?: ReactNode;
}) {
  const theme = useDesignSystemTheme();

  return (
    <Stack.V flex="1" background={theme.colors.canvas.background}>
      {toolbar}
      <ScrollArea>
        <Stack.V flex="1">
          <Spacer.Vertical size={100} />
          <Stack.H flex="1" justifyContent="center" padding={'0px 60px'}>
            <Stack.V flex="1" maxWidth={720}>
              {children}
            </Stack.V>
          </Stack.H>
          {!footer && <Spacer.Vertical size={100} />}
        </Stack.V>
      </ScrollArea>
      {footer && (
        <>
          <Stack.H justifyContent="center" padding={'20px 60px 30px 60px'}>
            <Stack.V flex="1" maxWidth={720}>
              {footer}
            </Stack.V>
          </Stack.H>
        </>
      )}
    </Stack.V>
  );
}
