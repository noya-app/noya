import React, { useMemo } from 'react';
import styled from 'styled-components/native';

import { useApplicationState, useDispatch } from 'noya-app-state-context';
import { DrawableLayerType } from 'noya-state';

import Button from '../components/Button';
import Layout from '../components/Layout';

interface ToolbarProps {}

const Toolbar: React.FC<ToolbarProps> = (props) => {
  const [state] = useApplicationState();
  const dispatch = useDispatch();

  const interType = state.interactionState.type;
  const layerType = useMemo(() => {
    if (state.interactionState.type === 'insert') {
      return state.interactionState.layerType;
    }

    if (state.interactionState.type === 'drawing') {
      return state.interactionState.shapeType;
    }

    return undefined;
  }, [state.interactionState]);

  const onToDo = () => {};

  const isButtonActive = (shape: DrawableLayerType) =>
    layerType === shape && (interType === 'drawing' || interType === 'insert');

  const onReset = () => {
    if (interType !== 'none') {
      dispatch('interaction', ['reset']);
    }
  };

  const onAddShape = (shape: DrawableLayerType) => () => {
    dispatch('interaction', ['insert', shape]);
  };

  const buttons = [
    {
      icon: 'cursor-arrow',
      onPress: onReset,
      active: interType === 'none' || interType === 'marquee',
    },
    {
      icon: 'frame',
      onPress: onAddShape('artboard'),
      active: isButtonActive('artboard'),
    },
    {
      icon: 'square',
      onPress: onAddShape('rectangle'),
      active: isButtonActive('rectangle'),
    },
    {
      icon: 'circle',
      onPress: onAddShape('oval'),
      active: isButtonActive('oval'),
    },
    {
      icon: 'slash',
      onPress: onAddShape('line'),
      active: isButtonActive('line'),
    },
    { icon: 'share-1', onPress: onToDo },
    { icon: 'text', onPress: onToDo },
    { icon: 'group', onPress: onToDo },
  ];

  return (
    <>
      <ToolbarView>
        <ToolbarContainer>
          {buttons.map(({ icon, onPress, active }, idx) => (
            <React.Fragment key={idx}>
              <Button icon={icon} onPress={onPress} active={active} />
              {idx !== buttons.length - 1 && <Layout.Queue size="medium" />}
            </React.Fragment>
          ))}
        </ToolbarContainer>
      </ToolbarView>
    </>
  );
};

export default Toolbar;

const ToolbarView = styled.View((p) => ({
  bottom: 10,
  zIndex: 100,
  width: '100%',
  position: 'absolute',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ToolbarContainer = styled.View((p) => ({
  flexDirection: 'row',
  paddingVertical: p.theme.sizes.spacing.small,
  paddingHorizontal: p.theme.sizes.spacing.medium,
  backgroundColor: p.theme.colors.sidebar.background,
  borderRadius: 10,
}));
