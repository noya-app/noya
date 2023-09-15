import { NOYA_HOST } from './noyaClient';

export const isBeta = true;

export const isLocal =
  NOYA_HOST?.includes('localhost') || NOYA_HOST?.includes('ngrok.io');
