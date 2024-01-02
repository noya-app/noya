import { Base64 } from '@noya-app/noya-utils';
import { fileSave, FileWithHandle } from 'browser-fs-access';
import { hostApp } from './hostApp';

class FileManager {
  requestId = 0;

  private handles: Map<FileSystemFileHandle, string> = new Map();

  private registerFile(name: string, path: string) {
    const handle: FileSystemFileHandle = {
      name,
      kind: 'file',
    } as any;

    this.handles.set(handle, path);

    return handle;
  }

  open = async (
    options: {
      path?: string;
      extensions?: string[];
      mimeTypes?: string[];
    } = {},
  ): Promise<FileWithHandle> => {
    const result = await hostApp.request(
      {
        type: 'openFile',
        id: this.requestId++,
        extensions: options.extensions,
        path: options.path,
      },
      'didOpenFile',
    );

    if (!result.file) throw new DOMException('User cancelled file open dialog');

    const uint8Array = Base64.decode(result.file.base64);

    const file = new File([uint8Array], result.file.name, {
      type: 'application/zip',
    }) as FileWithHandle;

    file.handle = this.registerFile(file.name, result.file.path);

    return file;
  };

  save: typeof fileSave = async (
    blob,
    options,
    existingHandle,
    throwIfExistingHandleNotGood,
  ) => {
    const data = await (await blob).arrayBuffer();

    const base64 = Base64.encode(data);

    if (Array.isArray(options)) {
      throw new Error('options must be an object');
    }

    const { file } = await hostApp.request(
      {
        type: 'saveFile',
        id: this.requestId++,
        base64,
        path: existingHandle ? this.handles.get(existingHandle) : undefined,
        extensions: options?.extensions,
      },
      'didSaveFile',
    );

    if (!file) throw new DOMException('User cancelled file save dialog');

    if (existingHandle) return existingHandle;

    return this.registerFile(file.name, file.path);
  };
}

export const fileManager = new FileManager();
