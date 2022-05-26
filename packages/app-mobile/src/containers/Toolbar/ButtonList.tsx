import React, { memo, useCallback } from 'react';
import styled from 'styled-components';
import { Text } from 'react-native';

import { Layout, Button } from 'noya-designsystem';
import type { ToolbarItem } from './types';

interface ButtonListProps {
  items: ToolbarItem[];
}

const ButtonList: React.FC<ButtonListProps> = ({ items }) => {
  const renderItem = useCallback((item: ToolbarItem, index: number) => {
    const { onPress, active, disabled, icon, label } = item;

    return (
      <React.Fragment key={`item-${index}`}>
        <Button onClick={onPress} active={active} disabled={disabled}>
          {!!icon && <Layout.Icon name={icon} size={16} />}
          {!!label && <Label>{label}</Label>}
        </Button>
        <Layout.Queue size="small" />
      </React.Fragment>
    );
  }, []);

  return <>{items.map(renderItem)}</>;
};

export default memo(ButtonList);

const Label = styled(Text)(({ theme }) => ({
  color: theme.colors.icon,
  fontSize: 12,
  minWidth: 30,
  textAlign: 'center',
}));
