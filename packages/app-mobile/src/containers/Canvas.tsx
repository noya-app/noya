import React, { useContext } from 'react';
import styled from 'styled-components/native';
import { GestureResponderEvent } from 'react-native';

import {
  Rect as SkiaRect,
  Canvas as SkiaCanvas,
} from '@shopify/react-native-skia';

import {
  useApplicationState,
  useWorkspaceState,
  StateProvider,
} from 'noya-app-state-context';
import {
  SketchFileDebugContext,
  SketchFileRenderer,
  useCanvasKit,
  CanvasKitProvider,
} from 'noya-renderer';

const Canvas: React.FC<{}> = () => {
  const [state, dispatch] = useApplicationState();
  const debugCtx = useContext(SketchFileDebugContext);
  const workspaceState = useWorkspaceState();
  const canvasKit = useCanvasKit();

  const onStartShouldSetResponder = (e: GestureResponderEvent) => true;

  const onResponderGrant = (e: GestureResponderEvent) => {
    switch (state.interactionState.type) {
      case 'insert': {
        dispatch('interaction', [
          'startDrawing',
          state.interactionState.layerType,
          {
            x: e.nativeEvent.locationX,
            y: e.nativeEvent.locationY,
          },
        ]);

        break;
      }
    }
  };

  const onResponderMove = (e: GestureResponderEvent) => {
    switch (state.interactionState.type) {
      case 'insert': {
        dispatch('interaction', [
          state.interactionState.type,
          state.interactionState.layerType,
          {
            x: e.nativeEvent.locationX,
            y: e.nativeEvent.locationY,
          },
        ]);
        break;
      }
    }
  };

  const onResponderRelease = (e: GestureResponderEvent) => {
    console.log('onResponderRelease');
  };

  return (
    <CanvasWrapper
      onStartShouldSetResponder={onStartShouldSetResponder}
      onResponderMove={onResponderMove}
      onResponderGrant={onResponderGrant}
      onResponderRelease={onResponderRelease}
    >
      <StyledCanvas>
        <CanvasKitProvider canvasKit={canvasKit}>
          <SketchFileDebugContext.Provider value={debugCtx}>
            <StateProvider state={workspaceState}>
              <SketchFileRenderer />
              {/* Control rect to see if canvas is rendering :) */}
              <SkiaRect
                x={100}
                y={100}
                width={100}
                height={100}
                color="lightblue"
              />
            </StateProvider>
          </SketchFileDebugContext.Provider>
        </CanvasKitProvider>
      </StyledCanvas>
    </CanvasWrapper>
  );
};

export default Canvas;

const CanvasWrapper = styled.View(() => ({
  flex: 1,
}));

const StyledCanvas = styled(SkiaCanvas)((p) => ({
  flex: 1,
  backgroundColor: '#fff',
}));
