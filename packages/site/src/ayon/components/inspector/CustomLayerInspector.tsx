import { Stack, useDesignSystemTheme } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { InspectorPrimitives } from 'noya-inspector';
import React, { useCallback } from 'react';
import styled from 'styled-components';
import { InspectorSection } from '../../../components/InspectorSection';
import { useAyonState } from '../../state/ayonState';
import { CustomLayerData } from '../../types';
import { ComponentNameInspector } from './ComponentNameInspector';

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
  // resize: 'none',
  whiteSpace: 'pre',
  '&:focus': {
    boxShadow: `0 0 0 2px ${theme.colors.primary}`,
  },
}));

export function CustomLayerInspector({
  selectedLayer,
}: {
  selectedLayer: Sketch.CustomLayer<CustomLayerData>;
}) {
  const [, dispatch] = useAyonState();
  const theme = useDesignSystemTheme();

  const handleChangeName = useCallback(
    (value: string) => {
      dispatch('setLayerName', selectedLayer.do_objectID, value);
    },
    [dispatch, selectedLayer.do_objectID],
  );

  return (
    <Stack.V
      gap="1px"
      position="relative"
      background={theme.colors.canvas.background}
    >
      <InspectorSection title={'Component'} titleTextStyle="heading3">
        <InspectorPrimitives.LabeledRow label="Name">
          <ComponentNameInspector
            name={selectedLayer.name}
            frame={selectedLayer.frame}
            onChangeName={handleChangeName}
          />
        </InspectorPrimitives.LabeledRow>
        <InspectorPrimitives.LabeledRow label="Description">
          <DescriptionTextArea
            value={selectedLayer.data.description || ''}
            onChange={(event) => {
              dispatch('setLayerDescription', event.target.value);
            }}
          />
        </InspectorPrimitives.LabeledRow>
      </InspectorSection>
    </Stack.V>
  );
}
