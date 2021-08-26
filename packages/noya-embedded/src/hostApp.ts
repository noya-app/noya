import { MessageFromEmbedded, MessageFromHost } from 'noya-embedded';
import { Emitter } from 'noya-fonts';

class HostApp extends Emitter<[MessageFromHost]> {
  constructor() {
    super();

    window.addEventListener('message', ({ data }: MessageEvent) => {
      this.emit(data as MessageFromHost);
    });
  }

  sendMessage = (data: MessageFromEmbedded) => {
    postMessage(data, window.location.origin);
  };
}

export const hostApp = new HostApp();
