import React, { useCallback, useMemo, memo } from 'react';
import styled from 'styled-components';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { View, Text } from 'react-native';

import {
  useDispatch,
  useSelector,
  useApplicationState,
} from 'noya-app-state-context';
import { Layout, Button, useExpandable } from 'noya-designsystem';
import { DrawableLayerType, Selectors } from 'noya-state';
import { Base64, parseFilename } from 'noya-utils';
import { useCanvasKit } from 'noya-renderer';

interface Item {
  icon?: string;
  label?: string;
  onPress: () => void;
  active?: boolean;
}

const Toolbar: React.FC = () => {
  const [state] = useApplicationState();
  const CanvasKit = useCanvasKit();
  const dispatch = useDispatch();
  const expandable = useExpandable();
  const meta = useSelector(Selectors.getCurrentPageMetadata);

  const interType = useMemo(
    () => state.interactionState.type,
    [state.interactionState.type],
  );

  const layerType = useMemo(() => {
    if (state.interactionState.type === 'insert') {
      return state.interactionState.layerType;
    }

    if (state.interactionState.type === 'drawing') {
      return state.interactionState.shapeType;
    }

    return undefined;
  }, [state.interactionState]);

  const isButtonActive = useCallback(
    (shape: DrawableLayerType) =>
      layerType === shape &&
      (interType === 'drawing' || interType === 'insert'),
    [layerType, interType],
  );

  const onReset = useCallback(() => {
    if (interType !== 'none') {
      dispatch('interaction', ['reset']);
    }
  }, [dispatch, interType]);

  const onAddShape = useCallback(
    (shape: DrawableLayerType) => () => {
      if (shape === 'artboard') {
        expandable.setActiveTab('right', 'inspector');
      }

      dispatch('interaction', ['insert', shape]);
    },
    [dispatch, expandable],
  );

  const processImage = useCallback(
    (base64Image: string, uri: string) => {
      const data = Base64.decode(base64Image);
      const decodedImage = CanvasKit.MakeImageFromEncoded(data);
      const { name, extension } = parseFilename(uri);

      if (!decodedImage) {
        return;
      }

      const size = {
        width: decodedImage.width(),
        height: decodedImage.height(),
      };

      dispatch(
        'importImage',
        [{ data, size, extension, name }],
        { x: 0, y: 0 },
        'nearestArtboard',
      );
    },
    [CanvasKit, dispatch],
  );

  const onAddImage = useCallback(async () => {
    const results = await ImagePicker.launchImageLibraryAsync();

    if (results.cancelled) {
      return;
    }

    if (results.base64) {
      processImage(results.base64, results.uri);
      return;
    }

    const fileString = await FileSystem.readAsStringAsync(results.uri, {
      encoding: 'base64',
    });

    processImage(fileString, results.uri);
  }, [processImage]);

  const onZoom = useCallback(
    (type: 'zoomIn' | 'zoomOut') => {
      switch (type) {
        case 'zoomIn': {
          dispatch('setZoom*', 2, 'multiply');
          break;
        }
        case 'zoomOut': {
          dispatch('setZoom*', 0.5, 'multiply');
          break;
        }
      }
    },
    [dispatch],
  );

  const onResetZoom = useCallback(() => {
    dispatch('setZoom*', 1, 'replace');
  }, [dispatch]);

  const drawItems: Item[] = useMemo(
    () => [
      {
        icon: 'cursor-arrow',
        onPress: onReset,
        active: interType === 'none' || interType === 'marquee',
      },
      {
        icon: 'frame',
        onPress: onAddShape('artboard'),
        active: isButtonActive('artboard'),
      },
      {
        icon: 'image',
        onPress: onAddImage,
      },
      {
        icon: 'square',
        onPress: onAddShape('rectangle'),
        active: isButtonActive('rectangle'),
      },
      {
        icon: 'circle',
        onPress: onAddShape('oval'),
        active: isButtonActive('oval'),
      },
      {
        icon: 'slash',
        onPress: onAddShape('line'),
        active: isButtonActive('line'),
      },
      {
        icon: 'zoom-in',
        onPress: () => onZoom('zoomIn'),
      },
      {
        label: `${Math.floor(meta.zoomValue * 100)}%`,
        onPress: () => onResetZoom(),
      },
      {
        icon: 'zoom-out',
        onPress: () => onZoom('zoomOut'),
      },
    ],
    [
      meta.zoomValue,
      interType,
      onReset,
      onAddImage,
      onAddShape,
      onZoom,
      onResetZoom,
      isButtonActive,
    ],
  );

  return (
    <ToolbarView pointerEvents="box-none">
      <ToolbarContainer>
        {drawItems.map(
          ({ icon, label, onPress, active }: Item, idx: number) => (
            <React.Fragment key={idx}>
              <Button onClick={onPress} active={active}>
                {!!icon && <Layout.Icon name={icon} size={16} />}
                {!!label && <Label>{label}</Label>}
              </Button>
              {idx !== drawItems.length - 1 && <Layout.Queue size="medium" />}
            </React.Fragment>
          ),
        )}
      </ToolbarContainer>
    </ToolbarView>
  );
};

export default memo(Toolbar);

const ToolbarView = styled(View)((_p) => ({
  top: 10,
  zIndex: 100,
  width: '100%',
  position: 'absolute',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ToolbarContainer = styled(View)((p) => ({
  flexDirection: 'row',
  borderRadius: 8,
  padding: p.theme.sizes.spacing.small,
  backgroundColor: p.theme.colors.sidebar.background,
}));

const Label = styled(Text)(({ theme }) => ({
  color: theme.colors.icon,
  fontSize: 12,
  minWidth: 30,
  textAlign: 'center',
}));
