import Link from 'next/link';
import { useRouter } from 'next/router';
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
import styled from 'styled-components';
import { Logo } from './Logo';

const StyledLogo = styled(Logo)({
  cursor: 'pointer',
  userSelect: 'none',
  '&:hover': {
    opacity: 0.9,
  },
  '&:active': {
    opacity: 0.95,
  },
});

export function Toolbar() {
  const theme = useDesignSystemTheme();
  const session = useNoyaSession();
  const router = useRouter();

  const userMenuItems = createSectionedMenu([
    { title: 'Sign out', value: 'signOut' },
  ]);

  return (
    <Stack.H
      background={theme.colors.sidebar.background}
      flex={`0 0 ${theme.sizes.toolbar.height}px`}
      alignItems="center"
      padding={'0 10px'}
    >
      <Link href="/">
        <StyledLogo
          onClick={() => {
            router.push('/');
          }}
        />
      </Link>
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
