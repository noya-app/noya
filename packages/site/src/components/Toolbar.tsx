import Link from 'next/link';
import { useRouter } from 'next/router';
import { NoyaAPI, useOptionalNoyaSession } from 'noya-api';
import {
  Avatar,
  Button,
  createSectionedMenu,
  DividerVertical,
  DropdownMenu,
  Popover,
  Small,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import {
  ChevronDownIcon,
  DiscordLogoIcon,
  EnvelopeClosedIcon,
  ExitIcon,
  InfoCircledIcon,
  PersonIcon,
  QuestionMarkCircledIcon,
  VideoIcon,
} from 'noya-icons';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { useOnboarding } from '../contexts/OnboardingContext';
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
  left?: ReactNode;
  right?: ReactNode;
  showOnboarding?: boolean;
  dismissOnboarding?: () => void;
}

function getMonogram(session: NoyaAPI.Session) {
  const text = session.user.name ?? session.user.email;

  if (!text) return undefined;

  const firstLetter = text[0].toLocaleUpperCase();

  return firstLetter;
}

function openInNewTab(url: string) {
  window?.open(url, '_blank')?.focus();
}

export function Toolbar({ children, left, right }: Props) {
  const theme = useDesignSystemTheme();
  const session = useOptionalNoyaSession();
  const router = useRouter();

  const userMenuItems = createSectionedMenu(
    [{ title: 'Account', value: 'account', icon: <PersonIcon /> }],
    [
      { title: 'Intro Video', value: 'introVideo', icon: <VideoIcon /> },
      { title: 'Discord', value: 'discord', icon: <DiscordLogoIcon /> },
      { title: 'Contact us', value: 'contact', icon: <EnvelopeClosedIcon /> },
      {
        title: 'Report an issue',
        value: 'reportIssue',
        icon: <InfoCircledIcon />,
      },
      { title: 'Get help', value: 'help', icon: <QuestionMarkCircledIcon /> },
    ],
    [{ title: 'Sign out', value: 'signOut', icon: <ExitIcon /> }],
  );

  const { onboardingStep, setOnboardingStep } = useOnboarding();
  const showOnboarding = onboardingStep === 'configuredBlockText';
  const dismissOnboarding = () => setOnboardingStep('dismissedSupportInfo');

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
      {left && (
        <>
          <Stack.H gap={theme.sizes.toolbar.itemSeparator} alignSelf="stretch">
            {left}
          </Stack.H>
          <Spacer.Horizontal size={10} />
        </>
      )}
      <Spacer.Horizontal />
      <Spacer.Horizontal size={10} />
      <Stack.H gap={theme.sizes.toolbar.itemSeparator}>
        {right}
        {session && (
          <SupportOnboardingPopover
            dismiss={dismissOnboarding}
            show={showOnboarding}
            trigger={
              <DropdownMenu
                items={userMenuItems}
                onOpenChange={(isOpen) => {
                  if (showOnboarding && isOpen) {
                    dismissOnboarding();
                  }
                }}
                onSelect={(value) => {
                  switch (value) {
                    case 'account':
                      router.push('/account');
                      return;
                    case 'signOut':
                      window.location.href = `${NOYA_HOST}/api/auth/signout`;
                      return;
                    case 'discord':
                      openInNewTab('https://discord.gg/NPGAwyEBJw');
                      return;
                    case 'contact':
                      openInNewTab(
                        'https://noyasoftware.notion.site/Noya-Contact-9a95e0895eba4f578517dfdc4d94ccdd',
                      );
                      return;
                    case 'introVideo':
                      openInNewTab(
                        'https://vimeo.com/noyasoftware/noya-welcome-video',
                      );
                      return;
                    case 'help':
                      openInNewTab(
                        'https://noyasoftware.notion.site/Noya-Help-4344e26dc3394c7195305b15b050e616',
                      );
                      return;
                    case 'reportIssue':
                      openInNewTab('https://airtable.com/shrtIsWGdVjSPZSbo');
                      return;
                  }
                }}
              >
                <Button id="insert-symbol" data-private>
                  {(session.user.name || session.user.email) && (
                    <Avatar
                      size={21}
                      overflow={1}
                      fallback={getMonogram(session)}
                    />
                  )}
                  <Spacer.Horizontal size={4} />
                  <ChevronDownIcon />
                </Button>
              </DropdownMenu>
            }
          />
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

function SupportOnboardingPopover({
  show,
  dismiss,
  trigger,
}: {
  show: boolean;
  dismiss?: () => void;
  trigger: ReactNode;
}) {
  if (!show) return <>{trigger}</>;

  return (
    <Popover
      trigger={trigger}
      open={show}
      closable
      side="bottom"
      onCloseAutoFocus={(event) => {
        event.preventDefault();
      }}
      onOpenAutoFocus={(event) => {
        event.preventDefault();
      }}
      onClickClose={() => {
        dismiss?.();
      }}
    >
      <Stack.V width={300} padding={20} gap={10} alignItems="start">
        <Small fontWeight={'bold'}>Step 4: Join the Community</Small>
        <Small>
          In this menu you can find links to our Discord community, support
          email, and issue tracker.
        </Small>
        <Small>
          Join our Discord to chat with the Noya team and other people using
          Noya.
        </Small>
        <Small fontStyle="italic">
          If you get stuck, this is the quickest way to get help!
        </Small>
      </Stack.V>
    </Popover>
  );
}
