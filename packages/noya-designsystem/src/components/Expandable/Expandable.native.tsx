import React, { memo, useMemo, useCallback, useLayoutEffect } from 'react';
import { View } from 'react-native';
import styled from 'styled-components';
import Animated, {
  withSpring,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { Layout } from '../Layout';
import { Button } from '../Button';
import type { ExpandableProps, ExpandableViewProps } from './types';
import { useExpandable } from './context';

const PanelWidth = 310;

export const Expandable = memo(function (props: ExpandableProps) {
  const { position = 'left', items } = props;
  const expandable = useExpandable();
  const expandableOffset = useSharedValue(
    position === 'left' ? -PanelWidth : PanelWidth,
  );

  const activeTab = useMemo(() => {
    return expandable.activeTabs[position];
  }, [expandable.activeTabs, position]);

  const setActiveTab = useCallback(
    (tab?: string) => {
      expandable.setActiveTab(position, tab);
    },
    [expandable, position],
  );

  const onToggleTab = useCallback(
    (tab: string) => {
      if (activeTab === tab) {
        setActiveTab(undefined);
      } else {
        setActiveTab(tab);
      }
    },
    [activeTab, setActiveTab],
  );

  useLayoutEffect(() => {
    if (!!activeTab && expandableOffset.value !== 0) {
      expandableOffset.value = 0;
    } else if (!activeTab && expandableOffset.value === 0) {
      expandableOffset.value = position === 'left' ? -PanelWidth : PanelWidth;
    }
  }, [expandableOffset, position, activeTab]);

  const expandableStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(expandableOffset.value, {
          damping: 20,
          stiffness: 200,
        }),
      },
    ],
  }));

  const tabContent = useMemo(() => {
    const activeItem = items.find((item) => item.name === activeTab);

    if (!activeItem) {
      return null;
    }

    return <ExpandableContent>{activeItem.content}</ExpandableContent>;
  }, [items, activeTab]);

  const buttons = useMemo(() => {
    return items.map((item, idx) => (
      <React.Fragment key={item.name}>
        <Button
          onClick={() => onToggleTab(item.name)}
          active={activeTab === item.name}
        >
          <Layout.Icon name={item.icon} size={16} />
        </Button>
        {idx !== items.length - 1 && <Layout.Stack size="medium" />}
      </React.Fragment>
    ));
  }, [items, activeTab, onToggleTab]);

  return (
    <ExpandableView position={position} style={expandableStyle}>
      <ExpandableContentWrapper>{tabContent}</ExpandableContentWrapper>
      <Layout.Queue size="medium" />
      <View>
        <ButtonList>{buttons}</ButtonList>
      </View>
    </ExpandableView>
  );
});

const ExpandableView = styled(Animated.View)<ExpandableViewProps>((p) => {
  const common = {
    zIndex: 100,
    top: 0,
    bottom: 0,
    padding: 10,
  };

  if (p.position === 'left') {
    return {
      position: 'absolute',
      flexDirection: 'row',
      ...common,
      left: 0,
    };
  }

  return {
    position: 'absolute',
    flexDirection: 'row-reverse',
    ...common,
    right: 0,
  };
});

const ExpandableContentWrapper = styled(View)((_p) => ({
  width: PanelWidth,
}));

const ButtonList = styled(View)((p) => ({
  borderRadius: 8,
  padding: p.theme.sizes.spacing.small,
  backgroundColor: p.theme.colors.sidebar.background,
}));

const ExpandableContent = styled(View)((p) => ({
  flex: 1,
  width: PanelWidth,
  borderRadius: 8,
  padding: p.theme.sizes.spacing.small,
  backgroundColor: p.theme.colors.sidebar.background,
}));
