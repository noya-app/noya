import { useApplicationState } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import { elementShouldHandleOwnShortcut } from 'noya-keymap';
import { getSelectedLayers } from 'noya-state';
import { ClipboardUtils } from 'noya-utils';
import { useEffect } from 'react';

export type NoyaClipboardData = {
  type: 'layers';
  layers: Sketch.AnyLayer[];
};

export function useCopyHandler() {
  const [state] = useApplicationState();
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
    };

    document.addEventListener('copy', handler);

    return () => document.removeEventListener('copy', handler);
  }, [selectedLayers]);
}
