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
import { DrawableLayerType, Selectors, Layers } from 'noya-state';
import { useKeyCommands, Shortcuts } from 'noya-keymap';
import { Base64, parseFilename } from 'noya-utils';
import { useHistory } from 'noya-workspace-ui';
import { useCanvasKit } from 'noya-renderer';

interface ToolbarItem {
  icon?: string;
  label?: string;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
  shortcut?: {
    cmd: string;
    title: string;
    menuName: string;
  };
}

interface ToolbarSection {
  items: ToolbarItem[];
}

const Toolbar: React.FC = () => {
  const [state] = useApplicationState();
  const CanvasKit = useCanvasKit();
  const dispatch = useDispatch();
  const expandable = useExpandable();
  const meta = useSelector(Selectors.getCurrentPageMetadata);
  const { redoDisabled, undoDisabled } = useHistory();
  const interactionType = useMemo(
    () => state.interactionState.type,
    [state.interactionState.type],
  );

  const isEditingPath = useMemo(
    () => Selectors.getIsEditingPath(interactionType),
    [interactionType],
  );

  const isCreatingPath = useMemo(
    () => interactionType === 'drawingShapePath',
    [interactionType],
  );

  const canStartEditingPath = useMemo(
    () =>
      interactionType === 'none' &&
      Selectors.getSelectedLayers(state).filter(Layers.isPointsLayer).length >
        0,
    [state, interactionType],
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

  const onReset = useCallback(() => {
    dispatch('interaction', ['reset']);
  }, [dispatch]);

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

  const onZoom = useCallback(
    (type: 'zoomIn' | 'zoomOut') => () => {
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

  const onHistoryAction = useCallback(
    (action: 'undo' | 'redo') => () => {
      switch (action) {
        case 'undo': {
          dispatch('undo');
          break;
        }
        case 'redo': {
          dispatch('redo');
          break;
        }
      }
    },
    [dispatch],
  );

  const onEnablePenTool = useCallback(() => {
    if (isEditingPath) {
      dispatch('interaction', ['reset']);
    } else {
      dispatch('interaction', ['editPath']);
    }
  }, [isEditingPath, dispatch]);

  const onResetZoom = useCallback(() => {
    dispatch('setZoom*', 1, 'replace');
  }, [dispatch]);

  const menu: ToolbarSection[] = useMemo(
    () => [
      {
        items: [
          {
            icon: 'thick-arrow-left',
            disabled: undoDisabled,
            onPress: onHistoryAction('undo'),
            shortcut: {
              cmd: 'Mod-z',
              title: 'Undo',
              menuName: 'Edit',
            },
          },
          {
            icon: 'thick-arrow-right',
            disabled: redoDisabled,
            onPress: onHistoryAction('redo'),
            shortcut: {
              cmd: 'Mod-Shift-z',
              title: 'Redo',
              menuName: 'Edit',
            },
          },
        ],
      },
      {
        items: [
          {
            icon: 'cursor-arrow',
            onPress: onReset,
            active: interactionType === 'none' || interactionType === 'marquee',
            shortcut: {
              cmd: 'Escape',
              title: 'Reset interaction',
              menuName: 'Edit',
            },
          },
          {
            icon: 'point-mode',
            disabled: !(isEditingPath || canStartEditingPath),
            active: isEditingPath,
            onPress: onEnablePenTool,
            shortcut: {
              cmd: 'p',
              title: 'Edit path',
              menuName: 'Edit',
            },
          },
        ],
      },
      {
        items: [
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
      },
      {
        items: [
          {
            icon: 'zoom-in',
            shortcut: { cmd: 'Mod-+', title: 'Zoom in', menuName: 'Edit' },
            onPress: onZoom('zoomIn'),
          },
          {
            shortcut: { cmd: 'Mod-0', title: 'Reset zoom', menuName: 'Edit' },
            label: `${Math.floor(meta.zoomValue * 100)}%`,
            onPress: onResetZoom,
          },
          {
            shortcut: { cmd: 'Mod--', title: 'Zoom out', menuName: 'Edit' },
            icon: 'zoom-out',
            onPress: onZoom('zoomOut'),
          },
        ],
      },
    ],
    [
      onZoom,
      onReset,
      onAddPath,
      onAddImage,
      onAddShape,
      onResetZoom,
      redoDisabled,
      undoDisabled,
      isEditingPath,
      isCreatingPath,
      isButtonActive,
      meta.zoomValue,
      onHistoryAction,
      onEnablePenTool,
      interactionType,
      canStartEditingPath,
    ],
  );

  const renderItem = useCallback((item: ToolbarItem, index: number) => {
    const { onPress, active, disabled, icon, label } = item;

    return (
      <React.Fragment key={`item-${index}`}>
        <Button onClick={onPress} active={active} disabled={disabled}>
          {!!icon && <Layout.Icon name={icon} size={16} />}
          {!!label && <Label>{label}</Label>}
        </Button>
        <Layout.Queue size="small" />
      </React.Fragment>
    );
  }, []);

  const renderSection = useCallback(
    (section: ToolbarSection, index: number) => {
      return (
        <React.Fragment key={`section-${index}`}>
          {section.items.map(renderItem)}
          {index < menu.length - 1 && <Layout.Queue size="large" />}
        </React.Fragment>
      );
    },
    [renderItem, menu],
  );

  const keyCommands: Shortcuts = useMemo(() => {
    return menu
      .map((section) => section.items)
      .flat()
      .reduce((reducer, item) => {
        if (!item.shortcut) {
          return reducer;
        }

        return {
          ...reducer,
          [item.shortcut.cmd]: {
            title: item.shortcut.title,
            menuName: item.shortcut.menuName,
            callback: item.onPress,
          },
        };
      }, {});
  }, [menu]);

  useKeyCommands(keyCommands);

  return (
    <ToolbarView pointerEvents="box-none">
      <ToolbarContainer>{menu.map(renderSection)}</ToolbarContainer>
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
