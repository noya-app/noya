import { useApplicationState } from 'noya-app-state-context';
import { getSelectedLayers } from 'noya-state';
import { ClipboardUtils } from 'noya-utils';
import { useEffect } from 'react';

export function useCopyHandler() {
  const [state] = useApplicationState();
  const selectedLayers = getSelectedLayers(state);

  useEffect(() => {
    const handler = (event: ClipboardEvent) => {
      event.preventDefault();

      if (selectedLayers.length === 0) return;

      event.clipboardData?.setData(
        'text/html',
        ClipboardUtils.toEncodedHTML(selectedLayers),
      );
    };

    document.addEventListener('copy', handler);

    return () => document.removeEventListener('copy', handler);
  }, [selectedLayers]);
}
