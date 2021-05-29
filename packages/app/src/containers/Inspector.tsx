import { Divider, Spacer } from 'noya-designsystem';
import { Selectors, SetNumberMode } from 'noya-state';
import * as Layers from 'noya-state/src/layers';
import { Fragment, memo, useCallback, useMemo } from 'react';
import DimensionsInspector from '../components/inspector/DimensionsInspector';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import withSeparatorElements from '../utils/withSeparatorElements';
import AlignmentInspector from './AlignmentInspector';
import ArtboardSizeList from './ArtboardSizeList';
import BorderInspector from './BorderInspector';
import FillInspector from './FillInspector';
import LayerThemeInspector from './LayerThemeInspector';
import OpacityInspector from './OpacityInspector';
import RadiusInspector from './RadiusInspector';
import ShadowInspector from './ShadowInspector';
import TextStyleInspector from './TextStyleInspector';
import ThemeTextInspector from './ThemeTextInspector';
import SymbolMasterInspector from './SymbolMasterInspector';
import SymbolInstanceInspector from './SymbolInstanceInspector';

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

    const views = [
      <Fragment key="layout">
        <AlignmentInspector />
        <DimensionsInspector
          {...dimensionsInspectorProps}
          onSetRotation={handleSetRotation}
          onSetX={handleSetX}
          onSetY={handleSetY}
          onSetWidth={handleSetWidth}
          onSetHeight={handleSetHeight}
        />
        <Spacer.Vertical size={10} />
      </Fragment>,
      hasFixedRadiusLayers && <RadiusInspector />,
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
      !hasSymbolInstance && selectedLayers.length === 1 && <BorderInspector />,
      selectedLayers.length === 1 && <ShadowInspector />,
    ].filter((element): element is JSX.Element => !!element);

    return withSeparatorElements(views, <Divider />);
  }, [
    selectedLayers,
    handleSetX,
    handleSetY,
    handleSetWidth,
    handleSetHeight,
    handleSetRotation,
    hasFixedRadiusLayers,
    hasContextSettingsLayers,
  ]);

  if (state.interactionState.type === 'insertArtboard') {
    return <ArtboardSizeList />;
  }

  if (selectedLayers.length === 0) return null;

  return <>{elements}</>;
});
