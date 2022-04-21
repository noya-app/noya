import React, { memo } from 'react';

import { FlatDispatcher, useApplicationState } from 'noya-app-state-context';
import { IconButton } from 'noya-designsystem';
import Container from './Container';

interface AlignmentInspectorProps {
  dispatch: FlatDispatcher;
}

const AlignmentInspector = memo(function AlignmentInspector({
  dispatch,
}: AlignmentInspectorProps) {
  return (
    <Container>
      <IconButton
        id="SpaceEvenlyHorizontallyIcon"
        name="space-evenly-horizontally"
        tooltip="Distribute horizontally"
        onClick={() => dispatch('distributeLayers', 'horizontal')}
      />
      <IconButton
        id="SpaceEvenlyVerticallyIcon"
        name="space-evenly-vertically"
        tooltip="Distribute vertically"
        onClick={() => dispatch('distributeLayers', 'vertical')}
      />
      <IconButton
        id="AlignLeftIcon"
        name="align-left"
        tooltip="Align left edges"
        onClick={() => dispatch('alignLayers', 'left')}
      />
      <IconButton
        id="AlignCenterHorizontallyIcon"
        name="align-center-horizontally"
        tooltip="Align horizontal centers"
        onClick={() => dispatch('alignLayers', 'centerHorizontal')}
      />
      <IconButton
        id="AlignRightIcon"
        name="align-right"
        tooltip="Align right edges"
        onClick={() => dispatch('alignLayers', 'right')}
      />
      <IconButton
        id="AlignTopIcon"
        name="align-top"
        tooltip="Align top edges"
        onClick={() => dispatch('alignLayers', 'top')}
      />
      <IconButton
        id="AlignCenterVerticallyIcon"
        name="align-center-vertically"
        tooltip="Align vertical centers"
        onClick={() => dispatch('alignLayers', 'centerVertical')}
      />
      <IconButton
        id="AlignBottomIcon"
        name="align-bottom"
        tooltip="Align bottom edges"
        onClick={() => dispatch('alignLayers', 'bottom')}
      />
    </Container>
  );
});

export default memo(() => {
  const [, dispatch] = useApplicationState();

  return <AlignmentInspector dispatch={dispatch} />;
});
