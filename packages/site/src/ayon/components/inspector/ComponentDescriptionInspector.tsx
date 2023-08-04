import { useGeneratedComponentDescriptions, useNoyaClient } from 'noya-api';
import { ActivityIndicator, IconButton } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { InspectorPrimitives } from 'noya-inspector';
import React, { memo, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useAyonState } from '../../state/ayonState';
import { CustomLayerData } from '../../types';

const DescriptionTextArea = styled.textarea(({ theme }) => ({
  ...theme.textStyles.small,
  color: theme.colors.text,
  background: theme.colors.inputBackground,
  width: '0px', // Reset intrinsic width
  flex: '1 1 0px',
  padding: '4px 6px',
  border: 'none',
  outline: 'none',
  height: 100,
  borderRadius: '4px',
  '&:focus': {
    boxShadow: `0 0 0 2px ${theme.colors.primary}`,
  },
}));

type Props = {
  selectedLayer: Sketch.CustomLayer<CustomLayerData>;
};

export const ComponentDescriptionInspector = memo(
  function ComponentDescriptionInspector({ selectedLayer }: Props) {
    const [, dispatch] = useAyonState();
    const client = useNoyaClient();
    const generatedDescription = useGeneratedComponentDescriptions(
      selectedLayer.name ?? '',
    );

    useEffect(() => {
      if (selectedLayer.data.description !== undefined || !selectedLayer.name) {
        return;
      }

      client.generate.componentDescription({ name: selectedLayer.name });
    }, [client, dispatch, selectedLayer.data.description, selectedLayer.name]);

    useEffect(() => {
      if (
        selectedLayer.data.description === undefined &&
        generatedDescription.description !== undefined &&
        generatedDescription.loading
      ) {
        dispatch('setLayerDescription', generatedDescription.description);
      }
    }, [
      dispatch,
      generatedDescription,
      generatedDescription.description,
      generatedDescription.loading,
      selectedLayer.data.description,
    ]);

    const handleShuffle = useCallback(() => {
      dispatch('setLayerDescription', undefined);
      client.generate.resetComponentDescription(selectedLayer.name);
    }, [client, dispatch, selectedLayer.name]);

    return (
      <InspectorPrimitives.LabeledRow
        label="Description"
        right={
          generatedDescription.loading ? (
            <ActivityIndicator size={13} />
          ) : (
            <IconButton
              iconName="ShuffleIcon"
              onClick={handleShuffle}
              size={13}
            />
          )
        }
      >
        <DescriptionTextArea
          value={selectedLayer.data.description || ''}
          onChange={(event) => {
            dispatch('setLayerDescription', event.target.value);
          }}
        />
      </InspectorPrimitives.LabeledRow>
    );
  },
);
