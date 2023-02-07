import Link from 'next/link';
import { useRouter } from 'next/router';
import { useOptionalNoyaSession } from 'noya-api';
import {
  Button,
  createSectionedMenu,
  DividerVertical,
  DropdownMenu,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import {
  ChevronDownIcon,
  DiscordLogoIcon,
  EnvelopeClosedIcon,
  ExitIcon,
  PersonIcon,
  QuestionMarkCircledIcon,
} from 'noya-icons';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { NOYA_HOST } from '../utils/noyaClient';
import { Logo } from './Logo';

const LogoContainer = styled.div({
  alignSelf: 'stretch',
  padding: '0 11px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  userSelect: 'none',
  '&:hover': {
    opacity: 0.9,
  },
  '&:active': {
    opacity: 0.95,
  },
});

interface Props {
  children?: ReactNode;
  right?: ReactNode;
}

export function Toolbar({ children, right }: Props) {
  const theme = useDesignSystemTheme();
  const session = useOptionalNoyaSession();
  const router = useRouter();

  const userMenuItems = createSectionedMenu(
    [{ title: 'Account', value: 'account', icon: <PersonIcon /> }],
    [
      { title: 'Discord', value: 'discord', icon: <DiscordLogoIcon /> },
      { title: 'Contact us', value: 'contact', icon: <EnvelopeClosedIcon /> },
      { title: 'Get help', value: 'help', icon: <QuestionMarkCircledIcon /> },
    ],
    [{ title: 'Sign out', value: 'signOut', icon: <ExitIcon /> }],
  );

  return (
    <Stack.H
      background={theme.colors.sidebar.background}
      flex={`0 0 ${theme.sizes.toolbar.height}px`}
      alignItems="center"
      padding={'0 10px 0 0'}
      position="relative"
    >
      <Link href="/">
        <LogoContainer
          onClick={() => {
            router.push('/');
          }}
        >
          <Logo />
        </LogoContainer>
      </Link>
      <DividerVertical />
      <Spacer.Horizontal size={10} />
      <Spacer.Horizontal />
      <Stack.H gap={theme.sizes.toolbar.itemSeparator}>
        {right}
        {session && (
          <DropdownMenu
            items={userMenuItems}
            onSelect={(value) => {
              switch (value) {
                case 'account':
                  router.push('/account');
                  return;
                case 'signOut':
                  window.location.href = `${NOYA_HOST}/api/auth/signout`;
                  return;
                case 'discord':
                  window.location.href = 'https://discord.gg/NPGAwyEBJw';
                  return;
                case 'contact':
                  window.location.href =
                    'https://noyasoftware.notion.site/Noya-Contact-9a95e0895eba4f578517dfdc4d94ccdd';
                  return;
                case 'help':
                  window.location.href =
                    'https://noyasoftware.notion.site/Noya-Help-4344e26dc3394c7195305b15b050e616';
                  return;
              }
            }}
          >
            <Button id="insert-symbol" data-private>
              {session.user.name ?? session.user.email}
              <Spacer.Horizontal size={4} />
              <ChevronDownIcon />
            </Button>
          </DropdownMenu>
        )}
      </Stack.H>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.colors.textMuted,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'all',
          }}
        >
          {children}
        </div>
      </div>
    </Stack.H>
  );
}
