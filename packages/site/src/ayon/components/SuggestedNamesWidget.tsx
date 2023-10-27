import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import { Button, Stack } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { Selectors } from 'noya-state';
import * as React from 'react';
import { Stacking } from '../stacking';
import { CustomLayerData } from '../types';
import { WidgetContainer } from './WidgetContainer';

export const SuggestedNamesWidget = function SuggestedNamesWidget({
  layer,
}: {
  layer: Sketch.CustomLayer<CustomLayerData>;
}) {
  const { canvasInsets } = useWorkspace();
  const [state, dispatch] = useApplicationState();
  const { isContextMenuOpen } = useWorkspace();
  const page = Selectors.getCurrentPage(state);
  const rect = Selectors.getBoundingRect(page, [layer.do_objectID])!;
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
  const isPrimarySelected = state.selectedLayerIds[0] === layer.do_objectID;

  // const isEditing =
  //   state.interactionState.type === 'editingBlock' &&
  //   state.interactionState.layerId === layer.do_objectID;

  const showWidgetUI =
    isPrimarySelected &&
    !isContextMenuOpen &&
    state.interactionState.type !== 'drawing' &&
    state.interactionState.type !== 'marquee' &&
    state.selectedLayerIds.length === 1;

  const StackComponent = layer.frame.height > 150 ? Stack.V : Stack.H;

  return (
    <WidgetContainer
      frame={rect}
      transform={canvasTransform}
      zIndex={showWidgetUI ? Stacking.level.interactive : undefined}
      // label={<Small opacity={0.5}>{'Test'}</Small>}
    >
      <StackComponent
        background="rgba(0,0,0,0.07)"
        position="absolute"
        inset="1px 1px 1px 1px"
        alignItems="center"
        justifyContent="center"
        gap="8px"
      >
        {(layer.data.suggestedNames ?? []).map((name) => (
          <Stack.H pointerEvents="all" key={name}>
            <Button
              variant="white"
              size="large"
              onClick={() => {
                dispatch('setLayerName', layer.do_objectID, name);
              }}
            >
              {name}
            </Button>
          </Stack.H>
        ))}
      </StackComponent>
    </WidgetContainer>
  );
};
