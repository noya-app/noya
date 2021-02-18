import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import { Selectors } from 'ayano-state';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import ArrayController from '../components/inspector/ArrayController';
import ShadowRow from '../components/inspector/ShadowRow';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';

export default memo(function ShadowInspector() {
  const [, dispatch] = useApplicationState();

  const selectedLayers = useSelector(Selectors.getSelectedLayers);
  const shadows = useShallowArray(
    selectedLayers.map((layer) => layer.style?.shadows),
  );
  // TODO: Modify all shadows
  const firstFill = useMemo(() => shadows[0] || [], [shadows]);

  return (
    <ArrayController<FileFormat.Shadow>
      title="Shadows"
      id="fills"
      key="fills"
      value={firstFill}
      onClickPlus={useCallback(() => dispatch('addNewFill'), [dispatch])}
      onClickTrash={useCallback(() => dispatch('deleteDisabledFills'), [
        dispatch,
      ])}
      onDeleteItem={useCallback((index) => dispatch('deleteFill', index), [
        dispatch,
      ])}
      onMoveItem={useCallback(
        (sourceIndex, destinationIndex) =>
          dispatch('moveFill', sourceIndex, destinationIndex),
        [dispatch],
      )}
      onChangeCheckbox={useCallback(
        (index, checked) => dispatch('setFillEnabled', index, checked),
        [dispatch],
      )}
    >
      {useCallback(
        ({
          item,
          index,
          checkbox,
        }: {
          item: FileFormat.Shadow;
          index: number;
          checkbox: ReactNode;
        }) => (
          <ShadowRow
            id={`shadow-${index}`}
            color={item.color}
            prefix={checkbox}
            onChangeOpacity={(value) =>
              dispatch('setFillOpacity', index, value)
            }
            onNudgeOpacity={(value) =>
              dispatch('setFillOpacity', index, value, 'adjust')
            }
            onChangeColor={(value) => dispatch('setFillColor', index, value)}
          />
        ),
        [dispatch],
      )}
    </ArrayController>
  );
});
