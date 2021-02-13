import { PageLayer, Selectors } from 'ayano-state';
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
import withSeparatorElements from '../utils/withSeparatorElements';
import ArtboardSizeList from './ArtboardSizeList';
import BorderInspector from './BorderInspector';
import FillInspector from './FillInspector';

interface Props {}

export default memo(function Inspector(props: Props) {
  const [state] = useApplicationState();
  const page = useSelector(Selectors.getCurrentPage);

  const selectedLayers = useMemo(
    () =>
      state.selectedObjects
        .map((id) => page.layers.find((layer) => layer.do_objectID === id))
        .filter((layer): layer is PageLayer => !!layer),
    [page.layers, state.selectedObjects],
  );

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
      selectedLayers.length === 1 && <FillInspector />,
      selectedLayers.length === 1 && <BorderInspector />,
    ].filter((element): element is JSX.Element => !!element);

    return withSeparatorElements(views, <Divider />);
  }, [selectedLayers]);

  if (state.interactionState.type === 'insertArtboard') {
    return <ArtboardSizeList />;
  }

  if (selectedLayers.length === 0) return null;

  return <>{elements}</>;
});
