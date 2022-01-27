import React, { useState, useMemo } from 'react';
import styled from 'styled-components/native';

import { useApplicationState, useDispatch } from 'noya-app-state-context';
import { DrawableLayerType, InteractionType } from 'noya-state';

import DebugModal from './DebugModal';
import Button from '../components/Button';
import Layout from '../components/Layout';

type InteractionStateProjection =
  | {
      type: 'insert';
      layerType: DrawableLayerType;
    }
  | { type: Exclude<InteractionType, 'insert'> };

interface ToolbarProps {}

const Toolbar: React.FC<ToolbarProps> = (props) => {
  const [state] = useApplicationState();
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();

  const layerType =
    state.interactionState.type === 'insert'
      ? state.interactionState.layerType
      : undefined;

  const projection = useMemo(
    (): InteractionStateProjection =>
      state.interactionState.type === 'insert'
        ? { type: 'insert', layerType: layerType! }
        : { type: state.interactionState.type },
    [state.interactionState.type, layerType],
  );

  const isInsertingLayerType =
    projection.type === 'insert' ? projection.layerType : undefined;

  const isInsertRectangle = isInsertingLayerType === 'rectangle';

  const onAddRect = () => {
    if (isInsertRectangle) {
      dispatch('interaction', ['reset']);
    } else {
      dispatch('interaction', ['insert', 'rectangle']);
    }
  };

  const onOpenModal = () => {
    setShowModal(true);
  };

  return (
    <>
      <ToolbarView>
        <Button label="Add Rect" onPress={onAddRect} />
        <Layout.Queue size="medium" />
        <Button label="Open Debug Modal" onPress={onOpenModal} />
      </ToolbarView>
      <DebugModal showModal={showModal} setShowModal={setShowModal} />
    </>
  );
};

export default Toolbar;

const ToolbarView = styled.View((p) => ({
  width: '100%',
  padding: p.theme.sizes.spacing.medium,
  backgroundColor: p.theme.colors.sidebar.background,
  flexDirection: 'row',
}));
