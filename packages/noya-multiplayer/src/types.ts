export interface ServerToClientEvents {
  join: (channelId: string, userId: string, userName: string) => void;
  leave: (channelId: string, userId: string) => void;
  cursorPosition: (
    channelId: string,
    userId: string,
    x: number,
    y: number,
  ) => void;
  keyValue: (
    channelId: string,
    userId: string,
    key: string,
    value: Uint8Array,
  ) => void;
  error: (error: string) => void;
}

export interface ClientToServerEvents {
  register: (userName: string, callback: (userId: string) => void) => void;
  listChannels: (callback: (channelIds: string[]) => void) => void;
  join: (channelId: string) => void;
  leave: (channelId: string) => void;
  setCursorPosition: (channelId: string, x: number, y: number) => void;
  setKeyValue: (channelId: string, key: string, value: Uint8Array) => void;
}
