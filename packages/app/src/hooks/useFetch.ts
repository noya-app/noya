import { PromiseState } from 'noya-react-utils';
import { useEffect, useState } from 'react';
import fetchData, { ResponseEncoding } from '../utils/fetchData';

export default function useFetch<T>(
  url: string,
  encoding: ResponseEncoding,
): PromiseState<T> {
  const [state, setState] = useState<PromiseState<T>>({ type: 'pending' });

  useEffect(() => {
    let isStale = false;

    async function getInfo() {
      try {
        const data = await fetchData<T>(url, encoding as any);

        if (isStale) return;

        setState({ type: 'success', value: data });
      } catch (error) {
        if (isStale) return;

        setState({ type: 'failure', value: error });
      }
    }

    getInfo();

    return () => {
      isStale = true;
    };
  }, [url, encoding]);

  return state;
}
