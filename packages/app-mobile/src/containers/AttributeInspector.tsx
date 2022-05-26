import React, { Fragment, useCallback, memo, useMemo } from 'react';
import styled from 'styled-components';
import { View } from 'react-native';

import {
  isLine,
  Layers,
  Selectors,
  SetNumberMode,
  getMultiValue,
  getMultiNumberValue,
} from 'noya-state';
import {
  Layout,
  ScrollableView,
  withSeparatorElements,
} from 'noya-designsystem';
import {
  BlurInspector,
  FillInspector,
  LineInspector,
  ExportInspector,
  RadiusInspector,
  ShadowInspector,
  BorderInspector,
  ArtboardSizeList,
  OpacityInspector,
  AlignmentInspector,
  DimensionsInspector,
  InnerShadowInspector,
  ColorControlsInspector,
  PointControlsInspector,
  PointCoordinatesInspector,
  ControlPointCoordinatesInspector,
} from 'noya-workspace-ui';
import {
  useThrottledApplicationState,
  useThrottledSelector,
} from 'noya-app-state-context';
import { useShallowArray } from 'noya-react-utils';

interface AttributeInspectorProps {}

const HorizontalPaddingContainer = styled(View)({
  paddingLeft: 10,
  paddingRight: 10,
});

const AttributeInspector: React.FC<AttributeInspectorProps> = (props) => {
  const [state, dispatch] = useThrottledApplicationState();

  const selectedLayers = useShallowArray(
    useThrottledSelector(Selectors.getSelectedLayers),
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

  const handleSetConstrainProportions = useCallback(
    (value: boolean) => dispatch('setConstrainProportions', value),
    [dispatch],
  );

  const supportsFlipping = selectedLayers.some(
    (layer) => !Layers.isSymbolMasterOrArtboard(layer),
  );
  const isFlippedVertical = selectedLayers.some(
    (layer) => layer.isFlippedVertical,
  );
  const isFlippedHorizontal = selectedLayers.some(
    (layer) => layer.isFlippedHorizontal,
  );

  const constrainProportions =
    getMultiValue(
      selectedLayers.map((layer) => layer.frame.constrainProportions),
    ) ?? true;

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
    const hasGroup = selectedLayers.some(Layers.isGroup);
    const hasSymbolMaster = selectedLayers.some(Layers.isSymbolMaster);
    const hasSymbolInstance = selectedLayers.some(Layers.isSymbolInstance);
    const hasOneSymbolMaster = selectedLayers.length === 1 && hasSymbolMaster;
    const hasOneSymbolInstance =
      selectedLayers.length === 1 && hasSymbolInstance;

    if (selectedLayers.length === 0) return null;

    const views = [
      <Fragment key="layout">
        <AlignmentInspector />
        {isEditingPath ? (
          <HorizontalPaddingContainer>
            {isEditingControlPoint ? (
              <ControlPointCoordinatesInspector />
            ) : (
              <PointCoordinatesInspector />
            )}
          </HorizontalPaddingContainer>
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
            supportsFlipping={supportsFlipping}
            isFlippedHorizontal={isFlippedHorizontal}
            isFlippedVertical={isFlippedVertical}
            constrainProportions={constrainProportions}
            onSetRotation={handleSetRotation}
            onSetX={handleSetX}
            onSetY={handleSetY}
            onSetWidth={handleSetWidth}
            onSetHeight={handleSetHeight}
            onSetIsFlippedHorizontal={handleSetIsFlippedHorizontal}
            onSetIsFlippedVertical={handleSetIsFlippedVertical}
            onSetConstraintProportions={handleSetConstrainProportions}
          />
        )}
        <Layout.Stack size="medium" />
      </Fragment>,
      hasFixedRadiusLayers && !isEditingPath && <RadiusInspector />,
      isEditingPath && <PointControlsInspector />,
      hasContextSettingsLayers && <OpacityInspector />,
      // !hasTextLayer && !hasSymbolMaster && !hasSymbolInstance && (
      //   <LayerThemeInspector />
      // ),
      // hasAllTextLayer && <ThemeTextInspector />,
      // hasTextLayer && <TextStyleInspector />,
      // hasOneSymbolMaster && <SymbolMasterInspector />,
      // hasOneSymbolInstance && <SymbolInstanceInspector />,
      selectedLayers.every(Layers.hasInspectableFill) && (
        <FillInspector title="Fills" allowMoreThanOne />
      ),
      selectedLayers.every(Layers.hasInspectableBorder) && <BorderInspector />,
      selectedLayers.every(Layers.hasInspectableShadow) && (
        <ShadowInspector
          allowMoreThanOne={!hasGroup}
          supportsSpread={!hasGroup}
        />
      ),
      selectedLayers.every(Layers.hasInspectableInnerShadow) && (
        <InnerShadowInspector />
      ),
      selectedLayers.every(Layers.hasInspectableBlur) && <BlurInspector />,
      onlyBitmapLayers && <ColorControlsInspector />,
      selectedLayers.length === 1 && <ExportInspector />,
    ].filter((element): element is JSX.Element => !!element);

    return withSeparatorElements(
      views,
      <>
        <Layout.Stack size="medium" />
        <Layout.Divider />
        <Layout.Stack size="medium" />
      </>,
    );
  }, [
    selectedLayers,
    isEditingPath,
    isEditingControlPoint,
    isFlippedHorizontal,
    isFlippedVertical,
    handleSetWidth,
    handleSetIsFlippedHorizontal,
    handleSetIsFlippedVertical,
    supportsFlipping,
    constrainProportions,
    handleSetRotation,
    handleSetX,
    handleSetY,
    handleSetHeight,
    handleSetConstrainProportions,
    hasFixedRadiusLayers,
    hasContextSettingsLayers,
  ]);

  if (
    state.interactionState.type === 'insert' &&
    state.interactionState.layerType === 'artboard'
  ) {
    return <ArtboardSizeList />;
  }

  return <ScrollableView>{elements}</ScrollableView>;
};

export default memo(AttributeInspector);
