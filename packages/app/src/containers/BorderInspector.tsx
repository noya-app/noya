import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import { Selectors } from 'ayano-state';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import ArrayController from '../components/inspector/ArrayController';
import BorderRow from '../components/inspector/BorderRow';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';

export default memo(function BorderInspector() {
  const [, dispatch] = useApplicationState();

  const selectedLayers = useSelector(Selectors.getSelectedLayers);
  const borders = useShallowArray(
    selectedLayers.map((layer) => layer.style?.borders),
  );
  // TODO: Modify all borders
  const firstBorder = useMemo(() => borders[0] || [], [borders]);

  return (
    <ArrayController<FileFormat.Border>
      title="Borders"
      id="borders"
      key="borders"
      value={firstBorder}
      onClickPlus={useCallback(() => dispatch('addNewBorder'), [dispatch])}
      onClickTrash={useCallback(() => dispatch('deleteDisabledBorders'), [
        dispatch,
      ])}
      onDeleteItem={useCallback((index) => dispatch('deleteBorder', index), [
        dispatch,
      ])}
      onMoveItem={useCallback(
        (sourceIndex, destinationIndex) =>
          dispatch('moveBorder', sourceIndex, destinationIndex),
        [dispatch],
      )}
      onChangeCheckbox={useCallback(
        (index, checked) => dispatch('setBorderEnabled', index, checked),
        [dispatch],
      )}
    >
      {useCallback(
        ({
          item,
          index,
          checkbox,
        }: {
          item: FileFormat.Border;
          index: number;
          checkbox: ReactNode;
        }) => (
          <BorderRow
            id={`border-${index}`}
            color={item.color}
            prefix={checkbox}
            width={item.thickness}
            onNudgeWidth={(value) =>
              dispatch('setBorderWidth', index, value, 'adjust')
            }
            onChangeWidth={(value) => dispatch('setBorderWidth', index, value)}
            onChangeColor={(value) => {
              dispatch('setBorderColor', index, value);
            }}
          />
        ),
        [dispatch],
      )}
    </ArrayController>
  );
});
