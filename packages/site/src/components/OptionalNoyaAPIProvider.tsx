import { NoyaAPI, NoyaAPIProvider } from 'noya-api';
import React, { useEffect, useState } from 'react';
import { networkClientThatThrows } from '../utils/noyaClient';

export function OptionalNoyaAPIProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client, setClient] = useState<NoyaAPI.Client | undefined>();

  useEffect(() => {
    async function main() {
      try {
        if (!networkClientThatThrows) return;
        await networkClientThatThrows.auth.session();
        setClient(
          new NoyaAPI.Client({ networkClient: networkClientThatThrows }),
        );
      } catch {
        // Ignore
      }
    }

    main();
  }, []);

  return <NoyaAPIProvider value={client}>{children}</NoyaAPIProvider>;
}
