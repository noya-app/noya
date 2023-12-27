import Link from 'next/link';
import { useRouter } from 'next/router';
import { Stack } from 'noya-designsystem';
import React, { ComponentProps, ForwardedRef, forwardRef } from 'react';
import styled from 'styled-components';

export const StyledAnchor = styled.a<{ active?: boolean }>(
  ({ theme, active }) => ({
    ...theme.textStyles.small,
    color: active ? theme.colors.text : theme.colors.textMuted,
    backgroundColor: active ? theme.colors.inputBackground : 'rgba(0,0,0,0.05)',
    padding: '4px 8px',
    borderRadius: 4,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    '&:hover': {
      opacity: 0.8,
    },
    '&:active': {
      opacity: 0.9,
    },
  }),
);

export const StyledLink = forwardRef(function StyledLink(
  props: ComponentProps<typeof StyledAnchor> & { activePrefix?: string },
  forwardedRef: ForwardedRef<HTMLAnchorElement>,
) {
  const router = useRouter();

  const currentPath = `${router.basePath}${router.asPath}`;
  const active =
    currentPath === props.href ||
    currentPath === props.href + '/' ||
    (props.activePrefix &&
      currentPath.startsWith(`${router.basePath}${props.activePrefix}`));

  return <StyledAnchor ref={forwardedRef} active={active} {...props} />;
});

export function NavigationLinks() {
  return (
    <Stack.H
      gap={40}
      breakpoints={{
        600: {
          gap: 20,
        },
      }}
    >
      <Link href={'/'} passHref>
        <StyledLink>Projects</StyledLink>
      </Link>
      {/* <Link href={'/docs'} passHref>
        <StyledLink activePrefix="/docs">Docs</StyledLink>
      </Link>
      <StyledLink href={'/templates'}>Templates</StyledLink> */}
    </Stack.H>
  );
}
