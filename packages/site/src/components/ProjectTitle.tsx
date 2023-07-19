import { NoyaAPI } from 'noya-api';
import { Button, Spacer, useDesignSystemTheme } from 'noya-designsystem';
import { ChevronDownIcon } from 'noya-icons';
import React, { ReactNode, forwardRef } from 'react';
import { ProjectTypeIcon } from './ProjectTypeIcon';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  projectType?: NoyaAPI.FileData['type'];
}

export const ProjectTitle = forwardRef(function ProjectTitle(
  { children, projectType, onClick }: Props,
  ref: React.Ref<HTMLButtonElement>,
) {
  const theme = useDesignSystemTheme();

  return (
    <Button onClick={onClick} ref={ref}>
      <ProjectTypeIcon type={projectType} color={theme.colors.textMuted} />
      <Spacer.Horizontal size={6} />
      {children}
      <Spacer.Horizontal size={8} />
      <ChevronDownIcon />
    </Button>
  );
});
