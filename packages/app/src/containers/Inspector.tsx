// import EditableInput from '../components/input/EditableInput';
import AlignmentInspector from '../components/inspector/AlignmentInspector';
import DimensionsInspector, {
  Props as DimensionsInspectorProps,
} from '../components/inspector/DimensionsInspector';
import {
  useApplicationState,
  useCurrentPage,
} from '../contexts/ApplicationStateContext';
import * as InputField from '../components/InputField';
import * as Spacer from '../components/Spacer';
import { PageLayer } from 'ayano-state';

interface Props {}

export default function Inspector(props: Props) {
  const [state, dispatch] = useApplicationState();
  const page = useCurrentPage();

  const selectedLayers = state.selectedObjects
    .map((id) => page.layers.find((layer) => layer.do_objectID === id))
    .filter((layer): layer is PageLayer => !!layer);

  if (selectedLayers.length === 0) return null;

  const dimensionsInspectorProps: DimensionsInspectorProps =
    selectedLayers.length > 1
      ? { x: 'multi', y: 'multi', width: 'multi', height: 'multi' }
      : selectedLayers[0].frame;

  return (
    <>
      <AlignmentInspector />
      <DimensionsInspector {...dimensionsInspectorProps} />
    </>
  );
}
