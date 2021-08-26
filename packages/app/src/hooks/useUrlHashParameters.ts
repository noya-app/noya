import { parseQueryParameters } from 'noya-utils';
import { useEffect, useState } from 'react';

export type UrlHashParameters = Record<string, string>;

export function getUrlHashParameters(): UrlHashParameters {
  try {
    return parseQueryParameters(window.location.hash.slice(1));
  } catch (e) {
    console.warn(e);
    return {};
  }
}

export function useUrlHashParameters(): UrlHashParameters {
  const [parameters, setParameters] = useState<UrlHashParameters>(() =>
    getUrlHashParameters(),
  );

  useEffect(() => {
    const handler = () => setParameters(getUrlHashParameters());

    window.addEventListener('hashchange', handler);

    return () => {
      window.removeEventListener('hashchange', handler);
    };
  }, []);

  return parameters;
}

type ParameterTypeMap = {
  boolean: boolean;
  number: number;
  string: string;
};

export function castHashParameter<K extends keyof ParameterTypeMap>(
  value: string,
  type: K,
): ParameterTypeMap[K] {
  switch (type) {
    case 'boolean':
      return (value === 'true') as ParameterTypeMap[K];
    case 'number': {
      const result = Number(value);
      return (isNaN(result) ? 0 : result) as ParameterTypeMap[K];
    }
    case 'string':
      return value as ParameterTypeMap[K];
    default:
      throw new Error('Invalid type');
  }
}
