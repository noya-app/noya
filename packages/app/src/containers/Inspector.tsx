import { Selectors } from 'ayano-state';
import { Fragment, memo, useMemo } from 'react';
import Divider from '../components/Divider';
import AlignmentInspector from '../components/inspector/AlignmentInspector';
import DimensionsInspector, {
  Props as DimensionsInspectorProps,
} from '../components/inspector/DimensionsInspector';
import * as Spacer from '../components/Spacer';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import withSeparatorElements from '../utils/withSeparatorElements';
import ArtboardSizeList from './ArtboardSizeList';
import BorderInspector from './BorderInspector';
import FillInspector from './FillInspector';
import ShadowInspector from './ShadowInspector';
import OpacityInspector from './OpacityInspector';
import RadiusInspector from './RadiusInspector';

interface Props {}

export default memo(function Inspector(props: Props) {
  const [state] = useApplicationState();

  const selectedLayers = useShallowArray(
    useSelector(Selectors.getSelectedLayers),
  );
  const hasContextSettingsLayers =
    Selectors.getSelectedLayersWithContextSettings(state).length > 0;
  const hasFixedRadiusLayers =
    Selectors.getSelectedLayersWithFixedRadius(state).length > 0;

  const elements = useMemo(() => {
    const dimensionsInspectorProps: DimensionsInspectorProps =
      selectedLayers.length === 1
        ? selectedLayers[0].frame
        : { x: undefined, y: undefined, width: undefined, height: undefined };

    const views = [
      <Fragment key="layout">
        <AlignmentInspector />
        <DimensionsInspector {...dimensionsInspectorProps} />
        <Spacer.Vertical size={10} />
      </Fragment>,
      hasFixedRadiusLayers && <RadiusInspector />,
      hasContextSettingsLayers && <OpacityInspector />,
      selectedLayers.length === 1 && <FillInspector />,
      selectedLayers.length === 1 && <BorderInspector />,
      selectedLayers.length === 1 && <ShadowInspector />,
    ].filter((element): element is JSX.Element => !!element);

    return withSeparatorElements(views, <Divider />);
  }, [selectedLayers, hasContextSettingsLayers, hasFixedRadiusLayers]);

  if (state.interactionState.type === 'insertArtboard') {
    return <ArtboardSizeList />;
  }

  if (selectedLayers.length === 0) return null;

  return <>{elements}</>;
});
