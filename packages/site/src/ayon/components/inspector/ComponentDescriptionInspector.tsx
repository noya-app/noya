import { useGeneratedComponentDescription, useNoyaClient } from 'noya-api';
import { ActivityIndicator, Button, Spacer } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { InspectorPrimitives } from 'noya-inspector';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { PRIMITIVE_TAG_MAP } from '../../../dseditor/primitiveElements';
import { useAyonDispatch } from '../../state/ayonState';
import { CustomLayerData } from '../../types';
import { useManagedLayout } from '../GeneratedLayoutContext';

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

    const handleSetDescription = useCallback(
      (description: string) => {
        // If we're actively generating layers, set the layout to a placeholder box.
        // The user must manually shuffle to generate a new layout.
        if (!selectedLayer.data.node) {
          const node = PRIMITIVE_TAG_MAP.box.initialValue!();

          dispatch('batch', [
            ['setLayerDescription', selectedLayer.do_objectID, description],
            [
              'setLayerNode',
              selectedLayer.do_objectID,
              node,
              { name: '', description: '' },
            ],
          ]);

          return;
        }

        dispatch('setLayerDescription', selectedLayer.do_objectID, description);
      },
      [dispatch, selectedLayer.data.node, selectedLayer.do_objectID],
    );

    const value =
      (generatedDescription.loading && generatedDescription.description
        ? generatedDescription.description
        : selectedLayer.data.description) ?? '';
    const textareaRef = useAutoResize(value);

    const handleGenerateLayouts = useCallback(() => {
      dispatch('setLayerNode', selectedLayer.do_objectID, undefined, 'unset');
      client.generate.resetComponentLayouts(
        selectedLayer.name,
        selectedLayer.data.description ?? '',
      );
    }, [
      client.generate,
      dispatch,
      selectedLayer.data.description,
      selectedLayer.do_objectID,
      selectedLayer.name,
    ]);

    const generatedLayout = useManagedLayout(
      selectedLayer.name,
      selectedLayer.data.description ?? '',
    );

    // If there's no node _and_ we're generating layouts
    const isGeneratingLayouts =
      !selectedLayer.data.node &&
      generatedLayout.some((layout) => layout.loading);

    const highlightRegenerationButton =
      !isGeneratingLayouts &&
      selectedLayer.data.node &&
      selectedLayer.data.description &&
      (selectedLayer.data.layoutGenerationSource?.name !== selectedLayer.name ||
        selectedLayer.data.layoutGenerationSource?.description !==
          selectedLayer.data.description);

    return (
      <>
        <InspectorPrimitives.LabeledRow
          label="Description"
          right={
            generatedDescription.loading && <ActivityIndicator size={13} />
          }
        >
          <DescriptionTextArea
            ref={textareaRef}
            value={value}
            readOnly={generatedDescription.loading}
            onChange={(event) => handleSetDescription(event.target.value)}
          />
        </InspectorPrimitives.LabeledRow>
        <Button
          disabled={
            isGeneratingLayouts || selectedLayer.data.description === undefined
          }
          variant={highlightRegenerationButton ? 'secondary' : undefined}
          onClick={handleGenerateLayouts}
        >
          Generate Layout
          <Spacer.Horizontal inline size={8} />
          {isGeneratingLayouts ? <ActivityIndicator size={13} /> : '✨'}
        </Button>
      </>
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
