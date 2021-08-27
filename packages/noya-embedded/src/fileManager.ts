import { FileWithHandle, FileSystemHandle, fileSave } from 'browser-fs-access';
import { Base64 } from 'noya-utils';
import { hostApp } from './hostApp';

function createFileHandle(name: string): FileSystemHandle {
  return {
    name,
    kind: 'file',
    isSameEntry: () => Promise.resolve(false),
    queryPermission: () => Promise.resolve('granted'),
    requestPermission: () => Promise.resolve('granted'),
  };
}

class FileManager {
  requestId = 0;

  open = async (
    options: {
      extensions?: string[];
      mimeTypes?: string[];
    } = {},
  ): Promise<FileWithHandle> => {
    const { base64 } = await hostApp.request(
      { type: 'openFile', id: this.requestId++ },
      'didOpenFile',
    );

    if (!base64) throw new DOMException('User cancelled file open dialog');

    const uint8Array = Base64.decode(base64);

    const file = new File([uint8Array], 'Test.sketch', {
      type: 'application/zip',
    }) as FileWithHandle;

    file.handle = createFileHandle(file.name);

    return file;
  };

  save: typeof fileSave = async (
    blob,
    options,
    existingHandle,
    throwIfExistingHandleNotGood,
  ) => {
    const data = await blob.arrayBuffer();

    const base64 = Base64.encode(data);

    const { name } = await hostApp.request(
      { type: 'saveFile', id: this.requestId++, base64 },
      'didSaveFile',
    );

    if (!name) throw new DOMException('User cancelled file save dialog');

    return createFileHandle(name);
  };
}

export const fileManager = new FileManager();
