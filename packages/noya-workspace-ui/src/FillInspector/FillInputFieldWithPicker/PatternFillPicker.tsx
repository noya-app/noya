import React, { useCallback } from 'react';

import { useApplicationState } from 'noya-app-state-context';
import PatternInspector from '../../PatternInspector';
import type { PatternFillProps } from './types';

export default function PatternFillPicker({
  id,
  pattern,
  onChangePatternFillType,
  onChangePatternTileScale,
  onChangeFillImage,
}: PatternFillProps & { id?: string }) {
  const [, dispatch] = useApplicationState();

  const createImage = useCallback(
    (data: ArrayBuffer, _ref: string) => {
      dispatch('addImage', data, _ref);
    },
    [dispatch],
  );

  //     <PickerPatterns
  //       imageAssets={Selectors.getImageAssets(state)}
  //       onChange={onChangeFillImage}
  //     />

  return (
    <>
      <PatternInspector
        id={`${id}-pattern-inspector`}
        pattern={pattern}
        createImage={createImage}
        onChangeImage={onChangeFillImage}
        onChangeFillType={onChangePatternFillType}
        onChangeTileScale={onChangePatternTileScale}
      />
    </>
  );
}
