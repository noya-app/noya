import { useApplicationState } from 'noya-app-state-context';
import { getSelectedLayers } from 'noya-state';
import { Base64 } from 'noya-utils';
import { useEffect } from 'react';

export function useCopyHandler() {
  const [state] = useApplicationState();

  useEffect(() => {
    const encoder = new TextEncoder();

    const handler = (event: ClipboardEvent) => {
      event.preventDefault();

      const selectedLayers = getSelectedLayers(state);
      if (selectedLayers.length === 0) {
        return;
      }

      const json = JSON.stringify(selectedLayers);
      const data = Base64.encode(encoder.encode(json));

      event.clipboardData?.setData('text/html', `<p>(noya)${data}</p>`);
    };

    document.addEventListener('copy', handler);

    return () => document.removeEventListener('copy', handler);
  }, [state]);
}
