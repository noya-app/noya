import { IconButton } from '@noya-app/noya-designsystem';
import { useApplicationState } from 'noya-app-state-context';
import React, { memo } from 'react';
import styled from 'styled-components';

const AlignmentInspectorContainer = styled.div(({ theme }) => ({
  display: 'flex',
  minHeight: '35px',
  alignItems: 'center',
  justifyContent: 'space-evenly',
}));

interface AlignmentInspectorProps {}

function AlignmentInspector(props: AlignmentInspectorProps) {
  const [, dispatch] = useApplicationState();
  return (
    <AlignmentInspectorContainer>
      <IconButton
        id="SpaceEvenlyHorizontallyIcon"
        iconName="SpaceEvenlyHorizontallyIcon"
        tooltip="Distribute horizontally"
        onClick={() => dispatch('distributeLayers', 'horizontal')}
      />
      <IconButton
        id="SpaceEvenlyVerticallyIcon"
        iconName="SpaceEvenlyVerticallyIcon"
        tooltip="Distribute vertically"
        onClick={() => dispatch('distributeLayers', 'vertical')}
      />
      <IconButton
        id="AlignLeftIcon"
        iconName="AlignLeftIcon"
        tooltip="Align left edges"
        onClick={() => dispatch('alignLayers', 'left')}
      />
      <IconButton
        id="AlignCenterHorizontallyIcon"
        iconName="AlignCenterHorizontallyIcon"
        tooltip="Align horizontal centers"
        onClick={() => dispatch('alignLayers', 'centerHorizontal')}
      />
      <IconButton
        id="AlignRightIcon"
        iconName="AlignRightIcon"
        tooltip="Align right edges"
        onClick={() => dispatch('alignLayers', 'right')}
      />
      <IconButton
        id="AlignTopIcon"
        iconName="AlignTopIcon"
        tooltip="Align top edges"
        onClick={() => dispatch('alignLayers', 'top')}
      />
      <IconButton
        id="AlignCenterVerticallyIcon"
        iconName="AlignCenterVerticallyIcon"
        tooltip="Align vertical centers"
        onClick={() => dispatch('alignLayers', 'centerVertical')}
      />
      <IconButton
        id="AlignBottomIcon"
        iconName="AlignBottomIcon"
        tooltip="Align bottom edges"
        onClick={() => dispatch('alignLayers', 'bottom')}
      />
    </AlignmentInspectorContainer>
  );
}

export default memo(AlignmentInspector);
