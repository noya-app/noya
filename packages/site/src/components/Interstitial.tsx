import { ArrowRightIcon } from '@noya-app/noya-icons';
import router from 'next/router';
import {
  Button,
  Small,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import React, { ReactNode } from 'react';

export function Interstitial({
  title,
  description,
  showHomeLink,
}: {
  title: string;
  description: string;
  showHomeLink?: ReactNode;
}) {
  const theme = useDesignSystemTheme();

  return (
    <Stack.V
      flex="1"
      alignItems="center"
      justifyContent="center"
      background={theme.colors.canvas.background}
    >
      <Stack.V
        border={`1px solid ${theme.colors.dividerStrong}`}
        padding={20}
        background={theme.colors.sidebar.background}
        maxWidth={300}
      >
        <Small color="text" fontWeight="bold">
          {title}
        </Small>
        <Spacer.Vertical size={4} />
        <Small color="text">{description}</Small>
        {showHomeLink && (
          <>
            <Spacer.Vertical size={16} />
            <Stack.H>
              <Button variant="secondary" onClick={() => router.push('/')}>
                Home
                <Spacer.Horizontal size={6} inline />
                <ArrowRightIcon />
              </Button>
            </Stack.H>
          </>
        )}
      </Stack.V>
    </Stack.V>
  );
}
