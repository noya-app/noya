// TODO: There's an import order issue. This fixes it for now
import 'noya-utils';

let PUBLIC_PATH = '/';

export function getPublicPath() {
  return PUBLIC_PATH;
}

export function setPublicPath(path: string) {
  PUBLIC_PATH = path + '/';
}
