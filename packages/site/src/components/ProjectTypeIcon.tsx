import { NoyaAPI } from 'noya-api';
import { DashboardIcon, MixerVerticalIcon } from 'noya-icons';
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
