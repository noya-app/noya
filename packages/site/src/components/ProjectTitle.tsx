import { Button, Spacer, useDesignSystemTheme } from 'noya-designsystem';
import { ChevronDownIcon, DashboardIcon } from 'noya-icons';
import React, { forwardRef, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
}

export const ProjectTitle = forwardRef(function ProjectTitle(
  { children, onClick }: Props,
  ref: React.Ref<HTMLButtonElement>,
) {
  const theme = useDesignSystemTheme();

  return (
    <Button onClick={onClick} ref={ref}>
      <DashboardIcon color={theme.colors.textMuted} />
      <Spacer.Horizontal size={6} />
      {children}
      <Spacer.Horizontal size={8} />
      <ChevronDownIcon />
    </Button>
  );
});
