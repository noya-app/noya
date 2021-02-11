import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import { Selectors } from 'ayano-state';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import ArrayController from '../components/inspector/ArrayController';
import FillRow from '../components/inspector/FillRow';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';

export default memo(function FillInspector() {
  const [, dispatch] = useApplicationState();

  const selectedLayers = useSelector(Selectors.getSelectedLayers);
  const fills = useShallowArray(
    selectedLayers.map((layer) => layer.style?.fills),
  );
  // TODO: Modify all fills
  const firstFill = useMemo(() => fills[0] || [], [fills]);

  return (
    <ArrayController<FileFormat.Fill>
      title="Fills"
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
          item: FileFormat.Fill;
          index: number;
          checkbox: ReactNode;
        }) => (
          <FillRow
            id={`fill-${index}`}
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
