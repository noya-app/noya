import * as fflate from 'fflate';

export type FileMap = fflate.Unzipped;

export function unzip(bytes: Uint8Array): Promise<FileMap> {
  return new Promise((resolve, reject) => {
    fflate.unzip(bytes, (error, zip) => {
      if (error) {
        reject(error);
      } else {
        resolve(zip);
      }
    });
  });
}

export function zip(zip: FileMap): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    fflate.zip(zip, (error, bytes) => {
      if (error) {
        reject(error);
      } else {
        resolve(bytes);
      }
    });
  });
}
