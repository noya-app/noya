import {
  MessageFromMainProcess,
  MessageFromRendererProcess,
} from 'noya-desktop';
import { Emitter } from 'noya-fonts';

class EmbeddedApp extends Emitter<[MessageFromMainProcess]> {
  constructor() {
    super();

    window.addEventListener('message', ({ data }: MessageEvent) => {
      // console.log('from host', data);
      this.emit(data as MessageFromMainProcess);
    });
  }

  sendMessageToHost = (data: MessageFromRendererProcess) => {
    // console.log('to host', data);
    postMessage(data, window.location.origin);
  };
}

export const embeddedApp = new EmbeddedApp();
