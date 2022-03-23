import React, { memo, useMemo, useCallback, useEffect } from 'react';
import { View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import styled from 'styled-components';
import Animated, {
  withSpring,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { Layout } from '../Layout';
import { Button } from '../Button';
import type { ExpandableProps, Tab, ExpandableViewProps } from './types';
import { useExpandable } from './context';

const PanelWidth = 310;

const ExpandableProvider = (props: ExpandableProps) => {
  const { position = 'left', children } = props;
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

  const tabs = useMemo(() => {
    const tabs: Tab[] = [];

    if (children instanceof Array) {
      children.forEach((child) => {
        tabs.push({
          id: child.props.id,
          icon: child.props.icon,
        });
      });
    } else {
      tabs.push({
        id: children.props.id,
        icon: children.props.icon,
      });
    }

    return tabs;
  }, [children]);

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

  useEffect(() => {
    if (
      expandable.activeTabs[position] !== undefined &&
      expandableOffset.value !== 0
    ) {
      // Panel is active
      expandableOffset.value = 0;
    } else if (
      expandable.activeTabs[position] === undefined &&
      expandableOffset.value === 0
    ) {
      expandableOffset.value = position === 'left' ? -PanelWidth : PanelWidth;
    }
  }, [expandableOffset, position, expandable]);

  const activeChild = useMemo(() => {
    if (children instanceof Array) {
      return children.find((child) => child.props.id === activeTab);
    }

    return children.props.id === activeTab ? children : null;
  }, [children, activeTab]);

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

  return (
    <ExpandableView position={position} style={expandableStyle}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ExpandableContentWrapper>
          {!!activeChild && (
            <ExpandableContent>{activeChild}</ExpandableContent>
          )}
        </ExpandableContentWrapper>
      </TouchableWithoutFeedback>
      <Layout.Queue size="medium" />
      <View>
        <ButtonList>
          {tabs.map((tab, idx) => (
            <React.Fragment key={tab.id}>
              <Button
                onClick={() => onToggleTab(tab.id)}
                active={activeTab === tab.id}
              >
                <Layout.Icon name={tab.icon} size={16} />
              </Button>
              {idx !== tabs.length - 1 && <Layout.Stack size="medium" />}
            </React.Fragment>
          ))}
        </ButtonList>
      </View>
    </ExpandableView>
  );
};

export const Expandable = memo(ExpandableProvider);

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
