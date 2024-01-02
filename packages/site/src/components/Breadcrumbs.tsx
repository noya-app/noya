import { SlashIcon } from '@noya-app/noya-icons';
import Link from 'next/link';
import { Text } from 'noya-designsystem';
import React, { forwardRef, memo } from 'react';
import styled from 'styled-components';

export const BreadcrumbText = ({ children }: React.PropsWithChildren<{}>) => (
  <Text variant="small" whiteSpace="pre" lineHeight="15px" userSelect="none">
    {children}
  </Text>
);

const BreadcrumbAnchor = styled.a(({ theme }) => ({
  ...theme.textStyles.small,
  lineHeight: '15px',
  color: theme.colors.textMuted,
  whiteSpace: 'pre',
  textDecoration: 'none',
  userSelect: 'none',
  '&:hover': {
    color: theme.colors.textSubtle,
    textDecoration: 'underline',
  },
}));

export const BreadcrumbLink = memo(
  forwardRef(function BreadcrumbLink(
    { href, children }: { href: string; children: React.ReactNode },
    ref: React.ForwardedRef<HTMLAnchorElement>,
  ) {
    return (
      <Link href={href} passHref>
        <BreadcrumbAnchor ref={ref}>{children}</BreadcrumbAnchor>
      </Link>
    );
  }),
);

export const BreadcrumbSlash = memo(function BreadcrumbSlash() {
  return (
    <SlashIcon
      opacity={0.5}
      style={{ margin: '0 2px', transform: 'scale(0.9, 1.25)' }}
    />
  );
});
