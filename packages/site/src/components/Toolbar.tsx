import { useNoyaSession } from 'noya-api';
import {
  Button,
  createSectionedMenu,
  DropdownMenu,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { ChevronDownIcon } from 'noya-icons';
import React from 'react';

export function Toolbar() {
  const theme = useDesignSystemTheme();
  const session = useNoyaSession();

  const userMenuItems = createSectionedMenu([
    { title: 'Sign out', value: 'signOut' },
  ]);

  return (
    <Stack.H
      background={theme.colors.sidebar.background}
      flex={`0 0 ${theme.sizes.toolbar.height}px`}
      alignItems="center"
      padding={'0 20px'}
    >
      <Spacer.Horizontal />
      {session && (
        <DropdownMenu
          items={userMenuItems}
          onSelect={(value) => {
            switch (value) {
              case 'signOut':
                window.location.href = `${process.env.NEXT_PUBLIC_NOYA_WEB_URL}/api/auth/signout`;
                return;
            }
          }}
        >
          <Button id="insert-symbol">
            {session.user.name ?? session.user.email}
            <Spacer.Horizontal size={4} />
            <ChevronDownIcon />
          </Button>
        </DropdownMenu>
      )}
    </Stack.H>
  );
}
