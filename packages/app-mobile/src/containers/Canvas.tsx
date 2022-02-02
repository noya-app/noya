import React, { useRef } from 'react';
import { GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import styled, { ThemeProvider, useTheme } from 'styled-components';
import { Canvas as SkiaCanvas } from '@shopify/react-native-skia';

import {
  useApplicationState,
  useWorkspaceState,
  StateProvider,
  useWorkspace,
} from 'noya-app-state-context';
import { Point, createRect } from 'noya-geometry';
import { Selectors, getCurrentPage } from 'noya-state';
import { Components } from 'noya-react-canvaskit';
import {
  SketchFileRenderer,
  useCanvasKit,
  useFontManager,
  CanvasKitProvider,
  ComponentsProvider,
  ImageCacheProvider,
  FontManagerProvider,
} from 'noya-renderer';

function getPoint(event: GestureResponderEvent): Point {
  const { nativeEvent } = event;

  if (nativeEvent.touches.length > 1) {
    const firstTouch = nativeEvent.touches[0];

    return {
      x: firstTouch.locationX,
      y: firstTouch.locationY,
    };
  }

  return {
    x: Math.round(nativeEvent.locationX),
    y: Math.round(nativeEvent.locationY),
  };
}

const Canvas: React.FC<{}> = () => {
  const [state, dispatch] = useApplicationState();
  const { setCanvasSize } = useWorkspace();
  const workspaceState = useWorkspaceState();
  const fontManager = useFontManager();
  const canvasKit = useCanvasKit();
  const theme = useTheme();
  const touchRef = useRef<Point>({ x: 0, y: 0 });

  const insets = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };

  const onStartShouldSetResponder = (e: GestureResponderEvent) => true;

  const onResponderGrant = (e: GestureResponderEvent) => {
    const numOfTouches = e.nativeEvent.touches.length;
    const rawPoint = getPoint(e);

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
        if (numOfTouches > 1) {
          touchRef.current = rawPoint;
          return;
        }

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
    const rawPoint = getPoint(e);
    const numOfTouches = e.nativeEvent.touches.length;

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
      case 'none': {
        if (numOfTouches > 1) {
          const deltaX = touchRef.current.x - rawPoint.x;
          const deltaY = touchRef.current.y - rawPoint.y;

          dispatch('pan*', { x: deltaX, y: deltaY });
          touchRef.current = rawPoint;
        }

        break;
      }
    }
  };

  const onResponderRelease = (e: GestureResponderEvent) => {
    const rawPoint = getPoint(e);

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
      case 'none': {
        touchRef.current = { x: 0, y: 0 };
        break;
      }
    }
  };

  const onCanvasLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setCanvasSize({ width, height }, insets);
  };

  return (
    <CanvasWrapper
      onStartShouldSetResponder={onStartShouldSetResponder}
      onResponderMove={onResponderMove}
      onResponderGrant={onResponderGrant}
      onResponderRelease={onResponderRelease}
      onLayout={onCanvasLayout}
    >
      <InteractionView>
        <Interaction>{state.interactionState.type}</Interaction>
      </InteractionView>
      <StyledCanvas>
        <ThemeProvider theme={theme}>
          <ImageCacheProvider>
            <CanvasKitProvider canvasKit={canvasKit}>
              <FontManagerProvider>
                <StateProvider state={workspaceState}>
                  <ComponentsProvider value={Components}>
                    <SketchFileRenderer />
                  </ComponentsProvider>
                </StateProvider>
              </FontManagerProvider>
            </CanvasKitProvider>
          </ImageCacheProvider>
        </ThemeProvider>
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
