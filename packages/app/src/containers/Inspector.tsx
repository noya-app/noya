import { Divider, Spacer } from 'noya-designsystem';
import { Selectors, SetNumberMode } from 'noya-state';
import { getLayerRotation } from 'noya-state/src/selectors';
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
import TextStyleInspector from '../components/inspector/TextStyleInspector';

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

  const elements = useMemo(() => {
    const dimensionsInspectorProps =
      selectedLayers.length === 1
        ? {
            ...selectedLayers[0].frame,
            rotation: getLayerRotation(selectedLayers[0]),
          }
        : {
            x: undefined,
            y: undefined,
            width: undefined,
            height: undefined,
            rotation: undefined,
          };

    const Dimentions = (
      <Fragment key="layout">
        <AlignmentInspector />
        <DimensionsInspector
          {...dimensionsInspectorProps}
          onSetRotation={handleSetRotation}
        />
        <Spacer.Vertical size={10} />
      </Fragment>
    );

    // Only show the text inspector if layer is a text
    if (selectedLayers.length === 1 && selectedLayers[0]._class === 'text') {
      return (
        <>
          {Dimentions}
          <TextStyleInspector />
        </>
      );
    }

    const views = [
      Dimentions,
      hasFixedRadiusLayers && <RadiusInspector />,
      <LayerThemeInspector />,
      hasContextSettingsLayers && <OpacityInspector />,
      selectedLayers.length === 1 && <FillInspector />,
      selectedLayers.length === 1 && <BorderInspector />,
      selectedLayers.length === 1 && <ShadowInspector />,
    ].filter((element): element is JSX.Element => !!element);

    return withSeparatorElements(views, <Divider />);
  }, [
    selectedLayers,
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
