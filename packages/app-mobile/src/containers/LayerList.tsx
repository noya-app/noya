import React, { memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import styled from 'styled-components';
import { visit } from 'tree-visit';

import { useApplicationState, useSelector } from 'noya-app-state-context';
import { useDeepMemo, useShallowArray } from 'noya-react-utils';
import { Layers, PageLayer, Selectors } from 'noya-state';
import { Layout } from 'noya-designsystem';
import Sketch from 'noya-file-format';

interface LayerListProps {}

type LayerType = PageLayer['_class'];

type LayerListItem = {
  type: LayerType | 'line';
  id: string;
  name: string;
  depth: number;
  expanded: boolean;
  selected: boolean;
  visible: boolean;
  hasClippingMask: boolean;
  shouldBreakMaskChain: boolean;
  isWithinMaskChain: boolean;
  isLocked: boolean;
};

function flattenLayerList(
  page: Sketch.Page,
  selectedLayerIds: string[],
): LayerListItem[] {
  const flattened: LayerListItem[] = [];

  visit<PageLayer | Sketch.Page>(page, {
    getChildren: (layer) => {
      if (layer.layerListExpandedType === Sketch.LayerListExpanded.Collapsed) {
        return [];
      }

      return Layers.getChildren(layer).slice().reverse();
    },
    onEnter(layer, indexPath) {
      if (Layers.isPageLayer(layer)) {
        return;
      }

      const currentIndex = indexPath[indexPath.length - 1];

      const parent = Layers.accessReversed(
        page,
        indexPath.slice(0, -1),
      ) as Layers.ParentLayer;

      flattened.push({
        type:
          Layers.isShapePath(layer) && Selectors.isLine(layer.points)
            ? 'line'
            : layer._class,
        id: layer.do_objectID,
        name: layer.name,
        depth: indexPath.length - 1,
        expanded:
          layer.layerListExpandedType !== Sketch.LayerListExpanded.Collapsed,
        selected: selectedLayerIds.includes(layer.do_objectID),
        visible: layer.isVisible,
        hasClippingMask: layer.hasClippingMask ?? false,
        shouldBreakMaskChain: layer.shouldBreakMaskChain,
        isWithinMaskChain: Layers.isWithinMaskChain(parent, currentIndex),
        isLocked: layer.isLocked,
      });
    },
  });

  return flattened;
}

function typeToIcon(item: LayerListItem) {
  const { type } = item;

  return {
    artboard: 'frame',
    group: 'sketch-logo',
    oval: 'circle',
    line: 'slash',
    polygon: 'sketch-logo',
    rectangle: 'square',
    shapePath: 'share-1',
    star: 'sketch-logo',
    triangle: 'sketch-logo',
    shapeGroup: 'sketch-logo',
    text: 'text',
    symbolMaster: 'sketch-logo',
    symbolInstance: 'sketch-logo',
    slice: 'sketch-logo',
    MSImmutableHotspotLayer: 'sketch-logo',
    bitmap: 'image',
  }[type];
}

const LayerList: React.FC<LayerListProps> = (props) => {
  const [state, dispatch] = useApplicationState();
  const page = useSelector(Selectors.getCurrentPage);
  const selectedLayerIds = useShallowArray(state.selectedLayerIds);
  const items = useDeepMemo(flattenLayerList(page, selectedLayerIds));

  const renderItem = (item: LayerListItem) => {
    const handlePress = () => {
      dispatch('interaction', ['reset']);
      dispatch('selectLayer', item.id, 'replace');
    };
    return (
      <ItemView
        key={item.id}
        depth={item.depth}
        selected={item.selected}
        onPress={handlePress}
      >
        <ItemIcon name={typeToIcon(item)} size={16} />
        <ItemName>{item.name}</ItemName>
      </ItemView>
    );
  };

  return (
    <Container>
      <HeaderView>
        <Icon name="layers" size={16} />
        <Title>Layer list</Title>
      </HeaderView>
      <StyledScrollView>{items.map(renderItem)}</StyledScrollView>
    </Container>
  );
};

export default memo(LayerList);

const Container = styled(View)((p) => ({}));

const HeaderView = styled(View)((p) => ({
  flexDirection: 'row',
  alignItems: 'center',
  borderBottomWidth: 1,
  borderColor: p.theme.colors.text,
  paddingBottom: p.theme.sizes.spacing.small,
}));

const Title = styled(Text)((p) => ({
  color: p.theme.colors.text,
  fontSize: 16,
}));

const Icon = styled(Layout.Icon)((p) => ({
  color: p.theme.colors.text,
  marginRight: p.theme.sizes.spacing.small,
}));

const StyledScrollView = styled(ScrollView)((p) => ({
  paddingTop: p.theme.sizes.spacing.small,
}));

const ItemView = styled(TouchableOpacity)<{ depth: number; selected: boolean }>(
  (p) => ({
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: p.theme.sizes.spacing.micro,
    marginBottom: p.theme.sizes.spacing.small,
    paddingLeft: (16 + p.theme.sizes.spacing.small) * p.depth + 10,
    backgroundColor: p.selected ? p.theme.colors.primaryDark : 'transparent',
    borderRadius: 4,
  }),
);

const ItemName = styled(Text)((p) => ({
  color: p.theme.colors.text,
  fontSize: 16,
}));

const ItemIcon = styled(Layout.Icon)((p) => ({
  color: p.theme.colors.text,
  marginRight: p.theme.sizes.spacing.small,
}));
