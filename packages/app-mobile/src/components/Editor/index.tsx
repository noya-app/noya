import React, { useState, useRef, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import {
  Canvas,
  SkiaView,
  useSharedValueEffect,
} from '@shopify/react-native-skia';
import * as ImagePicker from 'expo-image-picker';

import useSelectionGesture, {
  SelectionParams,
} from '../../hooks/useSelectionGesture';
import useTapGesture, { TapParams } from '../../hooks/useTapGesture';
import useUIElements from '../../hooks/useUIElements';
import {
  ToolMode,
  ElementType,
  CanvasElement,
  Rect,
  Path,
  Image,
} from '../../types';
import Toolbar from '../Toolbar';
import RectElement from '../Rect';
import ImageElement from '../Image';
import PathElement from '../Path';
import selectElements from '../../utils/selectElements';
import createRect from '../../utils/createRect';

const Editor: React.FC = () => {
  const canvasRef = useRef<SkiaView>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [toolMode, setToolMode] = useState(ToolMode.Default);

  const selectedElements = useMemo(
    () => elements.filter((e) => e.isActive),
    [elements],
  );

  const onCreateRect = (params: SelectionParams) => {
    setToolMode(ToolMode.Default);

    const newRect: Rect = createRect(params.position, params.size);
    setElements([...elements, newRect]);
  };

  const onCreateImage = async (params: SelectionParams) => {
    setToolMode(ToolMode.Default);
    const results = await ImagePicker.launchImageLibraryAsync();

    if (results.cancelled) {
      return;
    }

    const baseRect = createRect(params.position, params.size);

    const newImage: Image = {
      fit: 'cover',
      size: baseRect.size,
      source: results.uri,
      type: ElementType.Image,
      position: baseRect.position,
    };

    setElements([...elements, newImage]);
  };

  const onAddPointToPath = async (params: TapParams) => {
    const newElements = [...elements];
    const activePathIdx = newElements.findIndex(
      (e) => e.type === ElementType.Path && e.isActive,
    );

    (newElements[activePathIdx] as Path).points.push(params.position);

    setElements(newElements);
  };

  const onFinishPath = () => {
    setToolMode(ToolMode.Default);
  };

  const onClosePath = () => {
    setToolMode(ToolMode.Default);

    const newElements = [...elements];
    const activePathIdx = newElements.findIndex(
      (e) => e.type === ElementType.Path && e.isActive,
    );

    (newElements[activePathIdx] as Path).closed = true;
    setElements(newElements);
  };

  const onSelectObject = (params: TapParams | SelectionParams) => {
    const newElements = selectElements(
      elements,
      params.position,
      'size' in params ? params.size : undefined,
    );

    setElements(newElements);
  };

  const onGestureFinished = (params: TapParams | SelectionParams) => {
    if (toolMode === ToolMode.CreateRect) {
      onCreateRect(params as SelectionParams);
    }

    if (toolMode === ToolMode.CreateImage) {
      onCreateImage(params as SelectionParams);
    }

    if (toolMode === ToolMode.CreatePath) {
      onAddPointToPath(params as TapParams);
    }

    if (toolMode === ToolMode.Default) {
      onSelectObject(params);
    }
  };

  const onAddRect = () => {
    setToolMode(ToolMode.CreateRect);
  };

  const onAddImage = async () => {
    setToolMode(ToolMode.CreateImage);
  };

  const onAddPath = async () => {
    setToolMode(ToolMode.CreatePath);

    const newPath: Path = {
      type: ElementType.Path,
      points: [],
      isActive: true,
      color: 'lightblue',
    };

    setElements([...elements, newPath]);
  };

  const onClearObjects = () => {
    setElements([]);
  };

  const tapGesture = useTapGesture({ onGestureFinished });
  const selectionGesture = useSelectionGesture({ onGestureFinished });

  // @ts-expect-error
  useSharedValueEffect<any>(canvasRef, [
    ...selectionGesture.effectDeps,
    ...tapGesture.effectDeps,
  ]);

  const renderElement = (element: CanvasElement, index: number) => {
    if (element.type === ElementType.Rect) {
      return <RectElement key={index} rect={element as Rect} />;
    }

    if (element.type === ElementType.Image) {
      return <ImageElement key={index} image={element as Image} />;
    }

    if (element.type === ElementType.Path) {
      return <PathElement key={index} path={element as Path} />;
    }

    return null;
  };

  const uiElements = useUIElements({
    elements,
    toolMode,
    selectionGesture,
    tapGesture,
  });

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <Animated.Text style={styles.navbarText}>
          Tool mode: {toolMode}
          {'\n'}
        </Animated.Text>
      </View>
      <View style={styles.contentContainer}>
        <GestureHandlerRootView style={styles.container}>
          <GestureDetector
            gesture={Gesture.Simultaneous(
              selectionGesture.gesture,
              tapGesture.gesture,
            )}
          >
            <View testID="Canvas" style={{ flex: 1 }}>
              <Canvas style={styles.canvas} innerRef={canvasRef}>
                {elements.map(renderElement)}
                {uiElements.map(renderElement)}
              </Canvas>
            </View>
          </GestureDetector>
        </GestureHandlerRootView>
        <Toolbar
          onAddRect={onAddRect}
          onAddImage={onAddImage}
          onAddPath={onAddPath}
          onClear={onClearObjects}
          toolMode={toolMode}
          selectedElements={selectedElements}
          onFinishPath={onFinishPath}
          onClosePath={onClosePath}
        />
      </View>
    </View>
  );
};

export default Editor;

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  navbar: {
    padding: 0,
    // Leave space for performance monitor :)
    paddingLeft: 250,
    height: 60,
  },
  navbarText: {
    color: '#fff',
    fontSize: 14,
  },
  canvas: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
