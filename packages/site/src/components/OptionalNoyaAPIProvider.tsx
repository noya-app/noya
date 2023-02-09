import { NoyaAPI, NoyaAPIProvider } from 'noya-api';
import React, { useEffect, useState } from 'react';
import { createNoyaClient } from '../utils/noyaClient';
import { Analytics } from './Analytics';

export function OptionalNoyaAPIProvider({
  children,
  networkClient,
}: {
  children: React.ReactNode;
  networkClient?: NoyaAPI.NetworkClient;
}) {
  const [client, setClient] = useState<NoyaAPI.Client | undefined>();

  useEffect(() => {
    async function main() {
      try {
        if (!networkClient) return;
        await networkClient.auth.session();
        setClient(createNoyaClient());
      } catch {
        // Ignore
      }
    }

    main();
  }, [networkClient]);

  if (client) {
    return (
      <NoyaAPIProvider value={client}>
        <Analytics>{children}</Analytics>
      </NoyaAPIProvider>
    );
  } else {
    return <>{children}</>;
  }
}
