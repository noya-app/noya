import React, { useCallback } from 'react';

import type { PatternFillProps } from './types';

export default function PatternFillPicker({
  id,
  pattern,
  onChangePatternFillType,
  onChangePatternTileScale,
  onChangeFillImage,
}: PatternFillProps & { id?: string }) {
  // const [state, dispatch] = useApplicationState();

  // const createImage = useCallback(
  //   (data: ArrayBuffer, _ref: string) => {
  //     dispatch('addImage', data, _ref);
  //   },
  //   [dispatch],
  // );

  // return (
  //   <>
  //     <PatternInspector
  //       id={`${id}-pattern-inspector`}
  //       pattern={pattern}
  //       createImage={createImage}
  //       onChangeImage={onChangeFillImage}
  //       onChangeFillType={onChangePatternFillType}
  //       onChangeTileScale={onChangePatternTileScale}
  //     />
  //     <PickerPatterns
  //       imageAssets={Selectors.getImageAssets(state)}
  //       onChange={onChangeFillImage}
  //     />
  //   </>
  // );
  return null;
}
