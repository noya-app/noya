import { Sketch } from '@noya-app/noya-file-format';
import { elementShouldHandleOwnShortcut } from '@noya-app/noya-keymap';
import { ClipboardUtils } from '@noya-app/noya-utils';
import { useApplicationState } from 'noya-app-state-context';
import { getSelectedLayers } from 'noya-state';
import { useEffect } from 'react';

export type NoyaClipboardData = {
  type: 'layers';
  layers: Sketch.AnyLayer[];
};

export function useCopyHandler() {
  const [state, dispatch] = useApplicationState();
  const selectedLayers = getSelectedLayers(state);

  useEffect(() => {
    const handler = (event: ClipboardEvent) => {
      if (elementShouldHandleOwnShortcut(event.target)) return;

      event.preventDefault();

      if (selectedLayers.length === 0) return;

      const data: NoyaClipboardData = {
        type: 'layers',
        layers: selectedLayers,
      };

      event.clipboardData?.setData(
        'text/html',
        ClipboardUtils.toEncodedHTML(data),
      );

      if (event.type === 'cut') {
        dispatch(
          'deleteLayer',
          selectedLayers.map((layer) => layer.do_objectID),
        );
      }
    };

    document.addEventListener('copy', handler);
    document.addEventListener('cut', handler);

    return () => {
      document.removeEventListener('copy', handler);
      document.removeEventListener('cut', handler);
    };
  }, [dispatch, selectedLayers]);
}
