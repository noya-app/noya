import { useGeneratedComponentDescription, useNoyaClient } from 'noya-api';
import { ActivityIndicator, IconButton } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { InspectorPrimitives } from 'noya-inspector';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAyonDispatch } from '../../state/ayonState';
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
  // readonly
  '&:read-only': {
    color: theme.colors.textDisabled,
  },
  resize: 'none',
}));

type Props = {
  selectedLayer: Sketch.CustomLayer<CustomLayerData>;
};

export const ComponentDescriptionInspector = memo(
  function ComponentDescriptionInspector({ selectedLayer }: Props) {
    const dispatch = useAyonDispatch();
    const client = useNoyaClient();
    const generatedDescription = useGeneratedComponentDescription(
      selectedLayer.name ?? '',
    );

    const handleShuffle = useCallback(() => {
      dispatch('setLayerDescription', selectedLayer.do_objectID, undefined);
      client.generate.resetComponentDescription(selectedLayer.name);
    }, [client, dispatch, selectedLayer.do_objectID, selectedLayer.name]);

    const value =
      (generatedDescription.loading && generatedDescription.description
        ? generatedDescription.description
        : selectedLayer.data.description) ?? '';
    const textareaRef = useAutoResize(value);

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
              tooltip="Generate new description"
            />
          )
        }
      >
        <DescriptionTextArea
          ref={textareaRef}
          value={value}
          readOnly={generatedDescription.loading}
          onChange={(event) => {
            dispatch(
              'setLayerDescription',
              selectedLayer.do_objectID,
              event.target.value,
            );
          }}
        />
      </InspectorPrimitives.LabeledRow>
    );
  },
);

const useAutoResize = (value: string) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = 'auto'; // Reset the height
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [value]);

  return textareaRef;
};
