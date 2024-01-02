import { Sketch } from '@noya-app/noya-file-format';
import { useManagedLayout } from '../components/GeneratedLayoutContext';
import { CustomLayerData } from '../types';

export function useCurrentGeneratedLayout(
  selectedLayer: Sketch.CustomLayer<CustomLayerData>,
) {
  const suggestionSourceName =
    selectedLayer.data.layoutGenerationSource?.name ?? selectedLayer.name ?? '';
  const suggestionSourceDescription =
    selectedLayer.data.layoutGenerationSource?.description ??
    selectedLayer.data.description ??
    '';
  const generatedLayout = useManagedLayout(
    suggestionSourceName,
    suggestionSourceDescription,
  );

  const activeIndex = selectedLayer.data.activeGenerationIndex ?? 0;
  const node = selectedLayer.data.node ?? generatedLayout[activeIndex]?.node;

  return {
    generatedLayout,
    activeIndex,
    node,
  };
}
