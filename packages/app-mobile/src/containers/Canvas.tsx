import React from 'react';
import styled from 'styled-components/native';
import { GestureResponderEvent } from 'react-native';

import { Canvas as SkiaCanvas } from '@shopify/react-native-skia';

import {
  useApplicationState,
  useWorkspaceState,
  StateProvider,
} from 'noya-app-state-context';
import { Point, createRect } from 'noya-geometry';
import { Selectors, getCurrentPage } from 'noya-state';
import { Components } from 'noya-react-canvaskit';
import {
  SketchFileRenderer,
  useCanvasKit,
  CanvasKitProvider,
  ComponentsProvider,
  ImageCacheProvider,
} from 'noya-renderer';
import { fontManager } from '../hooks/useAppState';

interface GesturePoint {
  locationX: number;
  locationY: number;
}

function getPoint(event: GesturePoint): Point {
  return { x: Math.round(event.locationX), y: Math.round(event.locationY) };
}

const Canvas: React.FC<{}> = () => {
  const [state, dispatch] = useApplicationState();
  const workspaceState = useWorkspaceState();
  const canvasKit = useCanvasKit();

  const insets = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };

  const onStartShouldSetResponder = (e: GestureResponderEvent) => true;

  const onResponderGrant = (e: GestureResponderEvent) => {
    const rawPoint = getPoint(e.nativeEvent);

    switch (state.interactionState.type) {
      case 'insert': {
        dispatch('interaction', [
          'startDrawing',
          state.interactionState.layerType,
          rawPoint,
        ]);

        break;
      }
      case 'none': {
        const layer = Selectors.getLayerAtPoint(
          canvasKit,
          fontManager,
          state,
          insets,
          rawPoint,
          {
            groups: 'groupAndChildren', // event[modKey] ? 'childrenOnly' : 'groupOnly',
            artboards: 'emptyOrContainedArtboardOrChildren',
            includeLockedLayers: false,
          },
        );

        const selectedGradientStopIndex = Selectors.getGradientStopIndexAtPoint(
          state,
          rawPoint,
        );

        if (state.selectedGradient && selectedGradientStopIndex !== -1) {
          dispatch('setSelectedGradientStopIndex', selectedGradientStopIndex);

          dispatch('interaction', ['maybeMoveGradientStop', rawPoint]);
        } else if (
          state.selectedGradient &&
          Selectors.isPointerOnGradientLine(state, rawPoint)
        ) {
          dispatch('addStopToGradient', rawPoint);
        } else if (
          state.selectedGradient &&
          Selectors.isPointerOnGradientEllipseEditor(state, rawPoint)
        ) {
          dispatch('interaction', ['maybeMoveGradientEllipseLength', rawPoint]);
        } else if (layer) {
          if (state.selectedLayerIds.includes(layer.do_objectID)) {
            // if (event.shiftKey && state.selectedLayerIds.length !== 1) {
            // dispatch('selectLayer', layer.do_objectID, 'difference');
            // }
          } else {
            dispatch(
              'selectLayer',
              layer.do_objectID,
              'replace',
              // event.shiftKey ? 'intersection' : 'replace',
            );
          }

          dispatch('interaction', ['maybeMove', rawPoint]);
        } else {
          dispatch('selectLayer', undefined);
          dispatch('interaction', ['startMarquee', rawPoint]);
        }

        break;
      }
    }
  };

  const onResponderMove = (e: GestureResponderEvent) => {
    const rawPoint = getPoint(e.nativeEvent);

    switch (state.interactionState.type) {
      case 'insert': {
        dispatch('interaction', [
          state.interactionState.type,
          state.interactionState.layerType,
          rawPoint,
        ]);
        break;
      }

      case 'drawing': {
        dispatch('interaction', ['updateDrawing', rawPoint]);
        break;
      }
      case 'marquee': {
        dispatch('interaction', ['updateMarquee', rawPoint]);

        const { origin, current } = state.interactionState;

        const layers = Selectors.getLayersInRect(
          state,
          getCurrentPage(state),
          insets,
          createRect(origin, current),
          {
            groups: 'groupOnly', // event[modKey] ? 'childrenOnly' : 'groupOnly',
            artboards: 'emptyOrContainedArtboardOrChildren',
            includeLockedLayers: false,
          },
        );

        dispatch(
          'selectLayer',
          layers.map((layer) => layer.do_objectID),
        );

        break;
      }
    }
  };

  const onResponderRelease = (e: GestureResponderEvent) => {
    const rawPoint = getPoint(e.nativeEvent);

    switch (state.interactionState.type) {
      case 'drawing': {
        dispatch('interaction', ['updateDrawing', rawPoint]);
        dispatch('addDrawnLayer');

        break;
      }
      case 'marquee': {
        dispatch('interaction', ['reset']);

        const { origin, current } = state.interactionState;

        const layers = Selectors.getLayersInRect(
          state,
          getCurrentPage(state),
          insets,
          createRect(origin, current),
          {
            groups: 'groupOnly', // event[modKey] ? 'childrenOnly' : 'groupOnly',
            artboards: 'emptyOrContainedArtboardOrChildren',
            includeLockedLayers: false,
          },
        );

        dispatch(
          'selectLayer',
          layers.map((layer) => layer.do_objectID),
        );

        // containerRef.current?.releasePointerCapture(event.pointerId);

        break;
      }
    }
  };

  return (
    <CanvasWrapper
      onStartShouldSetResponder={onStartShouldSetResponder}
      onResponderMove={onResponderMove}
      onResponderGrant={onResponderGrant}
      onResponderRelease={onResponderRelease}
    >
      <InteractionView>
        <Interaction>{state.interactionState.type}</Interaction>
      </InteractionView>
      <StyledCanvas>
        <ImageCacheProvider>
          <CanvasKitProvider canvasKit={canvasKit}>
            <StateProvider state={workspaceState}>
              <ComponentsProvider value={Components}>
                <SketchFileRenderer />
              </ComponentsProvider>
            </StateProvider>
          </CanvasKitProvider>
        </ImageCacheProvider>
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

const InteractionView = styled.View((p) => ({
  zIndex: 1,
  position: 'absolute',
  backgroundColor: p.theme.colors.sidebar.background,
  padding: p.theme.sizes.spacing.small,
}));

const Interaction = styled.Text((p) => ({
  color: '#fff',
  fontSize: 16,
  textTransform: 'uppercase',
}));
