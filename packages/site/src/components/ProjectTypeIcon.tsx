import { DashboardIcon, MixerVerticalIcon } from '@noya-app/noya-icons';
import { NoyaAPI } from 'noya-api';
import React from 'react';

interface Props {
  type?: NoyaAPI.FileData['type'];
}

export const ProjectTypeIcon = function ProjectTypeIcon({
  type,
}: Props & React.ComponentProps<typeof DashboardIcon>) {
  const Icon = type === 'io.noya.ds' ? MixerVerticalIcon : DashboardIcon;

  return <Icon />;
};
