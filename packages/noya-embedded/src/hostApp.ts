import { MessageFromEmbedded, MessageFromHost } from 'noya-embedded';
import { Emitter } from 'noya-fonts';

type MessageFromEmbeddedWithId = Extract<MessageFromEmbedded, { id: number }>;
type MessageFromHostWithId = Extract<MessageFromHost, { id: number }>;

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

  request = <
    Request extends MessageFromEmbeddedWithId,
    K extends MessageFromHostWithId['type'],
  >(
    request: Request,
    responseType: K,
  ): Promise<Extract<MessageFromHostWithId, { type: K }>> => {
    return new Promise((resolve) => {
      const handler = (response: MessageFromHost) => {
        if (!(response.type === responseType && response.id === request.id))
          return;

        hostApp.removeListener(handler);

        resolve(response as Extract<MessageFromHostWithId, { type: K }>);
      };

      hostApp.addListener(handler);

      this.sendMessage(request);
    });
  };
}

export const hostApp = new HostApp();
