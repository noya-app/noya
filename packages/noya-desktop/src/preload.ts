import { ipcRenderer } from 'electron';

window.addEventListener('message', (event: MessageEvent) => {
  ipcRenderer.send('rendererProcessMessage', event.data);
});

ipcRenderer.on('mainProcessMessage', (event, data) => {
  window.postMessage(data, '*');
});
