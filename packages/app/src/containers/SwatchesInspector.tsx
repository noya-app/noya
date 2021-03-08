import { Divider } from 'noya-designsystem';
import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import { Selectors } from 'noya-state';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import withSeparatorElements from '../utils/withSeparatorElements';
import ArtboardSizeList from './ArtboardSizeList';
import ArrayController from '../components/inspector/ArrayController';
import ColorSelectRow from '../components/inspector/ColorSelectRow';

const ColorPickerInspector =  memo(function ColorPickerInspector() {
  const [, dispatch] = useApplicationState();

  const selectedLayers = useSelector(Selectors.getSelectedLayers);
  const fills = useShallowArray(
    selectedLayers.map((layer) => layer.style?.fills),
  );
  // TODO: Modify all fills
  const firstFill = useMemo(() => fills[0] || [], [fills]);
  
  return (
    <ArrayController<FileFormat.Fill>
      title="Color Picker"
      id="ColorPicker"
      key="colorpicker"
      value={firstFill}
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
        }: {
          item: FileFormat.Fill;
          index: number;
        }) => (
          <ColorSelectRow
            id={`fill-${index}`}
            color={item.color}
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


export default memo(function SwatchesInspector() {
    const [state] = useApplicationState();
  
    const selectedLayers = useShallowArray(
      useSelector(Selectors.getSelectedLayers),
    );
  
    const elements = useMemo(() => {
      const views = [
        selectedLayers.length === 1 && <ColorPickerInspector />,
      ].filter((element): element is JSX.Element => !!element);
  
      return withSeparatorElements(views, <Divider />);
    }, [selectedLayers]);
  
    if (state.interactionState.type === 'insertArtboard') {
      return <ArtboardSizeList />;
    }
  
    //if (selectedLayers.length === 0) return null;
  
    return <><ColorPickerInspector /></>;
  });
  