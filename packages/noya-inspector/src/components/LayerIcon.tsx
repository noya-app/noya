import {
  CircleIcon,
  Component1Icon,
  ComponentInstanceIcon,
  CopyIcon,
  FrameIcon,
  GroupIcon,
  ImageIcon,
  LineIcon,
  Share1Icon,
  SquareIcon,
  TextIcon,
} from '@noya-app/noya-icons';
import { PageLayer } from 'noya-state';
import React, { memo } from 'react';
import { useTheme } from 'styled-components';

type LayerType = PageLayer['_class'];

export const LayerIcon = memo(function LayerIcon({
  type,
  selected,
  variant,
}: {
  type: LayerType | 'line';
  selected?: boolean;
  variant?: 'primary' | 'currentColor';
}) {
  const colors = useTheme().colors;

  const color =
    variant === 'currentColor'
      ? 'currentColor'
      : variant && !selected
      ? colors[variant]
      : selected
      ? colors.iconSelected
      : colors.icon;

  switch (type) {
    case 'rectangle':
      return <SquareIcon color={color} />;
    case 'oval':
      return <CircleIcon color={color} />;
    case 'text':
      return <TextIcon color={color} />;
    case 'artboard':
      return <FrameIcon color={color} />;
    case 'symbolMaster':
      return <Component1Icon color={color} />;
    case 'symbolInstance':
      return <ComponentInstanceIcon color={color} />;
    case 'group':
      return <CopyIcon color={color} />;
    case 'slice':
      return <GroupIcon color={color} />;
    case 'bitmap':
      return <ImageIcon color={color} />;
    case 'shapeGroup':
      return <CopyIcon color={color} />;
    case 'shapePath':
      return <Share1Icon color={color} />;
    case 'line':
      return <LineIcon color={color} />;
    default:
      return null;
  }
});
