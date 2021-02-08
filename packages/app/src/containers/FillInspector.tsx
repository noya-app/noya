import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import { Selectors } from 'ayano-state';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import ArrayController from '../components/inspector/ArrayController';
import FillRow from '../components/inspector/FillRow';
import { useApplicationState } from '../contexts/ApplicationStateContext';

export default memo(function FillInspector() {
  const [state, dispatch] = useApplicationState();

  const getPageLayers = Selectors.makeGetPageLayers(state);

  // TODO: Fills array isn't memoizing in a way that prevents re-render
  const fills = useMemo(
    () =>
      getPageLayers(state.selectedObjects).map((layer) => layer.style?.fills),
    [getPageLayers, state.selectedObjects],
  );
  const firstFill = useMemo(() => fills[0] || [], [fills]);

  const onClickPlusFill = useCallback(() => dispatch('addNewFill'), [dispatch]);
  const onClickTrashFill = useCallback(() => dispatch('deleteDisabledFills'), [
    dispatch,
  ]);
  const onDeleteFill = useCallback((index) => dispatch('deleteFill', index), [
    dispatch,
  ]);
  const onMoveFill = useCallback(
    (sourceIndex, destinationIndex) =>
      dispatch('moveFill', sourceIndex, destinationIndex),
    [dispatch],
  );
  const onChangeCheckboxFill = useCallback(
    (index, checked) => dispatch('setFillEnabled', index, checked),
    [dispatch],
  );
  const arrayControllerChildrenFill = useCallback(
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
        onChangeColor={(value) => {
          dispatch('setFillColor', index, value);
        }}
      />
    ),
    [dispatch],
  );

  return (
    <ArrayController<FileFormat.Fill>
      id="fills"
      key="fills"
      value={firstFill}
      onClickPlus={onClickPlusFill}
      onClickTrash={onClickTrashFill}
      onDeleteItem={onDeleteFill}
      onMoveItem={onMoveFill}
      onChangeCheckbox={onChangeCheckboxFill}
      title="Fills"
    >
      {arrayControllerChildrenFill}
    </ArrayController>
  );
});
