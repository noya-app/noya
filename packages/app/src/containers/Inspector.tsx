import { Divider, Spacer, withSeparatorElements } from 'noya-designsystem';
import { Layers, Selectors, SetNumberMode } from 'noya-state';
import { Fragment, memo, useCallback, useMemo } from 'react';
import DimensionsInspector from '../components/inspector/DimensionsInspector';
import { useApplicationState, useSelector } from 'noya-app-state-context';
import useShallowArray from '../hooks/useShallowArray';
import AlignmentInspector from './AlignmentInspector';
import ArtboardSizeList from './ArtboardSizeList';
import BorderInspector from './BorderInspector';
import ColorControlsInspector from './ColorControlsInspector';
import ExportInspector from './ExportInspector';
import FillInspector from './FillInspector';
import LayerThemeInspector from './LayerThemeInspector';
import OpacityInspector from './OpacityInspector';
import PointControlsInspector from './PointControlsInspector';
import PointCoordinatesInspector from './PointCoordinatesInspector';
import ControlPointCoordinatesInspector from './ControlPointCoordinatesInspector';
import RadiusInspector from './RadiusInspector';
import ShadowInspector from './ShadowInspector';
import SymbolInstanceInspector from './SymbolInstanceInspector';
import SymbolMasterInspector from './SymbolMasterInspector';
import TextStyleInspector from './TextStyleInspector';
import ThemeTextInspector from './ThemeTextInspector';
import getMultiValue from '../utils/getMultiValue';

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
    const dimensionsInspectorProps =
      selectedLayers.length === 1
        ? {
            ...selectedLayers[0].frame,
            rotation: Selectors.getLayerRotation(selectedLayers[0]),
          }
        : {
            x: undefined,
            y: undefined,
            width: undefined,
            height: undefined,
            rotation: undefined,
          };

    const onlyBitmapLayers = selectedLayers.every((l) =>
      Layers.isBitmapLayer(l),
    );
    const hasTextLayer = selectedLayers.some((l) => Layers.isTextLayer(l));
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
          isEditingControlPoint ? (
            <ControlPointCoordinatesInspector />
          ) : (
            <PointCoordinatesInspector />
          )
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
        <Spacer.Vertical size={10} />
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
      !hasSymbolInstance && selectedLayers.length === 1 && (
        <FillInspector title={'Fills'} allowMoreThanOne={true} />
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

  if (state.interactionState.type === 'insertArtboard') {
    return <ArtboardSizeList />;
  }

  return <>{elements}</>;
});
