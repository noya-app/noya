import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import { PageLayer, Selectors } from 'ayano-state';
import { Fragment, memo, useMemo } from 'react';
import Divider from '../components/Divider';
import AlignmentInspector from '../components/inspector/AlignmentInspector';
import ArrayController from '../components/inspector/ArrayController';
import BorderRow from '../components/inspector/BorderRow';
import DimensionsInspector, {
  Props as DimensionsInspectorProps,
} from '../components/inspector/DimensionsInspector';
import * as Spacer from '../components/Spacer';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import withSeparatorElements from '../utils/withSeparatorElements';
import FillInspector from './FillInspector';

interface Props {}

export default memo(function Inspector(props: Props) {
  const [state, dispatch] = useApplicationState();
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
        : { x: 'multi', y: 'multi', width: 'multi', height: 'multi' };

    const views = [
      <Fragment key="layout">
        <AlignmentInspector />
        <DimensionsInspector {...dimensionsInspectorProps} />
        <Spacer.Vertical size={10} />
      </Fragment>,
      selectedLayers.length === 1 && <FillInspector />,
      selectedLayers.length === 1 && (
        <ArrayController<FileFormat.Border>
          id="borders"
          key="borders"
          value={selectedLayers[0].style?.borders ?? []}
          onClickPlus={() => dispatch('addNewBorder')}
          onClickTrash={() => dispatch('deleteDisabledBorders')}
          onDeleteItem={(index) => dispatch('deleteBorder', index)}
          onMoveItem={(sourceIndex, destinationIndex) =>
            dispatch('moveBorder', sourceIndex, destinationIndex)
          }
          onChangeCheckbox={(index, checked) =>
            dispatch('setBorderEnabled', index, checked)
          }
          title="Borders"
        >
          {({ item, index, checkbox }) => (
            <BorderRow
              id={`border-${index}`}
              color={item.color}
              prefix={checkbox}
              width={item.thickness}
              onNudgeWidth={(value) =>
                dispatch('nudgeBorderWidth', index, value)
              }
              onChangeColor={(value) => {
                dispatch('setBorderColor', index, value);
              }}
            />
          )}
        </ArrayController>
      ),
    ].filter((element): element is JSX.Element => !!element);

    return withSeparatorElements(views, <Divider />);
  }, [dispatch, selectedLayers]);

  if (selectedLayers.length === 0) return null;

  return (
    <>
      {elements}
      <Divider />
    </>
  );
});
