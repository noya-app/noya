import { observable } from '@legendapp/state';
import { unique } from 'noya-utils';
import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from './types';

export type MultiplayerOptions = {
  userName: string;
};

export class Multiplayer {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    'localhost:31111',
    { transports: ['websocket'] },
  );

  // Observable state
  userName = observable(this.options.userName);
  userId = observable<string | undefined>(undefined);
  channels = observable<string[]>([]);
  state = observable<Record<string, Record<string, Buffer>>>();

  constructor(public options: MultiplayerOptions) {}

  connect() {
    this.socket.on('disconnect', (reason) => {
      this.userId.set(undefined);
    });

    this.socket.emit('register', this.options.userName, (userId) => {
      this.userId.set(userId);
    });

    this.socket.on('join', (channelId, userId, userName) => {
      this.channels.set((channels) => unique([...channels, channelId]));
    });

    this.socket.on('leave', (channelId, userId) => {
      this.channels.set((channels) => channels.filter((c) => c !== channelId));
    });

    this.socket.on('cursorPosition', (channelId, userId, x, y) => {});

    this.socket.on('keyValue', (channelId, userId, key, value) => {
      this.state[channelId][key].set(value);
    });
  }

  join = (channelId: string) => {
    this.socket.emit('join', channelId);
  };

  leave = (channelId: string) => {
    this.socket.emit('leave', channelId);
  };

  setKeyValue = (
    channelId: string,
    key: string,
    value: string | Uint8Array,
  ) => {
    const buffer =
      value instanceof Uint8Array ? value : new TextEncoder().encode(value);
    this.socket.emit('setKeyValue', channelId, key, buffer);
  };
}
