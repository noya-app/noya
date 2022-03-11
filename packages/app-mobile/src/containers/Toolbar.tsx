import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { decode as decodeBase64 } from 'base-64';
import { View } from 'react-native';

import { useApplicationState, useDispatch } from 'noya-app-state-context';
import { DrawableLayerType } from 'noya-state';
import { Layout, Button } from 'noya-designsystem';
import { useCanvasKit } from 'noya-renderer';
import { delimitedPath } from 'noya-utils';
import { decode } from 'noya-sketch-file';

interface ToolbarProps {}

interface Item {
  icon: string;
  onPress: () => void;
  active?: boolean;
}

function base64ToArrayBuffer(base64: string) {
  var binary_string = decodeBase64(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

function parseFilename(uri: string) {
  const basename = delimitedPath.basename(uri);
  const [name, extension] = basename.split('.');

  return {
    name,
    extension: extension as 'png' | 'jpg' | 'webp' | 'pdf',
  };
}

const Toolbar: React.FC<ToolbarProps> = (props) => {
  const [state] = useApplicationState();
  const CanvasKit = useCanvasKit();
  const dispatch = useDispatch();

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
      dispatch('interaction', ['insert', shape]);
    },
    [dispatch],
  );

  const processImage = useCallback(
    (base64Image: string, uri: string) => {
      const data = base64ToArrayBuffer(base64Image);
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

  const onOpenFile = useCallback(async () => {
    try {
      const results = await DocumentPicker.getDocumentAsync({
        multiple: false,
        type: '*/*',
      });

      if (results.type !== 'success') {
        return;
      }

      if (results.file) {
        const data = await results.file.arrayBuffer();
        const sketch = await decode(data);

        dispatch('setFile', sketch);
        return;
      }
      const fileString = await FileSystem.readAsStringAsync(results.uri, {
        encoding: 'base64',
      });
      const data = base64ToArrayBuffer(fileString);
      const sketch = await decode(data);
      dispatch('setFile', sketch);
    } catch (e) {
      console.warn(e);
    }
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
        icon: 'zoom-out',
        onPress: () => onZoom('zoomOut'),
      },
      // { icon: 'share-1', onPress: onToDo },
      // { icon: 'text', onPress: onToDo },
    ],
    [interType, onReset, onAddImage, onAddShape, onZoom, isButtonActive],
  );

  const utilItems: Item[] = useMemo(
    () => [{ icon: 'file', onPress: onOpenFile }],
    [onOpenFile],
  );

  return (
    <ToolbarView pointerEvents="box-none">
      <ToolbarContainer>
        {drawItems.map(({ icon, onPress, active }: Item, idx: number) => (
          <React.Fragment key={idx}>
            <Button onClick={onPress} active={active}>
              <Layout.Icon name={icon} size={16} />
            </Button>
            {idx !== drawItems.length - 1 && <Layout.Queue size="medium" />}
          </React.Fragment>
        ))}
        <Spacer />
        {utilItems.map(({ icon, onPress, active }: Item, idx: number) => (
          <React.Fragment key={idx}>
            <Button onClick={onPress} active={active}>
              <Layout.Icon name={icon} size={16} />
            </Button>
            {idx !== utilItems.length - 1 && <Layout.Queue size="medium" />}
          </React.Fragment>
        ))}
      </ToolbarContainer>
    </ToolbarView>
  );
};

export default React.memo(Toolbar);

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

const Spacer = styled(View)((p) => ({
  borderLeftWidth: 1,
  borderColor: p.theme.colors.text,
  marginLeft: p.theme.sizes.spacing.medium,
  paddingLeft: p.theme.sizes.spacing.medium,
}));
