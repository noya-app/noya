import { useSelector } from '@legendapp/state/react';
import { NoyaFileList } from '../core/schema';
import { useNoyaClient } from './context';

export function useNoyaFiles() {
  const files = useSelector(useNoyaClient().files$) as NoyaFileList;
  return files;
}

export function useNoyaSession() {
  const session = useSelector(useNoyaClient().session$);
  return session;
}
