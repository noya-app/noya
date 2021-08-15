import { useApplicationState, useSelector } from 'noya-app-state-context';
import { Divider, withSeparatorElements } from 'noya-designsystem';
import {
  getMultiNumberValue,
  getMultiValue,
  isLine,
  Layers,
  Selectors,
  SetNumberMode,
} from 'noya-state';
import { Fragment, memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import DimensionsInspector from '../components/inspector/DimensionsInspector';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';
import LineInspector from '../components/inspector/LineInspector';
import { useShallowArray } from 'noya-react-utils';
import AlignmentInspector from './AlignmentInspector';
import ArtboardSizeList from './ArtboardSizeList';
import BorderInspector from './BorderInspector';
import ColorControlsInspector from './ColorControlsInspector';
import ControlPointCoordinatesInspector from './ControlPointCoordinatesInspector';
import ExportInspector from './ExportInspector';
import FillInspector from './FillInspector';
import LayerThemeInspector from './LinkedStyleInspector';
import ThemeTextInspector from './LinkedTextStyleInspector';
import OpacityInspector from './OpacityInspector';
import PointControlsInspector from './PointControlsInspector';
import PointCoordinatesInspector from './PointCoordinatesInspector';
import RadiusInspector from './RadiusInspector';
import ShadowInspector from './ShadowInspector';
import SymbolInstanceInspector from './SymbolInstanceInspector';
import SymbolMasterInspector from './SymbolMasterInspector';
import TextStyleInspector from './TextStyleInspector';

const PointControlsContainer = styled.div({
  padding: '0 10px',
});

export default memo(function Inspector() {
  const [state, dispatch] = useApplicationState();

  const selectedLayers = useShallowArray(
    useSelector(Selectors.getSelectedLayers),
  );
  const hasContextSettingsLayers =
    Selectors.getSelectedLayersWithContextSettings(state).length > 0;
  const hasFixedRadiusLayers =
    Selectors.getSelectedLayersWithFixedRadius(state).length > 0;

  const handleSetRotation = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch('setLayerRotation', value, mode);
    },
    [dispatch],
  );

  const handleSetX = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch('setLayerX', value, mode);
    },
    [dispatch],
  );

  const handleSetY = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch('setLayerY', value, mode);
    },
    [dispatch],
  );

  const handleSetWidth = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch('setLayerWidth', value, mode);
    },
    [dispatch],
  );

  const handleSetHeight = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch('setLayerHeight', value, mode);
    },
    [dispatch],
  );

  const handleSetIsFlippedHorizontal = useCallback(
    (value: boolean) => dispatch('setIsFlippedHorizontal', value),
    [dispatch],
  );
  const handleSetIsFlippedVertical = useCallback(
    (value: boolean) => dispatch('setIsFlippedVertical', value),
    [dispatch],
  );

  const isFlippedVertical =
    getMultiValue(selectedLayers.map((layer) => layer.isFlippedVertical)) ??
    false;
  const isFlippedHorizontal =
    getMultiValue(selectedLayers.map((layer) => layer.isFlippedHorizontal)) ??
    false;

  const isEditingPath = Selectors.getIsEditingPath(state.interactionState.type);

  const isEditingControlPoint = isEditingPath && state.selectedControlPoint;

  const elements = useMemo(() => {
    const dimensionsInspectorProps = {
      x: getMultiNumberValue(selectedLayers.map((layer) => layer.frame.x)),
      y: getMultiNumberValue(selectedLayers.map((layer) => layer.frame.y)),
      width: getMultiNumberValue(
        selectedLayers.map((layer) => layer.frame.width),
      ),
      height: getMultiNumberValue(
        selectedLayers.map((layer) => layer.frame.height),
      ),
      rotation: getMultiNumberValue(
        selectedLayers.map(Selectors.getLayerRotation),
      ),
    };

    const onlyBitmapLayers = selectedLayers.every((l) =>
      Layers.isBitmapLayer(l),
    );
    const hasTextLayer = selectedLayers.some((l) => Layers.isTextLayer(l));
    const hasLineLayer = selectedLayers.every(
      (l) => Layers.isPointsLayer(l) && isLine(l.points),
    );
    const hasAllTextLayer = selectedLayers.every((l) => Layers.isTextLayer(l));
    const hasSymbolMaster = selectedLayers.some((l) =>
      Layers.isSymbolMaster(l),
    );
    const hasSymbolInstance = selectedLayers.some((l) =>
      Layers.isSymbolInstance(l),
    );
    const hasOneSymbolMaster = selectedLayers.length === 1 && hasSymbolMaster;
    const hasOneSymbolInstance =
      selectedLayers.length === 1 && hasSymbolInstance;

    if (selectedLayers.length === 0) return null;

    const views = [
      <Fragment key="layout">
        <AlignmentInspector />
        {isEditingPath ? (
          <PointControlsContainer>
            {isEditingControlPoint ? (
              <ControlPointCoordinatesInspector />
            ) : (
              <PointCoordinatesInspector />
            )}
          </PointControlsContainer>
        ) : hasLineLayer ? (
          <LineInspector
            {...dimensionsInspectorProps}
            isFlippedHorizontal={isFlippedHorizontal}
            isFlippedVertical={isFlippedVertical}
            onSetWidth={handleSetWidth}
            onSetIsFlippedHorizontal={handleSetIsFlippedHorizontal}
            onSetIsFlippedVertical={handleSetIsFlippedVertical}
          />
        ) : (
          <DimensionsInspector
            {...dimensionsInspectorProps}
            isFlippedHorizontal={isFlippedHorizontal}
            isFlippedVertical={isFlippedVertical}
            onSetRotation={handleSetRotation}
            onSetX={handleSetX}
            onSetY={handleSetY}
            onSetWidth={handleSetWidth}
            onSetHeight={handleSetHeight}
            onSetIsFlippedHorizontal={handleSetIsFlippedHorizontal}
            onSetIsFlippedVertical={handleSetIsFlippedVertical}
          />
        )}
        <InspectorPrimitives.VerticalSeparator />
      </Fragment>,
      hasFixedRadiusLayers && !isEditingPath && <RadiusInspector />,
      isEditingPath && <PointControlsInspector />,
      hasContextSettingsLayers && <OpacityInspector />,
      !hasTextLayer && !hasSymbolMaster && !hasSymbolInstance && (
        <LayerThemeInspector />
      ),
      hasAllTextLayer && <ThemeTextInspector />,
      hasTextLayer && <TextStyleInspector />,
      hasOneSymbolMaster && <SymbolMasterInspector />,
      hasOneSymbolInstance && <SymbolInstanceInspector />,
      selectedLayers.every(Layers.hasInspectableFill) && (
        <FillInspector title="Fills" allowMoreThanOne />
      ),
      selectedLayers.every(Layers.hasInspectableBorder) && <BorderInspector />,
      selectedLayers.every(Layers.hasInspectableShadow) && <ShadowInspector />,
      onlyBitmapLayers && <ColorControlsInspector />,
      selectedLayers.length === 1 && <ExportInspector />,
    ].filter((element): element is JSX.Element => !!element);

    return withSeparatorElements(views, <Divider />);
  }, [
    selectedLayers,
    isEditingPath,
    isEditingControlPoint,
    isFlippedHorizontal,
    isFlippedVertical,
    handleSetRotation,
    handleSetX,
    handleSetY,
    handleSetWidth,
    handleSetHeight,
    handleSetIsFlippedHorizontal,
    handleSetIsFlippedVertical,
    hasFixedRadiusLayers,
    hasContextSettingsLayers,
  ]);

  if (
    state.interactionState.type === 'insert' &&
    state.interactionState.layerType === 'artboard'
  ) {
    return <ArtboardSizeList />;
  }

  return <>{elements}</>;
});
