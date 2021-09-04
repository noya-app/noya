import { useApplicationState } from 'noya-app-state-context';
import { getSelectedLayersWithTopLevelCoordinates } from 'noya-state';
import { Base64 } from 'noya-utils';
import { useEffect } from 'react';

export function useCopyHandler() {
  const [state] = useApplicationState();

  useEffect(() => {
    const encoder = new TextEncoder();

    const handler = (event: ClipboardEvent) => {
      event.preventDefault();

      const selectedLayers = getSelectedLayersWithTopLevelCoordinates(state);
      if (selectedLayers.length === 0) {
        return;
      }

      const json = JSON.stringify(selectedLayers);
      const data = Base64.encode(encoder.encode(json));

      event.clipboardData?.setData('text/html', `<p>(noya)${data}</p>`);
    };

    document.addEventListener('copy', handler);

    return () => document.removeEventListener('paste', handler);
  }, [state]);
}

/*

  const isSafari = /Apple Computer/.test(navigator.vendor);
  if (isSafari) {
    const range = document.createRange();
    range.selectNode(document.body);

    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
  }

  document.execCommand('copy');

  if (isSafari) {
    window.getSelection()?.removeAllRanges();
  }

*/
