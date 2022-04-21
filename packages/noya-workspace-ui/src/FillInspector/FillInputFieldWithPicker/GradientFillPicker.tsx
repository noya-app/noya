import React, { useCallback } from 'react';

import { Selectors } from 'noya-state';
import { useApplicationState } from 'noya-app-state-context';
import { useOpenInputDialog } from '../../contexts/DialogContext';
import GradientInspector from '../../GradientInspector';
import type { GradientFillProps } from './types';

export default function GradientFillPicker({
  id,
  gradient,
  onChangeGradient,
  onChangeGradientColor,
  onChangeGradientPosition,
  onAddGradientStop,
  onDeleteGradientStop,
}: Omit<GradientFillProps, 'onChangeGradientType'> & { id?: string }) {
  const [state, dispatch] = useApplicationState();
  const openDialog = useOpenInputDialog();

  const gradientAssets = Selectors.getGradientAssets(state);

  const createThemeGradient = useCallback(async () => {
    if (!gradient) return;

    const gradientName = await openDialog('New Gradient Asset Name');

    if (!gradientName) return;

    dispatch('addGradientAsset', gradientName, gradient);
  }, [dispatch, gradient, openDialog]);

  const onRemoveThemeGradient = useCallback(
    (id: string) => dispatch('removeGradientAsset', id),
    [dispatch],
  );

  const onRenameThemeGradient = useCallback(
    (id: string, name: string) => dispatch('setGradientAssetName', id, name),
    [dispatch],
  );
  //     <PickerGradients
  //       gradientAssets={gradientAssets}
  //       onCreate={createThemeGradient}
  //       onChange={onChangeGradient}
  //       onDelete={onRemoveThemeGradient}
  //       onRename={onRenameThemeGradient}
  //     />

  return (
    <>
      <GradientInspector
        id={`${id}-gradient-inspector`}
        gradient={gradient.stops}
        onChangeColor={onChangeGradientColor}
        onChangePosition={onChangeGradientPosition}
        onAddStop={onAddGradientStop}
        onDeleteStop={onDeleteGradientStop}
      />
    </>
  );
}
