import { decode, encode } from 'base-64';

declare const global: any;

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}
