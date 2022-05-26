import React, { memo, useMemo, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { useApplicationState } from 'noya-app-state-context';
import { Base64, parseFilename } from 'noya-utils';
import { useExpandable } from 'noya-designsystem';
import { DrawableLayerType } from 'noya-state';
import { useCanvasKit } from 'noya-renderer';
import { useToolbarKeyCommands } from './utils';
import ButtonList from './ButtonList';

const ToolsMenu: React.FC = () => {
  const [state, dispatch] = useApplicationState();
  const CanvasKit = useCanvasKit();
  const expandable = useExpandable();

  const interactionType = useMemo(
    () => state.interactionState.type,
    [state.interactionState.type],
  );

  const isCreatingPath = useMemo(
    () => interactionType === 'drawingShapePath',
    [interactionType],
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
    (shape: DrawableLayerType) => {
      return (
        layerType === shape &&
        (interactionType === 'drawing' || interactionType === 'insert')
      );
    },
    [layerType, interactionType],
  );

  const onAddShape = useCallback(
    (shape: DrawableLayerType) => () => {
      if (shape === 'artboard') {
        expandable.setActiveTab('right', 'inspector');
      }

      dispatch('interaction', ['insert', shape]);
    },
    [dispatch, expandable],
  );

  const onAddPath = useCallback(() => {
    dispatch('interaction', ['drawingShapePath']);
  }, [dispatch]);

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

  const toolItems = useMemo(
    () => [
      {
        icon: 'frame',
        shortcut: {
          cmd: 'a',
          title: 'Artboard',
          menuName: 'Insert',
        },
        onPress: onAddShape('artboard'),
        active: isButtonActive('artboard'),
      },
      {
        icon: 'image',
        shortcut: {
          cmd: 'i',
          title: 'Image',
          menuName: 'Insert',
        },
        onPress: onAddImage,
      },
      {
        icon: 'square',
        shortcut: {
          cmd: 'r',
          title: 'Rectangle',
          menuName: 'Insert',
        },
        onPress: onAddShape('rectangle'),
        active: isButtonActive('rectangle'),
      },
      {
        icon: 'circle',
        shortcut: { cmd: 'o', title: 'Oval', menuName: 'Insert' },
        onPress: onAddShape('oval'),
        active: isButtonActive('oval'),
      },
      {
        icon: 'slash',
        shortcut: { cmd: 'l', title: 'Line', menuName: 'Insert' },
        onPress: onAddShape('line'),
        active: isButtonActive('line'),
      },
      {
        icon: 'line',
        onPress: onAddPath,
        active: isCreatingPath,
        shortcut: { cmd: 'v', title: 'Path', menuName: 'Insert' },
      },
    ],
    [onAddPath, isCreatingPath, onAddShape, isButtonActive, onAddImage],
  );

  useToolbarKeyCommands(toolItems);

  return <ButtonList items={toolItems} />;
};

export default memo(ToolsMenu);
